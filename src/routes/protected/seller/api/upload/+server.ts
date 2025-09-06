import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		console.log('hello');

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
			return json({ success: false, error }, { status: 500 });
		}

		return json({ success: true, deal: data }, { status: 200 });
	} catch (err) {
		console.error('Server error:', err);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
