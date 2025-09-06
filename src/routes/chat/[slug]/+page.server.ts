import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
	// check if chatroom exists in your DB
	const chatroom = await locals.pb.collection('chat_rooms').getOne(params.slug);

	if (!chatroom) {
		throw error(404, 'Chatroom not found');
	}

	let user: Record<string, any>;

	if (locals.user) {
		console.log('logged in user');
		user = { ...locals.user };
	} else {
		console.log('guest');
		user = { id: cookies.get('fingerprint') };
	}

	if (user.id !== chatroom.buyer && user.id !== chatroom.seller) {
		throw redirect(303, '/');
	}

	console.log(params);

	return {
		slug: params.slug,
		user,
		chatroom
	};
};
