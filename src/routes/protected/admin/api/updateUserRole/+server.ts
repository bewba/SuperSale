// src/routes/protected/admin/api/updateUserRole/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const ALLOWED = ['moderator', 'admin', 'seller'];

export const POST: RequestHandler = async (event) => {
	// protect: only admin via locals
	const isAdmin = event.locals?.userRole === 'admin';
	if (!isAdmin) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	let supabase = event.locals.supabase;

	try {
		const body = await event.request.json();
		const { id, role } = body ?? {};

		if (!id || !role) {
			return json({ error: 'Missing id or role' }, { status: 400 });
		}

		if (!ALLOWED.includes(String(role).toLowerCase())) {
			return json({ error: 'Role not allowed' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('roles')
			.update({ role: String(role).toLowerCase() })
			.eq('id', id)
			.select('id, role');

		if (error) {
			console.error('updateUserRole error', error);
			return json({ error: error.message }, { status: 500 });
		}

		return json({ updated: (data && data[0]) ?? null });
	} catch (err: any) {
		console.error(err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
