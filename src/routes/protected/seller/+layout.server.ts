// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = locals.user;

	if (!user) {
		console.log(`🚫 anonymous opened ${url.pathname}`);
		throw redirect(302, '/auth');
	}

	console.log(`✅ user opened ${url.pathname}`, {
		email: user.email,
		fullName: user.user_metadata?.full_name || '(no name)'
	});

	// check roles table
	const { data: rolesData, error: rolesError } = await locals.supabase
		.from('roles')
		.select('*')
		.eq('userId', locals.userId)
		.eq('role', 'seller')
		.maybeSingle(); // 👈 safer

	const isAdmin = !!rolesData;

	if (!isAdmin) {
		console.log(`❌ Redirecting user to seller confirmation: ${user.email}`);
		throw redirect(302, '/createAccount');
	} else {
		console.log(`✅ Redirecting user to personal dashboard: ${user.email}`);
	}

	return {
		user,
		isAdmin,
		supabaseError: rolesError ? { message: rolesError.message, status: rolesError.status } : null
	};
};
