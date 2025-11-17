// src/routes/protected/admin/api/updateUserRole/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

const ALLOWED = ['moderator', 'admin', 'seller'];

export const POST: RequestHandler = async (event) => {
	// protect: only admin
	if (event.locals?.userRole !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const supabase = event.locals.supabase;

	try {
		const body = await event.request.json();
		const { id, role } = body ?? {};

		if (!id || !role) {
			return json({ error: 'Missing id or role' }, { status: 400 });
		}

		if (!ALLOWED.includes(role.toLowerCase())) {
			return json({ error: 'Role not allowed' }, { status: 400 });
		}

		// ✅ Upsert: create if not exists, update if exists
		const { data, error } = await supabase
			.from('roles')
			.upsert(
				{ userId: id, role: role.toLowerCase() }, // insert row if missing
				{ onConflict: 'userId', ignoreDuplicates: false }
			)
			.select('userId, role');

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
