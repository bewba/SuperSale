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
		async signIn({ user, account }) {
			// Supabase client (we need anon key to write logs)
			const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

			if (!user?.email) {
				// ❌ Log failed login
				await logEvent(supabase, null, 'Failed login attempt (no user email)', false, 1);
				return false;
			}

			// At this point Auth.js says login is valid → log success
			await logEvent(supabase, user.id ?? null, `Successful login: ${user.email}`, true, 1);

			return true; // let login continue
		}
	}
});

// 2. Custom handle to store session in locals
const sessionHandle: Handle = async ({ event, resolve }) => {
	// Get the session from Auth.js
	const session = await event.locals.auth();
	const isNewSession = !event.cookies.get('session_seen');

	// Store it in locals for easy access
	event.locals.session = session;

	if (session?.user) {
		event.locals.user = session.user;

		if (isNewSession) {
			console.log('🎉 New login session detected:', session.user.email);

			event.cookies.set('session_seen', 'true', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax'
			});
		}
	}
	// Setup Supabase client
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Get user role if authenticated
	if (session?.user) {
		const { data: userData, error } = await event.locals.supabase
			.from('users')
			.select('*')
			.eq('email', session.user.email)
			.single();

		event.locals.userId = userData?.id ?? null;

		const { data: roleData, error: roleError } = await event.locals.supabase
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
