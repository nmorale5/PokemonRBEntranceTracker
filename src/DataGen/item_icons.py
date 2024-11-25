import json

with open('../PokemonData/items.json', 'r') as file:
    data = json.load(file)

out = { item["name"]: item["img"] for item in data if "img" in item }

with open('../PokemonData/ItemIcons.json', 'w') as file:
    json.dump(out, file, indent=2)