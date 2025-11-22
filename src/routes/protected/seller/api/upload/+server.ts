import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		if ((await checkUserRole(event, ['seller'])) != 0) {
			throw redirect(302, '/unauthorized');
		}

		const formData = await request.formData();

		const file = formData.get('image') as File;
		const title = formData.get('title') as string;
		const quantity = Number(formData.get('quantity'));
		const original_price = Number(formData.get('original_price'));
		const discount_price = Number(formData.get('discount_price'));
		const discount_percent = Number(formData.get('discount_percent'));
		const reason = formData.get('reason') as string;
		const reason_category = formData.get('category') as string;
		const expires_at = formData.get('expires_at') as string;
		const contact_information = formData.get('contactInfo') as string;

		const user = locals.user?.id;
		if (!user) return json({ success: false, error: 'Not authenticated' }, { status: 401 });

		const supabase = locals.supabase;

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
				quantity,
				original_price,
				reason_category,
				discount_price,
				discount_percent,
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
