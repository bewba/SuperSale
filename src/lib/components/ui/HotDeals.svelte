<!-- <script lang="ts">
	import DealCard from '$lib/components/DealCard.svelte';
	import type { Deal } from '$lib/types/types';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let deals: Deal[] = [];
	export let loading: boolean = false;
	const dispatch = createEventDispatcher();

	let currentIndex = 0;
	let itemsPerView = 5;

	// Adjust items per view based on screen size
	function updateItemsPerView() {
		if (window.innerWidth < 640) {
			itemsPerView = 1; // Mobile (sm)
		} else if (window.innerWidth < 1024) {
			itemsPerView = 2; // Tablet (md)
		} else if (window.innerWidth < 1280) {
			itemsPerView = 3; // Small laptop (lg)
		} else {
			itemsPerView = 5; // Desktop (xl and above)
		}
	}

	function handleCheckout(event: CustomEvent) {
		console.log(event.detail);
		dispatch('checkout', event.detail);
	}

	onMount(() => {
		updateItemsPerView();
		window.addEventListener('resize', updateItemsPerView);
		return () => window.removeEventListener('resize', updateItemsPerView);
	});

	function next() {
		if (deals.length <= itemsPerView) return;
		currentIndex = (currentIndex + 1) % (deals.length - itemsPerView + 1);
	}

	function prev() {
		if (deals.length <= itemsPerView) return;
		currentIndex =
			(currentIndex - 1 + (deals.length - itemsPerView + 1)) % (deals.length - itemsPerView + 1);
	}
</script> -->

<script lang="ts">
	import DealCard from '$lib/components/DealCard.svelte';
	import { createEventDispatcher } from 'svelte';
	import { ChevronRight, ChevronLeft } from '@lucide/svelte';
	import type { Deal } from '$lib/types/types';
	import { onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let deals: Deal[] = [];
	export let hasMore: boolean = false;
	export let loading: boolean = false;

	let currentIndex = 0;
	let amountLoaded = 0;
	// Go to next deal card
	function next() {
		currentIndex = (currentIndex + 1) % deals.length;
		scrollToCard(currentIndex);

		if ((currentIndex + 1) % 8 === 0 && hasMore && !loading && amountLoaded <= currentIndex) {
			amountLoaded += 10;
			console.log(amountLoaded, currentIndex);
			dispatch('loadMore');
		}
	}

	function handleScroll() {
		const slider = document.getElementById('deals-slider');
		if (!slider) return;

		const cardWidth = slider.firstElementChild?.clientWidth ?? 0;
		const scrollLeft = slider.scrollLeft;

		// Calculate the "active" index
		const index = Math.round(scrollLeft / cardWidth);

		currentIndex = index;

		// Trigger loadMore on every 8th card
		if ((currentIndex + 1) % 8 === 0 && hasMore && !loading && amountLoaded <= currentIndex) {
			amountLoaded += 10;
			console.log(amountLoaded, currentIndex);
			dispatch('loadMore');
		}
	}

	// Go to previous deal card
	function prev() {
		currentIndex = (currentIndex - 1 + deals.length) % deals.length;
		scrollToCard(currentIndex);
	}

	// "Mover" function
	function scrollToCard(index: number) {
		const slider = document.getElementById('deals-slider');
		const cardWidth = slider?.firstElementChild?.clientWidth ?? 0;
		slider?.scrollTo({
			left: index * cardWidth,
			behavior: 'smooth'
		});
	}

	function handleSelect(event: CustomEvent) {
		dispatch('select', event);
	}

	onMount(() => {
		const slider = document.getElementById('deals-slider');
		slider?.addEventListener('scroll', handleScroll);
		return () => slider?.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="mt-4 mx-2" id="hotdeals">
	<h1 class="mb-2 text-4xl font-bold">This Week's Hotdeals!</h1>

	<!-- Slider container -->
	<div class="relative">
		<div
			id="deals-slider"
			class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-scroll scroll-smooth"
		>
			{#each deals as deal}
				<div class="w-[90%] shrink-0 snap-center lg:w-1/2 xl:w-1/3 md:1/2">
					<DealCard {deal} on:select={(e) => handleSelect(e.detail.deal)} />
				</div>
			{/each}
		</div>

		<!-- Navigation buttons  -->
		<button
			on:click={prev}
			class="absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer rounded-r bg-black/50 py-1 text-white"
		>
			<ChevronLeft />
		</button>
		<button
			on:click={next}
			class="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer rounded-l bg-black/50 py-1 text-white"
		>
			<ChevronRight />
		</button>
	</div>
</div>

<style>
	/* Hide scrollbar but keep swipe */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
