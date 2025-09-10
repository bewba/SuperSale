<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { onMount, tick } from 'svelte';
	import {
		loadMessages,
		subscribeToMessages,
		enterChatroom,
		sendMessage,
		leaveChatroom,
		type Message,
		type SystemMessage
	} from '$lib/utils/chat';
	import { getPb } from '$lib/pocketbase/pb.client';
	import { supabase } from '$lib/supabase/supabaseClient';

	let { data } = $props();
	const slug = data.slug;
	const user = data.user;
	const hasSession = data.session;

	let messages = $state<(Message | SystemMessage)[]>([]);
	let newMessage = $state('');
	let hasPbAccount = false;

	let showEmailPrompt = $state(false);
	let email = $state('');
	let presenceTimer: ReturnType<typeof setTimeout> | null = null;

	// References
	let messagesContainer: HTMLDivElement;
	let bottom: HTMLDivElement;

	const pb = getPb();

	onMount(() => {
		let unsub: () => void;
		let unsubPresence: () => void;
		let presenceTimer: ReturnType<typeof setTimeout> | null = null;

		(async () => {
			messages = await loadMessages(slug);

			unsub = await subscribeToMessages(slug, (m) => {
				messages = [...messages, m];
			});

			enterChatroom(slug, user.id);

			if (!hasSession) {
				try {
					hasPbAccount = await pb.collection('users').getFirstListItem(`user_id = "${user}"`);
					console.log(hasPbAccount);
				} catch (err) {}
			}

			unsubPresence = await pb.collection('chatroom_presence').subscribe('*', (e) => {
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

					// if someone else joins, cancel the 10s timer
					if (e.action === 'create' && e.record.user_id !== user.id) {
						if (presenceTimer) {
							clearTimeout(presenceTimer);
							presenceTimer = null;
						}
					}
				}
			});

			// start 10s timer when current user joins
			presenceTimer = setTimeout(async () => {
				showEmailPrompt = true;
				console.log('hello');
				console.log('hello 2', showEmailPrompt);
				let hasEmail = false;

				try {
					const chatRoom = await pb.collection('chat_rooms').getOne(slug);

					const { buyer, seller } = chatRoom;

					const otherParticipantId = buyer.trim() === user.id.trim() ? seller : buyer;

					try {
						hasEmail = await pb
							.collection('users')
							.getFirstListItem(`user_id = "${otherParticipantId}"`);
					} catch (err) {
						// not found → stay false
						hasEmail = false;
					}

					console.log(hasEmail);

					const res = await fetch(`/chat/${slug}/api/sendMessageNotification`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							recipient: otherParticipantId,
							hasEmail: hasEmail
						})
					});

					if (!res.ok) {
						console.error('Failed to send notification', await res.text());
					} else {
						console.log('Notification sent successfully');
					}
				} catch (err) {
					console.error('Error sending notification:', err);
				}
			}, 10000);
		})();

		// cleanup
		return () => {
			unsub?.();
			unsubPresence?.();
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

		console.log(user.id);

		const user_id = user.id;

		console.log(user_id, email);

		try {
			if (!hasSession) {
				const { data, error } = await pb.collection('users').create({
					user_id: user_id,
					email: email
				});

				console.log(data, error);
			}
			console.log('Saved email to PB for fingerprint:', user);
		} catch (err) {
			console.error('Error saving email notification:', err);
		}
	}

	async function handleSend() {
		if (!newMessage.trim()) return;
		await sendMessage(slug, newMessage, user);
		newMessage = '';
	}

	// Auto-scroll whenever on new message sent
	$effect(() => {
		// Read a reactive dependency so this effect re-runs
		const _len = messages.length;

		// Wait for DOM to update, then scroll
		tick().then(() => {
			bottom?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
	});
</script>

<!-- TODO: 
1. send an email with the link to the pocketbase 
2. add a password to each chatroom so that we can bypass the chats via URL 
3. guests who provided their emails will be able to receive an email
(Flow: 1. check PB if they have an email assoc with fp, 2. pass it to the request handler, dont read
sb anymore ) -->

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

		<!-- Chat partner name -->
		<h2 class="truncate text-2xl font-semibold text-gray-800 sm:text-base md:text-3xl">
			Chatting with Guest!
		</h2>
	</div>

	<!-- Messages area -->
	<div class="messages flex-1 space-y-3 overflow-y-auto p-3 sm:p-4" bind:this={messagesContainer}>
		{#each messages as m}
			{#if m.isSystem}
				<!-- System message -->
				<div class="flex justify-center">
					<p class="text-sm text-gray-500 italic">{m.text}</p>
				</div>
			{:else}
				<!-- Normal message -->
				<div class="flex {m.sender_id === user.id ? 'justify-end' : 'justify-start'}">
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
					</div>
				</div>
			{/if}
		{/each}

		<!-- Sentinel element to scroll into view -->
		<div bind:this={bottom} aria-hidden="true"></div>
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
	<!-- Overlay -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
		<!-- Modal -->
		<form
			on:submit|preventDefault={handleEmailSubmit}
			class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
		>
			<h2 class="mb-3 text-lg font-semibold text-gray-800">Hey! 👋</h2>
			<p class="mb-5 text-sm leading-relaxed text-gray-600">
				It looks like the person you’re chatting with is currently offline. Leave us your email and
				we’ll notify you once they’re back online.
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
