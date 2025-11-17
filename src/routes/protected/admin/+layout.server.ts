// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './upload/$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;

	if (!user) {
		console.log(`🚫 anonymous opened ${url.pathname}`);
		throw redirect(302, '/');
	}

	console.log(`✅ user opened ${url.pathname}`, {
		email: user.email,
		fullName: user.user_metadata?.full_name || '(no name)'
	});

	const isAdmin = locals.userRole === 'admin';

	if (!isAdmin) {
		console.log(`❌ user is not admin: ${user.email}`);
		throw redirect(302, '/');
	} else {
		console.log(`✅ user is admin: ${user.email}`);
	}

	return {
		user,
		isAdmin
	};
};
