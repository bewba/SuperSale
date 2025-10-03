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
	<h1 class="mb-2 text-4xl font-bold">Today's hottest deals for you!</h1>

	<!-- Slider container -->
	<div class="relative group">
		<div
			id="deals-slider"
			class="scrollbar-hide rounded-2xl flex snap-x snap-mandatory gap-4 overflow-x-scroll scroll-smooth"
		>
			{#each deals as deal}
				<div class="flex w-[100%] shrink-0 snap-center lg:w-1/2 xl:w-1/3 md:w-1/2">
					<DealCard {deal} on:select={(e) => handleSelect(e.detail.deal)} />
				</div>
			{/each}
		</div>

		<!-- Navigation buttons  -->
		<button
			on:click={prev}
			class="cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover:opacity-100"
			aria-label="Previous deals"
		>
			<ChevronLeft class="w-6 h-6" />
		</button>
		<button
			on:click={next}
			class="cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 md:opacity-0 md:group-hover:opacity-100"
			aria-label="Next deals"
		>
			<ChevronRight class="w-6 h-6" />
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
