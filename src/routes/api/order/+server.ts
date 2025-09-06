// src/routes/api/orders/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { data, error } = await locals.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });


    console.log(data)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'No orders found' }), { status: 404 });
    }

    const formattedOrders = data.map((order: any) => ({
      ...order,
      order_items: order.order_items
        ? typeof order.order_items === 'string'
          ? JSON.parse(order.order_items)
          : order.order_items
        : [],
      shipping_info: order.shipping_info
        ? typeof order.shipping_info === 'string'
          ? JSON.parse(order.shipping_info)
          : order.shipping_info
        : {}
    }));

    return new Response(JSON.stringify({ success: true, orders: formattedOrders }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
