import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	let { supabase, user } = locals;

	if (!user) {
		user = { id: cookies.get('fingerprint') };
	}

	console.log('fingerprint = ', user);

	return {
		user
	};
};
