<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getPb } from '$lib/pocketbase/pb.client';

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
		const seenTime = chat.seen_by?.[user.id];
		if (!seenTime) return true; // never seen

		const lastSeen = new Date(seenTime);
		const lastMessage = new Date(chat.lastMessageTime);

		return lastMessage > lastSeen;
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
		<div
			on:click={() => openChat(chat.id)}
			class="flex cursor-pointer items-start border-b p-3 hover:bg-gray-50"
		>
			<img
				src={chat.productImage}
				alt={chat.productNameText}
				class="h-12 w-12 rounded-md object-cover"
			/>

			<div class="ml-3 flex-1">
				<p class={`text-sm ${chat.hasUnseenMessages ? 'font-bold' : 'font-medium'}`}>
					{chat.productNameText}
				</p>
				<p
					class={`text-xs ${chat.hasUnseenMessages ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
				>
					{new Date(chat.lastMessageTime).toLocaleString()}
				</p>
				<p
					class={`truncate ${chat.hasUnseenMessages ? 'font-semibold text-black' : 'text-gray-700'}`}
				>
					{chat.lastMessage}
				</p>
			</div>

			{#if chat.hasUnseenMessages}
				<span class="ml-2 font-bold text-blue-500">•</span>
			{/if}
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
