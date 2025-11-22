import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (locals.userRole !== 'admin' && locals.userRole !== 'moderator') {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: User with role "${locals.userRole}" attempted to unban user (required: admin or moderator)`
		);
		throw redirect(302, '/unauthorized');
	}

	const supabase = locals.supabase;
	const { id: userId } = await request.json();

	if (!userId) {
		await logEvent(supabase, locals.userId, `Validation failure: Missing user id in unban request`);
		return json({ error: 'Invalid payload: missing user id' }, { status: 400 });
	}

	try {
		const { data, error } = await supabase
			.from('users')
			.update({ is_banned: false })
			.eq('id', userId)
			.select('id, name, email, is_banned');

		if (error) {
			console.error('❌ unbanUser error:', error);
			await logEvent(supabase, locals.userId, `Failed to unban user ${userId}: ${error.message}`);
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			await logEvent(supabase, locals.userId, `Failed to unban user: User ${userId} not found`);
			return json({ error: 'User not found' }, { status: 404 });
		}

		await logEvent(
			supabase,
			locals.userId,
			`User unbanned: ${data[0].email || userId} by ${locals.user?.email || 'admin'}`
		);

		return json({ message: 'User unbanned successfully', user: data[0] });
	} catch (err: any) {
		console.error('❌ unbanUser exception:', err);
		await logEvent(
			supabase,
			locals.userId,
			`Error unbanning user ${userId}: ${err?.message ?? 'Unknown error'}`
		);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
