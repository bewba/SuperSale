<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, ImageUp, Save } from '@lucide/svelte';
	import { HandHelping, Truck } from '@lucide/svelte';
	import { toastError, toastSuccess } from '$lib/stores/toast';
	import imageCompression from 'browser-image-compression';
	import supabase from '$lib/supabase/supabaseClient';
	import { goto } from '$app/navigation';

	// Expect existingData from parent
	export let existingData = {
		storeName: '',
		address: '',
		contactNumber: '',
		pickup: true,
		delivery: true,
		logoUrl: '',
		viberLink: ''
	};

	const dispatch = createEventDispatcher();

	// Local state (pre-filled from existingData)
	let storeName = existingData.storeName || '';
	let address = existingData.address || '';
	let contactNumber = existingData.contactNumber?.replace('+63', '') || '';
	let pickup = existingData.pickup ?? true;
	let delivery = existingData.delivery ?? true;
	let viberLink = existingData.viberLink || '';
	let imagePreviews: string[] = existingData.logoUrl ? [existingData.logoUrl] : [];

	let imageFile: File | null = null;
	let hasNewImage = false;
	let loading = false;
	let errorMessage = '';
	let errorMessageViber = '';

	function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files?.length) return;

		imageFile = target.files[0];
		hasNewImage = true;

		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreviews = [e.target?.result as string];
		};
		reader.readAsDataURL(imageFile);
	}

	function removeImage(index: number) {
		imagePreviews.splice(index, 1);
		imagePreviews = [...imagePreviews];
		hasNewImage = false;
		imageFile = null;
	}

	function verifyStoreName(name: string) {
		if (!name.trim()) {
			errorMessage = 'Store name is required';
			return false;
		}
		errorMessage = '';
		return true;
	}

	function verifyViber() {
		if (!contactNumber.trim()) {
			errorMessageViber = 'Contact number is required';
			return false;
		}
		const numberRegex = /^\d{10}$/;
		if (!numberRegex.test(contactNumber)) {
			errorMessageViber = 'Invalid contact number format';
			return false;
		}
		viberLink = `viber://chat?number=%2B63${contactNumber}`;
		errorMessageViber = '';
		return true;
	}

	async function handleSave() {
		if (!verifyStoreName(storeName) || !verifyViber()) {
			toastError(`You must have a store name or a valid viber number!`, {
				title: 'Error Updating Store Information',
				duration: 2000,
				position: 'top-right'
			});
			return;
		}
		// Store name length check
		if (storeName.trim().length > 50) {
			errorMessage = 'Store name cannot exceed 50 characters';
			toastError(`Store name cannot exceed 50 characters`, {
				title: 'Error Updating Store Information',
				duration: 2000,
				position: 'top-right'
			});
			return;
			return;
		}

		// Address length check
		if (address.trim().length > 200) {
			toastError('Address cannot exceed 200 characters', {
				title: 'Error Updating Store Information',
				duration: 2000,
				position: 'top-right'
			});
			return;
		}

		// Contact number must be exactly 10 digits
		if (contactNumber.trim().length !== 10) {
			errorMessageViber = 'Contact number must be exactly 10 digits';
			toastError('Contact number must be exactly 10 digits', {
				title: 'Error Updating Store Information',
				duration: 2000,
				position: 'top-right'
			});
			return;
		}

		loading = true;
		try {
			let uploadedUrl: string | null = existingData.logoUrl;

			if (hasNewImage && imageFile) {
				const compressedFile = await imageCompression(imageFile, {
					maxSizeMB: 0.15,
					maxWidthOrHeight: 1024,
					useWebWorker: true
				});

				const fileName = `${crypto.randomUUID()}_${imageFile.name}`;

				const { error: uploadError } = await supabase.storage
					.from('productImages')
					.upload(fileName, compressedFile);

				if (uploadError) throw uploadError;

				const { data: publicUrlData } = supabase.storage
					.from('productImages')
					.getPublicUrl(fileName);

				uploadedUrl = publicUrlData.publicUrl;
			}

			const res = await fetch('/api/editAccount', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					storeName,
					address,
					pickup,
					delivery,
					uploadedUrl,
					viberLink
				})
			});

			const result = await res.json();

			if (result.success) {
				toastSuccess(result.message, { title: 'Success', duration: 2000 });
				goto('/protected/seller');
				dispatch('save', result.data); // still notify parent if needed
			} else {
				toastError(result.error ?? 'Failed to update store information', {
					title: 'Error',
					duration: 3000
				});
			}
		} catch (err) {
			console.error(err);
			toastError('Failed to update store information', {
				title: 'Error',
				duration: 3000
			});
		} finally {
			loading = false;
		}
	}
</script>

<!-- keep your template markup the same (logo upload, fields, toggles, buttons) -->
<div class="mx-auto w-full max-w-6xl">
	<div class="rounded-2xl bg-white p-6 shadow-xl sm:p-8 lg:p-12">
		<!-- Header -->
		<div class="mb-8 text-center lg:mb-12">
			<h2 class="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
				Edit Store Information
			</h2>
			<p class="text-sm text-gray-600 sm:text-base lg:text-lg">
				Update your store details and preferences
			</p>
		</div>

		<!-- Desktop Grid Layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
			<!-- Left Column: Logo Upload -->
			<div class="lg:col-span-1">
				<div class="space-y-3 lg:sticky lg:top-6">
					<label for="" class="block text-sm font-semibold text-gray-700 lg:text-base"
						>Store Logo</label
					>
					<label
						class="flex min-h-[18vh] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 lg:min-h-[25vh] lg:p-8 {imagePreviews.length >=
						1
							? 'cursor-not-allowed opacity-50'
							: ''}"
					>
						<ImageUp class="mb-2 h-6 w-6 text-gray-500 lg:h-8 lg:w-8" />
						<span class="text-xs text-gray-600 lg:text-sm">
							{imagePreviews.length >= 1 ? 'Click to replace image' : 'Click to upload logo'}
						</span>
						<span class="mt-2 text-xs text-gray-600 italic lg:text-sm">
							Note: Leaving this empty will default your last logo.
						</span>
						<input type="file" accept="image/*" class="sr-only" on:change={handleImageUpload} />
					</label>

					{#if imagePreviews.length > 0}
						<div class="flex justify-center pt-2">
							<div
								class="group relative aspect-square w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm lg:w-40"
							>
								<img
									src={imagePreviews[0]}
									alt="Store logo"
									class="h-full w-full rounded-lg object-cover"
								/>
								<button
									type="button"
									class="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-600 lg:p-2"
									on:click|stopPropagation={() => removeImage(0)}
								>
									<X class="h-3 w-3 lg:h-4 lg:w-4" />
								</button>
								<div
									class="absolute bottom-2 left-2 rounded px-2 py-1 text-xs text-white lg:text-sm {hasNewImage
										? 'bg-green-600'
										: 'bg-blue-600'}"
								>
									{hasNewImage ? 'New' : 'Current'}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Right Column: Form Fields -->
			<div class="lg:col-span-2">
				<div class="space-y-6 lg:space-y-8">
					<!-- Store Details Section -->
					<div class="space-y-6 lg:space-y-8">
						<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
							<!-- Store Name -->
							<div class="space-y-2 lg:space-y-3">
								<label for="" class="block text-sm font-medium text-gray-700 lg:text-base"
									>Store Name</label
								>
								<input
									type="text"
									bind:value={storeName}
									maxlength="50"
									placeholder="Enter your store name"
									class="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none lg:px-5 lg:py-4 lg:text-lg"
								/>
								{#if errorMessage}
									<p class="text-sm text-red-600 lg:text-base">{errorMessage}</p>
								{/if}
							</div>

							<!-- Contact Number -->
							<div class="space-y-2 lg:space-y-3">
								<label for="" class="block text-sm font-medium text-gray-700 lg:text-base"
									>Contact Number</label
								>
								<div
									class="flex rounded-xl border-2 border-gray-300 bg-white focus-within:border-gray-900"
								>
									<span class="flex items-center px-4 text-gray-500 lg:px-5 lg:text-lg">+63</span>
									<input
										type="text"
										maxlength="10"
										bind:value={contactNumber}
										placeholder="9XXXXXXXXX"
										class="flex-1 rounded-r-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none lg:px-5 lg:py-4 lg:text-lg"
									/>
								</div>
								{#if errorMessageViber}
									<p class="text-sm text-red-600 lg:text-base">{errorMessageViber}</p>
								{/if}
							</div>
						</div>

						<!-- Address (Full Width) -->
						<div class="space-y-2 lg:space-y-3">
							<label for="" class="block text-sm font-medium text-gray-700 lg:text-base"
								>Address</label
							>
							<textarea
								bind:value={address}
								placeholder="Enter your store address"
								maxlength="200"
								rows="3"
								class="lg:rows-4 w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none lg:px-5 lg:py-4 lg:text-lg"
							></textarea>
						</div>
					</div>

					<!-- Service Options -->
					<div class="space-y-4">
						<h3 class="text-sm font-medium text-gray-700">Service Options</h3>

						<!-- Pickup Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
									<HandHelping class="h-5 w-5 text-gray-600" />
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900">Pickup</span>
									<p class="text-xs text-gray-500">Customers can pick up orders</p>
								</div>
							</div>
							<button
								on:click={() => (pickup = !pickup)}
								class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {pickup
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={pickup}
								aria-label="pickup"
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out {pickup
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>

						<!-- Delivery Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
									<Truck class="h-5 w-5 text-gray-600" />
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900">Delivery</span>
									<p class="text-xs text-gray-500">Deliver orders to customers</p>
								</div>
							</div>
							<button
								on:click={() => (delivery = !delivery)}
								class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {delivery
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={delivery}
								aria-label="delivery"
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out {delivery
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex space-x-3 pt-4">
						<button
							on:click={handleSave}
							disabled={loading}
							class="flex flex-1 items-center justify-center rounded-xl bg-[#0060a9] px-6 py-3 text-white transition-colors hover:bg-[#0060a1] disabled:cursor-not-allowed disabled:bg-gray-400"
						>
							{#if loading}
								<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									></path>
								</svg>
							{:else}
								<Save class="mr-2 h-4 w-4" />
								Save Changes
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
