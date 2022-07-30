<script>
  import "/src/app.css";
  import { convertDate } from "$lib/utils.js";
  export let title;
  export let date;
  export let videoid;
  export let audiopath;
</script>

<div class="h-screen flex flex-col">
  <!-- <div
    class="fixed top-0 left-0 right-0 z-1 bg-white px-2 sm:px-4 py-3.5 h-[76px]"
  >
    J
  </div> -->
  <div
    class="relative mx-auto max-w-[100ch] overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8"
  >
    <span
      class="block cursor-pointer"
      on:click="{() => {
        history.back();
      }}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="inline h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
      </svg>
      back
    </span>
    <h2 class="my-4 text-4xl font-semibold">{title}</h2>
    <p class="my-4 text-gray-500">{convertDate(date)}</p>
    {#if videoid}
      <div class="w-full aspect-w-16 aspect-h-9">
        <iframe
          src="https://www.youtube.com/embed/{videoid}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          title=""></iframe>
      </div>
    {/if}
    {#if audiopath}
      <div class="mb-4">
        <audio type="mp3" controls>
          <source src="{audiopath}" />
        </audio>
      </div>
    {/if}
    <div
      class="prose prose-lg prose-slate first-letter:text-3xl first-letter:primary"
    >
      <!-- firstletter isnt working here... not sure why -->
      <slot />
    </div>
  </div>
</div>
