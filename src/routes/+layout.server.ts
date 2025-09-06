import type { LayoutServerLoad } from './$types';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { supabase, user } = locals;

	let cartItemCount = 0;

	if (user) {
		const { count, error } = await supabase
			.from('cart')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id);

		if (!error && typeof count === 'number') {
			cartItemCount = count;
		}
	}

	//console.log(cartItemCount);

	return {
		user,
		cartItemCount
	};
};
