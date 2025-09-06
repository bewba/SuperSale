<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import HeroCard from './HeroCard.svelte';
	import type { Deal } from '$lib/types/types';

	export let featuredDeals: Deal[] = [];

	let current = 0;
	let interval: number;

	onMount(() => {
		if (featuredDeals.length > 1) {
			interval = setInterval(() => {
				current = (current + 1) % featuredDeals.length;
			}, 3000); // 2 seconds per slide, is this good?
		}
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="relative w-full overflow-hidden">
  {#if featuredDeals.length > 0}
    <div
      class="flex transition-transform duration-700 ease-in-out"
      style={`transform: translateX(-${current * 100}%)`}
    >
      {#each featuredDeals as deal (deal.id)}
        <div class="w-full flex-shrink-0 px-2 sm:px-4">
          <HeroCard {deal} />
        </div>
      {/each}
    </div>
  {/if}
</div>
