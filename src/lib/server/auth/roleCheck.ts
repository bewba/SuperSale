import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function checkUserRole(event: RequestEvent, role: string[]) {
	const { locals } = event;

	console.log(locals.user, locals.userRole);

	if (!locals.user) {
		return 1; // not logged in
	}

	if (role.includes(locals.userRole)) {
		return 0; // role matches
	} else if (locals.user && !role.includes(locals.userRole)) {
		return 3; // logged in but wrong role
	} else {
		return 2; // logged in but no role
	}
}
