import type { RequestHandler } from '@sveltejs/kit';
import { sendSingleEmail } from '$lib/utils/email';
import { SITE_NATURE } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const requestData = await request.json();

		const recipientId = requestData.recipient;

		console.log('request data', requestData);
		// call Supabase function to get user email
		const { data, error } = await locals.supabase.rpc('get_user_email', {
			user_id: recipientId
		});

		if (error) {
			console.error('Supabase error:', error);
			return new Response(JSON.stringify({ error: 'Failed to fetch user email' }), {
				status: 500
			});
		}

		const recipient = Array.isArray(data) ? data[0] : data;

		if (!recipient) {
			return new Response(JSON.stringify({ error: 'No email found for this user' }), {
				status: 404
			});
		}

		console.log(recipient);

		if (SITE_NATURE === 'production') {
			await sendSingleEmail({
				recipient,
				subject: `✅ Someone sent you a message!`,
				content: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
						<div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
							<div style="text-align: center; margin-bottom: 30px;">
								<h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📩 New Message on supersale.ph</h1>
							</div>
							<div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #27ae60; margin-bottom: 25px;">
								<p style="margin: 0; color: #2c3e50; font-size: 16px;">
									You received a message on supersale.ph! Check it out when you get a chance.
								</p>
							</div>
							<div style="text-align: center; margin: 30px 0;">
								<a href="https://supersale.ph"
									style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
									Go to supersale.ph
								</a>
							</div>
							<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
								<p style="color: #666; font-size: 12px; margin: 0;">
									This is an automated notification from supersale.ph
								</p>
							</div>
						</div>
					</div>
				`
			});
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500
		});
	}
};
