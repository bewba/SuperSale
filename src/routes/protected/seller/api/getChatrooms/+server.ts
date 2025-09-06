import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request }) => {
	// you can now access locals, request, params, cookies, etc.
	const pb = locals.pb;
	const userId = locals.user.id;

	try {
		const records = await pb.collection('chat_rooms').getFullList({
			filter: `buyer = "${userId}" || seller = "${userId}"`,
			sort: '-created'
		});

		console.log(records);

		return new Response(JSON.stringify({ records }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error fetching chat rooms:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch chat rooms' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
