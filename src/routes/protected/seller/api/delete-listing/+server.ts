import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json().catch(() => null);

		if (!body || !body.dealId) {
			return json({ error: 'dealId is required' }, { status: 400 });
		}

		const { dealId } = body;

		console.log(dealId);

		const { data, error } = await locals.supabase
			.from('products')
			.delete()
			.eq('id', dealId)
			.select();

		console.log(data, error);

		if (error) {
			console.error('Supabase delete error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			return json({ error: 'Deal not found' }, { status: 404 });
		}

		return json({ success: true, deal: data[0] });
	} catch (err) {
		console.error('Unexpected delete error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
