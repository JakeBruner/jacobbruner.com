<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  export let subject: string;
  export let posts: PostInfo[];
</script>

<div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12 content-center">
  {#each posts as post}
    <Post {post} {subject} />
  {/each}
</div>
