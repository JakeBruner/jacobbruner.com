<script lang="ts">
  import type { PostInfo, BlogTags } from "$lib/blog/blog";
  import { BlogTagColors } from "$lib/blog/blog";
  import { fly } from "svelte/transition";
  export let post: PostInfo;
  const tags = post?.tags;
  export let subject = "";
  export let id = 0;
  //TODO strong typing
</script>

<div
  class="group rounded-lg bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-md hover:shadow-lg self-center transition ease-in-out duration-200 dark:shadow-white/5 hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 hover:scale-[100.5%] hover:-translate-y-1"
  in:fly={{ x: 0, y: -30, duration: 700, delay: id * 40, opacity: 0 }}
>
  <!--* if there is no subject, link directly to the slug -->
  <a href={subject ? subject + "/" + post.slug : post.slug}>
    {#if post.thumbnailpath}
      <div
        class="group-hover:contrast-[90%] border-b-2 border-zinc-100 rounded-t-lg aspect-w-16 lg:aspect-h-9 aspect-h-7 w-full bg-cover bg-center min-w-full transition ease-in-out duration-200"
        style="background-image: url({post.thumbnailpath})"
      />
    {/if}
    <div class="p-4 self-end">
      <p class="text-xl font-medium dark:text-zinc-100 text-zinc-800">{post.title}</p>
      {#if post.excerpt}
        <p class="text-base text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
      {/if}
      <div class="-ml-0.5 flex flex-row space-x-1 py-1" class:py-0.5={tags}>
        {#if tags}
          {#each tags as tag}
            <div class="rounded-3xl py-1 px-2" style:background-color={BlogTagColors[tag]}>
              <span class="text-xs relative block text-zinc-100">{tag}</span>
            </div>
          {/each}
        {/if}
      </div>
      <div class="">
        <div class="text-sm dark:text-zinc-400/60 text-zinc-500">
          <time>{post.formatteddate}</time>
        </div>
      </div>
    </div>
  </a>
</div>
