import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const supabase = locals.supabase;
	console.log('SERVER SLUG: ', params.slug);

	const { data, error } = await supabase
		.from('roles')
		.select('*')
		.eq('id', params.slug)
		.maybeSingle();

	if (error) {
		return { seller: null, error: error.message };
	}

	if (!data) {
		return { seller: null, error: 'Seller not found' };
	}

	return { seller: data };
};
