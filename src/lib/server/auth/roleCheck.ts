import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function checkUserRole(event: RequestEvent, role: string) {
	const { locals } = event;

	console.log(locals.user);

	// If not logged in
	if (!locals.user) {
		return 1;
	}

	if (locals.userRole == role) {
		return 0; // If the role matches
	} else if (locals.userRole != role && locals.user) {
		return 2; // If the person is logged in, but they have no role
	} else {
		return 3; // If they do not have the role
	}
}
