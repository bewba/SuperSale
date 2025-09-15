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

<!-- container uses CSS columns for masonry; mobile-first columns-2 -->
<div class="mt-4 px-3">
  <h1 class="mb-2 text-4xl font-bold">Today's listings:</h1>

  
  <div class="columns-2 gap-3 md:columns-3 lg:columns-4">
    {#each deals as deal (deal.id)}
      <!-- each card must be inline-block + full width to flow into columns properly -->
      <MiniDealCard {deal}
        on:select={(e) => dispatch('select', e.detail)}
      />
    {/each}
  </div>

  <!-- sentinel (placed after the list) -->
  <div class="flex justify-center items-center py-6" bind:this={sentinel}>
    {#if loading}
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
    {:else if !hasMore}
      <p class="text-gray-500 text-sm">No more listings</p>
    {/if}
  </div>
</div>
