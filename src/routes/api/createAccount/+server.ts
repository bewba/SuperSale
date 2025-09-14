import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { storeName, address, pickup, delivery, termsAccepted } = await request.json();

		const userId = locals.user.id;
		const sb = locals.supabase;

		if (!storeName || !address) {
			return json({ error: 'Store name and address are required' }, { status: 400 });
		}

		// 🔍 Check if user already exists in roles
		const { data: existingRole, error: selectError } = await sb
			.from('roles')
			.select('id')
			.eq('userId', userId);

		console.log(existingRole, selectError);

		if (!existingRole || existingRole?.length > 0) {
			console.log(existingRole);
			return json({ error: 'User already has a role registered' }, { status: 400 });
		} else {
			// ✅ Insert new role if not exists

			const { data, error } = await sb.from('roles').insert([
				{
					role: 'seller',
					userId: userId,
					store_name: storeName,
					address,
					pickup,
					delivery,
					terms_accepted: termsAccepted
				}
			]);

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
