import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const supabase = locals.supabase;

	const currentPage = Number(url.searchParams.get('page')) || 1;
	const rows = 10;

	const startIndex = (currentPage - 1) * rows;

	// Call your custom RPC
	const { data, error } = await supabase.rpc('roles_with_products', {
		limit_count: rows,
		offset_count: startIndex
	});

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(
		JSON.stringify({
			data,
			currentPage,
			rows
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
