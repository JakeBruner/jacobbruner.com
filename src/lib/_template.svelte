<script>
  import "/src/app.css";
  import { convertDate } from "$lib/dateutils.js";
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
  <div class="relative mx-auto max-w-[100ch] overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
    <span
      class="group cursor-pointer"
      on:click={() => {
        history.back();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="inline h-6 w-6 group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
      </svg>
      <p class="inline group-hover:-translate-x-5">back</p>
      <!-- why wont this work? -->
    </span>
    <h2 class="my-4 text-4xl font-semibold">{title}</h2>
    <p class="my-4 text-zinc-500 dark:text-zinc-400">{convertDate(date)}</p>
    {#if videoid}
      <div class="w-full aspect-w-16 aspect-h-9">
        <iframe
          src="https://www.youtube.com/embed/{videoid}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          title=""
        />
      </div>
    {/if}
    {#if audiopath}
      <div class="mb-4">
        <audio type="mp3" controls>
          <source src={audiopath} />
        </audio>
      </div>
    {/if}
    <div
      class="w-full prose lg:prose-xl prose-zinc dark:prose-invert first-letter:text-3xl first-letter:primary"
    >
      <!-- firstletter isnt working here... not sure why -->
      <slot />
    </div>
  </div>
</div>
