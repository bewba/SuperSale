import { redirect, type RequestEvent } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export async function checkUserRole(event: RequestEvent, role: string[]) {
	const { locals } = event;

	console.log(locals.user, locals.userRole);

	if (!locals.user) {
		// Log access control failure for unauthenticated access
		await logEvent(
			locals.supabase,
			null,
			`Access control failure: Unauthenticated user attempted to access ${event.url.pathname} (required roles: ${role.join(', ')})`
		);
		console.log('1');
		return 1; // not logged in
	}

	// Check if user is banned
	const { data: userData } = await locals.supabase
		.from('users')
		.select('is_banned')
		.eq('id', locals.userId)
		.single();

	if (userData?.is_banned) {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: Banned user attempted to access ${event.url.pathname} (required roles: ${role.join(', ')})`
		);
		console.log('5');
		return 5; // banned user
	}

	if (role.includes(locals.userRole)) {
		console.log('0');
		return 0; // role matches
	} else if (locals.user && !role.includes(locals.userRole)) {
		// Log access control failure for wrong role
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: User with role "${locals.userRole}" attempted to access ${event.url.pathname} (required roles: ${role.join(', ')})`
		);
		console.log('3');
		return 3; // logged in but wrong role
	} else {
		// Log access control failure for no role
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: User without role attempted to access ${event.url.pathname} (required roles: ${role.join(', ')})`
		);
		console.log('2');
		return 2; // logged in but no role
	}
}
