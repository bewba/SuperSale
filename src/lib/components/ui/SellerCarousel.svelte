<script lang="ts">
  import SellerCard from "$lib/components/SellerCard.svelte";
  import { ChevronRight, ChevronLeft } from "@lucide/svelte";

  let { sellers } = $props();
  let currentIndex = $state(0);

  function next() {
    currentIndex = (currentIndex + 1) % sellers.length;
    scrollToCard(currentIndex);
  }

  function prev() {
    currentIndex = (currentIndex - 1 + sellers.length) % sellers.length;
    scrollToCard(currentIndex);
  }

  function scrollToCard(index: number) {
    const slider = document.getElementById("brands-slider");
    const cardWidth = slider?.firstElementChild?.clientWidth ?? 0;
    slider?.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
  }
</script>

<div class="m-2" id="brands">
  <h1 class="text-2xl font-bold mb-2">Featured Brands</h1>

  <!-- Slider container -->
  <div class="relative">
    <div
      id="brands-slider"
      class="flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide scroll-smooth gap-4"
    >
      {#each sellers as seller, i}
        <div
          class="shrink-0 flex justify-center snap-center md:snap-start lg:snap-start transition-shadow duration-300"
          class:selected={i === currentIndex}
        >
          <SellerCard {seller} />
        </div>
      {/each}
    </div>

    <!-- Navigation buttons -->
    <button
      onclick={prev}
      class="cursor-pointer absolute top-1/2 left-0 -translate-y-1/2 bg-black/50 text-white py-1 rounded-r"
    >
      <ChevronLeft />
    </button>
    <button
      onclick={next}
      class="cursor-pointer absolute top-1/2 right-0 -translate-y-1/2 bg-black/50 text-white py-1 rounded-l"
    >
      <ChevronRight />
    </button>
  </div>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .selected {
    filter: drop-shadow(0 0 8px rgba(249, 115, 22, 1));
  }
</style>
