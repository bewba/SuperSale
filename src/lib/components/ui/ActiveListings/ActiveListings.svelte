<script lang="ts">
	import MiniDealCard from './MiniDealCard.svelte';
	import type { Deal } from '$lib/types/types';
	import { createEventDispatcher, onMount } from 'svelte';

	export let deals: Deal[] = [];
	export let loading = false;
	export let hasMore = true;

	const dispatch = createEventDispatcher();
	let sentinel: HTMLDivElement | null = null;

	onMount(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					dispatch('loadMore');
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="mt-4 px-3">
	<h1 class="mb-2 text-4xl font-bold">Vendor's listings:</h1>

	{#if deals.length === 0}
		<p class="text-gray-500">Vendor has no listings yet!</p>
	{:else}
		<!-- Mobile: masonry w/ CSS columns -->
		<div class="block md:hidden">
			<div class="columns-2 gap-3">
				{#each deals as deal (deal.id)}
					<MiniDealCard
						{deal}
						on:select={(e) => dispatch('select', e.detail)}
						class="mb-3 inline-block w-full"
					/>
				{/each}
			</div>
		</div>

		<!-- Tablet/Desktop: regular grid -->
		<div class="hidden md:grid md:grid-cols-4 md:gap-4">
			{#each deals as deal (deal.id)}
				<MiniDealCard {deal} on:select={(e) => dispatch('select', e.detail)} />
			{/each}
		</div>

		<!-- sentinel -->
		<div class="flex items-center justify-center py-6" bind:this={sentinel}>
			{#if loading}
				<div
					class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
				></div>
			{:else if !hasMore}
				<p class="text-sm text-gray-500">No more listings</p>
			{/if}
		</div>
	{/if}
</div>
