<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ProductImage from './ProductImage.svelte';
  import { ChevronRight, ChevronLeft } from '@lucide/svelte';

  let { deal } = $props();
  let imageList = deal.image_list;

  let timeLeft: string = $state('');
	let interval: any;

	function updateCountdown() {
		const now = Date.now();
		const expiry = new Date(deal.expires_at).getTime();
		const diff = expiry - now;

		if (diff <= 0) {
			timeLeft = 'EXPIRED';
			clearInterval(interval);
			return;
		}

		const seconds = Math.floor((diff / 1000) % 60);
		const minutes = Math.floor((diff / 1000 / 60) % 60);
		const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
	}

  onMount(() => {
		updateCountdown();
		interval = setInterval(updateCountdown, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	let currentIndex = 0;

	// Go to next image
	function next() {
		currentIndex = (currentIndex + 1) % imageList.length;
		scrollToImage(currentIndex);
	}

	// Go to previous image
	function prev() {
		currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
		scrollToImage(currentIndex);
	}

	// "Mover" function
	function scrollToImage(index: number) {
		const slider = document.getElementById('img-slider');
		const imageWidth = slider?.firstElementChild?.clientWidth ?? 0;
		slider?.scrollTo({
			left: index * imageWidth,
			behavior: 'smooth'
		});
	}
</script>

<div class="relative h-full">
  <!-- Top Details -->
  <div class="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-3 text-white">
    <!-- Discount percentage -->
    <p
      class="rounded-lg bg-gradient-to-r from-red-700 via-red-600 to-red-500
             px-2 py-1 text-lg font-bold tracking-wide uppercase shadow-lg
             sm:px-3 sm:py-2 sm:text-xl md:px-4 md:py-2.5 md:text-2xl 
             lg:px-3 lg:py-2 lg:text-xl xl:px-4 xl:py-2.5 xl:text-2xl"
    >
      {deal.discount_percent}% OFF
    </p>

    <!-- Star Rating -->
    {#if deal.avg_rating}
      <div
        class="backdrop-blur-xxs flex items-center gap-1 rounded-lg bg-black/30 px-1.5 py-0.5 
              sm:gap-1.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5"
      >
        <img
          src="/star-solid-full.svg"
          alt="star-rating"
          class="h-5 w-5 text-yellow-400 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-6 lg:w-6 xl:h-7 xl:w-7"
        />
        <span class="text-sm font-semibold drop-shadow-md sm:text-base md:text-lg lg:text-base xl:text-lg">
          {deal.avg_rating.toFixed(1)}
        </span>
      </div> 
    {/if} 
  </div>

  <!-- Image Slider -->
  <div
    id="img-slider"
    class="scrollbar-hide flex h-full snap-x snap-mandatory gap-4 overflow-x-scroll scroll-smooth"
  >
    {#if imageList} 
      {#each imageList as img}
        <div class="w-full h-full shrink-0 snap-center">
          <ProductImage image={img} className="h-full" />
        </div>
      {/each} 
    <!-- Display the main back-up image if image list is null -->
    {:else}
      <div class="w-full h-full shrink-0 snap-center">
        <ProductImage image={deal.image} className="h-full" />
      </div> 
    {/if}
  </div>

  <!-- Bottom Details -->
  <div class="absolute right-0 bottom-0 left-0 z-10 flex items-end justify-between p-3 text-white">
    <!-- Left -->
    <p
      class="w-fit rounded-md bg-[#f76800] px-1.5 pb-0.5 text-xs font-bold text-white 
             sm:text-sm md:text-base lg:text-sm xl:text-base"
    >
      Promo ends in: {timeLeft}
    </p>
  </div>

  <!-- Navigation buttons -->
  <!-- Hide buttons if only one image is available -->
  {#if imageList && imageList.length > 1} 
    <button
      onclick={prev}
      class="absolute top-1/2 left-2 z-20 -translate-y-1/2 cursor-pointer rounded bg-black/50 p-2 text-white
             hover:bg-black/70 transition-colors duration-200"
    >
      <ChevronLeft class="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
    <button
      onclick={next}
      class="absolute top-1/2 right-2 z-20 -translate-y-1/2 cursor-pointer rounded bg-black/50 p-2 text-white
             hover:bg-black/70 transition-colors duration-200"
    >
      <ChevronRight class="h-5 w-5 sm:h-6 sm:w-6" />
    </button> 
  {/if} 
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
