import json

# Load the restricted tiles JSON
with open('restricted_tiles.json', 'r') as f:
    json_tiles = set(json.load(f))

print(f'JSON tiles: {len(json_tiles)}')

# Simulate the game's grid creation logic
game_tiles = set()
restricted_count = 0

# Game creates tiles from -50 to 49 (maxTiles = 50)
for row in range(-50, 50):
    for col in range(-50, 50):
        tileKey = f"{row},{col}"
        game_tiles.add(tileKey)
        
        # Check if this tile should be restricted
        if tileKey in json_tiles:
            restricted_count += 1

print(f'Game grid tiles: {len(game_tiles)}')
print(f'Game restricted tiles: {restricted_count}')

# Find tiles that are in JSON but not processed by game
missing_tiles = json_tiles - game_tiles
if missing_tiles:
    print(f'\nTiles in JSON but outside game grid: {len(missing_tiles)}')
    print('Missing tiles:', sorted(list(missing_tiles))[:10])
else:
    print('\n✓ All JSON tiles are within game grid')

# Find tiles that should be restricted but might not be
if len(json_tiles) == restricted_count:
    print('\n✓ All JSON tiles should be marked as restricted in game')
else:
    print(f'\n❌ Mismatch: JSON has {len(json_tiles)}, game should mark {restricted_count}')

# Check coordinate ranges more carefully
rows = []
cols = []
for tile in json_tiles:
    row, col = map(int, tile.split(','))
    rows.append(row)
    cols.append(col)

min_row, max_row = min(rows), max(rows)
min_col, max_col = min(cols), max(cols)

print(f'\nJSON coordinate ranges:')
print(f'Rows: {min_row} to {max_row}')
print(f'Cols: {min_col} to {max_col}')

# Check if any tiles are exactly at boundaries
boundary_tiles = []
for tile in json_tiles:
    row, col = map(int, tile.split(','))
    if row == -50 or row == 49 or col == -50 or col == 49:
        boundary_tiles.append(tile)

if boundary_tiles:
    print(f'\nTiles at grid boundaries: {len(boundary_tiles)}')
    print('Boundary tiles:', boundary_tiles[:10]) 