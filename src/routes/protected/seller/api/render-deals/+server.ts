import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	// Get current user

	const user = locals.userId;

	if (!user) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
	}

	const { data: products, error } = await locals.supabase
		.from('products')
		.select('*')
		.eq('owner_id', user);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	} else {
		// TODO:ADD a log
	}

	return new Response(JSON.stringify(products), {
		headers: { 'Content-Type': 'application/json' }
	});
};
