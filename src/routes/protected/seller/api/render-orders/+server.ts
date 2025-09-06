import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Get the current logged-in user
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		if (userError || !user) {
			return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
		}

		// Fetch all orders where the deal belongs to this user
		const { data: myOrders, error } = await locals.supabase
			.from('orders')
			.select(
				`
        uuid,
		contactNumber,
		created_at,
		customerName,
		deal_title,
		email,
		is_accepted,
        totalPrice,
        quantity,
		products!inner(
			discount_price,
			is_active,
			title
		)
	`
			)
			.eq('products.owner_id', user.id);

		if (error) {
			console.error('Supabase error:', error);
			return new Response(JSON.stringify({ error: error.message }), { status: 500 });
		}

		return new Response(JSON.stringify(myOrders), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
	}
};
