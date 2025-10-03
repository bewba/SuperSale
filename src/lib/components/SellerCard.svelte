<script lang="ts">
	import { goto } from '$app/navigation';

	let { seller } = $props();

	function handleClick() {
		const slug = seller.slug || seller.id;
		goto(`/brand/${slug}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}

	// get the min max discount percent (if you want to show this)
	function getDiscountRange(seller: any): { min: number; max: number } | null {
		if (!seller.deals || seller.deals.length === 0) {
			return null; // No deals
		}
		let min = seller.deals[0].discount_percent;
		let max = seller.deals[0].discount_percent;
		for (const deal of seller.deals) {
			if (deal.discount_percent < min) min = deal.discount_percent;
			if (deal.discount_percent > max) max = deal.discount_percent;
		}
		return { min, max };
	}

	const discountRange = getDiscountRange(seller);
</script>

<button
	onclick={handleClick}
	onkeydown={handleKeydown}
	class="group relative h-32 w-32 transform cursor-pointer overflow-hidden rounded-xl bg-cover bg-center transition-all
         duration-300 ease-in-out hover:shadow-xl focus:outline-none
         sm:h-40 sm:w-40 md:h-48 md:w-48
         lg:h-56 lg:w-56 xl:h-64 xl:w-64"
	style="background-image: url({seller.logo ?? '/logo.svg'})"
	aria-label="View {seller.store_name} brand details"
>
	<!-- Gradient overlay -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent
              transition-all duration-300 group-hover:from-black/80 group-hover:via-black/40"
	></div>
</button>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
