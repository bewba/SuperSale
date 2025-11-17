// src/routes/protected/admin/api/banUser/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
	// only admins/moderators can ban/unban
	if (locals.userRole !== 'admin' && locals.userRole !== 'moderator') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const supabase = locals.supabase;
	const body = await request.json();
	const { id: userId } = body; // match the frontend payload

	if (!userId) {
		return json({ error: 'Invalid payload: missing user id' }, { status: 400 });
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
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User banned successfully', user: data[0] });
	} catch (err: any) {
		console.error('❌ banUser exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
