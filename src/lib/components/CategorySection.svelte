<script lang="ts">
	import DealCard from './DealCard.svelte';
	import type { Deal } from '$lib/types/types';
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let deals: Deal[] = [];

	const dispatch = createEventDispatcher();

	// Mapping for display titles
	const displayTitles: Record<string, string> = {
		LEFTOVER: 'DAILY LEFTOVERS',
		UGLY: 'UGLY GOODS',
		PACKAGING: 'NO PACKAGING'
	};

	// Mapping for descriptions
	const descriptions: Record<string, string> = {
		'DAILY LEFTOVERS': 'Fresh food from today that needs to go fast!',
		'UGLY GOODS': 'Imperfect shapes, perfect taste & nutrition!',
		'NO PACKAGING': 'Missing boxes but guaranteed quality inside!'
	};

	// Mapping for gradient backgrounds
	const gradients: Record<string, string> = {
		'DAILY LEFTOVERS': 'from-yellow-600 via-yellow-500 to-yellow-400',
		'UGLY GOODS': 'from-orange-600 via-orange-500 to-orange-400',
		'NO PACKAGING': 'from-green-600 via-emerald-500 to-teal-400'
	};

	// Fallback display title
	$: displayTitle = displayTitles[title.toUpperCase()] || title;

	// Fallback description
	$: description = descriptions[displayTitle] || 'Discover deals!';

	// Fallback gradient
	$: gradient = gradients[displayTitle] || 'from-gray-400 via-gray-500 to-gray-600';

	function handleCheckout(event: CustomEvent) {
		console.log('checkout received in CategorySection', event.detail);
		dispatch('checkout', event.detail);
		// event.detail contains { deal, offer }
		// you can now open modal or pass it up another level
	}
</script>

<section id="deals" class="py-8 sm:py-12 lg:py-16">
	<div class="container mx-auto w-full px-4">
		<!-- Header -->
		<div class="relative mb-8 overflow-hidden rounded-2xl shadow-lg lg:mb-12">
			<!-- Gradient background -->
			<div class={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-95`}></div>

			<!-- Content -->
			<div
				class="relative z-10 flex flex-col gap-4 p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:p-8 sm:text-left lg:p-10"
			>
				<div>
					<h2
						class="font-game text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl"
					>
						{displayTitle}
					</h2>
					<p class="mt-2 text-sm font-medium text-white/80 sm:text-base lg:text-lg">
						{description}
					</p>
				</div>
			</div>
		</div>

		<!-- Deals Grid -->
		{#if deals.length > 0}
			<!-- <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
      {#each deals as deal (deal.id)}
        <div class="h-full">
          <DealCard {deal} />
        </div>
      {/each}
    </div> -->
			<div
				class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each deals as deal (deal.id)}
					<div class="transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
						<DealCard {deal} on:checkout={handleCheckout} />
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center text-gray-600 shadow-inner sm:p-8 lg:p-10"
			>
				<p class="text-sm sm:text-base lg:text-lg">
					No deals available yet for <span class="font-semibold">{displayTitle}</span>.
				</p>
			</div>
		{/if}
	</div>
</section>
