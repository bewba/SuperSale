<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import ImageRoll from './ImageRoll.svelte';
	import type { Deal } from '$lib/types/types';

	export let selectedDeal: Deal;

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
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  role="presentation"
  aria-hidden="true"
>

	<!-- Overlay  -->
	<div class="absolute inset-0" on:click={closeModal} aria-hidden="true"></div>

	<div
		role="button"
		tabindex="0"
		class="relative mx-2 max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-md
					sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl"
		on:click={closeModal}
		on:keydown={(e) => {
			if (e.key === "Escape") closeModal();
		}}
		aria-label="Close modal"
	>
		<div class="flex flex-col lg:flex-row">
			<!-- Image + discount + expiry -->
			<div class="lg:w-1/2">
				<ImageRoll deal={selectedDeal} />
			</div>

			<div class="flex flex-1 flex-col p-4">
				<!-- Title & details -->
				<h2 class="text-xl font-bold md:text-2xl">{selectedDeal.title}</h2>

				<!-- Price -->
				<div class="mt-2 flex flex-wrap items-center gap-2">
					<span class="text-lg font-bold text-orange-600 md:text-xl">
						₱{selectedDeal.discount_price.toFixed(2)}
					</span>
					<span class="text-sm text-gray-400 line-through md:text-base">
						₱{selectedDeal.original_price.toFixed(2)}
					</span>
					<span class="text-xs text-gray-300 md:text-sm">per pc.</span>
				</div>

				<!-- Seller info -->
				<div class="mt-3 text-sm text-gray-700 md:text-base">
					<p><strong>Remaining stock:</strong> {selectedDeal.quantity} pcs.</p>
					<!-- TODO: Need to query the details from the server -->
					<p class="mt-1">
						<strong>More details by the seller:</strong><br />
						{selectedDeal.reason}
					</p>
				</div>

				<!-- Chat button -->
				<button
					class="mt-auto w-full cursor-pointer rounded bg-[#0060a9] py-2 font-semibold text-white hover:bg-[#004b82]"
					on:click={handleChat}
				>
					Need to chat with the seller?
				</button>
			</div>
		</div>
	</div>
</div>