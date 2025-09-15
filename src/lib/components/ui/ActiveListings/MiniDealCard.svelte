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
    <img
      src={deal.image_list?.[0] ?? deal.image}
      alt={deal.title}
      class="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
      loading="lazy"
    />

    {#if deal.discount_percent}
      <p
        class="absolute top-2 left-2 rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-500 
               px-2 py-1 text-xs font-bold text-white shadow"
      >
        {deal.discount_percent}% OFF
      </p>
    {/if}
  </div>
</div>
