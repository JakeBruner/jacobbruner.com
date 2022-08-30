<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Computer-Science" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>
<!-- ! PLEASE put tailwind utilityclasses into components, this looks miserable. in $lib/blog -->
<!-- TODO add a way to have a thumbnail for some posts -->
<div class=" pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <!-- <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{page}</h2> -->
      <h2
        class="text-3xl tracking-tight font-semibold sm:text-4xl 

    "
      >
        <details
          class="open:bg-white dark:open:bg-slate-900 open:ring-1 open:ring-offset-[15px] open:ring-black/5 dark:open:ring-white/10 open:shadow-2xl open:rounded-xl"
        >
          <!-- title="there also exists a coffee functor... Coffee :: (Monad m) => x -> m x, from which this website is a corolarry of a proof of it's existence" -->
          <summary class="select-none"> CS :: Jacob → [String] </summary>
          <p class="p-5 text-xl dark:text-zinc-400 text-zinc-500 font-medium">
            <!-- TODO make this look nicer on mobile -->
            There also exists a coffee endofunctor, Coffee :: (Monad m) => x -> m x, from which this
            website is a corollary of it's existence. Additionally there is a natural transformation
            η :: a . Coffee a -> Alcohol a, where Alcohol is a contravarient functor to the Lazy category.
            This forms a 'dinatural' Transformation :D. Unfortunately the Alcohol functor has side-effects
            (namely liver damage), so the diagram techincally wouldn't commute.
          </p>
        </details>
      </h2>
    </div>
    <div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
      {#each data.p as post}
        <div
          class="border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg flex flex-col justify-between transition ease-in-out duration-200  hover:shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[101%]"
        >
          <a href="/{subject}/{post.slug}" sveltekit:prefetch>
            <p class="text-xl font-medium dark:text-zinc-100 text-zinc-800">{post.title}</p>
            <p class="mt-3 dark:text-zinc-400 text-zinc-500">{post.excerpt}</p>
          </a>
          <div class="mt-6">
            <div class="text-sm dark:text-zinc-400 text-zinc-500">
              <time datetime="2020-03-16">{post.datestring}</time>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
