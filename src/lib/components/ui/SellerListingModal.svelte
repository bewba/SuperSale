<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { Deal } from '$lib/types/types';
	import { toastError } from '$lib/stores/toast';
	import { X, ImageUp } from '@lucide/svelte';

	const dispatch = createEventDispatcher();

	export let deal: Deal | null = null; // if passed → edit mode, else → add mode
	$: mode = deal ? 'edit' : 'add';

	// for images
	let existingImages: string[] = []; // from deal.image_list
	let removedImages: string[] = [];

	// form state
	let productName = '';
	let originalPrice: number = 0;
	let discountPrice: number = 0;
	let description = '';
	let quantity: string = '1';
	
	let expiresInHours: number = 2;

	function getExpiryTimestampz(hours: number): string {
		// Current time in PH
		const nowPH = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
		);
		// Add hours
		const expiryPH = new Date(nowPH);
		expiryPH.setHours(expiryPH.getHours() + hours);

		return expiryPH.toISOString();
	}

	let imageFiles: File[] = [];
	let imagePreviews: string[] = [];
	let category = '';
	let contactInfo = '';
	let expires_at_time = '';

	let discountPercent = 50;

	function close() {
		dispatch('closeModal');
	}

	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const newFiles = Array.from(target.files);

			// total allowed = 4 (including existing + current)
			const totalAllowed = 4 - existingImages.length;
			const limitedNewFiles = newFiles.slice(0, totalAllowed);

			// combine with already selected imageFiles
			const combined = [...imageFiles, ...limitedNewFiles].slice(0, 4);

			if (
				combined.length >= totalAllowed &&
				newFiles.every(
					(newFile) =>
						!combined.some(
							(existingFile) =>
								existingFile.name === newFile.name && existingFile.size === newFile.size
						)
				)
			) {
				toastError(`You can only upload 4 images`, {
					title: 'Deleted',
					duration: 2000,
					position: 'top-right'
				});
			}

			imageFiles = combined;
			imagePreviews = [...existingImages, ...imageFiles.map((file) => URL.createObjectURL(file))];
		}
	}

	function removeImage(index: number) {
		// if it's an existing URL (not a blob:// preview), mark it for deletion
		if (imagePreviews[index] && !imagePreviews[index].startsWith('blob:')) {
			removedImages.push(imagePreviews[index]);
			existingImages = existingImages.filter((img) => img !== imagePreviews[index]);
		}

		// always update previews and new files
		imageFiles = imageFiles.filter((_, i) => i !== index);
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
	}

	function handleSubmit() {
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

	$: if (deal) {
		productName = deal.title;
		description = deal.reason;
		quantity = String(deal.quantity);
		category = deal.reason_category;
		contactInfo = deal.contact_information;
		discountPercent = deal.discount_percent;
		existingImages = deal.image_list ? [...deal.image_list] : [];
		imagePreviews = [...existingImages];

		// Compute hours left until expiry
		if (deal.expires_at) {
		const nowPH = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
		);
		const expiryDate = new Date(deal.expires_at);
		const diffMs = expiryDate.getTime() - nowPH.getTime();

		// 0 if past expiry
		expiresInHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
	}

		// Load existing images into previews
		if (deal.image_list && deal.image_list.length > 0) {
			imagePreviews = [...deal.image_list];
		} else if (deal.image) {
			imagePreviews = [deal.image];
		} else {
			imagePreviews = [];
		}
	}

	$: discountPrice =
		originalPrice > 0 ? Number((originalPrice * (1 - discountPercent / 100)).toFixed(2)) : 0;
</script>

<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
	<div class="relative w-full max-w-3xl">
		<div
			class="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-xl"
		>
			<!-- Close button -->
			<button
				on:click={close}
				class="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer text-gray-500 hover:text-gray-800"
			>
				✕
			</button>
			<h2 class="text-xl sm:text-2xl font-bold">
				{mode === 'add' ? 'Add Product Listing' : 'Edit Product Listing'}
			</h2>

			<!-- Modal form -->
			<form on:submit|preventDefault={handleSubmit} class="space-y-5 sm:space-y-6">
				<!-- Image Upload -->
				<div class="space-y-3 mt-2">
					<label for="" class="block text-sm sm:text-md font-semibold text-gray-700">
						Upload Images (max 4)
						<span class="text-sm sm:text-md font-extrabold text-red-600">*</span>
					</label>

					<!-- Upload area -->
					<label
						class="flex cursor-pointer min-h-[30vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 sm:p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
					>
						<ImageUp class="text-gray-500 mb-2 h-6 w-6 sm:h-8 sm:w-8" />
						<span class="text-xs sm:text-sm text-gray-600">Click/tap to upload or drag & drop</span>
						<input
							type="file"
							accept="image/*"
							multiple
							class="sr-only"
							on:change={handleImageUpload}
						/>
					</label>

					<!-- Previews -->
					{#if imagePreviews.length > 0}
						<div class="flex gap-3 overflow-x-auto pb-2">
							{#each imagePreviews as src, i}
								<div class="group relative aspect-square w-28 sm:w-32 flex-shrink-0 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
									<img
										{src}
										alt="Preview"
										class="h-full w-full object-cover rounded-lg"
									/>
									<!-- Delete button -->
									<button
										type="button"
										aria-label="delete-button"
										class="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 text-white shadow hover:bg-red-600 transition"
										on:click={() => removeImage(i)}
									>
										<X class="h-4 w-4" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>


				<!-- <div>
					<label class="block text-sm font-medium">Product Name</label>
					<input
						type="text"
						bind:value={productName}
						required
						class="w-full rounded-lg border p-2"
					/>
				</div> -->

				<!-- <div>
					<label class="block text-sm font-medium">Description</label>
					<textarea bind:value={description} class="w-full rounded-lg border p-2"></textarea>
				</div> -->

				<div>
					<!-- <div>
						<label class="block text-sm font-medium">Original Price</label>
						<input
							type="number"
							bind:value={originalPrice}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div> -->
					<div>
						<label for="" class="block text-md font-semibold">Discount</label>
						<div class="relative">
							<input
								type="number"
								min="1"
								max="100"
								step="1"
								bind:value={discountPercent}
								class="border rounded-lg w-full p-2 pr-8"
							/>
							<span class="absolute inset-y-0 right-3 flex items-center text-gray-500">%</span>
						</div>
						<!-- <div class="mt-1 flex justify-between text-sm">
							<span class="text-gray-600">{discountPercent}% off</span>
							{#if discountPrice > 0}
								<span class="font-semibold text-green-600">
									Final Price: ₱{discountPrice}
								</span>
							{/if}
						</div> -->
					</div>
				</div>

				<!-- <div>
					<label class="block text-sm font-medium">Quantity</label>
					<input
						type="number"
						bind:value={quantity}
						required
						class="w-full rounded-lg border p-2"
					/>
				</div> -->

				<!-- Expiry date + time side by side -->
				<div>
					<!-- <div>
						<label class="block text-sm font-medium">Expiry Date</label>
						<input
							type="date"
							bind:value={expiryDate}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div> -->
					<div>
						<label for="" class="block text-md font-semibold mb-1">Deal expires in (hours):</label>
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
				</div>	

				<div class="flex gap-3">
					{#if mode === 'edit'}	
						<button
							on:click={() => dispatch('deleteListing', { deal })}
							class="cursor-pointer w-full text-2xl rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition hover:bg-red-600"
						>
							Delete
						</button>
					{/if}
					<button
						type="submit"
						class="cursor-pointer text-2xl rounded-lg bg-green-600 px-4 py-2 text-white w-full"
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
