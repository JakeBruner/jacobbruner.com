<script lang="ts">
  import Post from "$components/Post.svelte";
  import type { PostInfo } from "$lib/blog/blog";
  const post: PostInfo = {
    title: "Test",
    excerpt: "This is a test",
    datestring: "2021-01-01",
    date: new Date().valueOf(),
    slug: "test",
    thumbnailpath: "thumbnails/eulerform.png"
  };
</script>

<div class="grid grid-cols-3 space-x-4 p-10">
  <Post {post} />
  <Post {post} />
  <Post {post} />
</div>
