<script lang="ts">
  import ListingCard from './ListingCard.svelte';
  import type { Deal } from '$lib/types/types';
  import { createEventDispatcher } from 'svelte';

  export let myDeals: Deal[] = [];
  export let loadingDeals: boolean = false;

  const dispatch = createEventDispatcher();

  function addListing() {
    dispatch('addListing');
  }

  function editListing(event) {
    dispatch('editListing', event.detail.deal);
  }

  function deleteListing(event) {
    dispatch('deleteListing', event.detail.deal);
  }
</script>

<section>
  <div class="mb-6 flex gap-5 w-full items-center">
    <h2 class="text-2xl font-bold">My Listings</h2>
    <button
      on:click={addListing}
      class="transform cursor-pointer rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3 font-semibold
        text-white shadow-md transition hover:scale-105 md:mt-0"
    >
      + New Listing
    </button>
  </div>

  {#if loadingDeals}
    <div class="flex h-32">
      <p class="p-4">Loading listings...</p>
      <div
        class="flex h-10 w-10 animate-spin rounded-full border-4 border-solid border-black border-t-transparent"
      ></div>
    </div>
  {:else if myDeals.length > 0}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {#each myDeals as deal (deal.id)}
        <div class="group relative transform transition hover:scale-[1.02]">
          <ListingCard
            {deal}
            on:edit={editListing}
            on:delete={deleteListing}
          />
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-gray-500 italic">You don't have any listings yet.</div>
  {/if}
</section>
