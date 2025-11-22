import { checkUserRole } from '$lib/server/auth/roleCheck';
import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		console.log('1');

		const roleCheck = await checkUserRole(event, ['seller']);
		if (roleCheck != 0) {
			// Access control logging is handled in checkUserRole
			throw redirect(302, '/unauthorized');
		}

		console.log('2');

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

		console.log('3');
		// Type validation
		const typeValidation = await validateTypes(supabase, user, [
			{ value: productName, expectedType: 'string', fieldName: 'productName', required: true },
			{ value: originalPrice, expectedType: 'number', fieldName: 'originalPrice', required: false },
			{ value: discountPrice, expectedType: 'number', fieldName: 'discountPrice', required: false },
			{
				value: discountPercent,
				expectedType: 'number',
				fieldName: 'discountPercent',
				required: false
			},
			{ value: description, expectedType: 'string', fieldName: 'description', required: false },
			{ value: unit, expectedType: 'string', fieldName: 'unit', required: false },
			{ value: quantity, expectedType: 'string', fieldName: 'quantity', required: false },
			{ value: category, expectedType: 'string', fieldName: 'category', required: false },
			{ value: contactInfo, expectedType: 'string', fieldName: 'contactInfo', required: false },
			{ value: image_list, expectedType: 'array', fieldName: 'image_list', required: false },
			{ value: expires_at, expectedType: 'string', fieldName: 'expires_at', required: true }
		]);

		if (!typeValidation.valid) {
			return json(
				{ success: false, error: 'Invalid input types', details: typeValidation.errors },
				{ status: 400 }
			);
		}
		console.log('4');
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

		const insertedData = (data ?? []) as any[];
		await logEvent(supabase, user, `Product listing added: "${productName}" `);

		return json({ success: true, deal: insertedData }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		await logEvent(
			event.locals.supabase,
			event.locals.userId,
			`Error adding product listing: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
