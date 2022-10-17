<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$lib/blog/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Math" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>
<div class="bg-zinc-800 group">
  <div class="w-full -mt-[60px] h-auto bg-zinc-800 flex flex-col px-2">
    <video
      class="flex bg-inherit pt-16 w-full lg:w-1/2 md:w-2/3 mx-auto"
      autoplay
      playsinline
      loop
      muted
    >
      <source src="videos/ComplexFourierTransform.webm" type="video/webm" />
      <source src="videos/ComplexFourierTransform2.mp4" type="video/mp4" />
      <track kind="captions" />
    </video>
    <p
      class="self-end justify-self-end -mb-[27px] italic dark:text-zinc-300/70 text-zinc-700 group-hover:-translate-x-2 transition-all duration-300 ease-out text-xs md:text-md lg:text-lg pb-2 lg:pb-0"
    >
      Discrete Complex Fourier Series of my initials as a 2d path
    </p>
  </div>
</div>

<div class="sm:pt-10 pt-8  pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{subject}</h2>
    </div>
    <PostsGrid {subject} posts={data.p} />
  </div>
</div>
