import {
    convertDate
} from '$lib/utils';

export async function GET() {
    const allPostFiles =
        import.meta.globEager('./*/*.{svx,md}'); // this should be made page-speceifc
    // "exposes context-specific metadata to a JavaScript module"
    // in this case its the metadata within the --- header
    const allPosts = Object.entries(allPostFiles).map(([path, post]) => {
        // maps each post to this mega object
        const postPath = path.slice(2, -3);
        // slice takes off the ./ and .md
        return {
            ...post.metadata,
            path: postPath,
            published: convertDate(post.metadata.date)
        };
    });

    // TODO add other sorting methods/options
    const posts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!posts.length) { // if no posts
        return {
            status: 404
        };
    }
    return {
        body: {
            posts
        }
    };
}