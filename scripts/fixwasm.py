import json
from pathlib import Path

manifest = Path(__file__).resolve().parents[1] / "game-of-life" / "pkg" / "package.json"
data = json.loads(manifest.read_text())
data["type"] = "module"
data["main"] = "./game_of_life.js"
data["exports"] = {
    ".": {"types": "./game_of_life.d.ts", "import": "./game_of_life.js"},
    "./game_of_life_bg.wasm": "./game_of_life_bg.wasm",
}
manifest.write_text(json.dumps(data, indent=2) + "\n")

print("[fixwasm.py]: Ensured ES module entry points in the generated package.")
