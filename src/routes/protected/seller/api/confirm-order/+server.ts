import { sendSingleEmail } from '$lib/utils/email';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
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

		// Type validation
		if (!body.order || typeof body.order !== 'object') {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Type validation failure: Order object is missing or invalid (type: ${typeof body.order})`
			);
			return json({ error: 'Invalid order data' }, { status: 400 });
		}

		const order = body.order;
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

		console.log(body);

		const date = new Date(order.created_at);

		// Format with Intl.DateTimeFormat
		const formatted = new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: 'Asia/Manila'
		}).format(date);

		if (!orderId) {
			return json({ error: 'orderId is required' }, { status: 400 });
		}

		const { data, error } = await locals.supabase
			.from('orders')
			.update({ is_accepted: 'accepted' })
			.eq('uuid', orderId)
			.select()
			.single();

		if (order.email) {
			sendSingleEmail({
				recipient: order.email,
				subject: `✅ Order Accepted – ${order.deal_title}`,
				content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 28px;
        }
        .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .order-details h2 {
            color: #333;
            margin-top: 0;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
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
        .total-price {
            font-size: 20px;
            font-weight: bold;
            color: #4CAF50;
            text-align: center;
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            background-color: #4CAF50;
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
        .contact-info {
            background-color: #f0f8f0;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .contact-info h3 {
            margin-top: 0;
            color: #4CAF50;
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
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your order, ${order.customerName}!</p>
        </div>

        <p>Dear Hans,</p>
        <p>Great news! Your order has been <span class="status-badge">Accepted</span> and is now being processed.</p>

        <div class="order-details">
            <h2>Order Details</h2>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order.uuid}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${order.product.title}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${order.quantity} items</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Unit Price:</span>
                <span class="detail-value">₱${order.totalPrice}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${order.created_at}</span>
            </div>
        </div>

        <div class="total-price">
            Total Amount: ₱${order.totalPrice}
        </div>

        <div class="contact-info">
            <h3>📱 Contact Information</h3>
            <p><strong>Your Contact Number:</strong> 09270251730</p>
            <p><strong>Email:</strong>${order.email}</p>
        </div>

        <p><strong>What's Next?</strong></p>
        <ul>
            <li>We'll begin processing your order immediately</li>
            <li>You'll receive updates via email and SMS</li>
            <li>For any questions, feel free to contact us using the information below</li>
        </ul>

        <div class="footer">
            <p>Thank you for choosing our service!</p>
            <p>If you have any questions or concerns, please don't hesitate to reach out.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
                This is an automated confirmation email. Please do not reply directly to this message.
            </p>
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
				`Failed to confirm order ${orderId}: ${error.message}`
			);
			return json({ error: error.message }, { status: 500 });
		}

		await logEvent(
			locals.supabase,
			locals.userId,
			`Order confirmed: Order ${orderId} for product "${order.deal_title || 'Unknown'}"`
		);

		return json({ success: true, order: data });
	} catch (err) {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error confirming order: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
