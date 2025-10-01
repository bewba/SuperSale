<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/ui/Header.svelte';
	import BrandInfo from '$lib/components/brand/BrandInfo.svelte';
	import ActiveListings from '$lib/components/ui/ActiveListings/ActiveListings.svelte';
	import CheckoutModal from '$lib/components/ui/CheckoutModal/CheckoutModal.svelte';
	import NavigationFooter from '$lib/components/NavigationFooter.svelte';
	import type { Deal } from '$lib/types/types';

	export let data: { seller: any; error?: string };
	let openCheckoutModal = false;

	let selectedDeal: any | null = null;
	let deals: Deal[] = [];
	let offset = 0;
	const limit = 10;
	let hasMore = true;
	let loading = false;
	let error = null;

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

	async function loadProducts(
		sellerId: string,
		offset = 0,
		limit = 10
	): Promise<{ data: Deal[]; hasMore: boolean }> {
		const response = await fetch(
			`/api/fetchSellerListings?sellerId=${sellerId}&offset=${offset}&limit=${limit}`
		);
		return await response.json();
	}

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;

		const result = await loadProducts(data.seller.id, offset, limit);
		deals = [...deals, ...result.data]; // append new items
		hasMore = result.hasMore;
		offset += limit;

		loading = false;
	}

	onMount(async () => {
		await loadMore(); // load first batch
	});

	// async function fetchDeals(sellerId: string, offset = 0, limit = 10) {
	// 	try {
	// 		loading = true;
	// 		error = null;

	// 		const response = await fetch(
	// 			`/api/fetchSellerListings?sellerId=${sellerId}&offset=${offset}&limit=${limit}`
	// 		);

	// 		if (!response.ok) {
	// 			throw new Error(`Failed to fetch deals: ${response.statusText}`);
	// 		}

	// 		const result = await response.json();

	// 		if (result.error) {
	// 			throw new Error(result.error);
	// 		}

	// 		deals = result.data ?? [];
	// 	} catch (err) {
	// 		console.error('Error fetching deals:', err);
	// 		error = err instanceof Error ? err.message : 'Failed to load deals';
	// 	} finally {
	// 		loading = false;
	// 	}
	// }

	// onMount(() => {
	// 	// if (data.seller?.id) {
	// 	// 	fetchDeals(data.seller.id);
	// 	// }
	// });
</script>

<div class="min-h-[100vh]">
	<Header />

	<div class="mt-8 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
		<div class="px-4 sm:px-0">
			<!-- Info Card  -->
			<BrandInfo brand={data.seller} />

			<div class="mt-6 px-4 sm:mt-8 sm:px-0 md:mt-10">
				<ActiveListings
					{deals}
					on:select={(e) => openCheckout(e.detail)}
					on:loadMore={() => loadMore()}
				/>
			</div>
		</div>

		<!-- Checkout Modal -->
	</div>
</div>

<NavigationFooter />

{#if openCheckoutModal}
	<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
		<CheckoutModal {selectedDeal} on:close={closeCheckout} on:chat={(e) => handleChat(e)} />
	</div>
{/if}
