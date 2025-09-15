import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
	const supabase = locals.supabase;
	
	// Get seller_id from query parameters
	const sellerId = url.searchParams.get('seller_id');
	
	if (!sellerId) {
		return new Response(JSON.stringify({ error: "Seller ID is required" }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

  console.log("SellerId: ", sellerId)

	const { data, error } = await supabase
		.from('roles')
		.select('*')
		.eq('userId', sellerId)
		.single();

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!data) {
		return new Response(JSON.stringify({ error: "Seller not found" }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(JSON.stringify({ data }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};