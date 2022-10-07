import { isValidBlogType, convertDateToString, type FullPost } from "$lib/blog/blog";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }: ServerLoadEvent): Promise<FullPost> {
  // TODO 10/7 ts doesnt understand the typing here... {params}: S
  // TODO this isnt strongly typed yet... i should implement a post class with all the frontmatter properties
  // console.log(params.blog);
  try {
    if (params.blog) {
      if (isValidBlogType(params.blog)) {
        const post = await import(`../../../posts/${params.blog}/${params.post}.md`);
        const unicodedate = new Date(post.metadata.date);
        const aFullPost: FullPost = {
          title: post.metadata.title,
          date: convertDateToString(unicodedate),
          content: post.default.render().html,
          videoid: post.metadata?.videoid,
          audiopath: post.metadata?.audiopath,
          pdfpath: post.metadata?.pdfpath
        };
        return aFullPost;
      } else {
        throw error(400, "Not a valid blog type passed to /[blog]/[post]/*.md");
        // throw new Error("Not a valid blog type passed to /[blog]/[post]/*.md");
      }
    }
  } catch (e: any) {
    throw error(404, e);
  }
}
