<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { Deal } from '$lib/types/types';
	import { toastError } from '$lib/stores/toast';

	const dispatch = createEventDispatcher();

	export let deal: Deal | null = null; // if passed → edit mode, else → add mode
	$: mode = deal ? 'edit' : 'add';

	// for images
	let existingImages: string[] = []; // from deal.image_list
	let removedImages: string[] = [];

	// form state
	let productName = '';
	let originalPrice: string = '';
	let discountPrice: string = '';
	let description = '';
	let quantity: string = '';
	let expiryDate: string = '';
	let imageFiles: File[] = [];
	let imagePreviews: string[] = [];
	let category = '';
	let contactInfo = '';

	let discountPercent = 0;

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
		const payload = {
			productName,
			originalPrice,
			discountPrice,
			discountPercent,
			description,
			quantity,
			expiryDate,
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
		originalPrice = String(deal.original_price);
		discountPrice = String(deal.discount_price);
		description = deal.reason;
		quantity = String(deal.quantity);
		expiryDate = deal.expires_at;
		category = deal.reason_category;
		contactInfo = deal.contact_information;
		discountPercent = deal.discount_percent;
		existingImages = deal.image_list ? [...deal.image_list] : [];
		imagePreviews = [...existingImages];

		// Load existing images into previews
		if (deal.image_list && deal.image_list.length > 0) {
			imagePreviews = [...deal.image_list];
		} else if (deal.image) {
			imagePreviews = [deal.image];
		} else {
			imagePreviews = [];
		}
	}
</script>

<!-- Backdrop -->
<!-- 
	Removed the following for div:
	role="button"
	tabindex="0"
	on:click={handleBackdropClick}
	on:keydown={(e) => e.key === 'Escape'}
-->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
	<div class="relative mx-4 w-full max-w-3xl">
		<div class="max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
			<!-- Close button -->
			<button
				on:click={close}
				class="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
			>
				✕
			</button>

			<!-- Modal form -->
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<h2 class="text-2xl font-bold">
					{mode === 'add' ? 'Add Product Listing' : 'Edit Product Listing'}
				</h2>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block text-sm font-medium">Product Name</label>
					<input
						type="text"
						bind:value={productName}
						required
						class="w-full rounded-lg border p-2"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="block text-sm font-medium">Original Price</label>
						<input
							type="number"
							bind:value={originalPrice}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div>
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="block text-sm font-medium">Discount Price</label>
						<input
							type="number"
							bind:value={discountPrice}
							on:input={() => {
								if (originalPrice && discountPrice) {
									discountPercent = Math.round(
										(1 - Number(discountPrice) / Number(originalPrice)) * 100
									);
								}
							}}
							required
							class="w-full rounded-lg border p-2"
						/>
						{#if discountPercent > 0}
							<p class="mt-1 text-sm text-green-600">Discount: {discountPercent}%</p>
						{/if}
					</div>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block text-sm font-medium">Description</label>
					<textarea bind:value={description} class="w-full rounded-lg border p-2"></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="block text-sm font-medium">Quantity</label>
						<input
							type="number"
							bind:value={quantity}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div>
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="block text-sm font-medium">Expiry Date</label>
						<input
							type="date"
							bind:value={expiryDate}
							required
							class="w-full rounded-lg border p-2"
						/>
					</div>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block text-sm font-medium">Category</label>
					<input type="text" bind:value={category} class="w-full rounded-lg border p-2" />
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="block text-sm font-medium">Contact Info</label>
					<input type="text" bind:value={contactInfo} class="w-full rounded-lg border p-2" />
				</div>

				<div>
					<label
						class="inline-block cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-600"
					>
						Upload Images (max 4)
						<input
							type="file"
							accept="image/*"
							multiple
							class="hidden"
							on:change={handleImageUpload}
						/>
					</label>

					<!-- Image displays -->
					{#if imagePreviews.length > 0}
						<div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
							{#each imagePreviews as src, i}
								<div class="group relative">
									<img {src} alt="Preview" class="h-32 w-full rounded-lg object-cover" />
									<button
										type="button"
										class="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 px-2 py-1 text-xs text-white group-hover:block"
										on:click={() => removeImage(i)}
									>
										✕
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						on:click={close}
						class="cursor-pointer rounded-lg bg-gray-200 px-4 py-2"
					>
						Cancel
					</button>
					<button type="submit" class="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white">
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
