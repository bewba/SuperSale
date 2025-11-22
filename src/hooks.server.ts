// src/hooks.server.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	SUPABASE_SERVICE_ROLE_KEY,
	AUTH_SECRET
} from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { logEvent } from '$lib/server/utils/logger';
import { toastInfo } from '$lib/stores/toast';

// 1. Setup Auth.js with Supabase adapter
const { handle: authHandle } = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
	],
	adapter: SupabaseAdapter({
		url: PUBLIC_SUPABASE_URL,
		secret: SUPABASE_SERVICE_ROLE_KEY
	}),
	session: {
		strategy: 'database'
	},
	secret: AUTH_SECRET,
	callbacks: {
		async signIn({ user }) {
			const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

			if (!user?.email) {
				// ❌ Log failed login
				await logEvent(supabase, null, 'Failed login attempt (no user email)', false, 1);
				return false;
			}

			// ✅ Log successful login
			await logEvent(supabase, user.id ?? null, `Successful login: ${user.email}`, true, 1);

			return true; // continue login
		}
	}
});

// 2. Custom handle to store session in locals and detect fresh login
const sessionHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	// Store session and user in locals
	event.locals.session = session;
	if (session?.user) event.locals.user = session.user;

	// Setup Supabase client in locals
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Get user ID and role if authenticated
	if (session?.user) {
		const { data: userData } = await event.locals.supabase
			.from('users')
			.select('*')
			.eq('email', session.user.email)
			.single();

		event.locals.userId = userData?.id ?? null;

		const { data: roleData } = await event.locals.supabase
			.from('roles')
			.select('role')
			.eq('userId', event.locals.userId)
			.single();

		event.locals.userRole = roleData?.role ?? null;
	} else {
		event.locals.userRole = 'anon';
	}

	return resolve(event);
};

// 3. Combine both handles using sequence
export const handle = sequence(authHandle, sessionHandle);
