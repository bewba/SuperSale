import type { RequestHandler } from '@sveltejs/kit';
import { json, redirect } from '@sveltejs/kit';
import { checkUserRole } from '$lib/server/auth/roleCheck';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;

		const roleCheck = await checkUserRole(event, ['seller']);
		if (roleCheck != 0) {
			// Access control logging is handled in checkUserRole
			throw redirect(302, '/unauthorized');
		}

		const body = await request.json().catch(() => null);

		if (!body) {
			await logEvent(locals.supabase, locals.userId, `Type validation failure: Request body is null or invalid`);
			return json({ error: 'Invalid request body' }, { status: 400 });
		}

		const { dealId } = body;

		// Type validation
		const typeValidation = await validateTypes(locals.supabase, locals.userId, [
			{ value: dealId, expectedType: 'string', fieldName: 'dealId', required: true }
		]);

		if (!typeValidation.valid) {
			return json({ error: 'Invalid input types', details: typeValidation.errors }, { status: 400 });
		}

		console.log(dealId);

		const { data, error } = await locals.supabase
			.from('products')
			.delete()
			.eq('id', dealId)
			.select();

		console.log(data, error);

		if (error) {
			console.error('Supabase delete error:', error);
			await logEvent(
				locals.supabase,
				locals.userId,
				`Failed to delete product listing ${dealId}: ${error.message}`
			);
			return json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Failed to delete product listing: Deal ${dealId} not found`
			);
			return json({ error: 'Deal not found' }, { status: 404 });
		}

		await logEvent(
			locals.supabase,
			locals.userId,
			`Product listing deleted: "${data[0].title || 'Unknown'}" (ID: ${dealId})`
		);

		return json({ success: true, deal: data[0] });
	} catch (err) {
		console.error('Unexpected delete error:', err);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error deleting product listing: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
