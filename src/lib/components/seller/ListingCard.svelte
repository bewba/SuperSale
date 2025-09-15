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
	class="relative h-64 md:h-72 lg:h-80 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-cover bg-center shadow-lg transition hover:scale-[1.02] cursor-pointer"
	style="background-image: url({deal.image_list && deal.image_list.length > 0
		? deal.image_list[0]
		: deal.image})"
	role="button"
	aria-label="button"
	tabindex="0"
	on:click={() => dispatch('edit', { deal })}
>
	<!-- Overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

	<!-- Top Details -->
	<div class="absolute top-0 right-0 left-0 flex items-center justify-between p-2 sm:p-3 text-white">
		<p
			class="rounded-lg bg-gradient-to-r from-red-700 via-red-600 to-red-500
             px-1.5 sm:px-2 py-0.5 sm:py-1 text-sm sm:text-lg font-bold uppercase shadow-lg"
		>
			{deal.discount_percent}%
		</p>
	</div>

	<!-- Bottom Details -->
	<div class="absolute right-0 bottom-0 left-0 flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 text-white">
		<!-- Title + Reason -->
		<div>
			<h3 class="truncate text-lg sm:text-xl md:text-2xl font-semibold">{deal.title}</h3>
			<p class="line-clamp-1 text-xs sm:text-sm text-gray-200">{deal.reason}</p>
		</div>

		<!-- Price Row -->
		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="rounded-lg bg-[#f76800] px-1.5 sm:px-2 py-0.5 text-[0.65rem] sm:text-xs font-bold">
				Promo ends in: {timeLeft}
			</p>

			<h2
				class="rounded-lg bg-[#f76800] px-2 py-1 text-base sm:text-lg md:text-xl font-bold text-white inline-flex items-baseline gap-1 whitespace-nowrap"
			>
				₱{deal.discount_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
				<span class="text-[10px] sm:text-xs underline">per pc.</span>
			</h2>
		</div>
	</div>
</div>
