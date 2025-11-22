import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const supabase = locals.supabase;

	// read query params (default: first 10 items)
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);
	const limit = parseInt(url.searchParams.get('limit') || '10', 10);

	console.log(offset, limit);

	// fetch a batch of products
	const { data, error, count } = await supabase
		.from('all_products_including_expired')
		.select('*')
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	const mappedData = data.map((item: any) => ({
		...item,
		image: item.image // adjust if you transform your image path later
	}));

	// check if there are more products left
	const hasMore = offset + limit < (count ?? 0);

	return new Response(
		JSON.stringify({
			data: mappedData,
			hasMore
		}),
		{ status: 200 }
	);
};
