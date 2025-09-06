<script lang="ts">
    import { onMount } from 'svelte';

    let orders: any[] = [];

    onMount(async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();

            if (data.success) {
                orders = data.orders;
            } else {
                console.error('Failed to fetch orders:', data.error);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    });
</script>


<section class="min-h-screen bg-unli-light font-inter px-4 py-8 md:px-12 md:py-16">
    <h1 class="mb-8 text-3xl font-bold text-unli-dark">My Orders</h1>

    {#if orders.length === 0}
<div class="flex flex-col items-center justify-center space-y-4 py-20 text-center text-unli-forest">
    <!-- Friendly shopping cart icon -->


    <h1 class="text-6xl font-semibold text-unli-dark">You haven't placed any orders yet.</h1>
    <p class="text-2xl text-unli-dark/70">Once you make a purchase, your orders will appear here.</p>
</div>

    {:else}
        <div class="space-y-10">
            {#each orders as order}
                <div class="rounded-2xl border border-unli-sage bg-white shadow-3xl transition hover:shadow-2xl animate-fade-in">
                    <!-- Order Header -->
                    <div class="flex flex-col gap-4 border-b border-unli-light bg-gradient-to-r from-unli-light to-unli-sage px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <span class="text-xs text-unli-forest">Order ID</span>
                            <div class="font-mono text-sm font-semibold text-unli-dark">{order.id}</div>
                        </div>
                        <div>
                            <span class="text-xs text-unli-forest">Placed On</span>
                            <div class="text-sm font-semibold text-unli-dark">{new Date(order.created_at).toLocaleString()}</div>
                        </div>
                        <div>
                            <span class={`inline-block rounded-full px-4 py-1 text-xs font-semibold ${order.is_completed ? 'bg-unli-sage text-unli-deep' : 'bg-unli-light text-unli-dark'}`}>
                                {order.is_completed ? 'Completed' : 'Pending'}
                            </span>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="grid gap-6 px-6 py-6 md:grid-cols-2">
                        {#each order.order_items as item}
                            <div class="flex items-center gap-4 rounded-lg border border-unli-light bg-unli-light/60 p-4 shadow-sm hover:bg-unli-light/80 transition">
                                <img src={item.image} alt={item.name} class="h-20 w-20 rounded-lg object-cover border border-unli-sage" />
                                <div class="flex-1">
                                    <h2 class="font-semibold text-unli-dark">{item.name} <span class="text-xs text-unli-forest">({item.unit})</span></h2>
                                    <p class="mt-1 text-sm text-unli-forest line-clamp-2">{item.description}</p>
                                    <div class="mt-2 flex items-center gap-3">
                                        <span class="text-lg font-bold text-unli-sage">₱{item.price}</span>
                                        <span class="text-unli-light line-through">₱{item.originalPrice}</span>
                                        <span class="text-unli-dark">x {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <!-- Order Summary -->
                    <div class="flex flex-col gap-6 border border-unli-light bg-gradient-to-r from-unli-light to-unli-sage px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div class="flex flex-col gap-2 md:flex-row md:gap-8">
                            <div>
                                <span class="text-xs text-unli-forest">Subtotal</span>
                                <div class="font-semibold text-unli-dark">₱{order.subtotal}</div>
                            </div>
                            <div>
                                <span class="text-xs text-unli-forest">Total Savings</span>
                                <div class="font-semibold text-unli-dark">₱{order.total_savings}</div>
                            </div>
                            <div>
                                <span class="text-xs text-unli-forest">Payment</span>
                                <div class="font-semibold text-unli-dark capitalize">{order.payment_method}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Shipping Info -->
                    <div class="border border-unli-light bg-white px-6 py-6">
                        <h3 class="mb-3 text-lg font-semibold text-unli-dark">Shipping Information</h3>
                        <div class="grid gap-6 text-sm text-unli-forest md:grid-cols-2">
                            <div class="space-y-2">
                                <p>
                                    <span class="font-semibold text-unli-dark">Name:</span>
                                    <span class="ml-1">{order.shipping_info.firstName} {order.shipping_info.lastName}</span>
                                </p>
                                <p>
                                    <span class="font-semibold text-unli-dark">Address:</span>
                                    <span class="ml-1">{order.shipping_info.address}, {order.shipping_info.city}, {order.shipping_info.province}, {order.shipping_info.postalCode}</span>
                                </p>
                                <p>
                                    <span class="font-semibold text-unli-dark">Phone:</span>
                                    <span class="ml-1">{order.shipping_info.phone}</span>
                                </p>
                            </div>
                            <div class="space-y-2">
                                <p>
                                    <span class="font-semibold text-unli-dark">Email:</span>
                                    <span class="ml-1">{order.shipping_info.email}</span>
                                </p>
                                {#if order.shipping_info.specialInstructions}
                                    <p>
                                        <span class="font-semibold text-unli-dark">Notes:</span>
                                        <span class="ml-1">{order.shipping_info.specialInstructions}</span>
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</section>
