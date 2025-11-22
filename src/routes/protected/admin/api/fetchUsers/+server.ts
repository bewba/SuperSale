// src/routes/protected/admin/api/fetchUsers/+server.ts
import { json, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, request, url }) => {
	if (locals.userRole !== 'admin' && locals.userRole !== 'moderator') {
		throw redirect(302, '/unauthorized');
	}

	const supabase = locals.supabase;

	const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 200);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);
	const search = url.searchParams.get('search')?.trim() ?? '';

	try {
		// ✅ join auth.users to get email
		let query = supabase
			.from('users')
			.select(
				`
    id,
    name,
    email,
    is_banned,
    roles:roles!roles_userId_fkey1(
      role
    )
  `
			)
			.order('id', { ascending: false })
			.range(offset, offset + limit - 1);
		// ✅ search by email
		if (search) {
			query = query.ilike('email', `%${search}%`);
		}

		const { data, error, count } = await query;

		console.log(data);

		if (error) {
			console.error('❌ fetchUsers error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		const users = (data ?? []).map((row: any) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			role: row.roles?.role ?? null,
			is_banned: row.is_banned ?? null
		}));

		return json({ users, count: count ?? 0 });
	} catch (err: any) {
		console.error('❌ fetchUsers exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
