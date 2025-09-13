// src/routes/auth/confirm/+server.ts
import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash') as string | null;
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') || '/';

	console.log('confirming');

	if (token_hash && type) {
		// ✅ Verify OTP
		const { error } = await supabase.auth.verifyOtp({ token_hash, type });

		if (!error) {
			// ✅ Get the user
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError || !userData.user) {
				console.error('Could not fetch user after verifyOtp:', userError);
				throw redirect(303, '/auth/error');
			}

			const userId = userData.user.id;

			// ✅ Check if role already exists
			const { data: existingRoles, error: checkError } = await supabase
				.from('roles')
				.select('role')
				.eq('userId', userId);

			if (checkError) {
				console.error('Error checking roles:', checkError);
				throw redirect(303, '/auth/error');
			}

			// ✅ Insert role if none exists
			if (!existingRoles || existingRoles.length === 0) {
				const { error: insertError } = await supabase
					.from('roles')
					.insert({ userId, role: 'seller' });

				if (insertError) {
					console.error('Error inserting role:', insertError);
					throw redirect(303, '/auth/error');
				}
			}

			console.log('success');
			// ✅ Success → send them to `next`
			throw redirect(303, next);
		}

		console.log(error);
	}

	// ❌ Failure → error page
	throw redirect(303, '/auth/error');
};
