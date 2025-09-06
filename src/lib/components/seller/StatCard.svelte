<script lang="ts">
  export let title: string;
  export let value: number | string;
  export let colorClass: string = "text-gray-900"; // e.g. "text-green-600"
  export let icon: string = "📊"; // emoji or icon
</script>

<div
  class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl"
>
  <h3 class="text-sm font-extrabold">{title}</h3>
  <p class={`text-4xl font-extrabold ${colorClass}`}>{value}</p>
  <div class="absolute right-0 bottom-0 text-[100px] opacity-10">{icon}</div>
</div>
