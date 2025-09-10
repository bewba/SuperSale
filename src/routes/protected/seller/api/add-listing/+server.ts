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
			quantity,
			expiryDate,
			category,
			contactInfo,
			expiryTime,
			image_list
		} = body;

		const user = locals.user?.id;
		if (!user) return json({ success: false, error: 'Not authenticated' }, { status: 401 });

		const supabase = locals.supabase;

		// For safetys
		const safeQuantity = quantity === '' ? 1 : Number(quantity);
		const safeOriginalPrice = originalPrice === '' ? null : Number(originalPrice);
		const safeDiscountPrice = discountPrice === '' ? null : Number(discountPrice);
		const safeDiscountPercent = discountPercent === '' ? null : Number(discountPercent);

		const expires_at = `${expiryDate}T${expiryTime}:00+08:00`;

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
				expires_at,
				owner_id: user
			}
		]);

		if (error) {
			console.error('Supabase insert error:', error);
			return json({ success: false, error }, { status: 500 });
		}

		return json({ success: true, deal: data }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
