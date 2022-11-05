import { writable } from "svelte/store";

// type IsLoading = boolean;
// type Overlay = boolean;
// export type Loading = [IsLoading, Overlay];

export const loading = writable(false);

// const loading = writable<Loading>([false, false]);

// export default {
//   subscribe: loading.subscribe,
//   set: loading.set,
//   start: () => loading.set([true, false]),
//   stop: () => loading.set([false, false]),
//   overlay: () => loading.set([true, true]),
//   stopOverlay: () => loading.set([false, false])
// };
