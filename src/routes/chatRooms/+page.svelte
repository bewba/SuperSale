<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getPb } from '$lib/pocketbase/pb.client';
	import { goto } from '$app/navigation';

	type Chat = {
		id: string;
		productImage: string;
		productName: string;
		contactPerson: string;
		lastMessageTime: string;
		lastMessage: string;
		seen_by: Record<string, string>;
	};

	function computeUnseen(chat: Chat): boolean {
		return !chat.seen_by?.[user.id];
	}

	export let data;
	const user = data?.user;

	console.log(user.id);

	let chats: Chat[] = [];
	let page = 1;
	const perPage = 10;
	let loading = false;
	let hasMore = true;
	let pb: any;
	let unsubscribe: (() => void) | null = null;

	async function loadChats(reset = false) {
		if (loading || (!hasMore && !reset)) return;
		loading = true;

		try {
			const currentPage = reset ? 1 : page;
			const res = await fetch(`/api/loadActiveChats?page=${currentPage}&perPage=${perPage}`);
			if (!res.ok) throw new Error('Failed to fetch chats');

			const data = await res.json();

			if (reset) {
				chats = data.activeChats.map((chat: Chat) => ({
					...chat,
					hasUnseenMessages: computeUnseen(chat)
				}));

				page = 2;
			} else {
				const newChats = data.activeChats
					.filter((newChat: Chat) => !chats.some((chat) => chat.id === newChat.id))
					.map((chat: Chat) => ({
						...chat,
						hasUnseenMessages: computeUnseen(chat)
					}));

				chats = [...chats, ...newChats];

				page += 1;
			}

			hasMore = data.hasMore;
			console.log(chats);
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function setupRealtimeSubscription() {
		if (!browser) return;

		try {
			// Get PocketBase instance from your app (adjust this based on your setup)
			pb = getPb();

			let userId = user.id;

			// Subscribe to chat_rooms collection changes
			unsubscribe = await pb.collection('chat_rooms').subscribe('*', async (e) => {
				const { action, record } = e;

				// Only handle changes for rooms where current user is buyer or seller
				if (record.buyer === userId || record.seller === userId) {
					if (action === 'create') {
						// New chat room created - refresh the list
						await loadChats(true);
					} else if (action === 'update') {
						const existingChatIndex = chats.findIndex((chat) => chat.id === record.id);

						if (existingChatIndex !== -1) {
							// Update existing chat in place
							try {
								const res = await fetch(
									`/api/loadActiveChats?page=1&perPage=1&chatId=${record.id}`
								);
								if (res.ok) {
									const data = await res.json();
									if (data.activeChats.length > 0) {
										let updatedChat = data.activeChats[0];

										// Recompute unseen status
										updatedChat = {
											...updatedChat,
											hasUnseenMessages: computeUnseen(updatedChat)
										};

										// Filter out any existing chat with the same ID
										chats = chats.filter((chat) => chat.id !== updatedChat.id);
										// Insert the updated one at the top
										chats = [updatedChat, ...chats];
									}
								}
							} catch (err) {
								console.error('Error updating chat:', err);
								// Fallback: refresh entire list
								await loadChats(true);
							}
						} else {
							// Chat not in current list, refresh to get it
							await loadChats(true);
						}
					} else if (action === 'delete') {
						// Chat room deleted
						chats = chats.filter((chat) => chat.id !== record.id);
					}
				}
			});

			console.log('Subscribed to chat_rooms collection');
		} catch (err) {
			console.error('Error setting up real-time subscription:', err);
		}
	}

	function openChat(chatId: string) {
		console.log('Opening chat:', chatId);
		goto(`/chat/${chatId}`);
	}

	// Infinite scroll observer
	function handleScroll(e: Event) {
		const el = e.target as HTMLElement;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
			loadChats();
		}
	}

	// Initialize component
	onMount(async () => {
		await loadChats(true);
		await setupRealtimeSubscription();
	});

	// Cleanup subscription on destroy
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
			console.log('Unsubscribed from chat_rooms collection');
		}
	});
</script>

<!-- Chat list container -->
<div class="h-screen overflow-y-auto" on:scroll={handleScroll}>
	{#each chats as chat}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			on:click={() => openChat(chat.id)}
			class="flex cursor-pointer items-center border-b border-gray-100 p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
		>
			<!-- Product Image -->
			<div class="relative">
				<img
					src={chat.productImage}
					alt={chat.productNameText}
					class="h-20 w-20 object-cover shadow-sm"
				/>
				{#if chat.hasUnseenMessages}
					<div
						class="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500"
					></div>
				{/if}
			</div>

			<!-- Chat Content -->
			<div class="ml-4 min-w-0 flex-1">
				<div class="flex items-baseline justify-between">
					<h3 class="truncate text-base font-medium text-gray-900">
						{chat.productNameText}
					</h3>
					<span class="ml-2 flex-shrink-0 text-xs text-gray-500">
						{new Date(chat.lastMessageTime).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</span>
				</div>

				<p class="mt-0.5 truncate text-xs text-gray-600">
					{chat.seller_name}
				</p>

				<p
					class={`text-md mt-1 truncate ${chat.hasUnseenMessages ? 'font-medium text-gray-900' : 'text-gray-500'}`}
				>
					{chat.lastMessage}
				</p>
			</div>
		</div>
	{/each}

	{#if loading}
		<p class="p-3 text-center text-gray-500">Loading…</p>
	{/if}

	{#if !hasMore && chats.length > 0}
		<p class="p-3 text-center text-gray-400">No more chats</p>
	{/if}

	{#if chats.length === 0 && !loading}
		<p class="p-3 text-center text-gray-500">No active chats</p>
	{/if}
</div>
