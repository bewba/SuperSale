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
	secret: AUTH_SECRET
});

// 2. Custom handle to store session in locals
const sessionHandle: Handle = async ({ event, resolve }) => {
	// Get the session from Auth.js
	const session = await event.locals.auth();

	// Store it in locals for easy access
	event.locals.session = session;

	if (session) {
		event.locals.user = session.user;
	}

	// Setup Supabase client
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Get user role if authenticated
	if (session?.user) {
		const { data: roleData } = await event.locals.supabase
			.from('roles')
			.select('role')
			.eq('userId', session.user.id)
			.single();

		event.locals.userRole = roleData?.role ?? null;

		const { data: userData, error } = await event.locals.supabase
			.from('users')
			.select('*')
			.eq('email', session.user.email)
			.single();

		event.locals.userId = userData?.id ?? null;

		console.log('userData: ', userData);
		console.log(error);
	} else {
		event.locals.userRole = 'anon';
	}

	return resolve(event);
};

// 3. Combine both handles using sequence
export const handle = sequence(authHandle, sessionHandle);
