<script lang="ts">
	export let brand: {
		store_name: string;
		address: string;
		pickup: boolean;
		delivery: boolean;
		logo?: string;
	};
</script>

<div
	class="flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
>
	<!-- Logo -->
	<div class="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
		<img
			src={brand.logo ?? '/logo.svg'}
			alt={`${brand.store_name} logo`}
			class="h-full w-full object-cover"
		/>
	</div>

	<!-- Info -->
	<div class="flex flex-col">
		<h2 class="text-lg font-semibold text-gray-900">
			{brand.store_name}
		</h2>
		<p class="text-sm text-gray-600">{brand.address}</p>

		<!-- Badges -->
		<div class="mt-2 flex flex-wrap gap-2">
			<p class="font-semibold text-gray-600">
				Available for:
				{#if brand.pickup}
					<span class=" ml-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
						>Pickup</span
					>
				{/if}
				{#if brand.delivery}
					<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
						>Delivery</span
					>
				{/if}

				{#if !brand.delivery && !brand.pickup}
					<span class="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium"
						>Pickup/Delivery not available.
					</span>
				{/if}
			</p>
		</div>
	</div>
</div>
