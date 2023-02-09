<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  import { BlogTagColors } from "$lib/blog/blog";
  import { fly } from "svelte/transition";
  import { hexToRGB } from "$lib/blog/tags";
  import { c } from "$lib/c";
  export let post: PostInfo;
  const tags = post?.tags;
  export let subject = "";
  export let id = 0;

  let _classes: string | undefined = undefined;
  export { _classes as class };

</script>

<div
  class={c("group rounded-lg bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-md hover:shadow-lg self-center transition ease-in-out duration-200 dark:shadow-white/5 hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:scale-[100.5%] hover:-translate-y-1", _classes)}
  in:fly={{ x: 0, y: -30, duration: 700, delay: id * 40, opacity: 0 }}
>
  <!--* if there is no subject, link directly to the slug -->
  <a href={subject ? subject + "/" + post.slug : post.slug}>
    {#if post.thumbnailpath}
      <div
        class="group-hover:contrast-[90%] border-b-2 dark:border-zinc-800 border-zinc-100 rounded-t-lg aspect-w-16 lg:aspect-h-9 aspect-h-7 w-full bg-cover bg-center min-w-full transition ease-in-out duration-200"
        style="background-image: url({post.thumbnailpath})"
      />
    {/if}
    <div class="p-4 self-end">
      <p class="text-xl font-medium dark:text-zinc-100 text-zinc-800">{post.title}</p>
      {#if post.excerpt}
        <p class="text-base text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
      {/if}

      {#if tags}
        <div class="-ml-[1px] flex flex-row space-x-1 pt-1.5">
          {#each tags as tag}
            {@const color = hexToRGB(BlogTagColors[tag])}
            <div
              class="cursor-default rounded-full py-1 px-2"
              style="background-color: rgba({color}, 0.3);"
            >
              <span
                class="text-xs relative block opacity-100 brightness-[.6] dark:!brightness-150"
                style="color: rgba({color}, 1);">{tag}</span
              >
            </div>
          {/each}
        </div>
      {/if}

      <div class="pt-3" class:pt-0.5={tags}>
        <div class="text-sm dark:text-zinc-400/60 text-zinc-500">
          <time>{post.formatteddate}</time>
        </div>
      </div>
    </div>
  </a>
</div>
