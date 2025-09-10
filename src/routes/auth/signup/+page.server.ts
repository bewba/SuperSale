// +page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password
		});

		// Error handling
		if (error) {
			console.log(error.message);

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
		throw redirect(303, '/auth/check-email');
	}
};
