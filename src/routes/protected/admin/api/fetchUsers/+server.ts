// src/routes/protected/admin/api/fetchUsers/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, request, url }) => {
	// ✅ protect: only admin
	if (locals.userRole !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
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
    roles:roles!roles_userId_fkey1(
      role,
      is_banned
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

		if (error) {
			console.error('❌ fetchUsers error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		const users = (data ?? []).map((row: any) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			role: row.roles?.role ?? null,
			is_banned: row.roles?.is_banned ?? null
		}));

		return json({ users, count: count ?? 0 });
	} catch (err: any) {
		console.error('❌ fetchUsers exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
