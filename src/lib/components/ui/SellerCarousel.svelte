<script lang="ts">
  import { onMount } from "svelte";
  import SellerCard from "$lib/components/SellerCard.svelte";
  import { ChevronRight, ChevronLeft } from "@lucide/svelte";

  let currentIndex = $state(0);

  let sellers: any[] = $state([]);
  let loadingSellers = true;
  let sellersError: string | null = null;
  let currentPage = 1;
  let hasMoreSellers = true;
  const rowsPerPage = 10;

  async function fetchSellersBatch() {
    try {
      loadingSellers = true;

      const res = await fetch(`/api/fetchAllSellers?page=${currentPage}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch sellers (status ${res.status})`);
      }

      const { data } = await res.json();

      if (data.length === 0) {
        hasMoreSellers = false; // no more results
      } else {
        sellers = [...sellers, ...data];
        currentPage++; // move to next page for the next call
      }
    } catch (err: any) {
      sellersError = err.message ?? "An error occurred while fetching sellers";
    } finally {
      loadingSellers = false;
    }
  }

  function next() {
    const nextIndex = (currentIndex + 1) % sellers.length;
    currentIndex = nextIndex;
    scrollToCard(nextIndex);

    // prefetch next batch if close to the end
    if (hasMoreSellers && nextIndex >= sellers.length - 3) {
      fetchSellersBatch();
    }
  }

  function prev() {
    const prevIndex = (currentIndex - 1 + sellers.length) % sellers.length;
    currentIndex = prevIndex;
    scrollToCard(prevIndex);
  }

  function scrollToCard(index: number) {
    const slider = document.getElementById("brands-slider");
    const cardWidth = slider?.firstElementChild?.clientWidth ?? 0;
    slider?.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
  }

  // Fetch first batch on mount
  onMount(() => {
    fetchSellersBatch();
  });
</script>


<div class="m-2" id="brands">
  <h1 class="mb-3 text-4xl font-bold">Featured brands:</h1>

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
