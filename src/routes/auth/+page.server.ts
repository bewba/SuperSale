import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

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
			return fail(400, { error: 'Email and password are required' });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password,
			options: { persistSession: remember }
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		// Only redirect if session exists
		if (data.session) {
			// The cookie has already been set by the server adapter
			throw redirect(303, '/');
		}

		// This should rarely happen, but just in case
		return fail(400, { error: 'Login failed' });
	}
};

