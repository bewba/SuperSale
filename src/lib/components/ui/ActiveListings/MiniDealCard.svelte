<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Deal } from '$lib/types/types';

  let { deal } = $props();

  const dispatch = createEventDispatcher();

  function selectDeal() {
    dispatch('select', deal );
  }
</script>

<!-- Clickable square card -->
<div
  role="button"
  tabindex="0"
  class="inline-block w-full break-inside-avoid mb-3 cursor-pointer"
  onclick={selectDeal}
  onkeydown={(e) => e.key === 'Enter' && selectDeal()}
>
  <div class="relative w-full aspect-square overflow-hidden rounded-lg shadow-md">
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
    <img
      src={deal.image_list?.[0] ?? deal.image}
      alt={deal.title}
      class="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
      loading="lazy"
    />

    <p
      class="absolute top-2 left-2 rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-500 
              px-2 py-1 text-xl font-bold text-white shadow"
    >
      {deal.discount_percent}% OFF
    </p>


    <!-- Bottom overlay for title + price -->
		<div class="absolute bottom-0 left-0 right-0 p-2">
			<h3 class="truncate text-white text-md font-semibold">{deal.title}</h3>
			<div class="flex items-center justify-baseline">
				<span class="text-white px-1 pb-1 rounded-lg bg-[#f76800] text-xl font-bold">
					₱{deal.discount_price.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					})}
				</span>
				{#if deal.original_price}
					<span class="ml-2 text-gray-300 text-xs line-through">
						₱{deal.original_price.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</span>
				{/if}
			</div>
		</div>
  </div>
</div>
