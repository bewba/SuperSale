import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();

		const {
			productName,
			originalPrice,
			discountPrice,
			discountPercent,
			description,
			unit,
			quantity,
			category,
			contactInfo,
			image_list,
			expires_at
		} = body;

		const user = locals.userId;

		if (!user) return json({ success: false, error: 'Not authenticated' }, { status: 401 });

		const supabase = locals.supabase;

		// For safetys
		const safeQuantity = quantity === '' ? 1 : Number(quantity);
		const safeOriginalPrice = originalPrice === '' ? null : Number(originalPrice);
		const safeDiscountPrice = discountPrice === '' ? null : Number(discountPrice);
		const safeDiscountPercent = discountPercent === '' ? null : Number(discountPercent);

		const { data, error } = await supabase.from('products').insert([
			{
				title: productName,
				image_list,
				quantity: safeQuantity,
				original_price: safeOriginalPrice,
				discount_price: safeDiscountPrice,
				discount_percent: safeDiscountPercent,
				reason: description,
				reason_category: category,
				contact_information: contactInfo,
				owner_id: user,
				expires_at,
				unit
			}
		]);

		if (error) {
			console.error('Supabase insert error:', error);
			console.log(error);
			return json({ success: false, error }, { status: 500 });
		} else {
			//TODO:ADD a log
		}

		return json({ success: true, deal: data }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
