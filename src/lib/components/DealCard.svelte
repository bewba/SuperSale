<!-- <script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();

	type Deal = {
		id: string;
		title: string;
		image: string;
		quantity: number;
		original_price: number;
		discount_price: number;
		discount_percent: number;
		reason: string;
		expires_at: string;
		contact_information: string;
		reason_category: string;
	};

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
</script> -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	// import { Star } from '@lucide/svelte';

	const dispatch = createEventDispatcher();

	let timeLeft: string = $state('');
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

	function selectDeal() {
		dispatch('select', { deal });
	}

	let { deal } = $props();

	console.log(deal);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	role="button"
	tabindex="0"
	class="relative h-56 w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-cover bg-center sm:h-64 md:h-72 lg:h-80"
	style="background-image: url({deal.image_list && deal.image_list.length > 0
		? // if image_list is empty, use the default fallback image
			deal.image_list[0]
		: deal.image})"
	onclick={selectDeal}
>
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

	<!-- Top Details -->
	<div class="absolute top-0 right-0 left-0 flex items-center justify-between p-3 text-white">
		<!-- Discount percentage -->
		<p
			class="rounded-lg bg-gradient-to-r from-red-700 via-red-600
		          to-red-500 px-2 py-1 text-2xl font-bold tracking-wide uppercase shadow-lg
		         sm:px-3 sm:py-2 sm:text-3xl md:px-4 md:py-2.5
		         md:text-4xl lg:px-5 lg:py-3 lg:text-5xl"
		>
			{deal.discount_percent}% OFF
		</p>

		<!-- Star Rating -->
		{#if deal.avg_rating}
			<div
				class="backdrop-blur-xxs flex items-center gap-1 rounded-lg bg-black/30 px-1.5 py-0.5 sm:gap-1.5
                  sm:px-2 sm:py-1 md:px-3 md:py-1.5"
			>
				<img
					src="/star-solid-full.svg"
					alt="star-rating"
					class="h-7 w-7 text-yellow-400 sm:h-8 sm:w-8 md:h-9 md:w-9"
				/>
				<span class="text-sm font-semibold drop-shadow-md sm:text-base md:text-lg lg:text-xl">
					{deal.avg_rating}
				</span>
			</div>
		{/if}
	</div>

	<!-- Bottom Details -->
	<div class="absolute right-0 bottom-0 left-0 flex items-end justify-between p-4 text-white">
		<!-- Left -->
		<div class="space-y-1">
			<!-- Expiry -->
			<p
				class="w-fit rounded-lg bg-[#f76800] px-2 py-0.5 text-xs font-bold text-white sm:text-sm md:text-base"
			>
				Promo ends in: {timeLeft}
			</p>

			<!-- Name and description -->
			<div class="w-64 space-y-0.5 sm:w-72 sm:space-y-1 md:w-80">
				<h2
					class="truncate text-xl leading-tight font-semibold sm:text-2xl md:text-3xl lg:text-4xl"
				>
					{deal.title}
				</h2>

				<p
					class="line-clamp-1 text-xs text-gray-200 sm:line-clamp-2 sm:text-sm md:line-clamp-3 md:text-base"
				>
					{deal.reason}
				</p>
			</div>
		</div>

		<!-- Right -->
		<div class="text-right">
			<h2
				class="rounded-lg bg-[#f76800] px-2 py-1 text-lg font-bold text-white sm:text-xl md:text-2xl"
			>
				₱{deal.discount_price.toFixed(2)}<span class="ml-1 text-[10px] underline sm:text-xs"
					>per pc.</span
				>
			</h2>
			<p class="text-xs text-gray-300 line-through sm:text-sm">₱{deal.original_price.toFixed(2)}</p>
		</div>
	</div>
</div>

<!-- <button
				class="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:outline-none"
				on:click={() => dispatch('checkout', { deal })}
			>
				Place bid
			</button> -->
