import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
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

		const expires_at = formData.get('expires_at') as string | null;

		const existingImages = JSON.parse(formData.get('existingImages') as string || '[]');
		const removedImages = JSON.parse(formData.get('removedImages') as string || '[]');

		const owner_id = locals.user?.id;
		if (!owner_id) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// Build the update object
		const updateFields: Record<string, any> = {
			title,
			quantity,
			original_price,
			discount_price,
			discount_percent,
			reason,
			reason_category,
			expires_at,
			contact_information
		};

		// If a new file is uploaded, update image
		const uploadedUrls: string[] = [];
		for (const file of files) {
			if (!file) continue;

			const fileName = `images/${crypto.randomUUID()}-${file.name}`;

			// Supabase expects ArrayBuffer or Blob in SvelteKit
			const arrayBuffer = await file.arrayBuffer();

			const { error: uploadError } = await locals.supabase.storage
				.from('productImages')
				.upload(fileName, arrayBuffer, { contentType: file.type });

			if (uploadError) {
				console.error(uploadError);
				return json({ error: 'File upload failed' }, { status: 500 });
			}

			// Get public URL
			const { data: publicUrlData } = locals.supabase.storage
				.from('productImages')
				.getPublicUrl(fileName);

			uploadedUrls.push(publicUrlData.publicUrl);
		}

		let finalImages = existingImages.filter((img: string) => !removedImages.includes(img));
		finalImages = [...finalImages, ...uploadedUrls];

		// enforce max 4 images only
		finalImages = finalImages.slice(0, 4);

		updateFields.image_list = finalImages
	
		// delete images from supbase
		for (const url of removedImages) {
			const path = url.split('/productImages/')[1];
			if (path) {
				await locals.supabase.storage.from('productImages').remove([path]);
			}
		}

		updateFields.image_list = finalImages;

		// Update product where id and owner match
		const { error: dbError } = await locals.supabase
			.from('products')
			.update(updateFields)
			.eq('id', id)
			.eq('owner_id', owner_id);

		if (dbError) {
			console.error(dbError);
			return json({ error: 'Database update failed' }, { status: 500 });
		}

		return json({ success: true });
	} catch (e) {
		console.error(e);
		return json({ error: 'Something went wrong' }, { status: 500 });
	}
};
