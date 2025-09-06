<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Deal } from '$lib/types/types';

	const dispatch = createEventDispatcher();
	export let deal: Deal;

	let timeLeft: string = '';
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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="relative h-64 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-cover bg-center shadow-lg transition hover:scale-[1.02]"
	style="background-image: url({deal.image_list && deal.image_list.length > 0
		? deal.image_list[0]
		: deal.image})"
>
	<!-- Overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

	<!-- Top Details -->
	<div class="absolute top-0 right-0 left-0 flex items-center justify-between p-3 text-white">
		<p
			class="rounded-lg bg-gradient-to-r from-red-700 via-red-600 to-red-500
             px-2 py-1 text-lg font-bold uppercase shadow-lg"
		>
			-{deal.discount_percent}%
		</p>

		<!-- <span class="rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold shadow-md">
      {deal.reason_category?.toUpperCase() || ''}
    </span> -->
	</div>

	<!-- Bottom Details -->
	<div class="absolute right-0 bottom-0 left-0 flex flex-col gap-2 p-4 text-white">
		<div>
			<h3 class="truncate text-xl font-semibold">{deal.title}</h3>
			<p class="line-clamp-1 text-sm text-gray-200">{deal.reason}</p>
		</div>

		<!-- Price -->
		<div class="flex items-center justify-between gap-2">
			<div>
				<span class="text-sm text-gray-300 line-through">₱{deal.original_price}</span>
				<span class="text-2xl font-extrabold text-[#f76800]">₱{deal.discount_price}</span>
			</div>
			<p class="h-fit w-fit rounded-lg bg-[#f76800] px-2 py-0.5 text-xs font-bold">
				Promo ends in: {timeLeft}
			</p>
		</div>

		<!-- Actions -->
		<div class="mt-2 flex gap-3">
			<button
				on:click={() => dispatch('edit', { deal })}
				class="flex-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-blue-600"
			>
				Edit
			</button>
			<button
				on:click={() => dispatch('delete', { deal })}
				class="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-red-600"
			>
				Delete
			</button>
		</div>
	</div>
</div>
