import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	let user: Record<string, any>;

	if (locals.user) {
		console.log('logged in user');
		user = { ...locals.user };
	} else {
		console.log('guest');
		user = { id: cookies.get('fingerprint') };
	}

	return {
		user: user
	};
};
