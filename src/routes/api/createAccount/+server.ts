import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { storeName, address, pickup, delivery, termsAccepted, uploadedUrl, viberLink } =
			await request.json();

		console.log(storeName, address, pickup, delivery, termsAccepted, uploadedUrl, viberLink);
		const viber_link = viberLink;
		const userId = locals.user?.id;
		console.log('user is: ', locals.userId);
		const sb = locals.supabase;

		if (!storeName || !address) {
			return json({ error: 'Store name and address are required' }, { status: 400 });
		}

		let existingRole = locals.userRole == 'seller';

		console.log(existingRole);

		if (existingRole) {
			console.log(existingRole);

			// TODO: Add server logs, handle toast

			return json({ error: 'User already has a role registered' }, { status: 400 });
		} else {
			const { data, error } = await sb.from('roles').insert([
				{
					role: 'seller',
					userId: locals.userId,
					store_name: storeName,
					address,
					pickup,
					delivery,
					terms_accepted: termsAccepted,
					logo: uploadedUrl,
					viber_link
				}
			]);

			// TODO: Add server logs, handle toast

			if (error) {
				console.error('Insert error:', error);
				return json({ error: 'Failed to register store' }, { status: 500 });
			}
		}

		return json({
			success: true,
			message: 'Store registered successfully',
			data: { storeName, address, pickup, delivery }
		});
	} catch (err) {
		console.error('Error creating store:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
