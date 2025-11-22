import type { RequestHandler } from '@sveltejs/kit';
import { sendSingleEmail } from '$lib/utils/email';
import { SITE_NATURE } from '$env/static/private';
import { getPbBackground } from '$lib/pocketbase/pb.client';
import { validateTypes } from '$lib/server/utils/typeValidator';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const requestData = await request.json();
		console.log('Notification request data:', requestData);

		const recipientId = requestData.recipient;
		const hasEmail = requestData.hasEmail;

		// Type validation
		const typeValidation = await validateTypes(locals.supabase, locals.userId, [
			{ value: recipientId, expectedType: 'string', fieldName: 'recipient', required: true },
			{ value: hasEmail, expectedType: 'boolean', fieldName: 'hasEmail', required: true }
		]);

		if (!typeValidation.valid) {
			return new Response(JSON.stringify({ error: 'Invalid input types', details: typeValidation.errors }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		let recipientEmail = '';

		if (hasEmail) {
			// User has email, need to find it in PocketBase (guests)
			try {
				const pbBackground = getPbBackground();
				const pbUser = await pbBackground
					.collection('users')
					.getFirstListItem(`user_id = "${recipientId}"`);

				recipientEmail = pbUser.email;
				console.log('Found email in PocketBase:', recipientEmail);
			} catch (error) {
				console.error('Error fetching from PocketBase:', error);
				return new Response(
					JSON.stringify({ error: 'Failed to fetch user email from PocketBase' }),
					{
						status: 500
					}
				);
			}
		} else {
			// User doesn't have email, try Supabase (logged-in users) as fallback
			try {
				const { data, error } = await locals.supabase.rpc('get_user_email', {
					user_id: recipientId
				});

				if (error) {
					console.error('Supabase error:', error);
					return new Response(
						JSON.stringify({ error: 'Failed to fetch user email from Supabase' }),
						{
							status: 500
						}
					);
				}

				recipientEmail = Array.isArray(data) ? data[0] : data;
				console.log('Found email in Supabase:', recipientEmail);
			} catch (error) {
				console.error('Error fetching from Supabase:', error);
			}
		}

		if (!recipientEmail) {
			console.log('No email found for recipient:', recipientId);
			return new Response(JSON.stringify({ error: 'No email found for this user' }), {
				status: 404
			});
		}

		console.log('Sending notification to:', recipientEmail);

		if (SITE_NATURE === 'production') {
			await sendSingleEmail({
				recipient: recipientEmail,
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
		} else {
			console.log('Development mode - would send email to:', recipientEmail);
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500
		});
	}
};
