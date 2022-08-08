<script>
  export let posts;
  const page = "Math";
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{page}</title>
</svelte:head>

<div class="w-full h-auto bg-zinc-800 -mt-[68px]">
  <video class="flex px-5 pt-16 lg:w-1/2 md:w-2/3 mx-auto" autoplay loop muted>
    <source src="videos/ComplexFourierTransform.webm" type="video/webm" />
    <source src="videos/ComplexFourierTransform2.mp4" type="video/mp4" />
    <track kind="captions" />
  </video>
</div>

<!-- TODO add a way to have a thumbnail for some posts -->
<div class="sm:pt-10 pt-8  pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{page}</h2>
    </div>
    <div class="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-10">
      {#each posts as post}
        <div
          class="border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg flex flex-col justify-between transition ease-in-out duration-200 hover:shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[101%]"
        >
          <a href="/{page}/{post.path}" sveltekit:prefetch>
            <p class="text-xl font-medium dark:text-zinc-100 text-zinc-800">{post.title}</p>
            <p class="mt-3 dark:text-zinc-400 text-zinc-500">{post.excerpt}</p>
          </a>
          <div class="mt-6">
            <div class="text-sm dark:text-zinc-400 text-zinc-500 italic font-thin">
              <time datetime="2020-03-16">{post.published}</time>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
