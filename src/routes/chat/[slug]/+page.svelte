<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { onMount, tick } from 'svelte';
  import { loadMessages, subscribeToMessages, sendMessage, type Message } from '$lib/utils/chat';

  let { data } = $props();
  const slug = data.slug;
  const user = data.user;

  let messages: Message[] = $state([]);
  let newMessage = $state("");

  // References
  let messagesContainer: HTMLDivElement;
  let bottom: HTMLDivElement;

  onMount(async () => {
    messages = await loadMessages(slug);

    const unsub = await subscribeToMessages(slug, (m) => {
      // replace array so $state sees a new value
      messages = [...messages, m];
    });

    return () => unsub();
  });

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

<div class="chat flex h-[100dvh] flex-col bg-gray-50">
  <!-- Sticky Header -->
  <div
    class="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3"
  >
    <button
      class="cursor-pointer rounded-full p-2 hover:bg-gray-100 active:scale-95"
      on:click={() => { history.back() }}
      aria-label="Back"
    >
      <ArrowLeft class="h-12 w-12 text-orange-700 sm:h-11 sm:w-11" />
    </button>

    <!-- Chat partner name -->
    <h2
      class="truncate text-2xl font-semibold text-gray-800 sm:text-base md:text-3xl"
    >
      Chatting with Guest!
    </h2>
  </div>

  <!-- Messages area -->
  <div
    class="messages flex-1 overflow-y-auto p-3 space-y-3 sm:p-4"
    bind:this={messagesContainer}
  >
    {#each messages as m}
      <div
        class="flex {m.sender_id === user.id ? 'justify-end' : 'justify-start'}"
      >
        <div
          class="max-w-[80%] rounded-lg px-3 py-2 sm:max-w-[70%] sm:px-4 sm:py-2
            {m.sender_id === user.id
              ? 'bg-orange-400 text-white'
              : 'bg-gray-200 text-gray-800'}"
        >
          {#if m.sender_id != user.id}
            <p
              class="mb-1 text-md font-semibold underline text-gray-700 sm:mb-1.5"
            >
              {m.sender_name}
            </p>
          {/if}
          <p class="break-words text-2xl">{m.text}</p>
        </div>
      </div>
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
      class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 sm:px-4 sm:text-base"
    />
    <button
      type="submit"
      class="cursor-pointer shrink-0 rounded-lg bg-orange-400 px-4 py-2 text-xl font-medium text-white hover:bg-orange-500 active:scale-95 sm:px-5 sm:py-2.5 sm:text-base"
    >
      Send
    </button>
  </form>
</div>
