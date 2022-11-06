// app.html

const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const setColorTheme = (isDarkMode: boolean) => {
  if (isDarkMode) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#18181b");
  }
};
// run on load
setColorTheme(colorSchemeQueryList);
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (list: MediaQueryListEvent) => setColorTheme(list.matches));
