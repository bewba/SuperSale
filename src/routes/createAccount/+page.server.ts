// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	const sb = locals.supabase;

	// 🚫 Not logged in
	if (!user) {
		throw redirect(302, '/auth');
	}

	let role = locals.userRole;

	// if (role) {
	// 	throw redirect(302, '/protected/seller');
	// }

	return {
		user,
		role: role
	};
};
