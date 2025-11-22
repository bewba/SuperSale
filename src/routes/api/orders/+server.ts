import type { RequestHandler } from '@sveltejs/kit';
import { sendSingleEmail } from '$lib/utils/email';
import { logEvent } from '$lib/server/utils/logger';
import { validateTypes } from '$lib/server/utils/typeValidator';

type EmailPayload = {
	recipient: string;
	quantity: number;
	totalPrice: number;
	deal_title: string;
};

// GET all orders
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { data, error } = await locals.supabase
			.from('orders')
			.select('*')
			.order('created_at', { ascending: false });

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

// POST new order
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();

		// Type validation
		const typeValidation = await validateTypes(locals.supabase, locals.userId, [
			{ value: body.email, expectedType: 'string', fieldName: 'email', required: true },
			{ value: body.quantity, expectedType: 'number', fieldName: 'quantity', required: true },
			{ value: body.dealTotal, expectedType: 'number', fieldName: 'dealTotal', required: true },
			{ value: body.dealTitle, expectedType: 'string', fieldName: 'dealTitle', required: true },
			{ value: body.owner, expectedType: 'string', fieldName: 'owner', required: true },
			{ value: body.name, expectedType: 'string', fieldName: 'name', required: true },
			{ value: body.contactNumber, expectedType: 'string', fieldName: 'contactNumber', required: true },
			{ value: body.dealId, expectedType: 'string', fieldName: 'dealId', required: true }
		]);

		if (!typeValidation.valid) {
			await logEvent(
				locals.supabase,
				locals.userId,
				`Type validation failure in order creation: ${typeValidation.errors.join('; ')}`
			);
			return new Response(JSON.stringify({ error: 'Invalid input types', details: typeValidation.errors }), { status: 400 });
		}

		console.log(body);

		//Email to Buyer
		const buyerEmailPayload: EmailPayload = {
			recipient: body.email ?? '',
			quantity: body.quantity,
			totalPrice: body.dealTotal,
			deal_title: body.dealTitle
		};

		const sellerEmailPayload: EmailPayload = {
			recipient: body.owner ?? '',
			quantity: body.quantity,
			totalPrice: body.dealTotal,
			deal_title: body.dealTitle
		};

		// Get the seller email
		const { data: sellerEmail, error: ownerError } = await locals.supabase.rpc(
			'get_user_email_by_id',
			{ p_user_id: sellerEmailPayload.recipient }
		);

		// check if valid
		if (ownerError) {
			console.error('Error fetching seller email:', ownerError.message);
		} else if (sellerEmail) {
			// sellerEmail is the returned string from the RPC
			sellerEmailPayload.recipient = sellerEmail as unknown as string;
		}

		// Construct the payload for inserting my order
		const payload = {
			customerName: body.name,
			contactNumber: body.contactNumber,
			email: body.email,
			quantity: body.quantity,
			deal_id: body.dealId,
			deal_title: body.dealTitle,
			totalPrice: body.dealTotal
		};

		const { data, error } = await locals.supabase.from('orders').insert([payload]).select();

		const emailPromises: Promise<any>[] = [];

		// add to promises
		if (buyerEmailPayload.recipient) {
			emailPromises.push(
				sendSingleEmail({
					recipient: buyerEmailPayload.recipient,
					subject: `✅ Order Confirmation – ${buyerEmailPayload.deal_title}`,
					content: `<!DOCTYPE html>
		<html lang="en">
		<head>
		    <meta charset="UTF-8">
		    <meta name="viewport" content="width=device-width, initial-scale=1.0">
		    <title>Order Confirmation - Ugly.ph</title>
		</head>
		<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
		    <!-- Wrapper Table -->
		    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; min-height: 100vh;">
		        <tr>
		            <td align="center" style="padding: 20px 0;">
		                <!-- Main Content Table -->
		                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 600px; width: 100%;">

		                    <!-- Header Section -->
		                    <tr>
		                        <td style="background-color: #ff6b6b; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
		                            <!-- Success Icon -->
		                            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
		                                <tr>
		                                    <td style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; text-align: center; vertical-align: middle;">
		                                        <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; margin: 20px auto; line-height: 40px; text-align: center;">
		                                            <span style="color: #ff6b6b; font-size: 24px; font-weight: bold;">✓</span>
		                                        </div>
		                                    </td>
		                                </tr>
		                            </table>
		                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Order Confirmed!</h1>
		                            <p style="color: #ffffff; margin: 15px 0 0; font-size: 18px; opacity: 0.9;">Your order has been successfully placed</p>
		                        </td>
		                    </tr>

		                    <!-- Content Section -->
		                    <tr>
		                        <td style="padding: 40px 30px;">
		                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
		                                Thank you for ordering <strong style="color: #2d3748;">${buyerEmailPayload.deal_title}</strong> from <strong style="color: #ff6b6b;">Ugly.ph</strong>
		                            </p>

		                            <!-- Order Details Card -->
		                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
		                                <tr>
		                                    <td style="padding: 30px;">
		                                        <!-- Order Details Header -->
		                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
		                                            <tr>
		                                                <td>
		                                                    <table cellpadding="0" cellspacing="0" border="0">
		                                                        <tr>
		                                                            <td style="background-color: #ff6b6b; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; vertical-align: middle;">📋</td>
		                                                            <td style="color: #2d3748; font-size: 20px; font-weight: bold; padding-left: 12px; vertical-align: middle;">Order Details</td>
		                                                        </tr>
		                                                    </table>
		                                                </td>
		                                            </tr>
		                                        </table>

		                                        <!-- Order Items -->
		                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
		                                            <tr>
		                                                <td style="color: #4a5568; font-weight: 500; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">Item</td>
		                                                <td style="color: #2d3748; font-weight: bold; padding: 15px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${buyerEmailPayload.deal_title}</td>
		                                            </tr>
		                                            <tr>
		                                                <td style="color: #4a5568; font-weight: 500; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">Quantity</td>
		                                                <td style="padding: 15px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
		                                                    <span style="background-color: #ff6b6b; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">${buyerEmailPayload.quantity}</span>
		                                                </td>
		                                            </tr>
		                                            <tr>
		                                                <td style="color: #2d3748; font-weight: bold; font-size: 18px; padding: 20px 0 5px;">Total</td>
		                                                <td style="color: #ff6b6b; font-weight: bold; font-size: 24px; padding: 20px 0 5px; text-align: right;">₱${buyerEmailPayload.totalPrice.toLocaleString()}</td>
		                                            </tr>
		                                        </table>
		                                    </td>
		                                </tr>
		                            </table>

		                            <!-- Status Card -->
		                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e6fffa; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #38b2ac;">
		                                <tr>
		                                    <td style="padding: 25px;">
		                                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
		                                            <tr>
		                                                <td style="background-color: #38b2ac; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; vertical-align: middle;">🚀</td>
		                                                <td style="color: #2d3748; font-weight: bold; padding-left: 15px; vertical-align: middle;">What's Next?</td>
		                                            </tr>
		                                        </table>
		                                        <p style="color: #4a5568; margin: 0; line-height: 1.6;">
		                                            We're preparing your order and will notify you once it's out for delivery. You'll receive tracking information shortly!
		                                        </p>
		                                    </td>
		                                </tr>
		                            </table>
		                        </td>
		                    </tr>

		                    <!-- Footer -->
		                    <tr>
		                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
		                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
		                                <tr>
		                                    <td style="padding-bottom: 20px;">
		                                        <p style="color: #4a5568; margin: 0 0 10px; font-weight: 500;">Need help?</p>
		                                        <a href="mailto:ugly.phbusiness@gmail.com" style="color: #ff6b6b; text-decoration: none; font-weight: bold; background-color: rgba(255,107,107,0.1); padding: 10px 20px; border-radius: 25px; display: inline-block;">
		                                            📧 ugly.phbusiness@gmail.com
		                                        </a>
		                                    </td>
		                                </tr>
		                                <tr>
		                                    <td style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
		                                        <div style="color: #ff6b6b; font-weight: bold; font-size: 20px; margin-bottom: 5px;">Ugly.ph</div>
		                                        <p style="color: #a0aec0; font-size: 14px; margin: 0;">
		                                            © ${new Date().getFullYear()} Ugly.ph. All rights reserved.
		                                        </p>
		                                    </td>
		                                </tr>
		                            </table>
		                        </td>
		                    </tr>
		                </table>
		            </td>
		        </tr>
		    </table>
		</body>
		</html>`
				})
			);
		}

		// add to promises
		if (sellerEmailPayload.recipient) {
			emailPromises.push(
				sendSingleEmail({
					recipient: sellerEmailPayload.recipient,
					subject: `✅ Order Received – ${sellerEmailPayload.deal_title}`,
					content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Bid Received - Ugly.ph</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <!-- Wrapper Table -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Main Content Table -->
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 600px; width: 100%;">
                    
                    <!-- Header Section -->
                    <tr>
                        <td style="background-color: #10b981; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <!-- Sale Icon -->
                            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
                                <tr>
                                    <td style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; text-align: center; vertical-align: middle;">
                                        <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; margin: 20px auto; line-height: 40px; text-align: center;">
                                            <span style="color: #10b981; font-size: 24px; font-weight: bold;">💰</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">New Order Received!</h1>
                            <p style="color: #ffffff; margin: 15px 0 0; font-size: 18px; opacity: 0.9;">You have a new sale to fulfill</p>
                        </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                                Great news! A customer has bid for <strong style="color: #2d3748;">${sellerEmailPayload.deal_title}</strong> from your <strong style="color: #10b981;">Ugly.ph</strong> store.
                            </p>
                            
                            <!-- Order Details Card -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <!-- Order Details Header -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                                            <tr>
                                                <td>
                                                    <table cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="background-color: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; vertical-align: middle;">📦</td>
                                                            <td style="color: #2d3748; font-size: 20px; font-weight: bold; padding-left: 12px; vertical-align: middle;">Sale Details</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Order Items -->
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-weight: 500; padding: 15px 0; border-bottom: 1px solid #bbf7d0;">Product</td>
                                                <td style="color: #2d3748; font-weight: bold; padding: 15px 0; border-bottom: 1px solid #bbf7d0; text-align: right;">${sellerEmailPayload.deal_title}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-weight: 500; padding: 15px 0; border-bottom: 1px solid #bbf7d0;">Quantity Sold</td>
                                                <td style="padding: 15px 0; border-bottom: 1px solid #bbf7d0; text-align: right;">
                                                    <span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">${sellerEmailPayload.quantity}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #2d3748; font-weight: bold; font-size: 18px; padding: 20px 0 5px;">Total Sale Amount</td>
                                                <td style="color: #10b981; font-weight: bold; font-size: 24px; padding: 20px 0 5px; text-align: right;">₱${sellerEmailPayload.totalPrice.toLocaleString()}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <p style="color: #4a5568; margin: 0 0 10px; font-weight: 500;">Need seller support?</p>
                                        <a href="mailto:ugly.phbusiness@gmail.com" style="color: #10b981; text-decoration: none; font-weight: bold; background-color: rgba(16,185,129,0.1); padding: 10px 20px; border-radius: 25px; display: inline-block;">
                                            📧 ugly.phbusiness@gmail.com
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                        <div style="color: #10b981; font-weight: bold; font-size: 20px; margin-bottom: 5px;">Ugly.ph</div>
                                        <p style="color: #a0aec0; font-size: 14px; margin: 0;">
                                            © ${new Date().getFullYear()} Ugly.ph. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
				})
			);
		}

		// send to both buyer and seller
		await Promise.all(emailPromises.map((p) => p as Promise<any>));

		if (error) {
			console.error('Supabase insert error:', error);
			await logEvent(
				locals.supabase,
				locals.userId,
				`Failed to create order for product "${body.dealTitle}": ${error.message}`
			);
			return new Response(JSON.stringify({ error: error.message }), { status: 500 });
		}

		await logEvent(
			locals.supabase,
			locals.userId,
			`Order created: Order for "${body.dealTitle}" (Order ID: ${data[0]?.uuid || 'unknown'}, Quantity: ${body.quantity}, Total: ₱${body.dealTotal})`
		);

		return new Response(JSON.stringify({ success: true, order: data[0] }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err: any) {
		console.error('Error inserting order:', err);
		await logEvent(
			locals.supabase,
			locals.userId,
			`Error creating order: ${err?.message ?? 'Unknown error'}`
		);
		return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
	}
};
