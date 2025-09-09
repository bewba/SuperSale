// src/routes/api/create-chatroom/+server.ts
import type { RequestHandler } from './$types';
import { sendSingleEmail } from '$lib/utils/email';
import { SITE_NATURE } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const { selectedDeal } = await request.json();

		console.log(selectedDeal);

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

				const { data, error } = await locals.supabase.rpc('get_user_email', {
					user_id: selectedDeal.owner_id
				});

				if (SITE_NATURE == 'production') {
					sendSingleEmail({
						recipient: data,
						subject: `✅ Someone sent you a message!`,
						content: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
							<div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
								<div style="text-align: center; margin-bottom: 30px;">
									<h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📩 New Message on ugly.ph</h1>
								</div>
								
								<div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #27ae60; margin-bottom: 25px;">
									<p style="margin: 0; color: #2c3e50; font-size: 16px;">
										You received a message on ugly.ph! Check it out when you get a chance.
									</p>
								</div>
								
								<div style="text-align: center; margin: 30px 0;">
									<a href="https://ugly.ph" 
									   style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
										Go to ugly.ph
									</a>
								</div>
								
								<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
									<p style="color: #666; font-size: 12px; margin: 0;">
										This is an automated notification from ugly.ph
									</p>
								</div>
							</div>
						</div>
					`
					});
				}

				console.log(data);
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
