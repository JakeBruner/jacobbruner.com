// # * add "type": "module" to package.json
// import json

// with open("./game-of-life/pkg/package.json", "r+") as file:
//     data = json.load(file)
//     data.update({"type": "module"})
//     file.seek(0)
//     json.dump(data, file, indent=4)

//     print('[fixwasm.py]: Added "type": "module" to package.json.')

//* add "type": "module" to package.json

import fs from "fs";
import path from "path";

const file = path.join("/../game-of-life/pkg/package.json");
const data = fs.readFileSync(file, "utf8");
data.update({ type: "module" });
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('[fixwasm.py]: Added "type": "module" to package.json.');
