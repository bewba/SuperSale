<script lang="ts">
  import { goto } from '$app/navigation';
  
  let { seller } = $props();

  function handleClick() {
    const slug = seller.slug || seller.id;
    goto(`/brand/${slug}`);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }

  // get the min max discount percent (if you want to show this)
  function getDiscountRange(seller: any): { min: number; max: number } | null {
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

<button
  onclick={handleClick}
  onkeydown={handleKeydown}
  class="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80
         rounded-full overflow-hidden bg-cover bg-center
         transform transition-all duration-300 ease-in-out
         hover:shadow-2xl focus:shadow-2xl
         focus:outline-none focus:ring-4 focus:ring-orange-300/50
         cursor-pointer group"
  style="background-image: url({seller.logo ?? '/logo.svg'})"
  aria-label="View {seller.store_name} brand details"
>
  <!-- Gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent 
              group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300"></div>
  
  <!-- Brand name -->
  <!-- <div class="absolute bottom-18 left-0 right-0 px-4">
    <h3 class="text-white font-bold text-center drop-shadow-lg
               text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl
               line-clamp-2 group-hover:scale-105 transition-transform duration-300">
      {seller.store_name}
    </h3>
  </div> -->

  <!-- Discount Range (optional) -->
  {#if discountRange}
    <div class="absolute top-4 left-0 right-0 mx-3">
      <div class="px-2 py-1 rounded-md text-center text-white font-bold
                  text-xs sm:text-sm md:text-base lg:text-lg
                  bg-gradient-to-r from-red-700 via-red-600 to-red-500 shadow-lg
                  transform group-hover:scale-105 transition-transform duration-300">
        {discountRange.min}% – {discountRange.max}% OFF!
      </div>
    </div>
  {/if}

  <!-- Hover overlay with "View Deals" text -->
  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
              transition-opacity duration-300 flex items-center justify-center">
    <div class="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full
                font-semibold text-sm md:text-base shadow-lg
                transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
      View Deals
    </div>
  </div>
</button>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

  <!-- // get the min max discount percent
  // function getDiscountRange(seller: Seller): { min: number; max: number } | null {
  //   if (!seller.deals || seller.deals.length === 0) {
  //     return null; // No deals
  //   }

  //   let min = seller.deals[0].discount_percent;
  //   let max = seller.deals[0].discount_percent;

  //   for (const deal of seller.deals) {
  //     if (deal.discount_percent < min) min = deal.discount_percent;
  //     if (deal.discount_percent > max) max = deal.discount_percent;
  //   }

  //   return { min, max };
  // }

  // const discountRange = getDiscountRange(seller); -->


  <!-- Discount Range -->
  <!-- {#if discountRange}
    <p
      class="absolute bottom-3 left-0 right-0 mx-3 px-1 py-1 rounded-md
             text-center text-white font-bold 
             text-sm sm:text-base md:text-lg lg:text-xl
             bg-gradient-to-r from-red-700 via-red-600 to-red-500 shadow-lg"
    >
      {discountRange.min}% – {discountRange.max}% OFF!
    </p>
  {/if} -->
