import { checkUserRole } from '$lib/server/auth/roleCheck';
import type { RequestHandler } from './$types';
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

		const formData = await request.formData();

		// image files
		const files = formData.getAll('imageFiles') as File[];

		// other fields
		const id = formData.get('id') as string;
		const title = formData.get('productName') as string;
		const quantity = Number(formData.get('quantity'));
		const original_price = Number(formData.get('originalPrice'));
		const discount_price = Number(formData.get('discountPrice'));
		const discount_percent = Number(formData.get('discountPercent'));
		const reason = formData.get('description') as string;
		const reason_category = formData.get('category') as string;
		const contact_information = formData.get('contactInfo') as string;
		const unit = formData.get('unit') as string;

		// EXPIRES NOT VALIDATED (as requested)
		const expires_at = formData.get('expires_at') as string | null;

		const existingImages = JSON.parse((formData.get('existingImages') as string) || '[]');
		const removedImages = JSON.parse((formData.get('removedImages') as string) || '[]');

		const owner_id = locals.userId;
		if (!owner_id) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// ---------- BASIC FIELD VALIDATION (same as previous file) ----------

		// Title validation
		if (typeof title !== 'string' || title.trim().length === 0) {
			await logEvent(
				locals.supabase,
				owner_id,
				`Validation failure: Invalid product name (type: ${typeof title}, length: ${typeof title === 'string' ? title.trim().length : 'N/A'})`
			);
			return json({ error: 'Invalid product name' }, { status: 400 });
		}

		if (title.trim().length > 70) {
			await logEvent(
				locals.supabase,
				owner_id,
				`Validation failure: Product name exceeds 70 characters (length: ${title.trim().length})`
			);
			return json({ error: 'Product name too long' }, { status: 400 });
		}

		// Number validations (no NaN allowed)
		const safeQuantity = isNaN(quantity) ? 1 : quantity;
		const safeOriginal = isNaN(original_price) ? null : original_price;
		const safeDiscountPrice = isNaN(discount_price) ? null : discount_price;
		const safeDiscountPercent = isNaN(discount_percent) ? null : discount_percent;

		// ---------------------------------------------------------------------

		// Build the update object
		const updateFields: Record<string, any> = {
			title,
			quantity: safeQuantity,
			original_price: safeOriginal,
			discount_price: safeDiscountPrice,
			discount_percent: safeDiscountPercent,
			reason,
			reason_category,
			expires_at, // untouched
			contact_information,
			unit
		};

		// Upload new images
		const uploadedUrls: string[] = [];
		for (const file of files) {
			if (!file) continue;

			const fileName = `images/${crypto.randomUUID()}-${file.name}`;
			const arrayBuffer = await file.arrayBuffer();

			const { error: uploadError } = await locals.supabase.storage
				.from('productImages')
				.upload(fileName, arrayBuffer, { contentType: file.type });

			if (uploadError) {
				console.error(uploadError);
				await logEvent(
					locals.supabase,
					owner_id,
					`Failed to upload image for product ${id}: ${uploadError.message}`
				);
				return json({ error: 'File upload failed' }, { status: 500 });
			}

			const { data: publicUrlData } = locals.supabase.storage
				.from('productImages')
				.getPublicUrl(fileName);

			uploadedUrls.push(publicUrlData.publicUrl);
		}

		// Merge images
		let finalImages = existingImages.filter((img: string) => !removedImages.includes(img));
		finalImages = [...finalImages, ...uploadedUrls];

		// max 4 images
		finalImages = finalImages.slice(0, 4);

		updateFields.image_list = finalImages;

		// delete removed images
		for (const url of removedImages) {
			const path = url.split('/productImages/')[1];
			if (path) {
				await locals.supabase.storage.from('productImages').remove([path]);
			}
		}

		// Update
		const { error: dbError } = await locals.supabase
			.from('products')
			.update(updateFields)
			.eq('id', id)
			.eq('owner_id', owner_id);

		if (dbError) {
			console.error(dbError);
			await logEvent(
				locals.supabase,
				owner_id,
				`Failed to update product listing ${id}: ${dbError.message}`
			);
			return json({ error: 'Database update failed' }, { status: 500 });
		}

		await logEvent(
			locals.supabase,
			owner_id,
			`Product listing updated: "${title}" (ID: ${id})`
		);

		return json({ success: true });
	} catch (e) {
		console.error(e);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error editing product listing: ${e instanceof Error ? e.message : 'Unknown error'}`
		);
		return json({ error: 'Something went wrong' }, { status: 500 });
	}
};
