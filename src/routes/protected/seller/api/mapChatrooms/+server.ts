import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase;

	// 1. parse chatRooms sent from client
	const chatRooms = await request.json();

	console.log(chatRooms);

	// 2. collect IDs
	const productIds = [...new Set(chatRooms.map((c: any) => c.product))];
	const buyerIds = [...new Set(chatRooms.map((c: any) => c.buyer))];

	// Run both queries in parallel
	const [{ data: productsData, error: productsError }, { data: emailsData, error: emailsError }] =
		await Promise.all([
			supabase.from('products').select('id, title').in('id', productIds),
			supabase.rpc('get_user_emails_by_ids', {
				uids: buyerIds
			})
		]);

	if (productsError || emailsError) {
		console.error(productsError ?? emailsError);
		return new Response(JSON.stringify({ error: productsError ?? emailsError }), { status: 500 });
	}

	// 3. make lookup maps
	const productsMap = Object.fromEntries(productsData?.map((p) => [p.id, p.title]) ?? []);
	const emailsMap = Object.fromEntries(emailsData?.map((e) => [e.id, e.email]) ?? []);

	console.log(productsMap);

	// 4. enrich chats
	const enriched = chatRooms.map((chat: any) => ({
		...chat,
		productName: productsMap[chat.product] ?? 'Unknown deal',
		buyerEmail: emailsMap[chat.buyer] ?? 'Guest'
	}));

	console.log(enriched);

	return new Response(JSON.stringify(enriched), { status: 200 });
};
