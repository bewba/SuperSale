// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { supabase, user, userId } = locals;

	let secondLastSignIn: any = null;

	if (!userId) {
		// no user ID → redirect to home
		throw redirect(302, '/');
	}

	// get the 2nd latest login
	const { data, error } = await supabase
		.from('logs')
		.select('*')
		.eq('user_id', userId)
		.eq('type', 1)
		.order('created_at', { ascending: false }) // latest first
		.range(1, 1); // 0 = latest, 1 = second latest

	if (!error && data && data.length > 0) {
		secondLastSignIn = data[0];
	}

	const now = Date.now();
	const TEN_SECONDS = 10 * 1000;

	// if no 2nd last login, it's a new account → redirect to home
	if (!secondLastSignIn) {
		throw redirect(302, '/');
	}

	// otherwise, log new login if needed
	if (now > new Date(secondLastSignIn.created_at).getTime() + TEN_SECONDS) {
		const { error: insertError } = await supabase.from('logs').insert({
			user_id: userId,
			message: `Successful login: ${user?.email}`,
			type: 1,
			success: true
		});

		if (insertError) {
			console.error('Error logging new login:', insertError);
		}
	}

	return {
		user,
		secondLastSignIn
	};
};
