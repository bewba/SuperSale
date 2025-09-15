import { redirect } from '@sveltejs/kit';

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
			throw redirect(303, '/auth/auth-code-error');
		}

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
