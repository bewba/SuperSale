<script lang="ts">
	import Hero from '$lib/components/ui/Hero.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HotDeals from '$lib/components/ui/HotDeals.svelte';
	import SellerCarousel from '$lib/components/ui/SellerCarousel.svelte';
	import CheckoutModal from '$lib/components/ui/CheckoutModal/CheckoutModal.svelte';
	import type { Deal, ProductResponse } from '$lib/types/types';
	import ActiveListings from '$lib/components/ui/ActiveListings/ActiveListings.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getPb } from '$lib/pocketbase/pb.client';
	// import type { Seller } from '$lib/types/types';

	import { goto } from '$app/navigation';

	export let data;
	const user = data?.user;

	let openCheckoutModal = false;
	let selectedDeal: any | null = null;
	let deals: Deal[] = [];
	let activeDeals: Deal[] = [];
	let offsetProducts = 0;
	let offsetActive = 0;
	const limit = 10;
	let hasMore = true;
	let loading = false;

	let hasMoreProducts = true;
	let hasMoreActive = true;

	let loadingProducts = false;
	let loadingActive = false;

	// Notification state
	// let hasUnseenMessages = false;
	// let pb: any;
	// let unsubscribe: (() => void) | null = null;

	// type Chat = {
	// 	id: string;
	// 	productImage: string;
	// 	productName: string;
	// 	contactPerson: string;
	// 	lastMessageTime: string;
	// 	lastMessage: string;
	// 	seen_by: Record<string, string>;
	// };

	// function computeUnseen(chat: Chat): boolean {
	// 	return !chat.seen_by?.[user.id];
	// }

	// async function checkUnseenMessages() {
	// 	try {
	// 		const res = await fetch(`/api/loadActiveChats?page=1&perPage=50`); // Get more chats to check
	// 		if (!res.ok) return;

	// 		const data = await res.json();
	// 		const chats = data.activeChats || [];

	// 		// Check if any chat has unseen messages
	// 		hasUnseenMessages = chats.some((chat: Chat) => computeUnseen(chat));
	// 		console.log('Has unseen messages:', hasUnseenMessages);
	// 	} catch (err) {
	// 		console.error('Error checking unseen messages:', err);
	// 	}
	// }

	// async function setupRealtimeSubscription() {
	// 	if (!browser || !user?.id) return;

	// 	try {
	// 		pb = getPb();
	// 		let userId = user.id;

	// 		// Subscribe to chat_rooms collection changes
	// 		unsubscribe = await pb.collection('chat_rooms').subscribe('*', async (e) => {
	// 			const { action, record } = e;

	// 			// Only handle changes for rooms where current user is buyer or seller
	// 			if (record.buyer === userId || record.seller === userId) {
	// 				if (action === 'create' || action === 'update') {
	// 					// Check for unseen messages whenever there's a change
	// 					await checkUnseenMessages();
	// 				} else if (action === 'delete') {
	// 					// Recheck unseen messages after deletion
	// 					await checkUnseenMessages();
	// 				}
	// 			}
	// 		});

	// 		console.log('Subscribed to chat_rooms collection for notifications');
	// 	} catch (err) {
	// 		console.error('Error setting up real-time subscription:', err);
	// 	}
	// }

	function openCheckout(event: CustomEvent) {
		selectedDeal = event;
		openCheckoutModal = true;
		console.log('selectedDeal', selectedDeal);
		console.log(openCheckoutModal);
	}

	function closeCheckout() {
		openCheckoutModal = false;
		selectedDeal = null;
	}

	// function handleFloatingChat() {
	// 	goto('/chatRooms');
	// }

	// async function handleChat(event: CustomEvent) {
	// 	try {
	// 		const selectedDeal = event.detail.selectedDeal;
	// 		console.log('hello');
	// 		console.log('Selected deal:', selectedDeal);

	// 		const res = await fetch('/api/create-chatroom', {
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify({ selectedDeal })
	// 		});

	// 		const data = await res.json();
	// 		console.log('Chatroom response:', data);

	// 		if (data.success) {
	// 			// maybe redirect to chatroom
	// 			console.log(data.chatroomId);
	// 			goto(`/chat/${data.chatroomId}`);
	// 		} else {
	// 			console.error('Failed to create chatroom:', data.error);
	// 		}
	// 	} catch (err) {
	// 		console.error('Error creating chatroom:', err);
	// 		closeCheckout();
	// 	}
	// }

	async function loadProducts(offset = 0, limit = 10): Promise<{ data: Deal[]; hasMore: boolean }> {
		const res = await fetch(`/api/fetchProducts?offset=${offset}&limit=${limit}`);
		return await res.json();
	}

	async function loadActiveProducts(
		offset = 0,
		limit = 10
	): Promise<{ data: Deal[]; hasMore: boolean }> {
		const res = await fetch(`/api/fetchActiveDeals?offset=${offset}&limit=${limit}`);
		return await res.json();
	}

	async function loadMoreActiveDeals() {
		if (loadingActive || !hasMoreActive) return;
		loadingActive = true;

		const result = await loadActiveProducts(offsetActive, limit);
		activeDeals = [...activeDeals, ...result.data];
		hasMoreActive = result.hasMore;
		offsetActive += limit;

		loadingActive = false;
	}

	async function loadMoreProducts() {
		if (loadingProducts || !hasMoreProducts) return;
		loadingProducts = true;

		const result = await loadProducts(offsetProducts, limit);
		deals = [...deals, ...result.data];
		hasMoreProducts = result.hasMore;
		offsetProducts += limit;

		loadingProducts = false;
	}

	onMount(async () => {
		// load first batches
		await Promise.all([loadMoreProducts(), loadMoreActiveDeals()]);
	});

	// Cleanup subscription on destroy
	// onDestroy(() => {
	// 	if (unsubscribe) {
	// 		unsubscribe();
	// 		console.log('Unsubscribed from chat_rooms collection');
	// 	}
	// });
</script>

<div class="min-h-[100vh]">
	<!-- Header -->
	<Header userStatus={user.role} />

	<!-- Hero -->
	<!-- <Hero /> -->

	<!-- Main Content - Padding only on tablets and desktops -->
	<div class="mt-8 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
		<!-- Hot Deals -->
		<div class="px-4 sm:px-0">
			<HotDeals
				deals={activeDeals}
				hasMore={hasMoreActive}
				loading={loadingActive}
				on:select={(e) => openCheckout(e.detail)}
				on:loadMore={() => loadMoreActiveDeals()}
			/>
		</div>

		<!-- Brands -->
		<div class="mt-6 px-4 sm:mt-8 sm:px-0 md:mt-10">
			<SellerCarousel />
		</div>

		<!-- Active Listings -->
		<div class="mt-6 px-4 sm:mt-8 sm:px-0 md:mt-10">
			<ActiveListings
				{deals}
				hasMore={hasMoreProducts}
				loading={loadingProducts}
				on:select={(e) => openCheckout(e.detail)}
				on:loadMore={() => loadMoreProducts()}
			/>
		</div>
	</div>

	<!-- Checkout Modal -->
	{#if openCheckoutModal}
		<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
			<CheckoutModal {selectedDeal} on:close={closeCheckout} />
		</div>
	{/if}

	<!-- <button
		class="floating-chat-btn relative flex h-36 w-36 items-center justify-center rounded-full shadow-lg"
		on:click={handleFloatingChat}
		aria-label="Open chat"
		style="background: linear-gradient(135deg, #FFA500, #FF7F00);"
	> -->
	<!-- Chat Icon SVG -->
	<!-- <svg
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="chat-icon text-white"
		>
			<path
				d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H6L10 22L14 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
				fill="currentColor"
			/>
			<circle cx="8" cy="10" r="1" fill="white" />
			<circle cx="12" cy="10" r="1" fill="white" />
			<circle cx="16" cy="10" r="1" fill="white" />
		</svg> -->

	<!-- Conditional Notification dot - only show when there are unseen messages -->
	<!-- {#if hasUnseenMessages}
			<span
				class="notification-dot absolute top-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-red-500"
			></span>
		{/if} -->
	<!-- </button> -->

	<!-- Footer -->
	<Footer />
</div>

<style>
	.floating-chat-btn {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 96px;
		height: 96px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		z-index: 1000;
		outline: none;
	}

	.floating-chat-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
	}

	.floating-chat-btn:active {
		transform: scale(0.95);
	}

	.chat-icon {
		transition: transform 0.2s ease;
	}

	.floating-chat-btn:hover .chat-icon {
		transform: scale(1.1);
	}

	.notification-dot {
		position: absolute;
		top: 20px;
		right: 20px;
		width: 12px;
		height: 12px;
		background: #ff4444;
		border: 2px solid white;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.7;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Mobile responsive adjustments */
	@media (max-width: 768px) {
		.floating-chat-btn {
			width: 72px;
			height: 72px;
			bottom: 16px;
			right: 16px;
		}

		.chat-icon {
			width: 20px;
			height: 20px;
		}

		.notification-dot {
			width: 10px;
			height: 10px;
			top: 12px;
			right: 12px;
		}
	}

	@media (max-width: 480px) {
		.floating-chat-btn {
			width: 60px;
			height: 60px;
			bottom: 12px;
			right: 12px;
		}

		.chat-icon {
			width: 32px;
			height: 32px;
		}
	}

	/* Ensure it doesn't interfere with footer on very small screens */
	@media (max-height: 600px) {
		.floating-chat-btn {
			bottom: 12px;
		}
	}
</style>
