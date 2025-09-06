import { form } from '$app/server';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		console.log('hello');

		const formData = await request.formData();

		const files = formData.getAll('imageFiles') as File[];
		const title = formData.get('productName') as string; //done
		const quantity = Number(formData.get('quantity')); //done
		const original_price = Number(formData.get('originalPrice')); //done
		const discount_price = Number(formData.get('discountPrice')); //done
		const discount_percent = Number(formData.get('discountPercent')); //done
		const reason = formData.get('description') as string; //done
		const reason_category = formData.get('category') as string; //done
		const expiryDate = formData.get('expiryDate') as string; //done
		const contact_information = formData.get('contactInfo') as string; //done
		const expires_at_time = formData.get('expiryTime') as string;

		const user = locals.user?.id;
		if (!user) return json({ success: false, error: 'Not authenticated' }, { status: 401 });

		const supabase = locals.supabase;

		// Upload images to productImages bucket
		const image_list: string[] = [];
		for (const file of files) {
			const fileName = `${crypto.randomUUID()}_${file.name}`;
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('productImages')
				.upload(fileName, file);

			if (uploadError) {
				console.error('Supabase storage upload error:', uploadError);
				return json({ success: false, error: uploadError.message }, { status: 500 });
			}

			const { data: publicUrlData } = supabase.storage.from('productImages').getPublicUrl(fileName);

			image_list.push(publicUrlData.publicUrl);
		}

		const expires_at = `${expiryDate}T${expires_at_time}:00+08:00`;

		// Insert deal into DB
		const { data, error } = await supabase.from('products').insert([
			{
				title,
				image_list,
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

		if (data) {
			console.log(data);
		}

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
