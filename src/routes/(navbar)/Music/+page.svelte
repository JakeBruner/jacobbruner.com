<script lang="ts">
  // export const prerender = true;
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$components/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Music" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>

<div class="pt-8 md:pt-16 pb-20 px-4 sm:px-6 lg:pt-18 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{subject}</h2>
    </div>
    <div class="pt-10 pb-8">
      <h2 class="pl-2 md:pl-4 text-xl md:text-2xl text-zinc-700 dark:text-zinc-300 font-bold">
        Performances:
      </h2>
      <div
        class="mt-8 flex flex-col lg:flex-row space-y-5 pb-1 lg:space-y-0 lg:justify-center lg:align-middle"
      >
        <div class="flex-1">
          <div
            class="relative max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto"
            style="aspect-ratio: 16/9;"
          >
            <!-- TODO: change embed to better video -->
            <iframe
              class="rounded-md caption h-full w-full"
              src="https://www.youtube-nocookie.com/embed/LcVxi56DaYY"
              title="YouTube video player"
              frameborder="0"
              allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <p class="w-full text-center italic font-light">
            Gaspard de la Nuit: 1. Ondine — Maurice Ravel
          </p>
        </div>

        <div class="hidden lg:block lg:p-5" />

        <div class="flex-1">
          <div
            class="relative max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto"
            style="aspect-ratio: 16/9;"
          >
            <iframe
              class="rounded-md caption h-full w-full"
              src="https://www.youtube-nocookie.com/embed/7rCl4E-YNSI "
              title="YouTube video player"
              frameborder="0"
              allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <p class="w-full text-center italic font-light">Jeux d'eau — Maurice Ravel</p>
        </div>
      </div>
    </div>
    <h2 class="pl-2 md:pl-4 text-xl md:text-2xl text-zinc-700 dark:text-zinc-300 font-bold -mb-6">
      Compositions and Analysis:
    </h2>
    <PostsGrid {subject} posts={data.p} />
  </div>
</div>

<style>
  .caption::after {
    content: "";
    position: absolute;
    bottom: 0;
    text-align: center;
  }
</style>
