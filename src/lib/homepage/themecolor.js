// app.html

const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)");

const setColorTheme = (colorScheme) => {
  if (colorScheme.matches) {
    // if dark mode
    // change meta
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#18181b");
  }
};
// run on load
setColorTheme(colorSchemeQueryList);
colorSchemeQueryList.addEventListener("change", setColorTheme);
