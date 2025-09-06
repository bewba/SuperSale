// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import crypto from 'crypto';
import { SITE_NATURE } from '$env/static/private';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	//const { data: products } = await locals.supabase.from('products').select('*').limit(6);

	if (!locals.user) {
		let fingerprint = cookies.get('fingerprint');

		if (!fingerprint) {
			fingerprint = crypto.randomUUID();

			cookies.set('fingerprint', fingerprint, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: SITE_NATURE === 'production',
				maxAge: 60 * 60 * 24 * 365
			});
			console.log(`🚫 anonymous opened ${url.pathname} (new fingerprint)`, fingerprint);
		} else {
			console.log(`🚫 anonymous opened ${url.pathname} (existing fingerprint)`, fingerprint);
		}
		console.log(`🚫 anonymous opened ${url.pathname}`);
	} else {
		console.log(`✅ user opened ${url.pathname}`, {
			email: locals.user.email,
			fullName: locals.user.user_metadata?.full_name || '(no name)'
		});
	}
};
