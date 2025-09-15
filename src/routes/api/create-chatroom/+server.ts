// src/routes/api/create-chatroom/+server.ts
import type { RequestHandler } from './$types';
import { sendSingleEmail } from '$lib/utils/email';
import { SITE_NATURE } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const { selectedDeal } = await request.json();

		let buyerId: string = '';
		let username: string | null = null;

		const pb = locals.pb;
		const sb = locals.supabase;

		if (locals.user) {
			buyerId = locals.user.id;
			username = locals.user.email;
		} else {
			buyerId = cookies.get('fingerprint') ?? '';
			username = 'Guest';
		}

		const sellerId = selectedDeal.owner_id;
		let sellerName: string | null = null;

		const { data: supaSeller, error: sellerError } = await sb
			.from('roles')
			.select('store_name')
			.eq('userId', sellerId)
			.single();

		if (!sellerError && supaSeller) {
			sellerName = supaSeller.store_name;
		} else {
			sellerName = 'Unknown Seller';
		}

		let record: any = null;

		let existing;

		try {
			existing = await pb
				.collection('chat_rooms')
				.getFirstListItem(
					`buyer="${buyerId}" && seller="${selectedDeal.owner_id}" && product="${selectedDeal.id}"`
				);
			console.log('Chatroom exists:', existing.id);
			console.log('Selected deal:', selectedDeal.id);
			record = existing;
		} catch (err: any) {
			if (err.status === 404) {
				console.log('No existing chatroom, creating one...');
				existing = await pb.collection('chat_rooms').create({
					buyer: buyerId,
					buyer_name: username,
					seller: selectedDeal.owner_id,
					seller_name: sellerName,
					product: selectedDeal.id,
					product_name: selectedDeal.title,
					image_url: selectedDeal.image_list[0]
				});
				record = existing;

				console.log(selectedDeal.owner_id);
			} else {
				throw err;
			}
		}

		return new Response(JSON.stringify({ success: true, chatroomId: record.id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err: any) {
		console.log(err);
		return new Response(JSON.stringify({ success: false, error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
