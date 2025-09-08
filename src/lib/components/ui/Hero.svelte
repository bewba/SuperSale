<script lang="ts">
	import { goto } from '$app/navigation';

	let loading = false;

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

<section
	class="relative flex min-h-[100vh] items-center justify-center bg-cover bg-center pb-20 sm:min-h-[90vh] md:min-h-[100vh] lg:h-[100vh]"
	style="background-image: url('/salcedo.jpg');"
>
	<!-- Overlay -->
	<div class="absolute inset-0 bg-black/60"></div>

	<!-- Hero content -->
	<div
		class="relative container mx-auto flex flex-col items-center px-4 text-center text-white sm:px-6"
	>
		<!-- Logo -->
		<img
			src="/logo.svg"
			alt="SuperSale-Logo"
			class="logo-glow mx-auto h-auto w-full max-w-[95%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]"
		/>

		<!-- Tagline -->
		<p
			class="mb-6 text-2xl leading-snug font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] sm:text-3xl
              md:text-4xl lg:text-5xl"
		>
			The smart way to clear and buy surplus.
		</p>

		<!-- Subtext -->
		<p
			class="mx-auto max-w-4xl text-center text-xl leading-relaxed
          font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] sm:text-2xl
          md:text-3xl lg:text-4xl"
		>
			Find food deals from your favourite stores at
			<span class="font-extrabold text-red-500 drop-shadow-[0_4px_10px_rgba(255,255,255,1)]">
				SUPERSALE
			</span>
			prices!
		</p>

		<!-- <p class="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-95 max-w-4xl mx-auto 
              drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-relaxed">
      Find food deals from your favourite stores at AMAZING prices.
      <span 
        class="block mt-2 font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
         bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent
         drop-shadow-[0_6px_10px_rgba(0,0,0,1)]"
      >
        20 to 90% off!
      </span>
    </p> -->

		<!-- Buttons -->
		<div class="mt-8 flex flex-col gap-4 sm:flex-row">
			<a
				class="cursor-pointer rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 px-8
        py-3 text-lg font-semibold text-white
        shadow-lg transition-all duration-300
        hover:scale-105 hover:shadow-orange-500/50"
				href="#hotdeals"
			>
				Find super food deals!
			</a>

			<button
				class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/90 px-8 py-3 text-lg font-semibold
         text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-white/50
         disabled:cursor-not-allowed disabled:opacity-70"
				on:click={handleClick}
				disabled={loading}
			>
				{#if loading}
					<svg
						class="h-5 w-5 animate-spin text-black"
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
	</div>
</section>

<style>
	.logo-glow {
		filter: drop-shadow(0 0 26px #fcead6) drop-shadow(0 0 34px #fcead6);
	}
</style>
