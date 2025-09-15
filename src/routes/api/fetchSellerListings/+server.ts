import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const supabase = locals.supabase;

	// sellerId must be provided in query params
	const sellerId = url.searchParams.get('sellerId');
	if (!sellerId) {
		return new Response(
			JSON.stringify({ error: 'Missing sellerId parameter' }),
			{ status: 400 }
		);
	}

	// pagination params
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);
	const limit = parseInt(url.searchParams.get('limit') || '10', 10);

	console.log(`Resolving userId for sellerId=${sellerId}`);

	// get the userId from roles
	const { data: role, error: roleError } = await supabase
		.from('roles')
		.select('userId')
		.eq('id', sellerId)
		.single();

	if (roleError) {
		return new Response(JSON.stringify({ error: roleError.message }), { status: 500 });
	}

	if (!role) {
		return new Response(JSON.stringify({ error: 'Seller not found' }), { status: 404 });
	}

	const userId = role.userId;
	console.log(`Fetching products for userId=${userId}, offset=${offset}, limit=${limit}`);

	// fetch products belonging to that userId
	const { data, error, count } = await supabase
		.from('products')
		.select('*', { count: 'exact' })
		.eq('owner_id', userId) 
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	const mappedData = (data ?? []).map((item: any) => ({
		...item,
		image: item.image // adjust if needed
	}));

	const hasMore = offset + limit < (count ?? 0);

	return new Response(
		JSON.stringify({
			data: mappedData,
			hasMore
		}),
		{ status: 200 }
	);
};
