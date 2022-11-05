// PostInfo provides the nessecary information about a post to be displayed in the grid "blog homepage" layout

// note that BlogType cant inherit from navigating because not all pages (e.g., /photography) have blogs
// this 'type ailias' is really just for type safety on the functions below
// as an array, it also acts as a 'checker' for /[blog]/[slug]/+page.server.ts since it exists in compile time

export type BlogType = "Computer-Science" | "Math" | "Music" | "Writing"; // "Computer-Science" | "Math" | "Music" | "Writing";
// this type is used on [slug]/+page.server.ts endpoints to construct the glob path fed into the fn below

/** Checks if parameter is a valid blog type */
export const isValidBlogType = (string: string): string is BlogType => {
  return ["Computer-Science", "Math", "Music", "Writing"].includes(string);
};
// console.log(isValidBlogType("Computer-Science"));

// export interface SearchParamaters {
//   // keywords: string;
// }

// once i implement search parameters this should take in (query: SearchParamaters = {}, subject)
export const getPostsInfo = async (subject: BlogType): Promise<PostInfo[]> => {
  let modules: Record<string, () => Promise<ImportedPost>>;

  switch (subject) {
    case "Computer-Science":
      // prettier-ignore
      modules = import.meta.glob<ImportedPost>("/src/posts/Computer-Science/*.md", { eager: false });
      break;
    case "Math":
      modules = import.meta.glob<ImportedPost>("/src/posts/Math/*.md", { eager: false });
      break;
    case "Music":
      modules = import.meta.glob<ImportedPost>("/src/posts/Music/*.md", { eager: false });
      break;
    case "Writing":
      modules = import.meta.glob<ImportedPost>("/src/posts/Writing/*.md", { eager: false });
      break;
    default:
      throw new Error("i really dont know how we got here");
  }
  // this should handle every possible 'error-prone' case

  const iterableModules = Object.entries(modules);
  // the type of this is [url, () => Promise]

  const postlist: PostInfo[] = await Promise.all(
    // mapping over the promise monad
    iterableModules.map(async ([url, module]) => {
      // .map just happens to do what i need
      const { metadata }: ImportedPost = await module();

      const utcdate = new Date(metadata.date);

      return {
        title: metadata.title,
        excerpt: metadata.excerpt,
        date: metadata.date,
        formatteddate: convertDateToString(utcdate),
        thumbnailpath: metadata.thumbnailpath,
        slug: getPath(url) ?? "error",
        utctimestamp: utcdate.getTime()
      };

      // return {
      //   slug: getPath(url) ?? "error",
      //   title: metadata?.title,
      //   excerpt: metadata?.excerpt,
      //   date: utcdate,
      //   datestring: convertDateToString(utcdate),
      //   thumbnailpath: metadata?.thumbnailpath ? metadata.thumbnailpath : null
      // };
    })
  );

  // sort with null check
  postlist.sort((a, b) => b.utctimestamp - a.utctimestamp);

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

// * Types for blog

export interface ImportedPost {
  metadata: {
    title: string;
    excerpt: string;
    date: string;
    thumbnailpath: string;
    videoid?: string;
    audiopath?: string;
    pdfpath?: string;
  };
  default: {
    render: () => {
      // eek
      html: string;
    };
  };
}

export type FullPost = Omit<
  ImportedPost["metadata"],
  keyof { excerpt: string; thumbnailpath: string }
> & { formatteddate: string; html: string };

// type Unwanted = {
//   videoid?: string;
//   audiopath?: string;
//   pdfpath?: string;
// };

// export type PostInfo = Omit<ImportedPost["metadata"], keyof Unwanted> & {
//   slug: string;
//   datestring: string;
//   utctimestamp: number;
// };
export type PostInfo = {
  title: string;
  excerpt: string;
  date: string;
  formatteddate: string;
  thumbnailpath: string;
  slug: string;
  utctimestamp: number;
};

// * Helper Functions *
/** removes everything from imported url except the name of post */
const getPath = (path: string): string | undefined => path.split("/").at(-1)?.replace(".md", "");

/** converts Date object to string `January 2nd, 2021` */
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
    "December"
  ];

  const day = date.getDate() + 1;
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
