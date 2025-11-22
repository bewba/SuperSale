import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { sendSingleEmail } from '$lib/utils/email';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

type Order = {
	uuid: string;
	contactNumber: string;
	created_at: Date;
	customerName: string;
	email: string;
	is_accepted: string;
	quantity: number;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { order } = body;

		// Type validation
		if (!order || typeof order !== 'object') {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Type validation failure: Order object is missing or invalid (type: ${typeof order})`
			);
			return json({ error: 'Invalid order data' }, { status: 400 });
		}

		const orderId = order.uuid;

		// Validate order fields
		const typeValidation = await validateTypes(locals.supabase, locals.userId, [
			{ value: orderId, expectedType: 'string', fieldName: 'order.uuid', required: true },
			{ value: order.contactNumber, expectedType: 'string', fieldName: 'order.contactNumber', required: false },
			{ value: order.customerName, expectedType: 'string', fieldName: 'order.customerName', required: false },
			{ value: order.email, expectedType: 'string', fieldName: 'order.email', required: false },
			{ value: order.quantity, expectedType: 'number', fieldName: 'order.quantity', required: false }
		]);

		if (!typeValidation.valid) {
			return json({ error: 'Invalid input types', details: typeValidation.errors }, { status: 400 });
		}

		console.log('Order (object):', order);
		console.log('Order (string):', JSON.stringify(order, null, 2));
		console.log('OrderId:', orderId);

		const { data, error } = await locals.supabase
			.from('orders')
			.update({ is_accepted: 'declined' })
			.eq('uuid', orderId)
			.select()
			.single();

		if (order.email) {
			sendSingleEmail({
				recipient: order.email,
				subject: `Order Declined – ${order.deal_title}`,
				content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Declined</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #f44336;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f44336;
            margin: 0;
            font-size: 28px;
        }
        .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .detail-value {
            color: #333;
        }
        .status-badge {
            display: inline-block;
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Offer Declined</h1>
        </div>

        <p>Hi Hans,</p>
        <p>Your offer has been <span class="status-badge">Declined</span>.</p>

        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">158b46ea-258c-4070-9ace-53fb885e8e1e</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">sdszdsa</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">10</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">₱100.00</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you.</p>
        </div>
    </div>
</body>
</html>`
			});
		}

		if (error) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Failed to decline order ${orderId}: ${error.message}`
			);
			return json({ error: error.message }, { status: 500 });
		}

		await logEvent(
			locals.supabase,
			locals.userId,
			`Order declined: Order ${orderId} for product "${order.deal_title || 'Unknown'}"`
		);

		return json({ success: true, order: data });
	} catch (err) {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error declining order: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
