<script lang="ts">
	import { onMount } from 'svelte';

	type Chat = {
		id: string;
		productImage: string;
		productName: string;
		contactPerson: string;
		lastMessageTime: string;
		lastMessage: string;
		hasUnseenMessages: boolean;
	};

	let chats: Chat[] = [];
	let page = 1;
	const perPage = 10;
	let loading = false;
	let hasMore = true;

	async function loadChats() {
		if (loading || !hasMore) return;
		loading = true;

		try {
			const res = await fetch(`/api/loadActiveChats?page=${page}&perPage=${perPage}`);
			if (!res.ok) throw new Error('Failed to fetch chats');

			const data = await res.json();
			chats = [...chats, ...data.activeChats];
			hasMore = data.hasMore;
			page += 1;
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function openChat(chatId: string) {
		console.log('Opening chat:', chatId);
	}

	// load first page on mount
	onMount(loadChats);

	// Infinite scroll observer
	function handleScroll(e: Event) {
		const el = e.target as HTMLElement;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
			loadChats();
		}
	}
</script>

<!-- Chat list container -->
<div class="h-screen overflow-y-auto" on:scroll={handleScroll}>
	{#each chats as chat}
		<div
			on:click={() => openChat(chat.id)}
			class="flex cursor-pointer items-start border-b p-3 hover:bg-gray-50"
		>
			<img src={chat.productImage} alt={chat.productName} class="h-12 w-12 rounded-md" />

			<div class="ml-3 flex-1">
				<p class="font-semibold">{chat.productName}</p>
				<p class="text-sm text-gray-600">
					{chat.contactPerson} — {chat.lastMessageTime}
				</p>
				<p class="truncate text-gray-700">{chat.lastMessage}</p>
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
</div>
