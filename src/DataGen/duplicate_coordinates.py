import json

with open('../PokemonData/CheckData.json', 'r') as file:
    data = json.load(file)

found_coords = set()
for check in data:
    coord = (check["coordinates"]["x"], check["coordinates"]["y"])
    if coord in found_coords:
        print(check["region"], check["name"])
    else:
        found_coords.add(coord)

# with open('../PokemonData/ItemIcons.json', 'w') as file:
#     json.dump(out, file, indent=2)