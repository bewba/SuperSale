import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (locals.userRole !== 'admin' && locals.userRole !== 'moderator') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const supabase = locals.supabase;
	const { id: userId } = await request.json();

	if (!userId) {
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
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User unbanned successfully', user: data[0] });
	} catch (err: any) {
		console.error('❌ unbanUser exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
