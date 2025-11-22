import type { RequestHandler } from './$types';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async ({ locals }) => {
	const userId = locals.userId;
	const userEmail = locals.user?.email || 'Unknown';
	
	await logEvent(locals.supabase, userId, `User logged out: ${userEmail}`);
	
	console.log(await locals.supabase.auth.signOut());
	return new Response(null, { status: 200 });
};
