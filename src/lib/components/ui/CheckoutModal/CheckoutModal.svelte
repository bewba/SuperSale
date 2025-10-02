<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ImageRoll from './ImageRoll.svelte';
	import type { Deal } from '$lib/types/types';
	import { track } from '$lib/analytics/analytics';
	import { goto } from '$app/navigation';

	export let selectedDeal: Deal;

	let sellerData: any = null;
	let loadingSeller = true;
	let sellerError: string | null = null;

	if (!selectedDeal) {
		closeModal();
	}

	const dispatch = createEventDispatcher();

	function closeModal() {
		console.log(':hsoidsa');
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

	function openViber() {
		track('Open Viber', {
			seller_id: sellerData.id,
			viber_link: sellerData.viber_link
		});

		setTimeout(() => {
			window.location.href = sellerData.viber_link;
		}, 200);
	}

	$: if (selectedDeal?.owner_id) {
		fetchSellerData();
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
	role="presentation"
	aria-hidden="true"
>
	<!-- Overlay -->
	<div class="absolute inset-0" on:click={closeModal} aria-hidden="true"></div>

	<div
		role="dialog"
		tabindex="0"
		class="relative z-[999] max-h-[95vh] w-full max-w-sm transform overflow-hidden
			   rounded-2xl bg-white shadow-2xl transition-all duration-200
			   ease-in-out sm:max-w-md md:max-w-lg lg:max-w-3xl xl:max-w-5xl"
		on:click|stopPropagation
		on:keydown={(e) => {
			if (e.key === 'Escape') closeModal();
		}}
		aria-label="Close modal"
	>
		<!-- Close button -->
		<button
			class="duration-200hover:text-gray-800 absolute top-3 right-3 z-[999] flex h-8 w-8 cursor-pointer
				   items-center justify-center rounded-full bg-white text-gray-600
				   transition-colors"
			on:click={closeModal}
			aria-label="Close modal"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>

		<!-- Scrollable content -->
		<div class="flex max-h-[95vh] flex-col overflow-hidden lg:flex-row">
			<!-- Image section -->
			<div class="bg-gray-50 lg:max-h-[95vh] lg:w-1/2">
				<div class="h-64 sm:h-80 md:h-96 lg:h-full">
					<ImageRoll deal={selectedDeal} />
				</div>
			</div>

			<!-- Content section -->
			<div class="flex flex-1 flex-col lg:max-h-[95vh] lg:overflow-y-auto">
				<div class="flex flex-1 flex-col space-y-6 p-4 sm:p-6 lg:p-8">
					<!-- Title & details -->
					<div class="space-y-3">
						<h2 class="text-xl leading-tight font-bold text-gray-900 sm:text-2xl lg:text-3xl break-all">
							{selectedDeal.title}
						</h2>

						<!-- Price section with better visual hierarchy -->
						<div
							class="flex flex-wrap items-baseline gap-3 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 p-4"
						>
							<span class="text-2xl font-bold text-orange-600 sm:text-3xl">
								₱{selectedDeal.discount_price.toFixed(2)}
							</span>
							<span class="text-base text-gray-500 line-through sm:text-lg">
								₱{selectedDeal.original_price.toFixed(2)}
							</span>
							<span class="rounded-md border bg-white px-2 py-1 text-sm text-gray-600">
								per pc.
							</span>
						</div>
					</div>

					<!-- Seller info section -->
					<div class="space-y-4">
						<h3 class="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
							Seller Information
						</h3>

						<div class="space-y-3 rounded-xl bg-gray-50 p-4">
							{#if loadingSeller}
								<div class="flex items-center gap-3">
									<div
										class="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
									></div>
									<p class="text-gray-600">Loading seller info...</p>
								</div>
							{:else if sellerError}
								<div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
									<svg
										class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
									<div>
										<p class="font-medium text-red-800">Error loading seller info</p>
										<p class="text-sm text-red-600">{sellerError}</p>
									</div>
								</div>
							{:else if sellerData}
								<div class="seller-info space-y-3">
									<div class="flex items-center gap-3">
										<button
											class="cursor-pointer flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
											on:click={()=>{goto(`/brand/${sellerData.id}`)}}	
										>
											<img src={sellerData.logo} alt="seller-logo" class="rounded-full h-full w-full object-cover" />	
										</button>
										<div>
											<p class="font-medium text-gray-900">
												<strong>{sellerData.store_name}</strong>
											</p>
											<p class="text-sm text-gray-600">
												<strong>Store address:</strong>
												{sellerData.address}
											</p>
											<p class="mt-1 text-sm text-gray-600">
												<strong>Available for:</strong>
												{#if sellerData.pickup}
													<span
														class="mr-1 inline-block rounded-full bg-orange-600 px-2 py-1 text-xs font-medium text-white"
													>
														Pickup
													</span>
												{/if}
												{#if sellerData.delivery}
													<span
														class="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
													>
														Delivery
													</span>
												{/if}
												{#if !sellerData.delivery && !sellerData.pickup}
													<span
														class="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium"
													>
														Pickup/Delivery not available.
													</span>
												{/if}	
											</p>
										</div>
									</div>
								</div>
							{:else}
								<div class="py-4 text-center">
									<svg
										class="mx-auto h-8 w-8 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									<p class="mt-2 text-sm text-gray-500">No seller information available</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Sticky chat button -->
				<div class="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 lg:p-8">
					<!-- Chat modal -->
					<!-- <button
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
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							Chat seller on SuperSale
						</span>
					</button> -->

					<!-- Viber Button -->
					<button
						on:click={openViber}
						class="mt-2 w-full transform cursor-pointer rounded-xl bg-gradient-to-r from-[#665CAC] to-[#7B68EE]
		px-6 py-3
		font-semibold text-white shadow-md transition-all
		duration-200 ease-in-out hover:-translate-y-0.5 hover:from-[#5A4F9A]
		hover:to-[#6A5ACD] hover:shadow-lg
		focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none
		active:scale-95 active:transform"
					>
						<span class="flex items-center justify-center gap-2">
							<img class="h-6" src="/viber.webp" alt="viber-logo" />
							Chat seller on Viber
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
