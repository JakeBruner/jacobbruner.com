// import type vite/client
// I HATE STRICT MODE
export interface Post {
  slug: string;
  title?: string;
  date: string;
  videoid?: string;
  audiopath?: string;
  pdfpath?: string;
  image?: string;
}
export type Post = { [index: string]: string };

export interface AllPosts {
  posts: Post[];
} // kinda pointless until i have more things that i want to be passed thru the monad

// export interface SearchParamaters {
//   // keywords: string;

// }

// export interface PostsData {
//   posts: Post[];
//   keywords: string[];
// }

const getPath = (path: string): string | undefined => path.split("/")?.at(-1)?.replace(".md", "");
// i want to marry typescript syntax, and negative array indexing
// sexy little monadic design pattern

// once i implement search parameters this should take in (query: SearchParamaters = {}, thispage)
export const getPostsGlob = (subject: string): AllPosts => {
  let postlist: Post[] = [];

  const rawPosts = import.meta.glob(`/src/posts/${subject}/*.md`, { eager: true }); // eager imports the module with sideeffects automatically
  // again, ideally this wouldn't fetch the entire page but oh well
  for (const key in rawPosts) {
    // const rawPost: object = rawPosts.key === undefined ? 0 : rawPosts[key];
    const rawPost = rawPosts[key] as Record<string, string[]>; // i hate strict mode

    const post: Post = {
      slug: typeof getPath(key) === undefined ? "slug-error" : (getPath(key) as string),
      date: rawPost["metadata"].date as string,
      ...rawPost["metadata"],
    };
    postlist.push(post);
  }

  postlist.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());

  // there should be logic to handle queries here

  return {
    posts: postlist,
  };
};

// for reference:
// glob works like so

// const modules = import.meta.glob('./dir/*.js')

//becomes:

// const modules = {
//   './dir/foo.js': () => import('./dir/foo.js'),
//   './dir/bar.js': () => import('./dir/bar.js')
// }

//or this with glob eager:

// import * as __glob__0_0 from './dir/foo.js'
// import * as __glob__0_1 from './dir/bar.js'
// const modules = {
//   './dir/foo.js': __glob__0_0,
//   './dir/bar.js': __glob__0_1
// }
