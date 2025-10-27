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
			.from('roles')
			.select(
				`
				id,
				userId,
				role,
				created_at
				`
			)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		// ✅ search by email
		if (search) {
			query = query.ilike('auth.email', `%${search}%`);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error('❌ fetchUsers error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		// ✅ normalize response
		const users = (data ?? []).map((row: any) => ({
			id: row.id,
			userId: row.userId,
			role: row.role,
			created_at: row.created_at,
			email: row.auth?.email ?? '(no email)'
		}));

		return json({ users, count: count ?? 0 });
	} catch (err: any) {
		console.error('❌ fetchUsers exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
