import { checkUserRole } from '$lib/server/auth/roleCheck';
import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		const roleCheck = await checkUserRole(event, ['seller']);
		if (roleCheck != 0) {
			// Access control logging is handled in checkUserRole
			throw redirect(302, '/unauthorized');
		}

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

		if (!user) {
			return json({ success: false, error: 'Not authenticated' }, { status: 401 });
		}

		const supabase = locals.supabase;

		// PH time
		const nowPH = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

		// Validate productName
		if (typeof productName !== 'string' || productName.trim().length === 0) {
			await logEvent(
				supabase,
				user,
				`Validation failure: Invalid product name (type: ${typeof productName}, length: ${typeof productName === 'string' ? productName.trim().length : 'N/A'})`
			);
			return json({ success: false, error: 'Invalid product name' }, { status: 400 });
		}

		if (productName.trim().length > 70) {
			await logEvent(
				supabase,
				user,
				`Validation failure: Product name exceeds 70 characters (length: ${productName.trim().length})`
			);
			return json({ success: false, error: 'Product name too long' }, { status: 400 });
		}

		// Validate expires_at
		if (!expires_at) {
			console.log(expires_at);
			await logEvent(supabase, user, `Validation failure: Missing expiration date`);
			return json({ success: false, error: 'Missing expiration date' }, { status: 400 });
		}

		const expiresDate = new Date(expires_at);

		if (isNaN(expiresDate.getTime()) || expiresDate < nowPH) {
			await logEvent(
				supabase,
				user,
				`Validation failure: Invalid expiration date (date: ${expires_at}, isNaN: ${isNaN(expiresDate.getTime())}, isPast: ${expiresDate < nowPH})`
			);
			return json({ success: false, error: 'Invalid expiration date' }, { status: 400 });
		}

		const safeQuantity =
			quantity === '' || quantity === null || quantity === undefined || isNaN(Number(quantity))
				? 1
				: Number(quantity);

		const safeOriginalPrice =
			originalPrice === '' || originalPrice === null || isNaN(Number(originalPrice))
				? null
				: Number(originalPrice);

		const safeDiscountPrice =
			discountPrice === '' || discountPrice === null || isNaN(Number(discountPrice))
				? null
				: Number(discountPrice);

		const safeDiscountPercent =
			discountPercent === '' || discountPercent === null || isNaN(Number(discountPercent))
				? null
				: Number(discountPercent);

		// Insert
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
			await logEvent(
				supabase,
				user,
				`Failed to add product listing "${productName}": ${error.message}`
			);
			return json({ success: false, error }, { status: 500 });
		}

		await logEvent(
			supabase,
			user,
			`Product listing added: "${productName}" (ID: ${data?.[0]?.id || 'unknown'})`
		);

		return json({ success: true, deal: data }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error adding product listing: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
