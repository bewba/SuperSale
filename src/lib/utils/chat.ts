// src/lib/chat.ts
import type { RecordModel } from 'pocketbase';
import { getPb } from '$lib/pocketbase/pb.client';

export type Message = RecordModel & {
	text: string;
	slug: string;
	sender_id?: string | null;
	sender_name?: string | null;
};

export type SystemMessage = {
	id: string;
	text: string;
	isSystem: true;
};

export async function loadMessages(slug: string) {
	const pb = getPb();
	const list = await pb.collection('messages').getList<Message>(1, 100, {
		filter: `chatroom_id="${slug}"`,
		sort: 'created'
	});

	return list.items;
}

export async function subscribeToMessages(chatroomId: string, callback: (m: Message) => void) {
	const pb = getPb();
	//console.log('[subscribeToMessages] Chatroom ID:', chatroomId);

	const subscription = pb.collection('messages').subscribe('*', (e) => {
		//console.log('[subscribeToMessages] Event received:', e);

		if (e.action === 'create') {
			//console.log('[subscribeToMessages] New message detected:', e.record);

			if (e.record.chatroom_id === chatroomId) {
				//console.log('[subscribeToMessages] Message matches chatroom. Calling callback.');
				callback(e.record as Message);
			} else {
				// console.log(
				// 	'[subscribeToMessages] Message chatroom_id does not match:',
				// 	e.record.chatroom_id
				// );
			}
		} else {
			//console.log('[subscribeToMessages] Ignored action:', e.action);
		}
	});

	console.log('[subscribeToMessages] Subscription created:', subscription);
	return subscription;
}

export async function sendMessage(
	slug: string,
	text: string,
	user?: { id: string; email?: string }
) {
	console.log(user);
	const pb = getPb();
	console.log(user);
	const payload = {
		text,
		sender_id: user?.id ?? null,
		sender_name: user?.email?.split('@')[0] ?? 'Guest',
		chatroom_id: slug
	};

	console.log(payload);

	try {
		const res = await pb.collection('messages').create(payload, { $autoCancel: false });
		console.log('✅ Message sent:', res);

		// 2. Update chatroom in parallel
		await pb.collection('chat_rooms').update(slug, {
			last_message: text,
			last_message_sent: res.created // PocketBase automatically adds created timestamp
		});
		return res;
	} catch (err: any) {
		console.error('❌ PocketBase error:', err.response);
		throw err;
	}
}

export async function enterChatroom(chatroomId: string, userId: string) {
	const pb = getPb();
	try {
		const res = await pb.collection('chatroom_presence').create({
			chatroom_id: chatroomId,
			user_id: userId,
			last_seen: new Date().toISOString()
		});
		console.log(`👤 ${userId} entered chatroom ${chatroomId}`, res);
	} catch (e: any) {
		const record = await pb
			.collection('chatroom_presence')
			.getFirstListItem(`chatroom_id="${chatroomId}" && user_id="${userId}"`);
		const res = await pb.collection('chatroom_presence').update(record.id, {
			last_seen: new Date().toISOString()
		});
		console.log(`🔄 ${userId} updated presence in chatroom ${chatroomId}`, res);
	}
}

export async function leaveChatroom(chatroomId: string, userId: string) {
	const pb = getPb();
	try {
		const record = await pb
			.collection('chatroom_presence')
			.getFirstListItem(`chatroom_id="${chatroomId}" && user_id="${userId}"`);
		await pb.collection('chatroom_presence').delete(record.id);
		console.log(`👋 ${userId} left chatroom ${chatroomId}`);
	} catch (e) {
		console.error('leaveChatroom error:', e);
	}
}
