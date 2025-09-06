<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let scrolled = false;
  // Track if page is scrolling
  onMount(() => {
    const update = () => scrolled = scrollY > 0;
    update();
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  });
</script>

<header
  class="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100 transition-transform duration-300"
  class:hidden={!scrolled}
>
  <div class="max-w-7xl mx-auto flex items-center justify-between p-4">
    <!-- Logo  -->
    <a href="/" class="flex items-center space-x-2">
      <img src="/logo.png" alt="logo-ugly.ph" class="h-10 w-auto" />
    </a>

    <!-- Seller button -->
    <button
      class="cursor-pointer bg-[#F76800] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e65e00] transition"
      on:click={() => goto("/protected/seller")}
    >
      Want to sell your surplus?
    </button>
  </div>
</header>