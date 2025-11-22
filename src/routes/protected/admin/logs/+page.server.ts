// src/routes/protected/admin/logs/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkUserRole } from '$lib/server/auth/roleCheck';

export const load: PageServerLoad = async (event) => {
	// Only admins can access logs (not moderators)
	const isAdmin = await checkUserRole(event, ['admin']);
	
	if (isAdmin !== 0) {
		// Access control logging is handled in checkUserRole
		if (isAdmin === 1) {
			throw redirect(302, '/auth');
		}
		if (isAdmin === 2 || isAdmin === 3) {
			throw redirect(302, '/unauthorized');
		}
		throw redirect(302, '/');
	}

	return {
		userId: event.locals.userId,
		role: event.locals.userRole
	};
};

