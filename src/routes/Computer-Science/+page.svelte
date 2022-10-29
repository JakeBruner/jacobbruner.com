<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$components/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Computer-Science" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>

<div class=" pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <!-- <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{page}</h2> -->
      <h2
        class="text-3xl tracking-tight font-semibold sm:text-4xl 

    "
      >
        <details
          class="open:bg-white dark:open:bg-zinc-900 open:ring-1 open:ring-black/5 open:py-3 open:pl-1.5 open:pr-3 dark:open:ring-zinc-300/10 dark:open:shadow-white/5 open:shadow-lg open:rounded-md open:lg:rounded-xl transition-all ease-in"
        >
          <!-- title="there also exists a coffee functor... Coffee :: (Monad m) => x -> m x, from which this website is a corolarry of a proof of it's existence" -->
          <summary class="select-none hover:translate-x-0.5 transition ease-in-out">
            CS :: Jacob → [String]
          </summary>
          <p
            class="p-5 text-lg lg:text-xl tracking-wide leading-tight dark:text-zinc-300 font-light text-zinc-500"
          >
            There also exists a coffee endofunctor, Coffee :: (Monad m) => x -> m x, from which this
            website is a corollary of its existence. Additionally there is a natural transformation
            η :: a . Coffee a -> Alcohol a, where Alcohol is a contravariant functor to the Lazy
            category. This forms a 'dinatural' Transformation :) Unfortunately the Alcohol functor
            has side-effects (namely liver damage), so the diagram technically wouldn't commute...
          </p>
        </details>
      </h2>
    </div>
    <PostsGrid {subject} posts={data.p} />
  </div>
</div>
