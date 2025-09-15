<script lang="ts">
	import Hero from '$lib/components/ui/Hero.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HotDeals from '$lib/components/ui/HotDeals.svelte';
	import SellerCarousel from '$lib/components/ui/SellerCarousel.svelte';
	import CheckoutModal from '$lib/components/ui/CheckoutModal/CheckoutModal.svelte';
	import type { Deal, ProductResponse } from '$lib/types/types';
	import { onMount } from 'svelte';
  import ActiveListings from '$lib/components/ui/ActiveListings/ActiveListings.svelte';
	// import type { Seller } from '$lib/types/types';

	import { goto } from '$app/navigation';

	let openCheckoutModal = false;

	let selectedDeal: any | null = null;
	let deals: Deal[] = [];
	let offset = 0;
	const limit = 10;
	let hasMore = true;
	let loading = false;

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

	function handleFloatingChat() {
		goto('/chat');
	}

	async function handleChat(event: CustomEvent) {
		try {
			const selectedDeal = event.detail.selectedDeal;
			console.log('hello');
			console.log('Selected deal:', selectedDeal);

			const res = await fetch('/api/create-chatroom', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ selectedDeal })
			});

			const data = await res.json();
			console.log('Chatroom response:', data);

			if (data.success) {
				// maybe redirect to chatroom
				console.log(data.chatroomId);
				goto(`/chat/${data.chatroomId}`);
			} else {
				console.error('Failed to create chatroom:', data.error);
			}
		} catch (err) {
			console.error('Error creating chatroom:', err);
			closeCheckout();
		}
	}

	async function loadProducts(offset = 0, limit = 10): Promise<{ data: Deal[]; hasMore: boolean }> {
		const res = await fetch(`/api/fetchProducts?offset=${offset}&limit=${limit}`);
		return await res.json();
	}

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;

		const result = await loadProducts(offset, limit);
		deals = [...deals, ...result.data]; // append new items
		hasMore = result.hasMore;
		offset += limit;

		loading = false;
	}

	onMount(async () => {
		await loadMore(); // load first batch
	});
</script>

<div class="min-h-[100vh]">
  <!-- Header -->
  <Header />
  
  <!-- Hero -->
  <!-- <Hero /> -->
  
  <!-- Main Content - Padding only on tablets and desktops -->
  <div class="mt-8 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
    <!-- Hot Deals -->
    <div class="px-4 sm:px-0">
      <HotDeals
        {deals}
        {hasMore}
        {loading}
        on:select={(e) => openCheckout(e.detail)}
        on:loadMore={() => loadMore()}
      />
    </div>
    
    <!-- Brands -->
    <div class="mt-6 sm:mt-8 md:mt-10 px-4 sm:px-0">
      <SellerCarousel />
    </div>
    
    <!-- Active Listings -->
    <div class="mt-6 sm:mt-8 md:mt-10 px-4 sm:px-0">
      <ActiveListings
        {deals}
        {hasMore}
        {loading}
        on:select={(e) => openCheckout(e.detail)}
        on:loadMore={() => loadMore()}
      />
    </div>
  </div>

  <!-- Checkout Modal -->
  {#if openCheckoutModal}
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <CheckoutModal 
        {selectedDeal} 
        on:close={closeCheckout} 
        on:chat={(e) => handleChat(e)} 
      />
    </div>
  {/if}

  <!-- Floating Chat Button -->
  <button 
    class="floating-chat-btn" 
    on:click={handleFloatingChat} 
    aria-label="Open chat"
  >
    <!-- Chat Icon SVG -->
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="chat-icon"
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H6L10 22L14 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        fill="currentColor"
      />
      <circle cx="8" cy="10" r="1" fill="white" />
      <circle cx="12" cy="10" r="1" fill="white" />
      <circle cx="16" cy="10" r="1" fill="white" />
    </svg>
    <!-- Notification dot -->
    <span class="notification-dot"></span>
  </button>

  <!-- Footer -->
  <Footer />
</div>

<style>
	.floating-chat-btn {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 60px;
		height: 60px;
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
		top: 8px;
		right: 8px;
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
			width: 56px;
			height: 56px;
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
			top: 6px;
			right: 6px;
		}
	}

	@media (max-width: 480px) {
		.floating-chat-btn {
			width: 52px;
			height: 52px;
			bottom: 12px;
			right: 12px;
		}

		.chat-icon {
			width: 18px;
			height: 18px;
		}
	}

	/* Ensure it doesn't interfere with footer on very small screens */
	@media (max-height: 600px) {
		.floating-chat-btn {
			bottom: 12px;
		}
	}
</style>
