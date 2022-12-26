import {
  isValidBlogType,
  convertDateToString,
  type FullPost,
  type BlogType,
  type ImportedPost,
  correctBlogTags
} from "$lib/blog/blog";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

// type data = {
//   post: FullPost;
//   blog: BlogType;
// };

export async function load({ params }: ServerLoadEvent) {
  // console.log(params.blog);
  let errormessage: string | null = null;
  try {
    if (params.blog) {
      isValidBlogType(params.blog);
      const post: ImportedPost = await import(`../../../../posts/${params.blog}/${params.post}.md`);

      const tagsArr = post.metadata.tags?.split(", ");
      // with error handling

      const tags = tagsArr ? (correctBlogTags(tagsArr) ? tagsArr : undefined) : undefined;

      const unicodedate = new Date(post.metadata.date);
      const aFullPost: FullPost = {
        title: post.metadata.title,
        date: post.metadata.date,
        formatteddate: convertDateToString(unicodedate),
        html: post.default.render().html,
        videoid: post.metadata?.videoid,
        audiopath: post.metadata?.audiopath,
        pdfpath: post.metadata?.pdfpath,
        tags
      } as const;
      return {
        post: aFullPost,
        subject: params.blog
      };
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
