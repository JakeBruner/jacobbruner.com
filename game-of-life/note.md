# What I've figured out so far...

Vite doesn't play well with importing the generated npm package as a ESM Module. Even though it specfies "module": "foo.js" whereas vite needs "type": "module". I need to figure out how to get wasm-pack to generate the correct package.json. As for how to do that, I'm clueless :)

Update 10/8: /scripts/fixwasm.py runs on `npm run build:wasm` and fixes the package.json

https://stackoverflow.com/questions/61401475/why-is-type-module-in-package-json-file 
https://blog.logrocket.com/es-modules-in-node-today/
https://github.com/webpack/webpack/issues/4674 
https://dev.to/bnb/implicit-esm-in-node-js-with-type-module-np
