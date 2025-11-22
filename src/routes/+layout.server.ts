import { checkUserRole } from '$lib/server/auth/roleCheck';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	const { user, userRole } = locals;

	const roleCheck = await checkUserRole(event, ['seller']);

	if (roleCheck === 5) {
		//throw redirect(302, '/unauthorized');
	}

	return {
		user,
		userRole
	};
};
