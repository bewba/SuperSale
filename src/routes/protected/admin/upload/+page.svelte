<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Toast from '$lib/components/Toast.svelte';
	const dispatch = createEventDispatcher();

	let toasts: { id: number; message: string; type?: 'success' | 'error' }[] = [];
	let toastId = 0;

	function addToast(message: string, type: 'success' | 'error' = 'success') {
		toasts = [...toasts, { id: ++toastId, message, type }];
	}
	function removeToast(id: number) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	let productName = '';
	let originalPrice: string = '';
	let discountPrice: string = '';
	let description = '';
	let quantity: string = '';
	let expiryDate: string = '';
	let imageFile: File | null = null;
	let imagePreview: string | null = null;
	let category = '';
	let contactInfo = '';

	let discountPercent = 0;
	let errors: Record<string, string> = {};

	function validate() {
		errors = {};

		if (!productName.trim()) {
			errors.productName = 'Product name is required';
		}

		if (!category.trim()) {
			errors.category = 'Product category is required';
		}

		if (!contactInfo.trim()) {
			errors.category = 'contactInfo is required';
		}

		if (
			!(originalPrice + '').trim() ||
			isNaN(Number(originalPrice)) ||
			Number(originalPrice) <= 0
		) {
			errors.originalPrice = 'Please enter a valid positive price';
		}

		if (
			!(discountPrice + '').trim() ||
			isNaN(Number(discountPrice)) ||
			Number(discountPrice) <= 0
		) {
			errors.discountPrice = 'Please enter a valid positive discounted price';
		}

		if (!(quantity + '').trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
			errors.quantity = 'Please enter a valid quantity';
		}

		if (!description.trim()) {
			errors.description = 'Description is required';
		}

		if (!expiryDate) {
			errors.expiryDate = 'Promo expiry date is required';
		} else if (new Date(expiryDate) <= new Date()) {
			errors.expiryDate = 'Expiry date must be in the future';
		}

		if (!imageFile) {
			errors.imageFile = 'Product image is required';
		}

		return Object.keys(errors).length === 0;
	}

	function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			imageFile = target.files[0];
			imagePreview = URL.createObjectURL(imageFile);
		}
	}

	function updateDiscount() {
		if (Number(originalPrice) > 0 && Number(discountPrice) > 0) {
			discountPercent = Math.round((1 - Number(discountPrice) / Number(originalPrice)) * 100);
		} else {
			discountPercent = 0;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) return;

		const formData = new FormData();
		formData.append('title', productName);
		formData.append('category', category);
		formData.append('contactInfo', contactInfo);
		formData.append('quantity', quantity.toString());
		formData.append('original_price', originalPrice.toString());
		formData.append('discount_price', discountPrice.toString());
		formData.append('discount_percent', discountPercent.toString());
		formData.append('reason', description);
		formData.append('expires_at', expiryDate);
		if (imageFile) formData.append('image', imageFile);

		try {
			const response = await fetch('/protected/admin/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('API error:', errorData);
				return;
			}

			const result = await response.json();
			console.log('Deal saved successfully:', result);
			resetForm();

			addToast('Deal saved successfully!', 'success');
		} catch (err) {
			console.error('Network or server error:', err);
			addToast('Something went wrong!', 'error');
		}
	}

	function resetForm() {
		productName = '';
		originalPrice = '';
		discountPrice = '';
		description = '';
		quantity = '';
		expiryDate = '';
		imageFile = null;
		imagePreview = null;
		discountPercent = 0;
		errors = {};
		category = '';
		contactInfo = '';
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<form
		on:submit={handleSubmit}
		class="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-md"
	>
		<h2 class="text-lg font-semibold text-gray-800">Add New Deal</h2>

		<!-- Product Name -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Product Name *</label>
			<input
				type="text"
				bind:value={productName}
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			/>
			{#if errors.productName}
				<p class="mt-1 text-xs text-red-500">{errors.productName}</p>
			{/if}
		</div>

		<!-- Price Inputs -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="block text-sm font-medium text-gray-700">Original Price (₱) *</label>
				<input
					type="number"
					bind:value={originalPrice}
					on:input={updateDiscount}
					min="1"
					step="0.01"
					class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					required
				/>
				{#if errors.originalPrice}
					<p class="mt-1 text-xs text-red-500">{errors.originalPrice}</p>
				{/if}
			</div>

			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="block text-sm font-medium text-gray-700">Discounted Price (₱) *</label>
				<input
					type="number"
					bind:value={discountPrice}
					on:input={updateDiscount}
					min="1"
					step="0.01"
					class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					required
				/>
				{#if errors.discountPrice}
					<p class="mt-1 text-xs text-red-500">{errors.discountPrice}</p>
				{/if}

				{#if discountPercent > 0}
					<p class="mt-1 text-xs font-medium text-green-600">-{discountPercent}% OFF</p>
				{/if}
			</div>
		</div>

		<!-- Quantity -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Quantity *</label>
			<input
				type="number"
				bind:value={quantity}
				min="1"
				step="1"
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			/>
			{#if errors.quantity}
				<p class="mt-1 text-xs text-red-500">{errors.quantity}</p>
			{/if}
		</div>

		<!-- Expiry Date -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Promo Expiry Date *</label>
			<input
				type="date"
				bind:value={expiryDate}
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			/>
			{#if errors.expiryDate}
				<p class="mt-1 text-xs text-red-500">{errors.expiryDate}</p>
			{/if}
		</div>

		<!-- Description -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Description *</label>
			<textarea
				bind:value={description}
				rows="3"
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			></textarea>
			{#if errors.description}
				<p class="mt-1 text-xs text-red-500">{errors.description}</p>
			{/if}
		</div>

		<!-- Product Category -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Product Category *</label>
			<input
				type="text"
				bind:value={category}
				placeholder="e.g.,Getting ugly, ugly"
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			/>
			{#if errors.category}
				<p class="mt-1 text-xs text-red-500">{errors.category}</p>
			{/if}
		</div>

		<!-- Contact Information -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Contact Information *</label>
			<input
				type="text"
				bind:value={contactInfo}
				placeholder="+63"
				class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				required
			/>
			{#if errors.contact_information}
				<p class="mt-1 text-xs text-red-500">{errors.contact_information}</p>
			{/if}
		</div>

		<!-- Image Upload -->
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700">Product Image *</label>
			<input
				type="file"
				accept="image/*"
				on:change={handleImageUpload}
				class="mt-2 block w-fit cursor-pointer rounded-md border border-gray-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
				required
			/>
			{#if errors.imageFile}
				<p class="mt-1 text-xs text-red-500">{errors.imageFile}</p>
			{/if}

			{#if imagePreview}
				<img
					src={imagePreview}
					alt="Preview"
					class="mt-3 h-36 w-36 rounded-lg object-cover ring-1 ring-gray-200"
				/>
			{/if}
		</div>

		<!-- Buttons -->
		<div class="flex justify-end gap-3">
			<button
				type="button"
				class="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
				on:click={resetForm}
			>
				Reset
			</button>
			<button
				type="submit"
				class="cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold text-black shadow hover:bg-red-600 hover:text-white"
			>
				Save Deal
			</button>
		</div>
	</form>
</div>

<div class="fixed top-5 right-5 z-50 space-y-3">
	{#each toasts as toast (toast.id)}
		<Toast
			id={toast.id}
			message={toast.message}
			type={toast.type}
			on:remove={(e) => removeToast(e.detail)}
		/>
	{/each}
</div>
