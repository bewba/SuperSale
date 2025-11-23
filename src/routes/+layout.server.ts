import { checkUserRole } from '$lib/server/auth/roleCheck';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	const { user, userRole } = locals;

	return {
		user,
		userRole
	};
};
