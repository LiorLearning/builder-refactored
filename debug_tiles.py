import json

# Load the restricted tiles JSON
with open('restricted_tiles.json', 'r') as f:
    tiles = json.load(f)

print(f'Total tiles in JSON: {len(tiles)}')

# Check for tiles outside game range (-50 to 49)
out_of_range = []
valid_tiles = []
invalid_format = []

for tile in tiles:
    try:
        row, col = map(int, tile.split(','))
        if row < -50 or row >= 50 or col < -50 or col >= 50:
            out_of_range.append(tile)
        else:
            valid_tiles.append(tile)
    except:
        invalid_format.append(tile)
        print(f'Invalid tile format: {tile}')

print(f'Valid tiles (within -50 to 49): {len(valid_tiles)}')
print(f'Out of range tiles: {len(out_of_range)}')
print(f'Invalid format tiles: {len(invalid_format)}')

if out_of_range:
    print('\nFirst 10 out-of-range tiles:')
    for tile in out_of_range[:10]:
        row, col = map(int, tile.split(','))
        print(f'  {tile} (row: {row}, col: {col})')

# Check for duplicates
unique_tiles = set(tiles)
print(f'\nUnique tiles: {len(unique_tiles)}')
duplicates = len(tiles) - len(unique_tiles)
if duplicates > 0:
    print(f'Duplicate tiles found: {duplicates}')

# Find coordinate ranges
if valid_tiles:
    rows = []
    cols = []
    for tile in valid_tiles:
        row, col = map(int, tile.split(','))
        rows.append(row)
        cols.append(col)
    
    print(f'\nCoordinate ranges of valid tiles:')
    print(f'Rows: {min(rows)} to {max(rows)}')
    print(f'Cols: {min(cols)} to {max(cols)}')

print(f'\nExpected in-game count: {len(valid_tiles)}')
print(f'Actual in-game count: 349')
print(f'Difference: {len(valid_tiles) - 349}') 