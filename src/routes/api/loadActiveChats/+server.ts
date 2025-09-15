import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	try {
		const userId = locals.user?.id || cookies.get('fingerprint');
		if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

		const pb = locals.pb;

		// get pagination params
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = parseInt(url.searchParams.get('perPage') || '10');

		// fetch paginated chat rooms for this user
		const { items: chatRooms, totalItems } = await pb
			.collection('chat_rooms')
			.getList(page, perPage, {
				filter: `buyer='${userId}' || seller='${userId}'`,
				sort: '-updated'
			});

		const chats = [];

		for (const room of chatRooms) {
			// last message
			const { items: lastMessages } = await pb.collection('messages').getList(1, 1, {
				filter: `chatroom_id='${room.id}'`,
				sort: '-created'
			});
			const lastMessage = lastMessages[0];

			// unseen messages for this user
			const { total: unseenTotal } = await pb.collection('messages').getList(1, 1, {
				filter: `chatroom_id='${room.id}' && sender_id!='${userId}' && is_seen=false`
			});

			chats.push({
				id: room.id,
				productImage: room.product,
				productName: room.product,
				contactPerson: room.buyer === userId ? room.seller : room.buyer,
				lastMessageTime: lastMessage?.created || room.updated,
				lastMessage: lastMessage?.text || '',
				hasUnseenMessages: unseenTotal > 0
			});
		}

		console.log(chats);

		return new Response(
			JSON.stringify({
				activeChats: chats,
				hasMore: page * perPage < totalItems
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		console.error('Error loading active chats:', err);
		return new Response(JSON.stringify({ error: 'Failed to load chats' }), { status: 500 });
	}
};
