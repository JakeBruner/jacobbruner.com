import { getPostsInfo, type PostInfo, type BlogType } from "$lib/blog/blog";

/** @type {import('./$types').PageServerLoad} */
export async function load(): Promise<{ p: PostInfo[] }> {
  // no need for async since getPostsInfo is async

  const subject: BlogType = "Computer-Science";

  const allposts: Promise<PostInfo[]> = getPostsInfo(subject);
  // console.log((await postlist) + " from page.server.ts");

  // (await postlist).forEach((e) => {
  //   console.log(e);
  // });

  return {
    p: await allposts,
  };
  // return has to be object type, not array
  //! this solution is confusing, but necessary for this to behave as type PostInfo[]
  // https://kit.svelte.dev/docs/load
}

// TODO make a "this website" post that has rainbow header text