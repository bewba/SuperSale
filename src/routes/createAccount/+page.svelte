<script lang="ts">
	import { goto } from '$app/navigation';
	import { X, ImageUp } from '@lucide/svelte';
	import { HandHelping, Truck } from '@lucide/svelte';
	import { toastError, toastInfo, toastSuccess } from '$lib/stores/toast';
	import imageCompression from 'browser-image-compression';
	import supabase from '$lib/supabase/supabaseClient';

	let storeName = '';
	let address = '';
	let contactNumber = '';
	let pickup = true;
	let delivery = true;
	let termsAccepted = false;
	let attemptedSubmit = false;
	let loading = false;
	let errorMessage = '';
	let errorMessageViber = '';
	let showTerms = false;
	let showPrivacy = false;
	let imageFile;
	let viberLink = '';

	let imagePreviews: string[] = [];
	let existingImages: string[] = [];

	function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		imageFile = target.files[0];
		console.log(imageFile);
		const reader = new FileReader();

		reader.onload = (e) => {
			imagePreviews = [e.target?.result as string]; // overwrite any existing preview
		};

		reader.readAsDataURL(imageFile);
	}

	// Remove image
	function removeImage(index: number) {
		imagePreviews.splice(index, 1);
		imagePreviews = [...imagePreviews]; // trigger reactivity
	}

	function verifyStoreName(storeName: string) {
		if (!storeName.trim()) {
			errorMessage = 'Store name is required';
			toastError(`Listing Deal!`, { title: 'Something went wrong', duration: 3000 });
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

		// Build full number with +63
		const fullNumber = `+63${contactNumber}`;
		viberLink = `viber://chat?number=%2B63${contactNumber}`;

		errorMessageViber = '';
		return true;
	}

	async function handleSignup() {
		attemptedSubmit = true;
		toastInfo(`Your Account is being created!`, {
			title: 'Your Account is being created!',
			duration: 500
		});

		if (!termsAccepted) {
			return;
		}

		if (!verifyStoreName(storeName)) {
			return;
		}

		if (!verifyViber()) {
			return;
		}

		loading = true;
		try {
			let uploadedUrl: string | null = null;
			if (imageFile) {
				const file = imageFile;

				console.log(file);

				console.log('File: ', file);

				// compress image
				const compressedFile = await imageCompression(file, {
					maxSizeMB: 0.15, // target max size in MB
					maxWidthOrHeight: 1024, // resize large images
					useWebWorker: true
				});

				// generate unique filename
				const fileName = `${crypto.randomUUID()}_${file.name}`;

				// upload to Supabase storage
				const { data, error } = await supabase.storage
					.from('productImages')
					.upload(fileName, compressedFile);

				console.log(data, error);

				if (error) throw error;

				// get public URL
				const { data: publicUrlData } = supabase.storage
					.from('productImages')
					.getPublicUrl(fileName);

				uploadedUrl = publicUrlData.publicUrl;
			}

			const res = await fetch('/api/createAccount', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					storeName,
					address,
					pickup,
					delivery,
					termsAccepted,
					uploadedUrl,
					viberLink
				})
			});

			const data = await res.json();

			if (data.success) {
				toastSuccess(`Your account has been created!`, {
					title: 'Account Created',
					duration: 1000
				});
				goto('/protected/seller');
			} else {
				alert(data.error || 'Failed to register store');
			}
		} catch (err) {
			console.error(err);
			toastError(`An error occured`, { title: 'Something went wrong', duration: 3000 });
		} finally {
			loading = false;
		}
	}

	function handleNotSeller() {
		goto('/');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
	<div class="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
		<div class="rounded-2xl bg-white p-6 shadow-xl sm:p-8 lg:p-12">
			<!-- Header -->
			<div class="mb-8 text-center sm:mb-10 lg:mb-12">
				<h1 class="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
					Store Registration
				</h1>
				<p class="text-sm text-gray-600 sm:text-base lg:text-lg">
					Set up your store details and delivery options
				</p>
			</div>

			<div class="space-y-2">
				<label for="" class="block text-sm font-semibold text-gray-700"> Upload Logo </label>
				<label
					class="mb-4 flex min-h-[22vh] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50 {imagePreviews.length >=
					1
						? 'cursor-not-allowed opacity-50'
						: ''}"
				>
					<ImageUp class="mb-1 h-7 w-7 text-gray-500" />
					<span class="text-xs text-gray-600">
						{imagePreviews.length >= 1
							? 'Maximum image reached'
							: 'Click/tap to upload or drag & drop'}
					</span>
					<input
						type="file"
						accept="image/*"
						class="sr-only"
						disabled={imagePreviews.length >= 1}
						on:change={handleImageUpload}
					/>
				</label>

				{#if imagePreviews.length > 0}
					<div class="flex gap-2 pb-4">
						<!-- Only one image preview -->
						<div
							class="group relative aspect-square w-28 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 shadow-sm"
						>
							<img
								src={imagePreviews[0]}
								alt="Preview"
								class="h-full w-full rounded-md object-cover"
							/>
							<button
								type="button"
								aria-label="delete-button"
								class="absolute top-1 right-1 z-10 cursor-pointer rounded-full bg-black/60 p-0.5 text-white shadow transition hover:bg-red-600"
								on:click|stopPropagation={() => removeImage(0)}
							>
								<X class="h-3.5 w-3.5" />
							</button>
							<div
								class="absolute bottom-1 left-1 rounded px-1 text-[10px] text-white {0 <
								existingImages.length
									? 'bg-blue-600'
									: 'bg-green-600'}"
							>
								{0 < existingImages.length ? 'Existing' : 'New'}
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Responsive Grid Layout -->
			<div class="grid grid-cols-1 sm:gap-8 lg:gap-10">
				<!-- Form Fields -->
				<div class="space-y-6 sm:space-y-7 lg:space-y-8">
					<!-- Store Name Input -->
					<div class="space-y-2 sm:space-y-3">
						<label for="" class="block text-sm font-medium text-gray-700 sm:text-base"
							>Store Name</label
						>
						<input
							type="text"
							bind:value={storeName}
							placeholder="Enter your store name"
							class="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none sm:px-4 sm:py-3 sm:text-base lg:py-4"
						/>
						{#if errorMessage}
							<p class="text-xs text-red-600 sm:text-sm">{errorMessage}</p>
						{/if}
					</div>

					<!-- Address Input -->
					<div class="space-y-2 sm:space-y-3">
						<label for="" class="block text-sm font-medium text-gray-700 sm:text-base"
							>Address</label
						>
						<textarea
							bind:value={address}
							placeholder="Enter your store address"
							rows="3"
							class="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none sm:px-4 sm:py-3 sm:text-base lg:py-4"
						></textarea>
					</div>

					<!-- Store Name Input -->
					<div class="space-y-2 sm:space-y-3">
						<label class="block text-sm font-medium text-gray-700 sm:text-base">
							Contact Number
						</label>

						<div
							class="flex rounded-xl border-2 border-gray-300 bg-white focus-within:border-gray-900"
						>
							<span class="flex items-center px-3 text-sm text-gray-500 sm:text-base">+63</span>
							<input
								type="text"
								bind:value={contactNumber}
								placeholder="9XXXXXXXXX"
								class="flex-1 rounded-r-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none sm:px-4 sm:py-3 sm:text-base lg:py-4"
							/>
						</div>

						{#if errorMessageViber}
							<p class="text-xs text-red-600 sm:text-sm">{errorMessageViber}</p>
						{/if}
					</div>
				</div>

				<!-- Options and Buttons -->
				<div class="mt-8 space-y-6 sm:mt-0 sm:space-y-7 lg:space-y-8">
					<!-- Service Options -->
					<div class="space-y-5 sm:space-y-6">
						<h3 class="text-sm font-medium text-gray-700 sm:text-base">Service Options</h3>

						<!-- Pickup Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-3 sm:p-4">
							<div class="flex items-center space-x-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 sm:h-10 sm:w-10"
								>
									<svg
										class="h-4 w-4 text-gray-600 sm:h-5 sm:w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<HandHelping />
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 sm:text-base">Pickup</span>
									<p class="text-xs text-gray-500 sm:text-sm">Customers can pick up orders</p>
								</div>
							</div>
							<button
								on:click={() => (pickup = !pickup)}
								class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none sm:h-6 sm:w-11 lg:h-7 lg:w-12 {pickup
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={pickup}
								aria-label="pickup"
							>
								<span
									class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out sm:h-5 sm:w-5 lg:h-6 lg:w-6 {pickup
										? 'translate-x-5 sm:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>

						<!-- Delivery Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-3 sm:p-4">
							<div class="flex items-center space-x-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 sm:h-10 sm:w-10"
								>
									<svg
										class="h-4 w-4 text-gray-600 sm:h-5 sm:w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<Truck />
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 sm:text-base">Delivery</span>
									<p class="text-xs text-gray-500 sm:text-sm">Deliver orders to customers</p>
								</div>
							</div>
							<button
								on:click={() => (delivery = !delivery)}
								class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none sm:h-6 sm:w-11 lg:h-7 lg:w-12 {delivery
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={delivery}
								aria-label="delivery"
							>
								<span
									class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out sm:h-5 sm:w-5 lg:h-6 lg:w-6 {delivery
										? 'translate-x-5 sm:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>

					<!-- Terms and Privacy Checkbox -->
					<div class="space-y-3 sm:space-y-4">
						<label class="flex cursor-pointer items-start space-x-3">
							<input
								type="checkbox"
								bind:checked={termsAccepted}
								class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
							/>
							<span class="text-xs leading-5 text-gray-600 sm:text-sm">
								I agree to the
								<button
									type="button"
									on:click={() => (showTerms = true)}
									class="cursor-pointer text-gray-900 underline hover:text-gray-700"
								>
									Terms of Service
								</button>
								and
								<button
									type="button"
									on:click={() => (showPrivacy = true)}
									class="cursor-pointer text-gray-900 underline hover:text-gray-700"
								>
									Privacy Policy
								</button>
							</span>
						</label>
						{#if !termsAccepted && attemptedSubmit}
							<p class="text-xs text-red-600 sm:text-sm">
								Please accept the terms and privacy policy to continue
							</p>
						{/if}
					</div>

					<!-- Bottom Buttons -->
					<div class="space-y-3 sm:space-y-4">
						<button
							on:click={handleSignup}
							class="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0060a9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0060a1] disabled:cursor-not-allowed disabled:bg-gray-400 sm:px-6 sm:py-3 sm:text-base lg:py-4"
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
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									></path>
								</svg>
							{:else}
								Create Store Account
							{/if}
						</button>
						<button
							on:click={handleNotSeller}
							class="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-6 sm:py-3 sm:text-base lg:py-4"
						>
							I'm not a seller
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
