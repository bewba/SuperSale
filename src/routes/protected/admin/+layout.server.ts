// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './upload/$types';
import { checkUserRole } from '$lib/server/auth/roleCheck';

export const load: PageServerLoad = async (event) => {
	const isAdmin = await checkUserRole(event, ['admin', 'moderator']);
	console.log(isAdmin);
	if (isAdmin === 0) {
		return {
			userId: event.locals.userId,
			role: event.locals.userRole
		};
	}

	if (isAdmin === 1) {
		throw redirect(302, '/auth');
	}

	// 2 = Not yet a seller
	if (isAdmin === 2) {
		console.log('redirecting to createAccount');
		throw redirect(302, '/createAccount');
	}

	// 3 = Not authorized
	if (isAdmin === 3) {
		throw redirect(302, '/unauthorized');
	}

	// fallback (optional)
	throw redirect(302, '/');
};
