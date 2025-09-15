import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
	const supabase = locals.supabase;
	
	const sellerId = params.seller_id;
	
	if (!sellerId) {
		return new Response(JSON.stringify({ error: "Seller ID is required" }), { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { data, error } = await supabase
		.from('sellers') // Replace 'sellers' with your actual table name
		.select('*') // Select all columns, or specify: 'id, name, email, etc.'
		.eq('id', sellerId) // Assuming the column is named 'id'
		.single(); // Use .single() if you expect exactly one row

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