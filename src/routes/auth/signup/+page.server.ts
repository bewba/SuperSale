// +page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		// Type validation (formData values are strings or null)
		const typeValidation = await validateTypes(locals.supabase, null, [
			{ value: email, expectedType: 'string', fieldName: 'email', required: true },
			{ value: password, expectedType: 'string', fieldName: 'password', required: true }
		]);

		if (!typeValidation.valid) {
			return fail(400, { error: 'Email and password are required' });
		}

		// TypeScript: email and password are guaranteed to be strings after validation
		const emailStr = email as string;
		const passwordStr = password as string;

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailStr)) {
			await logEvent(
				locals.supabase,
				null,
				`Validation failure: Invalid email format during signup - ${emailStr}`
			);
			return fail(400, { error: 'Invalid email format.' });
		}

		// Validate password strength
		if (passwordStr.length < 6) {
			await logEvent(
				locals.supabase,
				null,
				`Validation failure: Password too short during signup - ${emailStr} (length: ${passwordStr.length})`
			);
			return fail(400, { error: 'Password must be at least 6 characters long.' });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email: emailStr,
			password: passwordStr
		});

		// Error handling
		if (error) {
			console.log(error.message);
			const errorType = error.message.toLowerCase();
			let logMessage = `Failed signup attempt: ${email} - ${error.message}`;
			
			if (errorType.includes('already registered') || errorType.includes('already exists')) {
				logMessage = `Authentication failure: Email already registered - ${emailStr}`;
			} else if (errorType.includes('invalid') || errorType.includes('weak password')) {
				logMessage = `Validation failure: Invalid signup data - ${emailStr} - ${error.message}`;
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
		await logEvent(locals.supabase, userId, `Successful signup: ${emailStr}`);
		throw redirect(303, '/auth/check-email');
	}
};
