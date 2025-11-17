<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const { userStatus, isAuth } = $props<{ userStatus: string; isAuth: string }>();

	console.log(userStatus);

	const message = $derived(() => {
		let msg;
		if (userStatus === 'seller') {
			msg = 'Seller Dashboard';
		} else if (userStatus === 'admin' || userStatus === 'moderator') {
			msg = 'Admin Dashboard';
		} else if (isAuth && !userStatus) {
			msg = 'Create Store!';
		} else {
			msg = 'Want to sell your surplus?';
		}
		return msg;
	});

	let loading = $state(false);
	let scrolled = $state(false);

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
			if (userStatus === 'seller') {
				await goto('/protected/seller');
			} else if (userStatus === 'admin' || userStatus === 'moderator') {
				await goto('/protected/admin');
			} else if (isAuth) {
				await goto('/protected/seller');
			} else {
				await goto('/auth');
			}
		} finally {
			loading = false;
		}
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-gray-200 bg-[#eee] px-0 shadow-sm transition-transform
    duration-300 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
>
	<div class="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
		<!-- Logo -->
		<a href="/" class="flex shrink-0 items-center transition-opacity hover:opacity-80">
			<img src="/logo.svg" alt="SuperSale-logo" class="h-10 w-auto sm:h-12 md:h-14" />
		</a>

		<!-- Seller button -->
		<button
			class="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0060a9] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-[#004d8c] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#0060a9] disabled:hover:shadow-sm sm:px-5 sm:py-2.5 sm:text-base"
			onclick={handleClick}
			disabled={loading}
		>
			{#if loading}
				<svg
					class="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
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
				{message()}
			{/if}
		</button>
	</div>
</header>
