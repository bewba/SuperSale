// src/lib/chat.ts
import type { RecordModel } from 'pocketbase';
import { getPb } from '$lib/pocketbase/pb.client';

export type Message = RecordModel & {
	text: string;
	slug: string;
	sender_id?: string | null;
	sender_name?: string | null;
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
		const res = await pb.collection('messages').create(payload);
		console.log('✅ Message sent:', res);
		return res;
	} catch (err: any) {
		console.error('❌ PocketBase error:', err.response);
		throw err;
	}
}
