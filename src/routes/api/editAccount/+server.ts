import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { logEvent } from '$lib/server/utils/logger';

export const PUT: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		const { storeName, address, pickup, delivery, uploadedUrl, viberLink } = await request.json();

		if (!storeName || !storeName.trim()) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Validation failure: Missing or empty store name`
			);
			return json({ error: 'Store name is required' }, { status: 400 });
		}

		if (storeName.trim().length > 50) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Validation failure: Store name exceeds 50 characters (length: ${storeName.trim().length})`
			);
			return json({ error: 'Store name cannot exceed 50 characters' }, { status: 400 });
		}

		if (!address || !address.trim()) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Validation failure: Missing or empty address`
			);
			return json({ error: 'Address is required' }, { status: 400 });
		}

		if (address.trim().length > 200) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Validation failure: Address exceeds 200 characters (length: ${address.trim().length})`
			);
			return json({ error: 'Address cannot exceed 200 characters' }, { status: 400 });
		}

		let contactNumber = '';

		if (viberLink?.includes('viber://chat?number=%2B63')) {
			contactNumber = viberLink.replace('viber://chat?number=%2B63', '').trim();
		}

		if (!/^\d{10}$/.test(contactNumber)) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Validation failure: Invalid contact number format (received: "${contactNumber}", expected: 10 digits)`
			);
			return json({ error: 'Contact number must be exactly 10 digits' }, { status: 400 });
		}

		// Role check
		const isSeller = await checkUserRole(event, ['seller']);
		if (isSeller != 0) {
			redirect(302, '/unauthorized');
		}

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
			await logEvent(sb, userId, `Failed to update seller account: No seller account found`);
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
			await logEvent(sb, userId, `Failed to update seller account: ${error.message}`);
			return json({ error: 'Failed to update store information' }, { status: 500 });
		}

		await logEvent(sb, userId, `Successfully updated seller account: ${storeName}`);

		return json({
			success: true,
			message: 'Store information updated successfully',
			data: { storeName, address, pickup, delivery, uploadedUrl, viberLink }
		});
	} catch (err) {
		console.error('Error updating store:', err);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error updating seller account: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// fetch current seller data (without url params for ID)
export const GET: RequestHandler = async (event) => {
	try {
		const { locals } = event;

		const userId = locals.userId;
		const sb = locals.supabase;

		const isSeller = await checkUserRole(event, ['seller']);

		if (isSeller != 0) {
			redirect(302, '/unauthorized');
		}

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
