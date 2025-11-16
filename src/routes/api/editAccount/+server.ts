import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		const { storeName, address, pickup, delivery, uploadedUrl, viberLink } = await request.json();

		console.log('Updating seller:', {
			storeName,
			address,
			pickup,
			delivery,
			uploadedUrl,
			viberLink
		});

		const userId = locals.userId;
		const sb = locals.supabase;

		if (!storeName || !address) {
			return json({ error: 'Store name and address are required' }, { status: 400 });
		}

		// Check if user has an existing seller role
		const { data: existingRole, error: selectError } = await sb
			.from('roles')
			.select('id, role')
			.eq('userId', userId)
			.eq('role', 'seller')
			.single();

		if (selectError || !existingRole) {
			console.error('No existing seller role found:', selectError);
			return json({ error: 'No seller account found to update' }, { status: 404 });
		}

		// Update the existing seller record
		const updateData = {
			store_name: storeName,
			address,
			pickup,
			delivery,
			viber_link: viberLink
		};

		// Only update logo if a new one was provided
		if (uploadedUrl) {
			updateData.logo = uploadedUrl;
		}

		const { data, error } = await sb
			.from('roles')
			.update(updateData)
			.eq('userId', userId)
			.eq('role', 'seller')
			.select();

		if (error) {
			console.error('Update error:', error);
			return json({ error: 'Failed to update store information' }, { status: 500 });
		} else {
			// TODO:ADD a log
		}

		return json({
			success: true,
			message: 'Store information updated successfully',
			data: { storeName, address, pickup, delivery, uploadedUrl, viberLink }
		});
	} catch (err) {
		console.error('Error updating store:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// fetch current seller data (without url params for ID)
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const userId = locals.userId;
		const sb = locals.supabase;

		const { data: sellerData, error } = await sb
			.from('roles')
			.select('store_name, address, pickup, delivery, logo, viber_link')
			.eq('userId', userId)
			.eq('role', 'seller')
			.single();

		if (error || !sellerData) {
			console.error('Error fetching seller data:', error);
			return json({ error: 'Seller data not found' }, { status: 404 });
		} else {
			// TODO:ADD a log
		}

		// Transform the data to match the component's expected format
		const transformedData = {
			storeName: sellerData.store_name,
			address: sellerData.address,
			pickup: sellerData.pickup,
			delivery: sellerData.delivery,
			logoUrl: sellerData.logo,
			viberLink: sellerData.viber_link,
			contactNumber: sellerData.viber_link
				? sellerData.viber_link.replace('viber://chat?number=%2B63', '')
				: ''
		};

		return json({
			success: true,
			data: transformedData
		});
	} catch (err) {
		console.error('Error fetching seller data:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
