import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const remember = formData.get('remember-me') === 'on';

		if (!email || !password) {
			await logEvent(
				locals.supabase,
				null,
				`Validation failure: Missing email or password during login attempt`
			);
			return fail(400, { error: 'Email and password are required' });
		}

		// Check if user is banned before attempting login
		const { data: userData } = await locals.supabase
			.from('users')
			.select('id, is_banned, email')
			.eq('email', email)
			.single();

		if (userData?.is_banned) {
			await logEvent(
				locals.supabase,
				userData.id,
				`Authentication failure: Banned user attempted login - ${email}`
			);
			return fail(403, { error: 'Account is banned. Please contact support.' });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password,
			options: { persistSession: remember }
		});

		if (error) {
			// Check for specific error types
			const errorType = error.message.toLowerCase();
			let logMessage = `Failed login attempt: ${email} - ${error.message}`;

			if (errorType.includes('invalid') || errorType.includes('incorrect')) {
				logMessage = `Authentication failure: Invalid credentials for ${email}`;
			} else if (errorType.includes('too many') || errorType.includes('rate limit')) {
				logMessage = `Authentication lockout: Too many failed attempts for ${email}`;
			} else if (errorType.includes('email not confirmed')) {
				logMessage = `Authentication failure: Unconfirmed email for ${email}`;
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
					`Authentication blocked: Banned user attempted login - ${email}`
				);
				await locals.supabase.auth.signOut();
				return fail(403, { error: 'Account is banned. Please contact support.' });
			}

			await logEvent(locals.supabase, userId, `Successful login: ${email}`);
			// The cookie has already been set by the server adapter
			throw redirect(303, '/');
		}

		// This should rarely happen, but just in case
		await logEvent(locals.supabase, null, `Authentication failure: ${email} - No session created`);
		return fail(400, { error: 'Login failed' });
	}
};
