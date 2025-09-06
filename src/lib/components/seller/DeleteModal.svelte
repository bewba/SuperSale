<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let dealTitle = "";

  function close() {
    dispatch("close");
  }
  function confirm() {
    dispatch("confirm");
  }
</script>

<svelte:window on:keydown={(e) => open && e.key === "Escape" && close()} />

{#if open}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/50"
    role="dialog"
    aria-modal="true"
  >
    <div class="relative w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <button
        type="button"
        aria-label="Close"
        class="cursor-pointer absolute top-3 right-3 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
        on:click={close}
      >
        ✕
      </button>

      <h2 class="mb-2 text-xl font-bold text-gray-900">Delete Deal</h2>
      <p class="mb-6 text-gray-600">
        Are you sure you want to delete <span class="font-semibold">{dealTitle}</span>? This action cannot be undone.
      </p>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          on:click={close}
          class="cursor-pointer rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={confirm}
          class="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}
