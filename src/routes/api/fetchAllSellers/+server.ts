import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
	const supabase = locals.supabase;

	const currentPage = Number(url.searchParams.get("page")) || 1;

	// How many rows per page
	const rows = 10;

	// Calculate start and end index for batch range
	const startIndex = (currentPage - 1) * rows;
	const endIndex = startIndex + rows - 1;

	const { data, error } = await supabase
		.from("roles")
		.select("*")
		.range(startIndex, endIndex);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(
		JSON.stringify({
			data,
			currentPage,
			rows,
		}),
		{
			status: 200,
			headers: { "Content-Type": "application/json" },
		}
	);
};