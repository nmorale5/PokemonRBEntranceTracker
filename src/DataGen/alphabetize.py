import json

# Read the JSON data from the file
with open('../PokemonData/WarpDataCopy.json', 'r') as file:
    data = json.load(file)

# Sort the data by keys alphabetically
sorted_data = dict(sorted(data.items()))

# Write the sorted data back to the JSON file
with open('../PokemonData/WarpDataCopy.json', 'w') as file:
    json.dump(sorted_data, file, indent=2)