<script lang="ts">
	import Orders from '$lib/components/seller/Orders.svelte';
	import SellerListingModal from '$lib/components/seller/SellerListingModal.svelte';
	import AcceptedOrders from '$lib/components/seller/AcceptedOrders.svelte';
	import Listings from '$lib/components/seller/Listings.svelte';
	import type { Deal, ChatRoom, Enriched } from '$lib/types/types';
	import { onMount } from 'svelte';
	import DeleteModal from '$lib/components/seller/DeleteModal.svelte';
	import StatCard from '$lib/components/seller/StatCard.svelte';
	import ActiveChats from '$lib/components/seller/ActiveChats.svelte';
	import { toastSuccess, toastError, toastInfo } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	import supabase from '$lib/supabase/supabaseClient';
	import imageCompression from 'browser-image-compression';
	import { ArrowLeftIcon } from '@lucide/svelte';

	let myDeals: Deal[] = [];
	let chatRooms: ChatRoom[] = [];
	let pendingOrders: any[] = [];
	let enriched: Enriched[] = [];

	let loadingDeals = true;
	let loadingOrders = true;
	let loadingChats = true;
	let errorDeals: string | null = null;
	let errorOrders: string | null = null;

	let showDeleteModal = false;
	let dealToDelete: Deal | null = null;

	function openDeleteModal(deal: Deal) {
		dealToDelete = deal;
		showDeleteModal = true;
	}

	async function handleDeleteConfirm() {
		if (!dealToDelete) return;

		try {
			const res = await fetch('seller/api/delete-listing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dealId: dealToDelete.id })
			});
			console.log(res);

			const result = await res.json();

			// SUCCESS TOAST
			if (result.success) {
				myDeals = myDeals.filter((d) => d.id !== dealToDelete?.id);

				toastSuccess(`Item has been deleted.`, {
					title: 'Deleted',
					duration: 2000,
					position: 'top-right'
				});

				console.log('Deal deleted', dealToDelete.id);
			} else {
				// ERROR TOAST
				console.error('Delete failed', result.error);

				toastError(`Could not delete "${dealToDelete.title}".`, {
					title: 'Error',
					duration: 2500,
					position: 'top-right'
				});
			}
		} catch (err) {
			console.error('Request failed', err);

			toastError(`Something went wrong. Please try again.`, {
				title: 'Network Error',
				duration: 2500,
				position: 'top-right'
			});
		} finally {
			showDeleteModal = false;
			dealToDelete = null;
		}
	}

	// let showAddModal = false;
	// let newDeal: Partial<Deal> = {
	// 	title: '',
	// 	image: '',
	// 	original_price: 0,
	// 	discount_price: 0,
	// 	quantity: 1,
	// 	reason: '',
	// 	expires_at: ''
	// };

	let showModal = false;
	let modalMode: 'add' | 'edit' = 'add';
	let selectedDeal: Deal | null = null;

	function getExpiryTimestampz(hours: number): string {
		// Current time in PH
		const nowPH = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
		// Add hours
		const expiryPH = new Date(nowPH);
		expiryPH.setHours(expiryPH.getHours() + hours);

		return expiryPH.toISOString();
	}

	function addListing() {
		modalMode = 'add';
		selectedDeal = null;
		showModal = true;
	}

	async function sendEditListingToServer(deal: any) {
		toastInfo(`Updating listing!`, {
			title: 'Your listing is being updated!',
			duration: 3000,
			position: 'top-right'
		});

		try {
			const formData = new FormData();

			console.log(deal);

			let expires_at: string;

			if (deal) {
				expires_at =
					deal.expiresInHours > 0 ? getExpiryTimestampz(deal.expiresInHours) : deal.expires_at;
			} else {
				expires_at = getExpiryTimestampz(deal.expiresInHours);
			}

			// Append all fields
			formData.append('productName', deal.productName);
			formData.append('originalPrice', String(deal.originalPrice));
			formData.append('discountPrice', String(deal.discountPrice));
			formData.append('discountPercent', String(deal.discountPercent));
			formData.append('description', deal.description);
			formData.append('quantity', String(deal.quantity));
			formData.append('expiryDate', deal.expiryDate);
			formData.append('category', deal.category);
			formData.append('contactInfo', deal.contactInfo);
			formData.append('id', deal.id);

			formData.append('expires_at', expires_at);

			if (deal.existingImages) {
				formData.append('existingImages', JSON.stringify(deal.existingImages));
			}
			if (deal.removedImages) {
				formData.append('removedImages', JSON.stringify(deal.removedImages));
			}

			if (deal.imageFiles && deal.imageFiles.length > 0) {
				deal.imageFiles.forEach((file: File) => {
					formData.append('imageFiles', file);
				});
			}

			const res = await fetch('/protected/seller/api/edit-listing', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				throw new Error(`Failed to add listing: ${res.status}`);
			}

			const data = await res.json();
			console.log('✅ Listing added:', data);

			if (data.success) {
				await loadDeals();

				toastSuccess(`Your Listing has been updated!`, {
					title: 'Listing updated',
					duration: 2000,
					position: 'top-right'
				});
			}

			return data;
		} catch (err) {
			console.error('❌ Error updating listing:', err);

			toastError(`Error updating Listing!`, {
				title: 'An error occured',
				duration: 2000,
				position: 'top-right'
			});
		}
	}

	async function sendAddListingToServer(deal: any) {
		toastInfo(`Listing Deal!`, { title: 'Your listing is being placed!', duration: 3000 });

		try {
			// 1. Upload images directly to Supabase
			const uploadedUrls: string[] = [];
			if (deal.imageFiles?.length > 0) {
				for (const file of deal.imageFiles) {
					const compressedFile = await imageCompression(file, {
						maxSizeMB: 0.15, // target max size in MB
						maxWidthOrHeight: 1024, // resize large images
						useWebWorker: true
					});

					const fileName = `${crypto.randomUUID()}_${file.name}`;
					const { data, error } = await supabase.storage
						.from('productImages')
						.upload(fileName, compressedFile);

					if (error) throw error;

					const { data: publicUrlData } = supabase.storage
						.from('productImages')
						.getPublicUrl(fileName);

					uploadedUrls.push(publicUrlData.publicUrl);
				}
			}

			// 2. Send only metadata + image URLs
			const res = await fetch('/protected/seller/api/add-listing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...deal,
					image_list: uploadedUrls
				})
			});

			if (!res.ok) throw new Error(`Failed to add listing: ${res.status}`);

			const data = await res.json();
			console.log('✅ Listing added:', data);

			if (data.success) {
				await loadDeals();
				toastSuccess(`Your Listing has been placed!`, { title: 'Listing Placed', duration: 2000 });
			}

			return data;
		} catch (err) {
			console.error('❌ Error adding listing:', err);
			toastError(`Error Creating Listing!`, { title: 'An error occured', duration: 2000 });
		}
	}

	function editListing(deal: Deal) {
		modalMode = 'edit';
		selectedDeal = deal;
		showModal = true;

		console.log('editing', deal);
	}

	async function confirmOrder(orderId: string, order: any) {
		console.log('confirmingOrder');

		try {
			const res = await fetch('/protected/seller/api/confirm-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ order })
			});

			const data = await res.json();

			if (data.success) {
				order.is_accepted = 'accepted';
				pendingOrders = pendingOrders.sort((a: any, b: any) => {
					if (a.is_accepted === 'pending' && b.is_accepted !== 'pending') return -1;
					if (a.is_accepted !== 'pending' && b.is_accepted === 'pending') return 1;
					return 0;
				});
				console.log('Order confirmed ✅', data.order);
			} else {
				console.error('Error confirming order ❌', data.error);
			}
		} catch (err) {
			console.error('Request failed ❌', err);
		}
	}

	async function declineOrder(orderId: string, order: any) {
		try {
			console.log(order);
			const res = await fetch('/protected/seller/api/decline-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ order })
			});

			const data = await res.json();

			if (data.success) {
				order.is_accepted = 'declined';
				pendingOrders = pendingOrders.sort((a: any, b: any) => {
					if (a.is_accepted === 'pending' && b.is_accepted !== 'pending') return -1;
					if (a.is_accepted !== 'pending' && b.is_accepted === 'pending') return 1;
					return 0;
				});
				pendingOrders = [...pendingOrders];
				console.log('Order confirmed ✅', data.order);
			} else {
				console.error('Error confirming order ❌', data.error);
			}
		} catch (err) {
			console.error('Request failed ❌', err);
		}
	}

	async function loadDeals() {
		loadingDeals = true;
		errorDeals = null;

		try {
			const res = await fetch('/protected/seller/api/render-deals');
			if (!res.ok) throw new Error(`Failed to fetch deals: ${res.status}`);
			myDeals = await res.json();
		} catch (err) {
			console.error(err);
			errorDeals = 'Could not load deals.';
		} finally {
			loadingDeals = false;
		}
	}

	async function loadOrders() {
		loadingOrders = true;
		errorOrders = null;

		try {
			const res = await fetch('/protected/seller/api/render-orders');
			if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);

			const orders = await res.json();

			pendingOrders = orders.sort((a: any, b: any) => {
				if (a.is_accepted === 'pending' && b.is_accepted !== 'pending') return -1;
				if (a.is_accepted !== 'pending' && b.is_accepted === 'pending') return 1;
				return 0; // keep relative order for same status
			});

			console.log(pendingOrders);
		} catch (err) {
			console.error(err);
			errorOrders = 'Could not load orders.';
		} finally {
			loadingOrders = false;
		}
	}
	onMount(async () => {
		loadDeals();
	});

	async function loadChats() {
		try {
			const res = await fetch('/protected/seller/api/getChatrooms');

			if (!res.ok) {
				throw new Error(`Failed to load chats: ${res.status}`);
			}

			const data = (await res.json()) as { records: ChatRoom[] };

			return data.records;
		} catch (err) {
			console.error('Error loading chats:', err);
			return null;
		}
	}

	let currentView: string = 'listings';

	async function handleViewChange(view: string) {
		console.log('View changed to:', view);
		// you can call your fetch function here

		if (view === 'activeChats') {
			loadingChats = true;
			chatRooms = await loadChats();

			const enrichedRes = await fetch('/protected/seller/api/mapChatrooms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(chatRooms)
			});

			enriched = await enrichedRes.json();

			loadingChats = false;
		}
	}

	// reactive statement: runs whenever currentView changes
	$: handleViewChange(currentView);
</script>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 md:flex-row">
	<!-- Sidebar / Topbar (on mobile) -->
	<aside class="md:shadow-l-lg w-full bg-white p-4 shadow-lg md:w-64 md:border-b-0 md:p-6">
		<nav class="flex gap-2 overflow-x-auto md:flex-col md:space-y-3">
			<!-- Dashboard Header -->
				<button
					class="cursor-pointer items-center justify-center"	
					on:click={()=>{goto('/')}}
				>
					<ArrowLeftIcon />	
				</button>	
				<!-- <img
					src="/logo.svg"
					alt="Seller Dashboard"
					class="h-18 cursor-pointer object-contain drop-shadow-lg sm:h-14"
				/> -->
			
			<button
				class="flex-1 cursor-pointer rounded-lg px-4 py-2 text-left font-medium transition hover:bg-emerald-100
					md:w-full
					{currentView === 'listings' ? 'bg-emerald-200 text-emerald-800' : 'text-gray-700'}"
				on:click={() => (currentView = 'listings')}
			>
				📦 Listings
			</button>
			<!-- <button
				class="flex-1 cursor-pointer rounded-lg px-4 py-2 text-left font-medium transition hover:bg-emerald-100
				md:w-full
				{currentView === 'activeOrders' ? 'bg-emerald-200 text-emerald-800' : 'text-gray-700'}"
				on:click={() => (currentView = 'activeOrders')}
			>
				🚚 Pending Orders
			</button>
			<button
				class="flex-1 cursor-pointer rounded-lg px-4 py-2 text-left font-medium transition hover:bg-emerald-100
				md:w-full
				{currentView === 'acceptedOrders' ? 'bg-emerald-200 text-emerald-800' : 'text-gray-700'}"
				on:click={() => (currentView = 'acceptedOrders')}
			>
				✅ Accepted Orders
			</button> -->
			<!-- <button
				class="flex-1 cursor-pointer rounded-lg px-4 py-2 text-left font-medium transition hover:bg-emerald-100
					md:w-full
					{currentView === 'myOrders' ? 'bg-emerald-200 text-emerald-800' : 'text-gray-700'}"
				on:click={() => (currentView = 'myOrders')}
			>
				🛒 My Orders
			</button> -->
			<!-- <button
				class="flex-1 cursor-pointer rounded-lg px-4 py-2 text-left font-medium transition hover:bg-emerald-100
					md:w-full
					{currentView === 'activeChats' ? 'bg-emerald-200 text-emerald-800' : 'text-gray-700'}"
				on:click={() => (currentView = 'activeChats')}
			>
				💬 Active Chats
			</button> -->
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 space-y-8 p-4 md:p-8">	

		<!-- Stats Cards -->
		{#if currentView !== 'activeChats'}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Active Listings"
					value={myDeals.length}
					colorClass="text-green-600"
					icon="📦"
				/>
				<!-- <StatCard
					title="Pending Orders"
					value={pendingOrders.filter((order) => order.is_accepted === 'pending').length}
					colorClass="text-orange-500"
					icon="🚚"
				/> -->
				<!-- 
				<StatCard
					title="My Orders"
					value={pendingOrders.filter(order => order.is_accepted === "pending").length}
					colorClass="text-yellow-500"
					icon="🛒"
				/> 
				-->
			</div>
		{/if}

		<!-- View Switcher -->
		{#if currentView === 'listings'}
			<Listings
				{myDeals}
				{loadingDeals}
				on:addListing={addListing}
				on:editListing={(e) => editListing(e.detail)}
				on:deleteListing={(e) => {
					openDeleteModal(e.detail);
				}}
			/>
		{:else if currentView === 'activeOrders'}
			<Orders
				{pendingOrders}
				{loadingOrders}
				on:confirmOrder={(e) => confirmOrder(e.detail.orderId, e.detail.order)}
				on:declineOrder={(e) => declineOrder(e.detail.orderId, e.detail.order)}
			/>
		{:else if currentView == 'acceptedOrders'}
			<AcceptedOrders
				acceptedOrders={pendingOrders.filter((order) => order.is_accepted === 'accepted')}
				{loadingOrders}
			/>
			<!-- {:else if currentView === 'activeChats'}
			{#if loadingChats}
				<div class="flex h-32">
					<p class="p-4">Loading Chats...</p>
					<div
						class="flex h-10 w-10 animate-spin rounded-full border-4 border-solid border-black border-t-transparent"
					></div>
				</div>
			{:else}
				<ActiveChats {enriched} />
			{/if} -->
		{/if}
	</main>
</div>

{#if showModal}
	<SellerListingModal
		mode={modalMode}
		deal={selectedDeal}
		on:closeModal={() => (showModal = false)}
		on:addListing={(e) => {
			sendAddListingToServer(e.detail);
			showModal = false;
		}}
		on:updateListing={(e) => {
			sendEditListingToServer(e.detail);
			showModal = false;
		}}
		on:deleteListing={(e) => {
			openDeleteModal(e.detail.deal);
			showModal = false;
		}}
	/>
{/if}

<DeleteModal
	open={showDeleteModal}
	dealTitle={dealToDelete?.title || ''}
	on:close={() => (showDeleteModal = false)}
	on:confirm={handleDeleteConfirm}
/>
