<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageRoll from './ImageRoll.svelte';
	import type { Deal } from '$lib/types/types';

	export let selectedDeal: Deal;

  let sellerData: any = null;
	let loadingSeller = true;
	let sellerError: string | null = null;

	if (!selectedDeal) {
		closeModal();
	}

	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close');
	}

	function handleChat() {
		dispatch('chat', { selectedDeal });
	}

  async function fetchSellerData() {
    if (!selectedDeal?.owner_id) {
      loadingSeller = false;
      return;
    }

    try {
      loadingSeller = true;
      sellerError = null;

      // Use query parameters instead of route parameters
      const response = await fetch(`/api/fetchSeller?seller_id=${selectedDeal.owner_id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch seller: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      sellerData = result.data;
    } catch (error) {
      console.error('Error fetching seller data:', error);
      sellerError = error instanceof Error ? error.message : 'Failed to load seller information';
    } finally {
      loadingSeller = false;
    }
  }

  $: if (selectedDeal?.owner_id) {
    fetchSellerData();
  }

</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
	role="presentation"
	aria-hidden="true"
>
	<!-- Overlay -->
	<div class="absolute inset-0" on:click={closeModal} aria-hidden="true"></div>
	
	<div
		role="dialog"
		tabindex="0"
		class="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl xl:max-w-5xl 
			   max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl 
			   transform transition-all duration-200 ease-in-out"
		on:click|stopPropagation
		on:keydown={(e) => {
			if (e.key === "Escape") closeModal();
		}}
		aria-label="Close modal"
	>
		<!-- Close button -->
		<button 
			class="cursor-pointer absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center 
				   rounded-full bg-black/10 hover:bg-black/20 transition-colors duration-200
				   text-gray-600 hover:text-gray-800"
			on:click={closeModal}
			aria-label="Close modal"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Scrollable content -->
		<div class="flex flex-col lg:flex-row max-h-[95vh] overflow-hidden">
			<!-- Image section -->
			<div class="lg:w-1/2 lg:max-h-[95vh] bg-gray-50">
				<div class="h-64 sm:h-80 md:h-96 lg:h-full">
					<ImageRoll deal={selectedDeal} />
				</div>
			</div>
			
			<!-- Content section -->
			<div class="flex flex-1 flex-col lg:max-h-[95vh] lg:overflow-y-auto">
				<div class="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 space-y-6">
					<!-- Title & details -->
					<div class="space-y-3">
						<h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
							{selectedDeal.title}
						</h2>
						
						<!-- Price section with better visual hierarchy -->
						<div class="flex flex-wrap items-baseline gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
							<span class="text-2xl sm:text-3xl font-bold text-orange-600">
								₱{selectedDeal.discount_price.toFixed(2)}
							</span>
							<span class="text-base sm:text-lg text-gray-500 line-through">
								₱{selectedDeal.original_price.toFixed(2)}
							</span>
							<span class="text-sm text-gray-600 bg-white px-2 py-1 rounded-md border">
								per pc.
							</span>
						</div>
					</div>

					<!-- Seller info section -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
							Seller Information
						</h3>
						
						<div class="bg-gray-50 rounded-xl p-4 space-y-3">
							{#if loadingSeller}
								<div class="flex items-center gap-3">
									<div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
									<p class="text-gray-600">Loading seller info...</p>
								</div>
							{:else if sellerError}
								<div class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
									<svg class="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
									</svg>
									<div>
										<p class="text-red-800 font-medium">Error loading seller info</p>
										<p class="text-red-600 text-sm">{sellerError}</p>
									</div>
								</div>
							{:else if sellerData}
								<div class="seller-info space-y-3">
									<div class="flex items-center gap-3">
										<div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
											<svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
											</svg>
										</div>
										<div>
											<p class="font-medium text-gray-900">
												<strong>{sellerData.store_name}</strong> 
											</p>
											<p class="text-sm text-gray-600">
												<strong>Store address:</strong> {sellerData.address}
											</p>
                      <p class="mt-1 text-sm text-gray-600">
                        <strong>Available for:</strong>
                        {#if sellerData.pickup}
                          <span class="inline-block bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded-full mr-1">
                            Pickup
                          </span>
                        {/if}
                        {#if sellerData.delivery}
                          <span class="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            Delivery
                          </span>
                        {/if}
                      </p>
                      
                    </div>
									</div>
								</div>
							{:else}
								<div class="text-center py-4">
									<svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<p class="text-gray-500 text-sm mt-2">No seller information available</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Sticky chat button -->
				<div class="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-200">
					<button
						class="cursor-pointer w-full py-3 px-6 bg-gradient-to-r from-[#0060a9] to-[#004b82] 
							   hover:from-[#004b82] hover:to-[#003a66] 
							   text-white font-semibold rounded-xl shadow-md 
							   transform transition-all duration-200 ease-in-out
							   hover:shadow-lg hover:-translate-y-0.5 
							   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
							   active:transform active:scale-95"
						on:click={handleChat}
					>
						<span class="flex items-center justify-center gap-2">
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							Need to chat with the seller?
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- <p><strong>Remaining stock:</strong> {selectedDeal.quantity} pcs.</p> -->
					<!-- TODO: Need to query the details from the server -->
					<!-- <p class="mt-1"> -->
						<!-- <strong>More details by the seller:</strong><br /> -->
						<!-- {selectedDeal.reason} -->
					<!-- </p> -->