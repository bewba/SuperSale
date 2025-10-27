import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	let { supabase, user } = locals;

	const session = await locals.auth();

	console.log('Session: ', session);

	if (!session) {
		user = { id: cookies.get('fingerprint') };
	} else {
		user = session;
	}

	return {
		user
	};
};
