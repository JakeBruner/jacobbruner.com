<script lang="ts">
  import { fade } from "svelte/transition";
  let hidePopup = false;
</script>

<div
  class="fixed z-[200] sm:!hidden inset-0 w-full h-full bg-black/40 transition-all ease-in-out"
  style:visibility={hidePopup ? "hidden" : "visible"}
  transition:fade
  on:click={() => (hidePopup = true)}
  on:keypress={(e) => {
    if (e.key === "Escape") {
      hidePopup = true;
    }
  }}
>
  <div class="m-5 mt-20">
    <div class="w-full flex flex-col p-3 rounded-lg bg-white dark:bg-zinc-800 shadow-xl">
      <span class="flex absolute h-4 w-4 top-0 right-0 mr-[.75em] mt-[4em]">
        <span
          class="animate-ping duration-300 absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
        />
        <span class="relative inline-flex rounded-full h-4 w-4 bg-primary" />
      </span>
      <h3 class="pt-2 mx-auto text-xl font-semibold tracking-wide">
        It looks like you're on mobile!
      </h3>
      <p class="px-2 text-center whitespace-normal pt-2 text-zinc-500 dark:text-zinc-300">
        This part of the site in particular isn't made/optimized for viewing on mobile because of
        the difficulty styling all of the procedurally generated maths. For this reason, this is
        best viewed on a computer.
      </p>
      <span class="text-right px-4 !no-underline">—Jacob</span>
      <h6 class="italic pl-2 text-zinc-400">Tap to dismiss.</h6>
    </div>
  </div>
</div>
