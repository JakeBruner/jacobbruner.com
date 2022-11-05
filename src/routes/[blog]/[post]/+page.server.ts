import {
  isValidBlogType,
  convertDateToString,
  type FullPost,
  type BlogType,
  type ImportedPost
} from "$lib/blog/blog";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

// type data = FullPost & BlogType //! figure out how to do this once i get internet
type data = [FullPost, BlogType];

export async function load({ params }: ServerLoadEvent): Promise<data | undefined> {
  // console.log(params.blog);
  let errormessage: string | null = null;
  try {
    if (params.blog) {
      if (isValidBlogType(params.blog)) {
        const post: ImportedPost = await import(`../../../posts/${params.blog}/${params.post}.md`);
        // this throws an error if the post doesn't exist
        const unicodedate = new Date(post.metadata.date);
        const aFullPost: FullPost = {
          title: post.metadata.title,
          date: post.metadata.date,
          formatteddate: convertDateToString(unicodedate),
          html: post.default.render().html,
          videoid: post.metadata?.videoid,
          audiopath: post.metadata?.audiopath,
          pdfpath: post.metadata?.pdfpath
        };
        return [aFullPost, params.blog];
      } else {
        errormessage = `Invalid blog type: "${params.blog}"`;
      }
    }
  } catch {
    errormessage = `Post "${params.post}" not found under ${params.blog}`;
  } finally {
    if (errormessage) {
      // this isn't race conditions because errormessage should be empty
      // eslint-disable-next-line no-unsafe-finally
      throw error(404, errormessage);
    }
  }
}

//* now this sends descriptive errors 11/5
