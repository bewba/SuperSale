import { redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const GET = async (event: any) => {
	const {
		url,
		locals: { supabase }
	} = event;

	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { data: sessionData, error: sessionError } =
			await supabase.auth.exchangeCodeForSession(code);

		if (sessionError || !sessionData?.user?.id) {
			console.error(sessionError);
			await logEvent(
				supabase,
				null,
				`Authentication failure: OAuth callback error - ${sessionError?.message || 'No user ID'}`
			);
			throw redirect(303, '/auth/auth-code-error');
		}

		const userId = sessionData.user.id;
		const userEmail = sessionData.user.email;

		// Check if user is banned
		const { data: userData } = await supabase
			.from('users')
			.select('is_banned')
			.eq('id', userId)
			.single();

		if (userData?.is_banned) {
			await logEvent(
				supabase,
				userId,
				`Authentication failure: Banned user attempted OAuth login - ${userEmail}`
			);
			await supabase.auth.signOut();
			throw redirect(303, '/auth?error=banned');
		}

		await logEvent(supabase, userId, `Successful OAuth login: ${userEmail}`);

		const userId = sessionData.user.id;

		// Check if the user already has a role
		// const { data: existingRoles, error: checkError } = await supabase
		// 	.from('roles')
		// 	.select('role')
		// 	.eq('userId', userId);

		// if (checkError) {
		// 	console.error(checkError);
		// 	throw redirect(303, '/auth/auth-code-error');
		// }

		// // If the user has no roles, assign 'seller'
		// if (!existingRoles || existingRoles.length === 0) {
		// 	const { data: insertData, error: insertError } = await supabase
		// 		.from('roles')
		// 		.insert({ userId, role: 'seller' });

		// 	if (insertError) {
		// 		console.error(insertError);
		// 		throw redirect(303, '/auth/auth-code-error');
		// 	}
		// }

		// Redirect to next page
		throw redirect(303, next);
	}

	// If no code, redirect to error
	throw redirect(303, '/auth/auth-code-error');
};
