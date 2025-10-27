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

// 1. Setup Auth.js with Supabase adapter
const authHandle = SvelteKitAuth({
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
		strategy: 'database' // sessions stored in Supabase
	},
	secret: AUTH_SECRET // used to sign cookies
});

// 2. Combine Supabase client + Auth.js
export const handle: Handle = async ({ event, resolve }) => {
	// Expose supabase client (anon key) to locals
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			headers: {
				// Forward session cookie to Supabase (RLS aware queries)
				Authorization: event.request.headers.get('Authorization') ?? ''
			}
		}
	});

	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();
	event.locals.user = user ?? null;

	if (event.locals.user) {
		console.log('skibidi');
		const { data, error } = await event.locals.supabase
			.from('roles')
			.select('role')
			.eq('userId', event.locals.user.id)
			.single();
		event.locals.userRole = data?.role ? String(data.role) : null;
		console.log('role: ', event.locals.userRole);
	} else {
		event.locals.userRole = null;
	}

	return authHandle.handle({ event, resolve });
};
