// src/routes/cart/fetch/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cartCache } from '$lib/cache/cartCache';

// Type definitions
type ProductRow = {
	uuid: string;
	productName: string;
	price: string;
	originalPrice?: string;
	imageUrl: string;
	description: string;
	in_stock: boolean;
};

type CartRow = {
	uuid: string;
	quantity: number;
	products?: ProductRow | null;
};

type CartItem = {
	id: string;
	quantity: number;
	name: string;
	price: number;
	originalPrice: number;
	image: string;
	description: string;
	inStock: boolean;
	savings: number;
	unit: string;
};

// Fetch cart from database
async function fetchCartFromDB(userId: string, locals: any): Promise<CartItem[]> {
	const { data: cartItems, error } = await locals.supabase
		.from('cart')
		.select(
			`
            uuid,
            quantity,
            products!product_id (
                uuid,
                productName,
                price,
                originalPrice,
                imageUrl,
                description,
                in_stock
            )
        `
		)
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching carts:', error);
		return [];
	}

	return (cartItems ?? [])
		.filter((item: any) => item.products)
		.map((item: any) => {
			const priceStr = item.products.price ?? '0';
			const originalPriceStr = item.products.originalPrice ?? priceStr;
			const numericPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
			const numericOriginalPrice =
				parseFloat(originalPriceStr.replace(/[^\d.]/g, '')) || numericPrice;

			return {
				id: item.uuid,
				quantity: item.quantity,
				name: item.products.productName,
				price: numericPrice,
				originalPrice: numericOriginalPrice,
				image: item.products.imageUrl,
				description: item.products.description,
				inStock: item.products.in_stock,
				savings: numericOriginalPrice - numericPrice,
				unit: priceStr.replace(/[\d.,\s₱]/g, '')
			};
		});
}

// GET handler
export const GET: RequestHandler = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) return json({ cartItems: [] });

	const cartItems = await fetchCartFromDB(user.id, locals);

	// Update the cache
	cartCache.set(user.id, cartItems);

	return json({ cartItems });
};
