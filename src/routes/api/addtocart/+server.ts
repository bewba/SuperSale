import type { RequestHandler } from './$types';
import { validateTypes } from '$lib/server/utils/typeValidator';
import { logEvent } from '$lib/server/utils/logger';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 });

	const body = await request.json();
	const { productId, quantity } = body;

	// Type validation
	const typeValidation = await validateTypes(locals.supabase, user.id, [
		{ value: productId, expectedType: 'string', fieldName: 'productId', required: true },
		{ value: quantity, expectedType: 'number', fieldName: 'quantity', required: true }
	]);

	if (!typeValidation.valid) {
		return new Response(JSON.stringify({ error: 'Invalid input types', details: typeValidation.errors }), { status: 400 });
	}

	console.log(productId, quantity);

	const { data, error } = await locals.supabase
		.from('cart')
		.upsert(
			{ user_id: user.id, product_id: productId, quantity },
			{ onConflict: ['user_id', 'product_id'] }
		);

	if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

	return new Response(JSON.stringify({ data }), { status: 200 });
};
