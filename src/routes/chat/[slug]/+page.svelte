<script lang="ts">
	import { ArrowLeft, ShoppingCart } from '@lucide/svelte';
	import { onMount, tick } from 'svelte';
	import ChatDeal from '$lib/components/chat/ChatDeal.svelte';
	import {
		loadMessages,
		subscribeToMessages,
		enterChatroom,
		sendMessage,
		leaveChatroom,
		type Message,
		type SystemMessage
	} from '$lib/utils/chat';
	import { getPb, getPbBackground } from '$lib/pocketbase/pb.client';
	import type { Deal } from '$lib/types/types.js';

	let { data } = $props();
	const slug = data.slug;
	const user = data.user;
	const hasSession = data.session;
	const deal = data.deal;
	let selectedDeal = $state<Deal>({} as Deal);
	let showDealModal = $state(false);

	let messages = $state<(Message | SystemMessage)[]>([]);
	let newMessage = $state('');
	let hasPbAccount = $state(false);
	let otherParticipantOnline = $state(false);
	let emailSent = $state(false);

	let showEmailPrompt = $state(false);
	let email = $state('');

	// ADDED: Track if first message has been sent to control when timer starts
	let firstMessageSent = $state(false);

	// References
	let messagesContainer: HTMLDivElement;
	let bottom: HTMLDivElement;

	const pb = getPb();
	const pbBackground = getPbBackground();

	// ADDED: Variable to store the timer reference at module level
	let presenceTimer: ReturnType<typeof setTimeout> | null = null;

	// ADDED: Track which messages have been marked as seen to avoid duplicate updates
	let seenMessageIds = new Set<string>();

	// ADDED: Intersection Observer for tracking message visibility
	let messageObserver: IntersectionObserver | null = null;

	// Helper function to mark messages as seen
	async function markMessagesAsSeen(messageIds: string[]) {
		if (messageIds.length === 0) return;

		try {
			// Filter out messages that have already been marked as seen
			const unseenMessageIds = messageIds.filter((id) => !seenMessageIds.has(id));
			if (unseenMessageIds.length === 0) return;

			// Fetch chatroom once
			const chatRoom = await pbBackground.collection('chat_rooms').getOne(slug);
			const seenBy = chatRoom.seen_by || {};

			// Prepare promises
			const updates: Promise<any>[] = [];

			// ✅ Update all unseen messages in parallel
			for (const messageId of unseenMessageIds) {
				updates.push(pbBackground.collection('messages').update(messageId, { is_seen: true }));
				seenMessageIds.add(messageId);
			}

			// ✅ Update chatroom seen_by once if user not marked
			if (!seenBy[user.id]) {
				updates.push(
					pbBackground.collection('chat_rooms').update(slug, {
						seen_by: {
							...seenBy,
							[user.id]: new Date().toISOString()
						}
					})
				);
			}

			await Promise.all(updates);

			console.log(`✅ Marked ${unseenMessageIds.length} messages as seen`);
		} catch (err) {
			console.error('Error marking messages as seen:', err);
		}
	}

	// ADDED: Function to handle message visibility
	function handleMessageVisibility(entries: IntersectionObserverEntry[]) {
		const visibleMessageIds: string[] = [];

		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const messageElement = entry.target as HTMLElement;
				const messageId = messageElement.dataset.messageId;
				const senderId = messageElement.dataset.senderId;

				// Only mark messages from other users as seen (not our own messages)
				if (messageId && senderId && senderId !== user.id && !seenMessageIds.has(messageId)) {
					visibleMessageIds.push(messageId);
				}
			}
		});

		if (visibleMessageIds.length > 0) {
			// Debounce the API calls - wait a bit before marking as seen
			setTimeout(() => {
				markMessagesAsSeen(visibleMessageIds);
			}, 500);
		}
	}

	// ADDED: Set up intersection observer
	function setupMessageObserver() {
		if (messageObserver) {
			messageObserver.disconnect();
		}

		messageObserver = new IntersectionObserver(handleMessageVisibility, {
			root: messagesContainer,
			rootMargin: '0px',
			threshold: 0.5 // Message is considered seen when 50% visible
		});
	}

	// ADDED: Observe message elements
	function observeMessages() {
		if (!messageObserver) return;

		// Observe all message elements
		const messageElements = messagesContainer?.querySelectorAll('[data-message-id]');
		messageElements?.forEach((element) => {
			messageObserver!.observe(element);
		});
	}

	// Helper function to check if other participant has email in PocketBase
	async function checkOtherParticipantEmail(otherParticipantId: string): Promise<boolean> {
		try {
			await pbBackground.collection('users').getFirstListItem(`user_id = "${otherParticipantId}"`);
			console.log('Other participant found in PB with email');
			return true;
		} catch {
			console.log('Other participant not found in PB or no email');
			return false;
		}
	}

	// Helper function to check if other participant is currently online
	async function checkOtherParticipantOnline(otherParticipantId: string): Promise<boolean> {
		try {
			const presenceRecords = await pbBackground.collection('chatroom_presence').getFullList({
				filter: `chatroom_id = "${slug}" && user_id = "${otherParticipantId}"`
			});
			return presenceRecords.length > 0;
		} catch {
			return false;
		}
	}

	async function startNotificationTimer() {
		// Clear any existing timer first
		if (presenceTimer) {
			clearTimeout(presenceTimer);
		}

		presenceTimer = setTimeout(async () => {
			// Show email prompt for current user if needed
			if (!hasSession && !hasPbAccount) {
				showEmailPrompt = true;
			}

			// Only send notification to OTHER participant if they're NOT online
			if (!otherParticipantOnline) {
				try {
					const chatRoom = await pbBackground.collection('chat_rooms').getOne(slug);
					const { buyer, seller } = chatRoom;
					const otherParticipantId = buyer.trim() === user.id.trim() ? seller : buyer;

					// Double-check if OTHER participant is still offline
					const stillOffline = !(await checkOtherParticipantOnline(otherParticipantId));

					if (stillOffline) {
						// Check if OTHER participant has email in PocketBase
						const otherParticipantHasEmail = await checkOtherParticipantEmail(otherParticipantId);

						console.log('Other participant has email in PB:', otherParticipantHasEmail);
						console.log('Sending notification to offline participant');

						// Send notification request
						const res = await fetch(`/chat/${slug}/api/sendMessageNotification`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								recipient: otherParticipantId,
								hasEmail: otherParticipantHasEmail // true = check PB, false = check Supabase
							})
						});

						if (!res.ok) {
							console.error('Failed to send notification', await res.text());
						} else {
							console.log('Notification request sent successfully');
							emailSent = true;

							// Add system message to show email was sent
							messages = [
								...messages,
								{
									id: crypto.randomUUID(),
									text: `📧 We've notified the other participant that you're waiting to chat!`,
									sender_id: null,
									sender_name: null,
									isSystem: true
								}
							];
						}
					} else {
						console.log('Other participant came online, skipping notification');
					}
				} catch (err) {
					console.error('Error in notification process:', err);
				}
			} else {
				console.log('Other participant is online, no notification needed');
			}
		}, 10000);
	}

	onMount(() => {
		let unsub: () => void;
		let unsubPresence: () => void;

		// Setup intersection observer
		setupMessageObserver();

		// Load messages
		loadMessages(slug).then((msgs) => {
			messages = msgs;
			// Set up observer after messages are loaded
			tick().then(() => {
				observeMessages();
			});
		});

		// Subscribe to messages
		subscribeToMessages(slug, (m) => {
			messages = [...messages, m];
			// Re-observe messages when new ones arrive
			tick().then(() => {
				observeMessages();
			});
		}).then((sub) => {
			unsub = sub;
		});

		// Enter chatroom
		enterChatroom(slug, user.id);

		// Check if CURRENT user has PB account (for email prompt)
		if (!hasSession) {
			(async () => {
				try {
					const pbAccount = await pbBackground
						.collection('users')
						.getFirstListItem(`user_id = "${user.id}"`);
					hasPbAccount = true;
					console.log('Current user PB account found:', pbAccount);
				} catch (err) {
					hasPbAccount = false;
					console.log('No PB account found for current user:', user.id);
				}
			})();
		}

		// Initial check for other participant's online status
		(async () => {
			try {
				const chatRoom = await pbBackground.collection('chat_rooms').getOne(slug);
				const { buyer, seller } = chatRoom;
				const otherParticipantId = buyer.trim() === user.id.trim() ? seller : buyer;
				otherParticipantOnline = await checkOtherParticipantOnline(otherParticipantId);
			} catch (err) {
				console.error('Error checking other participant status:', err);
			}
		})();

		// Presence subscription
		pb.collection('chatroom_presence')
			.subscribe('*', (e) => {
				if (e.record.chatroom_id === slug) {
					const text =
						e.action === 'create'
							? `A user joined the chatroom`
							: e.action === 'delete'
								? `A user left the chatroom`
								: null;

					if (text) {
						messages = [
							...messages,
							{
								id: crypto.randomUUID(),
								text,
								sender_id: null,
								sender_name: null,
								isSystem: true
							}
						];
					}

					// Update online status when other user joins/leaves
					if (e.record.user_id !== user.id) {
						otherParticipantOnline = e.action === 'create';

						// Cancel timer if another user joins
						if (e.action === 'create' && presenceTimer) {
							clearTimeout(presenceTimer);
							presenceTimer = null;
						}
					}
				}
			})
			.then((sub) => {
				unsubPresence = sub;
			});

		// Cleanup
		return () => {
			unsub?.();
			unsubPresence?.();
			messageObserver?.disconnect();
			leaveChatroom(slug, user.id);
			if (presenceTimer) clearTimeout(presenceTimer);
		};
	});

	async function handleEmailSubmit() {
		if (!email.trim()) return;

		messages = [
			...messages,
			{
				id: crypto.randomUUID(),
				text: `Thanks! We'll notify you at ${email} once someone sends a message.`,
				sender_id: null,
				sender_name: null,
				isSystem: true
			}
		];
		showEmailPrompt = false;

		const user_id = user.id;
		console.log('Saving email for current user:', user_id, email);

		try {
			// Save current user's email to PB
			if (!hasSession) {
				const { data, error } = await pbBackground.collection('users').create({
					user_id,
					email: email.trim()
				});
				console.log('Saved current user email to PB:', data, error);
				hasPbAccount = true;
			}
		} catch (err) {
			console.error('Error saving email notification:', err);
		}
	}

	async function handleSend() {
		console.log('sending message');
		if (!newMessage.trim()) return;
		await sendMessage(slug, newMessage, user);
		await pbBackground.collection('chat_rooms').update(slug, {
			seen_by: {
				[user?.id]: new Date().toISOString()
			}
		});
		newMessage = '';

		if (!firstMessageSent) {
			firstMessageSent = true;
			startNotificationTimer();
		}
	}

	// Auto-scroll on new messages
	$effect(() => {
		const _len = messages.length;
		tick().then(() => {
			bottom?.scrollIntoView({ behavior: 'smooth', block: 'end' });
			// Re-observe messages after scrolling
			observeMessages();
		});
	});

	// Get the selected deal
	onMount(async () => {
		const res = await fetch(`/chat/${slug}/api/getSelectedDeal?uuid=${deal}`);
		if (res.ok) {
			const { deal: product } = await res.json();
			Object.assign(selectedDeal, product);
		}
	});
</script>

<div class="chat flex h-[100dvh] flex-col bg-gray-50">
	<!-- Sticky Header -->
	<div
		class="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3"
	>
		<button
			class="cursor-pointer rounded-full p-2 hover:bg-gray-100 active:scale-95"
			on:click={() => {
				history.back();
			}}
			aria-label="Back"
		>
			<ArrowLeft class="h-12 w-12 text-orange-700 sm:h-11 sm:w-11" />
		</button>

		<div class="flex flex-1 items-center justify-between">
			<h2 class="truncate text-2xl font-semibold text-gray-800 sm:text-base md:text-3xl">
				Chatting with Guest!
			</h2>

			<!-- Online status indicator -->
			<div class="flex items-center gap-2">
				<div
					class="h-3 w-3 rounded-full {otherParticipantOnline ? 'bg-green-500' : 'bg-gray-400'}"
				></div>
				<span class="hidden text-sm text-gray-600 sm:inline">
					{otherParticipantOnline ? 'Online' : 'Offline'}
				</span>
			</div>
		</div>
	</div>

	<button
		class="mx-auto mt-2 flex w-fit cursor-pointer rounded-xl bg-orange-500 px-4 py-3 text-2xl text-white shadow hover:bg-orange-600"
		on:click={() => (showDealModal = true)}
	>
		<ShoppingCart />
		<span class="ml-2">See product photos</span>
	</button>

	<!-- Messages area -->
	<div class="messages flex-1 overflow-y-auto p-3 sm:p-4" bind:this={messagesContainer}>
		<div class="flex min-h-full flex-col justify-end space-y-3">
			{#each messages as m, index}
				{#if m.isSystem}
					<div class="flex justify-center">
						<p class="text-sm text-gray-500 italic">{m.text}</p>
					</div>
				{:else}
					<!-- UPDATED: Added data attributes for intersection observer -->
					<div
						class="flex {m.sender_id === user.id ? 'justify-end' : 'justify-start'}"
						data-message-id={m.id}
						data-sender-id={m.sender_id}
					>
						<div
							class="max-w-[80%] rounded-lg px-3 py-2 sm:max-w-[70%] sm:px-4 sm:py-2
								{m.sender_id === user.id ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-800'}"
						>
							{#if m.sender_id != user.id}
								<p class="text-md mb-1 font-semibold text-gray-700 underline sm:mb-1.5">
									{m.sender_name}
								</p>
							{/if}
							<p class="text-2xl break-words">{m.text}</p>
							<!-- OPTIONAL: Show seen indicator for your own messages -->
							{#if m.sender_id === user.id && m.is_seen}
								<p class="mt-1 text-right text-xs text-gray-300">✓ Seen</p>
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			<div bind:this={bottom} aria-hidden="true"></div>
		</div>
	</div>

	<!-- Input area -->
	<form
		on:submit|preventDefault={handleSend}
		class="flex items-center gap-2 border border-gray-300 bg-white p-2 sm:p-3"
	>
		<input
			bind:value={newMessage}
			placeholder="Type a message..."
			class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none sm:px-4 sm:text-base"
		/>
		<button
			type="submit"
			class="shrink-0 cursor-pointer rounded-lg bg-orange-400 px-4 py-2 text-xl font-medium text-white hover:bg-orange-500 active:scale-95 sm:px-5 sm:py-2.5 sm:text-base"
		>
			Send
		</button>
	</form>
</div>

{#if showEmailPrompt && hasSession != true && hasPbAccount != true}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
		<form
			on:submit|preventDefault={handleEmailSubmit}
			class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
		>
			<h2 class="mb-3 text-lg font-semibold text-gray-800">Hey! 👋</h2>
			<p class="mb-5 text-sm leading-relaxed text-gray-600">
				It looks like the person you're chatting with is currently offline. Leave us your email and
				we'll notify you once they're back online.
			</p>

			<input
				type="email"
				placeholder="Enter your email"
				bind:value={email}
				class="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
				       focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
			/>

			<button
				type="submit"
				class="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white
				       transition-transform hover:bg-orange-600 active:scale-95"
			>
				Save
			</button>
		</form>
	</div>
{/if}

{#if showDealModal}
	<ChatDeal {selectedDeal} on:close={() => (showDealModal = false)} />
{/if}
