<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let loading = false;
	let scrolled = false;
	// Track if page is scrolling
	onMount(() => {
		const update = () => (scrolled = scrollY > 0);
		update();
		window.addEventListener('scroll', update);
		return () => window.removeEventListener('scroll', update);
	});

	async function handleClick() {
		loading = true;
		try {
			// whatever you’re doing (e.g. compression + upload)
			await goto('/protected/seller');
		} finally {
			loading = false;
		}
	}
</script>

<!-- class:hidden={!scrolled} -->
<header
	class="sticky top-0 z-50 border-b border-gray-100 bg-[#eee] shadow-md transition-transform duration-300"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between p-4">
		<!-- Logo  -->
		<a href="/" class="flex items-center space-x-2">
			<img src="/logo.svg" alt="SuperSale-logo" class="h-14 w-auto" />
		</a>

		<!-- Seller button -->
		<button
			class="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0060a9] px-4 py-2 font-semibold
         text-white transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-70"
			on:click={handleClick}
			disabled={loading}
		>
			{#if loading}
				<svg
					class="h-5 w-5 animate-spin text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
				</svg>
				<span>Loading...</span>
			{:else}
				Want to sell your surplus?
			{/if}
		</button>
	</div>
</header>
