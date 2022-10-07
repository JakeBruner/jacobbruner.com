# * add "type": "module" to package.json
import json

with open("./game-of-life/pkg/package.json", "r+") as file:
    data = json.load(file)
    data.update({"type": "module"})
    file.seek(0)
    json.dump(data, file, indent=4)

    print('[fixwasm.py]: Added "type": "module" to package.json.')
