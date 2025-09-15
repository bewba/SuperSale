import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	try {
		const userId = locals.user?.id || cookies.get('fingerprint');
		if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

		const pb = locals.pb;

		// get pagination params
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = parseInt(url.searchParams.get('perPage') || '10');
		const chatId = url.searchParams.get('chatId'); // For single chat updates

		let chatRooms, totalItems;

		if (chatId) {
			// Fetch single chat room for real-time updates
			try {
				const room = await pb.collection('chat_rooms').getOne(chatId, {
					filter: `buyer='${userId}' || seller='${userId}'`
				});
				chatRooms = [room];
				totalItems = 1;
			} catch (err) {
				// Chat room not found or user doesn't have access
				return new Response(JSON.stringify({ activeChats: [], hasMore: false }), {
					headers: { 'Content-Type': 'application/json' }
				});
			}
		} else {
			// Fetch paginated chat rooms for this user
			const result = await pb.collection('chat_rooms').getList(page, perPage, {
				filter: `buyer='${userId}' || seller='${userId}'`,
				sort: '-updated'
			});
			chatRooms = result.items;
			totalItems = result.totalItems;
		}

		const chats = [];

		for (const room of chatRooms) {
			// Get the other person's name based on stored names in chat_rooms
			let contactPersonName;
			let contactPersonId;

			if (room.buyer === userId) {
				contactPersonName = room.seller_name || room.seller;
				contactPersonId = room.seller;
			} else {
				contactPersonName = room.buyer_name || room.buyer;
				contactPersonId = room.buyer;
			}

			// Use stored last message info from chat_rooms if available
			let lastMessage = room.last_message || '';
			let lastMessageTime = room.last_message_sent || room.updated;

			// If no stored last message, fetch from messages collection
			if (!lastMessage) {
				const { items: lastMessages } = await pb.collection('messages').getList(1, 1, {
					filter: `chatroom_id='${room.id}'`,
					sort: '-created'
				});
				const lastMessageRecord = lastMessages[0];
				lastMessage = lastMessageRecord?.text || '';
				lastMessageTime = lastMessageRecord?.created || room.updated;
			}

			// Check for unseen messages
			const { total: unseenTotal } = await pb.collection('messages').getList(1, 1, {
				filter: `chatroom_id='${room.id}' && sender_id!='${userId}' && is_seen=false`
			});

			console.log(room);

			chats.push({
				id: room.id,
				productImage: room.image_url || '/placeholder-image.jpg',
				productName: room.product,
				contactPerson: contactPersonName,
				contactPersonId: contactPersonId,
				lastMessageTime: lastMessageTime,
				lastMessage: lastMessage,
				hasUnseenMessages: unseenTotal > 0,
				buyer: room.buyer,
				seller: room.seller,
				seen_by: room.seen_by,
				productNameText: room.product_name,
				seller_name: room.seller_name
			});
		}

		// Sort chats by last message time (most recent first)
		chats.sort(
			(a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
		);

		console.log(`Loaded ${chats.length} chats for user ${userId}`);

		return new Response(
			JSON.stringify({
				activeChats: chats,
				hasMore: !chatId && page * perPage < totalItems
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		console.error('Error loading active chats:', err);
		return new Response(JSON.stringify({ error: 'Failed to load chats' }), { status: 500 });
	}
};
