<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isModalOpen = false;
	let actionType: 'confirm' | 'decline' | null = null;

	function openModal(type: 'confirm' | 'decline') {
		actionType = type;
		isModalOpen = true;
	}

	function handleConfirm() {
		if (actionType === 'confirm') {
			dispatch('confirmOrder');
		} else if (actionType === 'decline') {
			dispatch('declineOrder');
		}
		closeModal();
	}

	function closeModal() {
		isModalOpen = false;
		actionType = null;
	}
</script>

<div class="mt-6 flex justify-center gap-4">
	<button
		on:click={() => openModal('confirm')}
		class="cursor-pointer rounded bg-green-700 px-4 py-2 text-white"
	>
		Accept Offer
	</button>

	<button
		on:click={() => openModal('decline')}
		class="cursor-pointer rounded bg-red-700 px-4 py-2 text-white"
	>
		Decline Offer
	</button>
</div>

{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/40 backdrop-blur-sm">
		<!-- Modal -->
		<div class="w-96 rounded-lg bg-white p-6 text-center shadow-lg">
			<h2 class="mb-4 text-lg font-semibold">
				{actionType === 'confirm'
					? 'Are you sure you want to confirm this order?'
					: 'Are you sure you want to decline this order?'}
			</h2>
			<div class="flex justify-center gap-4">
				<button
					on:click={handleConfirm}
					class="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
				>
					Yes
				</button>
				<button on:click={closeModal} class="cursor-pointer rounded bg-gray-300 px-4 py-2">
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
