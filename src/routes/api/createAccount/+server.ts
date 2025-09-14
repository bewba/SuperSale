import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { storeName, address, pickup, delivery } = await request.json();

		const userId = locals.user.id;
		const sb = locals.supabase;

		if (!storeName || !address) {
			return json({ error: 'Store name and address are required' }, { status: 400 });
		}

		// TODO: Save this data to your DB (Supabase / Postgres / etc.)
		// Example:
		// await db.insert({ storeName, address, pickup, delivery });

		const { data, error } = await sb.from('roles').insert([
			{
				role: 'seller',
				userId: userId,
				store_name: storeName,
				address,
				pickup,
				delivery
			}
		]);

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
