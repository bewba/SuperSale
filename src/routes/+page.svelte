<!-- <script lang="ts">
	import { onMount } from 'svelte';
	import CategorySection from '$lib/components/CategorySection.svelte';
	import ModalCheckout from '$lib/components/ModalCheckout.svelte';
	import Hero from '$lib/components/ui/Hero.svelte';
	import HotDeals from '$lib/components/ui/HotDeals.svelte';
	import { toastSuccess, toastError, toastInfo } from '$lib/stores/toast';

	type Deal = {
		id: string;
		title: string;
		image: string;
		quantity: number;
		original_price: number;
		discount_price: number;
		discount_percent: number;
		reason: string;
		expires_at: string;
		contact_information: string;
		reason_category: string;
		owner_id: string;
	};

	let featuredDeals: Deal[] = [];
	let page = 1;
	let hasMore = true;
	let loading = false;
	let loaderRef: HTMLDivElement;

	let showCheckoutModal = false;
	let selectedDeal: Deal | null = null;
	let selectedOffer: string | null = null;
	let resetOfferFlag = false;

	async function fetchProducts() {
		if (loading || !hasMore) return;
		loading = true;
		try {
			const res = await fetch(`/api/fetchProducts?page=${page}&limit=10`);
			const json = await res.json();
			featuredDeals = [...featuredDeals, ...json.data];
			hasMore = json.hasMore;
			page++;
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore) fetchProducts();
			},
			{ threshold: 1 }
		);
		if (loaderRef) observer.observe(loaderRef);
		return () => {
			if (loaderRef) observer.unobserve(loaderRef);
		};
	});

	function openCheckout(event: CustomEvent<{ deal: Deal; offer: string }>) {
		const { deal, offer } = event.detail;
		console.log('hello', deal, offer);

		selectedDeal = deal;
		selectedOffer = offer;
		showCheckoutModal = true;
		resetOfferFlag = false;
	}

	function closeModal() {
		showCheckoutModal = false;

		selectedDeal = null;
		selectedOffer = null;
	}

	async function confirmAction(data: any) {
		resetOfferFlag = true;
		const ownerId = selectedDeal?.owner_id ?? '';
		closeModal();
		try {
			const total = data.offer * data.quantity;

			toastInfo(`Placing order!`, {
				title: 'Your order is being placed!',
				duration: 3000,
				position: 'top-right'
			});

			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: data.name,
					contactNumber: data.contactNumber,
					email: data.email,
					quantity: data.quantity,
					dealId: data.deal.id,
					dealTitle: data.deal.title,
					dealTotal: total,
					owner: ownerId
				})
			});

			const json = await res.json();
			toastSuccess(`Your order has been placed!`, {
				title: 'Order Placed',
				duration: 2000,
				position: 'top-right'
			});

			console.log('toaats');

			if (!res.ok) {
				console.error('Failed to create order:', json.error);
			} else {
				console.log('Order created:', json.order);
			}
		} catch (err) {
			console.error('Error creating order:', err);
			toastError(`Error Creating Order!`, {
				title: 'An error occured',
				duration: 2000,
				position: 'top-right'
			});
		}
	}

	$: dealsByCategory = featuredDeals.reduce(
		(acc, deal) => {
			if (!acc[deal.reason_category]) acc[deal.reason_category] = [];
			acc[deal.reason_category].push(deal);
			return acc;
		},
		{} as Record<string, Deal[]>
	);

	// Sorted category names
	$: sortedCategories = Object.keys(dealsByCategory).sort();
</script> -->

<script lang="ts">
	import Hero from '$lib/components/ui/Hero.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HotDeals from '$lib/components/ui/HotDeals.svelte';
	import SellerCarousel from '$lib/components/ui/SellerCarousel.svelte';
	import CheckoutModal from '$lib/components/ui/CheckoutModal/CheckoutModal.svelte';
	import type { Deal, ProductResponse } from '$lib/types/types';
	import { onMount } from 'svelte';
	// import type { Seller } from '$lib/types/types';

	// TODO: RETRIVE SELLERS FROM THE DATABASE
	// let sellers: Seller[] = []
	import { sellers } from '$lib/data/sellers';
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
	<Hero />

	<!-- Hotdeals -->
	<HotDeals
		{deals}
		{hasMore}
		{loading}
		on:select={(e) => openCheckout(e.detail)}
		on:loadMore={() => loadMore()}
	/>

	<!-- Brands -->
	<!-- <SellerCarousel {sellers} /> -->

	{#if openCheckoutModal}
		<CheckoutModal {selectedDeal} on:close={closeCheckout} on:chat={(e) => handleChat(e)} />
	{/if}

	<!-- Footer  -->
	<Footer />
</div>
