import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 });

	const { productId, quantity } = await request.json();
	console.log(productId, quantity);

	if (!productId || !quantity)
		return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });

	const { data, error } = await locals.supabase
		.from('cart')
		.upsert(
			{ user_id: user.id, product_id: productId, quantity },
			{ onConflict: ['user_id', 'product_id'] }
		);

	if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

	return new Response(JSON.stringify({ data }), { status: 200 });
};
