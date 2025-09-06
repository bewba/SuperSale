<script lang="ts">
  import type { Seller } from "$lib/types/types"; 
	
  let {seller} = $props();

  // get the min max discount percent
  function getDiscountRange(seller: Seller): { min: number; max: number } | null {
    if (!seller.deals || seller.deals.length === 0) {
      return null; // No deals
    }

    let min = seller.deals[0].discount_percent;
    let max = seller.deals[0].discount_percent;

    for (const deal of seller.deals) {
      if (deal.discount_percent < min) min = deal.discount_percent;
      if (deal.discount_percent > max) max = deal.discount_percent;
    }

    return { min, max };
  }

  const discountRange = getDiscountRange(seller);

</script>

<div
  class="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80
         rounded-lg overflow-hidden bg-cover bg-center shadow-2xl shadow-black/40"
  style="background-image: url({seller.logo})"
>
  <!-- Gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

  <!-- Discount Range -->
  {#if discountRange}
    <p
      class="absolute bottom-3 left-0 right-0 mx-3 px-1 py-1 rounded-md
             text-center text-white font-bold 
             text-sm sm:text-base md:text-lg lg:text-xl
             bg-gradient-to-r from-red-700 via-red-600 to-red-500 shadow-lg"
    >
      {discountRange.min}% – {discountRange.max}% OFF!
    </p>
  {/if}
</div>
