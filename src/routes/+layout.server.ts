import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { supabase, user } = locals;

	// User is already set in hooks.server.ts from Supabase auth
	// No need to check Auth.js session since we're using Supabase for now

	return {
		user
	};
};
