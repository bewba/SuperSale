// src/routes/protected/admin/api/banUser/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const POST: RequestHandler = async ({ locals, request }) => {
	// only admins/moderators can ban/unban
	if (locals.userRole !== 'admin' && locals.userRole !== 'moderator') {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: User with role "${locals.userRole}" attempted to ban user (required: admin or moderator)`
		);
		throw redirect(302, '/unauthorized');
	}

	const supabase = locals.supabase;
	const body = await request.json();
	const { id: userId } = body; // match the frontend payload

	// Type validation
	const typeValidation = await validateTypes(supabase, locals.userId, [
		{ value: userId, expectedType: 'string', fieldName: 'id', required: true }
	]);

	if (!typeValidation.valid) {
		return json({ error: 'Invalid input types', details: typeValidation.errors }, { status: 400 });
	}

	try {
		// set is_banned = true for banUser endpoint
		const { data, error } = await supabase
			.from('users')
			.update({ is_banned: true })
			.eq('id', userId)
			.select('id, name, email, is_banned');

		if (error) {
			console.error('❌ banUser error:', error);
			await logEvent(supabase, locals.userId, `Failed to ban user ${userId}: ${error.message}`);
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			await logEvent(supabase, locals.userId, `Failed to ban user: User ${userId} not found`);
			return json({ error: 'User not found' }, { status: 404 });
		}

		await logEvent(
			supabase,
			locals.userId,
			`User banned: ${data[0].email || userId} by ${locals.user?.email || 'admin'}`
		);

		return json({ message: 'User banned successfully', user: data[0] });
	} catch (err: any) {
		console.error('❌ banUser exception:', err);
		await logEvent(
			supabase,
			locals.userId,
			`Error banning user ${userId}: ${err?.message ?? 'Unknown error'}`
		);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
