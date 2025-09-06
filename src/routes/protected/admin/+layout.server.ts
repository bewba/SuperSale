// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './upload/$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const {
		data: { user },
		error: authError
	} = await locals.supabase.auth.getUser();

	if (!user) {
		console.log(`🚫 anonymous opened ${url.pathname}`);
		throw redirect(302, '/');
	}

	console.log(`✅ user opened ${url.pathname}`, {
		email: user.email,
		fullName: user.user_metadata?.full_name || '(no name)'
	});

	console.log(user.id);

	// check roles table
	const { data: rolesData, error: rolesError } = await locals.supabase
		.from('roles')
		.select('*')
		.eq('userId', user.id)
		.eq('role', 'admin')
		.single();

	console.log(rolesData, rolesError);

	const isAdmin = !!rolesData;

	if (!isAdmin) {
		console.log(`❌ user is not admin: ${user.email}`);
		throw redirect(302, '/');
	} else {
		console.log(`✅ user is admin: ${user.email}`);
	}

	return {
		user,
		isAdmin,
		supabaseError:
			authError || rolesError
				? { message: (authError || rolesError)?.message, status: (authError || rolesError)?.status }
				: null
	};
};
