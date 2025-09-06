<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let acceptedOrders: any[] = [];
  export let loadingOrders: boolean = false;

  const dispatch = createEventDispatcher();
</script>

<section>
  <h2 class="mb-6 text-2xl font-bold">Accepted Orders</h2>

  {#if loadingOrders}
    <div class="flex h-32 items-center gap-3">
      <p class="p-4">Loading orders...</p>
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-solid border-black border-t-transparent"
      ></div>
    </div>
  {:else if acceptedOrders.length > 0}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {#each acceptedOrders as order}
        <div class="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <!-- Order header -->
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">{order.customerName}</h2>
            <span
              class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
            >
              Accepted
            </span>
          </div>

          <!-- Deal Info -->
          <div class="mb-3">
            <p class="text-sm text-gray-500">Deal</p>
            <p class="font-medium text-gray-900">{order.deal_title}</p>
          </div>

          <!-- Product Info -->
          <div class="mb-3 space-y-1">
            <p class="text-sm text-gray-500">Product</p>
            <p class="font-medium text-gray-900">{order.products?.title}</p>
            <p class="text-sm text-black">
              Listed as: ₱{order.products?.discount_price}
            </p>
          </div>

          <!-- Price & Quantity -->
          <div class="mb-3 grid grid-cols-2 gap-2 text-sm">
            <div class="rounded-lg bg-gray-50 p-2">
              <p class="text-gray-500">Quantity</p>
              <p class="font-medium text-gray-900">{order.quantity}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-2">
              <p class="text-gray-500">Total</p>
              <p class="font-medium text-gray-900">₱{order.totalPrice}</p>
            </div>
            <div class="col-span-2 rounded-lg bg-gray-50 p-2">
              <p class="text-gray-500">Price per Unit</p>
              <p class="font-medium text-gray-900">
                ₱{(parseFloat(order.totalPrice) / order.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="mb-3 space-y-1 text-sm text-gray-600">
            <p><span class="font-semibold">📞 Contact:</span> {order.contactNumber}</p>
            <p><span class="font-semibold">✉️ Email:</span> {order.email}</p>
          </div>

          <!-- Created At -->
          <p class="mb-4 text-xs text-gray-400">
            Ordered on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-gray-500 italic">No accepted orders yet.</div>
  {/if}
</section>
