import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const remember = formData.get('remember-me') === 'on';

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

		// Check if user is banned before attempting login
		const { data: userData } = await locals.supabase
			.from('users')
			.select('id, is_banned, email')
			.eq('email', emailStr)
			.single();

		if (userData?.is_banned) {
			await logEvent(
				locals.supabase,
				userData.id,
				`Authentication failure: Banned user attempted login - ${emailStr}`
			);
			return fail(403, { error: 'Account is banned. Please contact support.' });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email: emailStr,
			password: passwordStr
		});

		if (error) {
			// Check for specific error types
			const errorType = error.message.toLowerCase();
			let logMessage = `Failed login attempt: ${email} - ${error.message}`;

			if (errorType.includes('invalid') || errorType.includes('incorrect')) {
				logMessage = `Authentication failure: Invalid credentials for ${emailStr}`;
			} else if (errorType.includes('too many') || errorType.includes('rate limit')) {
				logMessage = `Authentication lockout: Too many failed attempts for ${emailStr}`;
			} else if (errorType.includes('email not confirmed')) {
				logMessage = `Authentication failure: Unconfirmed email for ${emailStr}`;
			}

			await logEvent(locals.supabase, userData?.id || null, logMessage);
			return fail(400, { error: error.message });
		}

		// Only redirect if session exists
		if (data.session) {
			// Get user ID for logging
			const userId = data.session.user?.id || null;

			// Double-check ban status after successful auth
			if (userData?.is_banned) {
				await logEvent(
					locals.supabase,
					userId,
					`Authentication blocked: Banned user attempted login - ${emailStr}`
				);
				await locals.supabase.auth.signOut();
				return fail(403, { error: 'Account is banned. Please contact support.' });
			}

			await logEvent(locals.supabase, userId, `Successful login: ${emailStr}`);
			// The cookie has already been set by the server adapter
			throw redirect(303, '/');
		}

		// This should rarely happen, but just in case
		await logEvent(
			locals.supabase,
			null,
			`Authentication failure: ${emailStr} - No session created`
		);
		return fail(400, { error: 'Login failed' });
	}
};
