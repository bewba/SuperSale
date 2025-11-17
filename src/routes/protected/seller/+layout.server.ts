import type { LayoutServerLoad } from './$types';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const isSeller = await checkUserRole(event, 'seller');

	console.log('sdaasd');
	if (isSeller === 0) {
		return {
			user: event.locals.user,
			role: event.locals.userRole
		};
	}

	console.log(event.locals.user);
	if (isSeller === 1) {
		throw redirect(302, '/auth');
	}

	// 2 = Not yet a seller
	if (isSeller === 2) {
		console.log('redirecting to createAccouint');
		throw redirect(302, '/createAccount');
	}

	// 3 = Not authorized
	if (isSeller === 3) {
		throw redirect(302, '/?toast=unauthorized');
	}

	// fallback (optional)
	throw redirect(302, '/');
};
