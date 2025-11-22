import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		if ((await checkUserRole(event, ['seller'])) != 0) {
			throw redirect(302, '/unauthorized');
		}

		const formData = await request.formData();

		const file = formData.get('image') as File;
		const title = formData.get('title') as string;
		const quantityStr = formData.get('quantity') as string;
		const original_priceStr = formData.get('original_price') as string;
		const discount_priceStr = formData.get('discount_price') as string;
		const discount_percentStr = formData.get('discount_percent') as string;
		const reason = formData.get('reason') as string;
		const reason_category = formData.get('category') as string;
		const expires_at = formData.get('expires_at') as string;
		const contact_information = formData.get('contactInfo') as string;

		const user = locals.user?.id;
		if (!user) return json({ success: false, error: 'Not authenticated' }, { status: 401 });

		const supabase = locals.supabase;

		// Type validation for form data (all formData values are strings or File)
		const typeValidation = await validateTypes(supabase, user, [
			{ value: title, expectedType: 'string', fieldName: 'title', required: true },
			{ value: quantityStr, expectedType: 'string', fieldName: 'quantity', required: true },
			{ value: original_priceStr, expectedType: 'string', fieldName: 'original_price', required: false },
			{ value: discount_priceStr, expectedType: 'string', fieldName: 'discount_price', required: false },
			{ value: discount_percentStr, expectedType: 'string', fieldName: 'discount_percent', required: false },
			{ value: reason, expectedType: 'string', fieldName: 'reason', required: false },
			{ value: reason_category, expectedType: 'string', fieldName: 'category', required: false },
			{ value: expires_at, expectedType: 'string', fieldName: 'expires_at', required: true },
			{ value: contact_information, expectedType: 'string', fieldName: 'contactInfo', required: false }
		]);

		if (!typeValidation.valid) {
			return json({ success: false, error: 'Invalid input types', details: typeValidation.errors }, { status: 400 });
		}

		// Validate file
		if (!file || !(file instanceof File)) {
			await logEvent(supabase, user, `Type validation failure: File is missing or invalid (type: ${typeof file})`);
			return json({ success: false, error: 'Image file is required' }, { status: 400 });
		}

		// Parse numeric values
		const quantity = Number(quantityStr);
		const original_price = Number(original_priceStr);
		const discount_price = Number(discount_priceStr);
		const discount_percent = Number(discount_percentStr);

		const fileName = `${crypto.randomUUID()}_${file.name}`;
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('productImages')
			.upload(fileName, file);

		if (uploadError) {
			console.error('Supabase storage upload error:', uploadError);
			await logEvent(
				supabase,
				user,
				`Failed to upload product image for "${title}": ${uploadError.message}`
			);
			return json({ success: false, error: uploadError.message }, { status: 500 });
		}

		// Get public URL
		const { data: publicUrlData } = supabase.storage.from('productImages').getPublicUrl(fileName);
		const imageUrl = publicUrlData.publicUrl;

		// Insert deal into DB
		const { data, error } = await supabase.from('products').insert([
			{
				title,
				image: imageUrl,
				quantity: isNaN(quantity) ? 1 : quantity,
				original_price: isNaN(original_price) ? null : original_price,
				reason_category,
				discount_price: isNaN(discount_price) ? null : discount_price,
				discount_percent: isNaN(discount_percent) ? null : discount_percent,
				contact_information,
				reason,
				expires_at,
				owner_id: user
			}
		]);

		if (error) {
			console.error('Supabase insert error:', error);
			await logEvent(
				supabase,
				user,
				`Failed to create product "${title}": ${error.message}`
			);
			return json({ success: false, error }, { status: 500 });
		}

		await logEvent(
			supabase,
			user,
			`Product created: "${title}" (ID: ${data?.[0]?.id || 'unknown'})`
		);

		return json({ success: true, deal: data }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		await logEvent(
			locals.supabase,
			locals.user?.id || null,
			`Error creating product: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
