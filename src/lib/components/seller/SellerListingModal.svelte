<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { Deal } from '$lib/types/types';
	import { toastError } from '$lib/stores/toast';
	import { X, ImageUp } from '@lucide/svelte';

	const dispatch = createEventDispatcher();

	export let deal: Deal | null = null;
	$: mode = deal ? 'edit' : 'add';

	// images
	let existingImages: string[] = []; 
	let removedImages: string[] = [];
	let imageFiles: File[] = [];

	// previews auto-sync with arrays
	$: imagePreviews = [
		...existingImages,
		...imageFiles.map((f) => URL.createObjectURL(f))
	];

	// form state
	let productName = '';
	let originalPrice: number;
	let discountPrice: number = 0;
	let description = '';
	let quantity: string = '1';
	let expiresInHours: number = 2;
	let category = '';
	let contactInfo = '';
	let discountPercent = 50;

	function getExpiryTimestampz(hours: number): string {
		const nowPH = new Date(
			new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
		);
		const expiryPH = new Date(nowPH);
		expiryPH.setHours(expiryPH.getHours() + hours);
		return expiryPH.toISOString();
	}

	function close() {
		dispatch('closeModal');
	}

	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	onMount(() => {
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	});

	function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const newFiles = Array.from(target.files);

			const currentTotal = existingImages.length + imageFiles.length;
			const remainingSlots = 4 - currentTotal;
			if (remainingSlots <= 0) {
				toastError('You can only upload 4 images total', {
					title: 'Upload limit',
					duration: 2000,
					position: 'top-right'
				});
				return;
			}

			const limitedNewFiles = newFiles.slice(0, remainingSlots);
			imageFiles = [...imageFiles, ...limitedNewFiles];

			if (newFiles.length > remainingSlots) {
				toastError(`Only ${remainingSlots} more images allowed`, {
					title: 'Upload limit',
					duration: 2000,
					position: 'top-right'
				});
			}
		}
		target.value = '';
	}

	function removeImage(index: number) {
		if (index < existingImages.length) {
			// removing an existing image
			const img = existingImages[index];
			removedImages = [...removedImages, img];
			existingImages = existingImages.filter((_, i) => i !== index);
		} else {
			// removing a newly added file
			const fileIndex = index - existingImages.length;
			const imageUrl = imagePreviews[index];
			if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
			imageFiles = imageFiles.filter((_, i) => i !== fileIndex);
		}
	}

	function handleSubmit(e?: Event) {
		if (e) e.preventDefault();

		// Require at least one image
		if (existingImages.length + imageFiles.length === 0) {
			toastError('You must upload at least 1 image', {
				title: 'Missing image',
				duration: 2000,
				position: 'top-right'
			});
			return;
		}

		let expires_at: string;	

		if (deal) {
			// In edit mode
			if (expiresInHours > 0) {
				expires_at = getExpiryTimestampz(expiresInHours);
			} else {
				expires_at = deal.expires_at;
			}
		} else {
			// In add mode always compute from now
			expires_at = getExpiryTimestampz(expiresInHours);
		}

		const payload = {
			productName,
			originalPrice,
			discountPrice,
			discountPercent,
			description,
			quantity,
			expires_at,
			category,
			contactInfo,
			imageFiles,
			existingImages,
			removedImages // backend will remove these
		};

		if (deal) {
			dispatch('updateListing', { ...payload, id: deal.id });
		} else {
			dispatch('addListing', payload);
		}

		close();
	}

	// initialize on deal change
	$: if (deal) {
		productName = deal.title;
		description = deal.reason;
		originalPrice = deal.original_price;
		quantity = String(deal.quantity);
		category = deal.reason_category;
		contactInfo = deal.contact_information;
		discountPercent = deal.discount_percent;
		existingImages = deal.image_list ? [...deal.image_list] : [];
		imageFiles = [];
		removedImages = [];

		if (deal.expires_at) {
			const nowPH = new Date(
				new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
			);
			const expiryDate = new Date(deal.expires_at);
			const diffMs = expiryDate.getTime() - nowPH.getTime();
			expiresInHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
		}
	} else {
		productName = '';
		description = '';
		originalPrice = undefined;
		quantity = '1';
		category = '';
		contactInfo = '';
		discountPercent = 50;
		existingImages = [];
		imageFiles = [];
		removedImages = [];
		expiresInHours = 2;
	}

	$: discountPrice =
		originalPrice > 0
			? Number((originalPrice * (1 - discountPercent / 100)).toFixed(2))
			: 0;

	onDestroy(() => {
		imagePreviews.forEach((url) => {
			if (url.startsWith('blob:')) URL.revokeObjectURL(url);
		});
	});
</script>

<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
	<div class="relative w-full max-w-3xl">
		<div
			class="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-xl"
		>
			<button
				on:click={close}
				class="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800"
			>
				✕
			</button>

			<h2 class="text-xl sm:text-2xl font-bold mb-6">
				{mode === 'add' ? 'Add Product Listing' : 'Edit Product Listing'}
			</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Image Upload -->
				<div class="space-y-3">
					<label for="" class="block text-sm sm:text-base font-semibold text-gray-700">
						Upload Images (max 4)
					</label>
					<label
						class="flex cursor-pointer min-h-[30vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 {imagePreviews.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}"
					>
						<ImageUp class="text-gray-500 mb-2 h-8 w-8" />
						<span class="text-sm text-gray-600">
							{imagePreviews.length >= 4
								? 'Maximum images reached'
								: 'Click/tap to upload or drag & drop'}
						</span>
						<input
							type="file"
							accept="image/*"
							multiple
							class="sr-only"
							disabled={imagePreviews.length >= 4}
							on:change={handleImageUpload}
						/>
					</label>

					{#if imagePreviews.length > 0}
						<div class="flex gap-3 overflow-x-auto pb-2">
							{#each imagePreviews as src, i}
								<div class="group relative aspect-square w-28 sm:w-32 flex-shrink-0 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
									<img {src} alt="Preview" class="h-full w-full object-cover rounded-lg" />
									<button
										type="button"
										aria-label="delete-button"
										class="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 text-white shadow hover:bg-red-600 transition z-10"
										on:click|stopPropagation={() => removeImage(i)}
									>
										<X class="h-4 w-4" />
									</button>
									<div class="absolute bottom-1 left-1 text-xs px-1 py-0.5 rounded text-white {i < existingImages.length ? 'bg-blue-600' : 'bg-green-600'}">
										{i < existingImages.length ? 'Existing' : 'New'}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Product Info -->
				<div class="space-y-4">
					<div>
						<label for="" class="block text-sm sm:text-base font-semibold">Listing title:</label>
						<input
							type="text"
							placeholder="Input listing title"
							bind:value={productName}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="" class="block text-sm sm:text-base font-semibold">Original Price:</label>
							<input
								type="number"
								placeholder="100.00"
								bind:value={originalPrice}
								min="1"
								required
								class="w-full rounded-lg border p-2"
							/>
						</div>
						<div>
							<label for="" class="block text-sm sm:text-base font-semibold">Discount:</label>
							<div class="relative">
								<input
									type="number"
									min="1"
									max="100"
									step="1"
									bind:value={discountPercent}
									class="w-full rounded-lg border p-2 pr-8"
								/>
								<span class="absolute inset-y-0 right-3 flex items-center text-gray-500">%</span>
							</div>
						</div>
					</div>
				</div>

				<div>
					<label for="" class="block text-sm sm:text-base font-semibold mb-1">
						Deal expires in (hours):
					</label>
					<input
						type="number"
						bind:value={expiresInHours}
						required
						enterkeyhint="done"
						class="w-full rounded-lg border p-2"
						on:keydown={(e) => {
							if (e.key === 'Enter') handleSubmit(e);
						}}
					/>
				</div>

				<div class="flex flex-col sm:flex-row gap-3 pt-2">
					{#if mode === 'edit'}
						<button
							type="button"
							on:click={() => dispatch('deleteListing', { deal })}
							class="w-full cursor-pointer text-lg rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition hover:bg-red-600"
						>
							Delete
						</button>
					{/if}
					<button
						type="submit"
						class="w-full cursor-pointer text-lg rounded-lg bg-green-600 px-4 py-2 text-white shadow-md transition hover:bg-green-700"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>

	<!-- <div class="mt-1 flex justify-between text-sm">
							<span class="text-gray-600">{discountPercent}% off</span>
							{#if discountPrice > 0}
								<span class="font-semibold text-green-600">
									Final Price: ₱{discountPrice}
								</span>
							{/if}
						</div> -->
					<!-- <div>
						<label class="block text-sm font-medium">Expiry Date</label>
						<input
							type="date"
							bind:value={expiryDate}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div> -->

				<!-- <div>
					<label class="block text-sm font-medium">Quantity</label>
					<input
						type="number"
						bind:value={quantity}
						required
						class="w-full rounded-lg border p-2"
					/>
				</div> -->

				<!-- <div>
					<label class="block text-sm font-medium">Description</label>
					<textarea bind:value={description} class="w-full rounded-lg border p-2"></textarea>
				</div> -->