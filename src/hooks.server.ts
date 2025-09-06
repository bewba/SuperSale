// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { getPb } from '$lib/pocketbase/pb.client';

export const handle: Handle = async ({ event, resolve }) => {
	//console.log('hooks running', PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY ? 'KEY OK' : 'NO KEY');

	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	const pb = getPb();

	// attach pb to locals
	event.locals.pb = pb ?? null;

	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();

	event.locals.user = user ?? null;

	return resolve(event);
};
