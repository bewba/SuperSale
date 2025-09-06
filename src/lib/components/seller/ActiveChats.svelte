<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ChatRoom } from '$lib/types/types';

	export let enriched: ChatRoom[] = [];

	// format date helper
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div>
	<h2 class="mb-3 text-3xl font-semibold text-gray-800">Active Chats</h2>

	<div
		class="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md"
	>
		{#if enriched.length > 0}
			{#each enriched as chatRoom}
				<button
					class="flex w-full cursor-pointer items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
					on:click={() => goto(`/chat/${chatRoom.id}`)}
				>
					<div class="flex flex-col">
						<span class="text-lg font-semibold text-gray-800">{chatRoom.productName}</span>
						<span class="text-sm text-gray-500">{chatRoom.buyerEmail}</span>
						<span class="text-xs text-gray-400">{formatDate(chatRoom.created)}</span>
					</div>
					<span class="text-sm font-semibold text-orange-600">Open chat →</span>
				</button>
			{/each}
		{:else}
			<p class="text-sm text-gray-500 italic">No active chats</p>
		{/if}
	</div>
</div>
