// src/routes/api/create-chatroom/+server.ts
import type { RequestHandler } from './$types';
import { sendSingleEmail } from '$lib/utils/email';
import { SITE_NATURE } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const { selectedDeal } = await request.json();

		// console.log(selectedDeal);

		let buyerId: string = '';

		if (locals.user) {
			buyerId = locals.user.id;
		} else {
			buyerId = cookies.get('fingerprint') ?? '';
		}

		const pb = locals.pb;
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
					seller: selectedDeal.owner_id,
					product: selectedDeal.id
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
