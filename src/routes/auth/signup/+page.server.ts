// +page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			await logEvent(
				locals.supabase,
				null,
				`Validation failure: Invalid email format during signup - ${email}`
			);
			return fail(400, { error: 'Invalid email format.' });
		}

		// Validate password strength
		if (password.length < 6) {
			await logEvent(
				locals.supabase,
				null,
				`Validation failure: Password too short during signup - ${email} (length: ${password.length})`
			);
			return fail(400, { error: 'Password must be at least 6 characters long.' });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password
		});

		// Error handling
		if (error) {
			console.log(error.message);
			const errorType = error.message.toLowerCase();
			let logMessage = `Failed signup attempt: ${email} - ${error.message}`;
			
			if (errorType.includes('already registered') || errorType.includes('already exists')) {
				logMessage = `Authentication failure: Email already registered - ${email}`;
			} else if (errorType.includes('invalid') || errorType.includes('weak password')) {
				logMessage = `Validation failure: Invalid signup data - ${email} - ${error.message}`;
			}

			await logEvent(locals.supabase, null, logMessage);

			// Custom error messages
			if (error.message.includes('Invalid login credentials')) {
				return fail(400, { error: 'Incorrect email or password.' });
			}
			if (error.message.includes('User already registered')) {
				return fail(400, { error: 'This email is already registered.' });
			}

			// Default
			return fail(400, { error: error.message });
		}

		// If everything is fine
		const userId = data.user?.id || null;
		await logEvent(locals.supabase, userId, `Successful signup: ${email}`);
		throw redirect(303, '/auth/check-email');
	}
};
