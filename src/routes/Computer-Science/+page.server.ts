import { error } from "@sveltejs/kit";
import { convertDate } from "$lib/dateutils";

// TODO I should figure out a way to have only one of this file that can distinguish between which page the GET function was called from. Since this has to be 'subject' specefic, i.e., only music posts populate /music, I solve it now by copy and pasting this file multiple times. There is likely a better way to do this, especially if I want to add more sorting options.
export async function load() {
  const allPostFiles = import.meta.globEager("./*.{svx,md}"); // this should be made page-speceifc
  // "exposes context-specific metadata to a JavaScript module"
  // in this case its the metadata within the --- header
  const allPosts = Object.entries(allPostFiles).map(([path, post]) => {
    // maps each post to this mega object
    const postPath = path.slice(2, -3);
    // slice takes off the ./ and .md
    return {
      ...post.metadata,
      path: postPath,
      published: convertDate(post.metadata.date),
    };
  });
  // console.log(allPosts);

  // TODO add other sorting methods/options
  const data = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  try {
    if (!data.length) {
      // if no posts
      throw error(404, "blogposts not found here");
    }
  } catch (error) {
    throw error(404, "error");
  }

  return {
    data,
  };
}
// TODO make a "this website" post that has rainbow header text
