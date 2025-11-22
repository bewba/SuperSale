import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			redirect(302, '/auth');
		}

		const body = await request.json();
		const { storeName, address, pickup, delivery, termsAccepted, uploadedUrl, viberLink } = body;

		const sb = locals.supabase;

		// Type validation
		const typeValidation = await validateTypes(sb, locals.userId, [
			{ value: storeName, expectedType: 'string', fieldName: 'storeName', required: true },
			{ value: address, expectedType: 'string', fieldName: 'address', required: true },
			{ value: pickup, expectedType: 'boolean', fieldName: 'pickup', required: true },
			{ value: delivery, expectedType: 'boolean', fieldName: 'delivery', required: true },
			{ value: termsAccepted, expectedType: 'boolean', fieldName: 'termsAccepted', required: true },
			{ value: uploadedUrl, expectedType: 'string', fieldName: 'uploadedUrl', required: true },
			{ value: viberLink, expectedType: 'string', fieldName: 'viberLink', required: false }
		]);

		if (!typeValidation.valid) {
			return json(
				{ error: 'Invalid input types', details: typeValidation.errors },
				{ status: 400 }
			);
		}

		console.log(storeName, address, pickup, delivery, termsAccepted, uploadedUrl, viberLink);
		const viber_link = viberLink;

		if (!storeName || !address) {
			await logEvent(
				sb,
				locals.userId,
				`Validation failure: Missing required fields (storeName: ${!!storeName}, address: ${!!address})`
			);
			return json({ error: 'Store name and address are required' }, { status: 400 });
		}

		if (storeName.trim().length === 0 || address.trim().length === 0) {
			await logEvent(
				sb,
				locals.userId,
				`Validation failure: Empty store name or address (storeName length: ${storeName.trim().length}, address length: ${address.trim().length})`
			);
			return json({ error: 'Store name and address cannot be empty' }, { status: 400 });
		}

		if (storeName.trim().length > 50) {
			await logEvent(
				sb,
				locals.userId,
				`Validation failure: Store name exceeds 50 characters (length: ${storeName.trim().length})`
			);
			return json({ error: 'Store name cannot exceed 50 characters' }, { status: 400 });
		}

		if (address.trim().length > 200) {
			await logEvent(
				sb,
				locals.userId,
				`Validation failure: Address exceeds 200 characters (length: ${address.trim().length})`
			);
			return json({ error: 'Address cannot exceed 200 characters' }, { status: 400 });
		}

		if (!termsAccepted) {
			await logEvent(sb, locals.userId, `Validation failure: Terms not accepted`);
			return json({ error: 'Terms must be accepted' }, { status: 400 });
		}

		if (!uploadedUrl || uploadedUrl.trim().length === 0) {
			await logEvent(sb, locals.userId, `Validation failure: Missing store logo/image`);
			return json({ error: 'A store logo/image is required' }, { status: 400 });
		}

		if (typeof pickup !== 'boolean' || typeof delivery !== 'boolean') {
			await logEvent(
				sb,
				locals.userId,
				`Validation failure: Invalid boolean values (pickup type: ${typeof pickup}, delivery type: ${typeof delivery})`
			);
			return json({ error: 'Pickup and delivery must be valid boolean values' }, { status: 400 });
		}

		let existingRole = locals.userRole == 'seller';

		console.log(existingRole);

		if (existingRole) {
			console.log(existingRole);

			await logEvent(
				sb,
				locals.userId,
				`Failed to create seller account: User already has seller role registered`
			);

			return json({ error: 'User already has a role registered' }, { status: 400 });
		} else {
			const { data, error } = await sb.from('roles').insert([
				{
					role: 'seller',
					userId: locals.userId,
					store_name: storeName,
					address,
					pickup,
					delivery,
					terms_accepted: termsAccepted,
					logo: uploadedUrl,
					viber_link
				}
			]);

			if (error) {
				console.error('Insert error:', error);
				await logEvent(sb, locals.userId, `Failed to create seller account: ${error.message}`);
				return json({ error: 'Failed to register store' }, { status: 500 });
			}

			await logEvent(sb, locals.userId, `Successfully created seller account: ${storeName}`);
		}

		return json({
			success: true,
			message: 'Store registered successfully',
			data: { storeName, address, pickup, delivery }
		});
	} catch (err) {
		console.error('Error creating store:', err);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error creating seller account: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
