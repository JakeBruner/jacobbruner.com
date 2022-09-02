// PostInfo provides the nessecary information about a post to be displayed in the grid "blog homepage" layout
export interface PostInfo {
  slug: string;
  title: string;
  excerpt: string;
  date: number;
  datestring: string;
  thumbnailpath?: string;
}

// note that BlogType cant inherit from navigating because not all pages (e.g., /photography) have blogs
// this 'type ailias' is really just for type safety on the functions below
// as an array, it also acts as a 'checker' for /[blog]/[slug]/+page.server.ts since it exists in compile time

export type BlogType = "Computer-Science" | "Math" | "Music" | "Writing"; // "Computer-Science" | "Math" | "Music" | "Writing";
// this type is used on [slug]/+page.server.ts endpoints to construct the glob path fed into the fn below

export const isValidBlogType = (string: string): string is BlogType => {
  return ["Computer-Science", "Math", "Music", "Writing"].includes(string);
};
// console.log(isValidBlogType("Computer-Science"));

// export interface SearchParamaters {
//   // keywords: string;
// }

// once i implement search parameters this should take in (query: SearchParamaters = {}, subject)
export const getPostsInfo = async (subject: BlogType): Promise<PostInfo[]> => {
  // TODO implement this function without <any> generic
  // type should be Record<string, () => Promise<NodeModule>>
  let modules: Record<string, () => Promise<any>>;

  switch (subject) {
    case "Computer-Science":
      modules = import.meta.glob<any>("/src/posts/Computer-Science/*.md", { eager: false });
      break;
    case "Math":
      modules = import.meta.glob<any>("/src/posts/Math/*.md", { eager: false });
      break;
    case "Music":
      modules = import.meta.glob<any>("/src/posts/Music/*.md", { eager: false });
      break;
    case "Writing":
      modules = import.meta.glob<any>("/src/posts/Writing/*.md", { eager: false });
      break;
    default:
      throw new Error("i really dont know how we got here");
  }
  // this should handle every possible 'error-prone' case

  const iterableModules = Object.entries(modules)!;
  // the type of this is [url, () => Promise]

  const postlist: PostInfo[] = await Promise.all(
    // mapping over the promise monad
    iterableModules.map(async ([url, module]) => {
      // .map just happens to do what i need
      const { metadata } = await module();

      const utcdate = new Date(metadata?.date);

      return {
        slug: getPath(url),
        title: metadata?.title,
        excerpt: metadata?.excerpt,
        date: utcdate.valueOf(), // quick fix for sveltekit 1.0.0-next.422 requiring json serialization
        datestring: convertDateToString(utcdate),
        thumbnailpath: metadata?.thumbnailpath ? metadata.thumbnailpath : null,
        // TODO this isnt type safe i dont think. I need errorhandeling for when not all these properties exist
      };
    })
  );

  postlist.sort((a, b) => b.date - a.date);

  // there should be logic to handle queries here

  return postlist;
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

// * Parametric Url Path Helpers *

export interface FullPost {
  title: string;
  date: string;
  content: any; //! hmm
  videoid?: string;
  audiopath?: string;
  pdfpath?: string;
  // TODO thumbnail
}

// * Helper Functions *

const getPath = (path: string) => path.split("/").at(-1).replace(".md", "");
// sexy little monadic design pattern
// TODO make this function take both types

export const convertDateToString = (date: Date): string => {
  const listmonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let dayth: string;
  switch (
    day % 10 // first digit
  ) {
    case 1:
      dayth = day + "st";
      break;
    case 2:
      dayth = day + "nd";
      break;
    case 3:
      dayth = day + "rd";
      break;
    default:
      dayth = day + "th";
  } // there might be a better way to do this but whatever :) it looks funny

  return `${listmonths[month]} ${dayth}, ${year}`;
};
