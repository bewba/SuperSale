// src/routes/protected/admin/api/updateUserRole/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

const ALLOWED = ['moderator', 'admin', 'seller'];

export const POST: RequestHandler = async (event) => {
	// protect: only admin
	if (event.locals?.userRole === 'moderator') {
		await logEvent(
			event.locals.supabase,
			event.locals.userId,
			`Access control failure: Moderator attempted to update user role (required: admin only)`
		);
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	if (event.locals.userRole !== 'admin' && event.locals.userRole !== 'moderator') {
		await logEvent(
			event.locals.supabase,
			event.locals.userId,
			`Access control failure: User with role "${event.locals.userRole}" attempted to update user role (required: admin or moderator)`
		);
		throw redirect(302, '/unauthorized');
	}

	const supabase = event.locals.supabase;

	try {
		const body = await event.request.json();
		const { id, role } = body ?? {};

		// Type validation
		const typeValidation = await validateTypes(supabase, event.locals.userId, [
			{ value: id, expectedType: 'string', fieldName: 'id', required: true },
			{ value: role, expectedType: 'string', fieldName: 'role', required: true }
		]);

		if (!typeValidation.valid) {
			return json({ error: 'Invalid input types', details: typeValidation.errors }, { status: 400 });
		}

		if (!ALLOWED.includes(role.toLowerCase())) {
			await logEvent(
				supabase,
				event.locals.userId,
				`Validation failure: Invalid role "${role}" (allowed: ${ALLOWED.join(', ')})`
			);
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
			await logEvent(
				supabase,
				event.locals.userId,
				`Failed to update user role for ${id} to ${role}: ${error.message}`
			);
			return json({ error: error.message }, { status: 500 });
		}

		await logEvent(
			supabase,
			event.locals.userId,
			`User role updated: User ${id} role changed to ${role} by ${event.locals.user?.email || 'admin'}`
		);

		return json({ updated: (data && data[0]) ?? null });
	} catch (err: any) {
		console.error(err);
		await logEvent(
			supabase,
			event.locals.userId,
			`Error updating user role: ${err?.message ?? 'Unknown error'}`
		);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
