class IsometricGridScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IsometricGridScene' });
        this.tileSize = 64; // Size of the diamond tile
        this.gridSize = 10; // 10x10 grid
        this.tiles = [];
        this.draggedItem = null;
        this.placedItems = new Map(); // Map to store placed items with their positions
        this.selectedItem = null; // Track the currently selected item
        this.zoomLevel = 1; // Track current zoom level
        this.minZoom = 1; // Minimum zoom level (100% of original size)
        this.maxZoom = 2; // Maximum zoom level (200% of original size)
        this.baseScale = 1; // Base scale for all elements
        this.developerMode = false; // Developer mode state
        this.restrictionMode = false; // Tile restriction mode
        this.restrictedTiles = new Set(); // Set to store restricted tile coordinates
        this.devModeKeySequence = ''; // Store key sequence for developer mode
        this.devModeTimeout = null; // Timeout for key sequence reset
        this.tileStates = new Map(); // Map to store tile states
        this.coins = 0; // Track number of coins
        // Icon configuration for yOffset and scale
        this.iconConfig = {
            tree:   { yOffset: this.tileSize / 4,      scale: 1.2 },
            grass:  { yOffset: this.tileSize / 4 + 6,  scale: 1 },
            grass1: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            flower: { yOffset: this.tileSize / 4 + 5,  scale: 1},
            flower2: { yOffset: this.tileSize / 4 + 3,  scale: 1},
            fence:  { yOffset: this.tileSize / 4 + 10,  scale: 1},
            fence2: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            fencecorner: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            fencecorner2: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            edge1: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            edge2: { yOffset: this.tileSize / 4 + 10,  scale: 1},
            timmy: { yOffset: this.tileSize / 4 + 5,  scale: 1.2},
        };
        this.toolbarExpanded = false; // Start closed
        
        // Initialize sprite counters for each icon type
        this.spriteCounters = new Map();
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'fencecorner2', 'edge1', 'edge2', 'timmy'];
        iconKeys.forEach(key => {
            this.spriteCounters.set(key, 3); // Start with 3 sprites for each type
        });
    }

    preload() {
        this.load.image('tree', 'assets/tree.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('grass', 'assets/grass.png');
        this.load.image('grass1', 'assets/grass1.png');
        this.load.image('flower', 'assets/fiower.png');
        this.load.image('flower2', 'assets/flower2.png');
        this.load.image('fence', 'assets/fence.png');
        this.load.image('fence2', 'assets/fence2.png');
        this.load.image('fencecorner', 'assets/fencecorner.png');
        this.load.image('fencecorner2', 'assets/fencecorner2.png');
        this.load.image('edge1', 'assets/edge1.png');
        this.load.image('edge2', 'assets/edge2.png');
        this.load.image('timmy', 'assets/timmy.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('shop', 'assets/shop.png');
    }

    create() {
        // Create grid layer
        this.gridLayer = this.add.container(0, 0); // Use a container for all grid content
        
        // Add the background image to grid layer
        const bg = this.add.image(0, 0, 'ground');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        bg.setDepth(-1000);
        this.gridLayer.add(bg);

        // Load restricted tiles before creating the grid
        this.loadRestrictedTiles().then(() => {
            // Create the grid in grid layer
            this.createGrid();

            // Launch UI scene
            this.scene.launch('UIScene', { 
                parentScene: this,
                tileSize: this.tileSize,
                iconConfig: this.iconConfig,
                coins: this.coins
            });

            // Add reset zoom button to top right
            this.createResetZoomButton();

            // Handle window resize
            this.scale.on('resize', this.handleResize, this);

            // Add spacebar event listener for quiz
            this.input.keyboard.on('keydown-SPACE', () => {
                this.showQuizDialog();
            });

            // Add wheel event listener for zoom
            this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
                const zoomDelta = deltaY > 0 ? -0.1 : 0.1;
                const newZoom = Phaser.Math.Clamp(this.zoomLevel + zoomDelta, this.minZoom, this.maxZoom);
                
                if (newZoom !== this.zoomLevel) {
                    // Get world point under pointer before zoom
                    const worldX = (pointer.x - this.gridLayer.x) / this.zoomLevel;
                    const worldY = (pointer.y - this.gridLayer.y) / this.zoomLevel;

                    this.zoomLevel = newZoom;
                    this.gridLayer.setScale(this.zoomLevel);

                    // After scaling, adjust gridLayer position so the point under the cursor stays fixed
                    this.gridLayer.x = pointer.x - worldX * this.zoomLevel;
                    this.gridLayer.y = pointer.y - worldY * this.zoomLevel;
                }
            });
        });

        // Add keyboard delete functionality
        const deleteHandler = () => {
            console.log('Delete key pressed');
            if (this.selectedItem) {
                console.log('Selected item found, attempting to delete');
                // Find and remove the item from placedItems
                for (const [key, item] of this.placedItems.entries()) {
                    if (item === this.selectedItem) {
                        console.log('Item found in placedItems, removing');
                        // Debug logs
                        console.log('Selected item textureKey:', item.textureKey);
                        console.log('Current sprite counters:', Object.fromEntries(this.spriteCounters));
                        
                        // Increment sprite counter for the deleted item type
                        const textureKey = item.textureKey;
                        const currentCount = this.spriteCounters.get(textureKey);
                        console.log('Current count for', textureKey, ':', currentCount);
                        
                        this.spriteCounters.set(textureKey, currentCount + 1);
                        console.log('New count for', textureKey, ':', currentCount + 1);
                        
                        // Update UI scene with new counter value
                        this.scene.get('UIScene').updateSpriteCounter(textureKey, currentCount + 1);
                        
                        item.destroy();
                        this.placedItems.delete(key);
                        this.selectedItem = null;
                        break;
                    }
                }
            } else {
                console.log('No item selected');
            }
        };

        // Listen for both Delete and Backspace keys
        this.input.keyboard.on('keydown-DELETE', deleteHandler);
        this.input.keyboard.on('keydown-BACKSPACE', deleteHandler);

        // Add developer mode key sequence handler
        this.input.keyboard.on('keydown', (event) => {
            // Handle developer mode sequence
            if (this.devModeTimeout) {
                clearTimeout(this.devModeTimeout);
            }
            this.devModeKeySequence += event.key;
            this.devModeTimeout = setTimeout(() => {
                this.devModeKeySequence = '';
            }, 2000);

            if (this.devModeKeySequence === '12345') {
                this.toggleDeveloperMode();
                this.devModeKeySequence = '';
            }

            // Handle developer mode commands
            if (this.developerMode) {
                if (event.key === 'r' || event.key === 'R') {
                    this.toggleRestrictionMode();
                } else if (event.key === 's' || event.key === 'S') {
                    this.saveRestrictedTiles();
                }
            }
        });
    }

    createResetZoomButton() {
        const buttonSize = 44;
        const margin = 20;
        const btnX = this.cameras.main.width - buttonSize / 2 - margin;
        const btnY = buttonSize / 2 + margin;

        // Create a container for the button
        this.resetZoomButton = this.add.container(btnX, btnY);
        this.resetZoomButton.setDepth(2000);

        // Button background (circle)
        const bg = this.add.graphics();
        bg.fillStyle(0x444444, 1);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.fillCircle(0, 0, buttonSize / 2);
        bg.strokeCircle(0, 0, buttonSize / 2);
        this.resetZoomButton.add(bg);

        // Button text
        const txt = this.add.text(0, 0, '⟳', {
            fontSize: '28px',
            color: '#fff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.resetZoomButton.add(txt);

        // Make button interactive
        bg.setInteractive(new Phaser.Geom.Circle(0, 0, buttonSize / 2), Phaser.Geom.Circle.Contains);
        bg.on('pointerdown', () => {
            this.resetZoomAndPosition();
        });

        // Adjust position on resize
        this.scale.on('resize', (gameSize) => {
            this.resetZoomButton.setPosition(
                gameSize.width - buttonSize / 2 - margin,
                buttonSize / 2 + margin
            );
        });
    }

    resetZoomAndPosition() {
        this.zoomLevel = 1;
        this.gridLayer.setScale(1);
        // Center the grid layer
        this.gridLayer.x = 0;
        this.gridLayer.y = 0;
    }

    handleResize(gameSize) {
        // Keep toolbar anchored to top-left
        this.toolbarContainer.setPosition(20, 20);
        
        // Update coin display position (keep same margin as above)
        const coinMarginRight = 180;
        if (this.coinText) {
            this.coinText.setPosition(gameSize.width - coinMarginRight + 30, 30);
        }

        // Update shop icon position
        const shopIcon = this.children.list.find(child => child.texture && child.texture.key === 'shop');
        if (shopIcon) {
            shopIcon.setPosition(gameSize.width - coinMarginRight - 50, 30);
        }
    }

    createGrid() {
        const tileW = this.tileSize;
        const tileH = this.tileSize / 2;

        // Calculate how many tiles are needed to cover the screen diagonally
        const maxTiles = Math.ceil(
            Math.max(this.cameras.main.width, this.cameras.main.height) / (tileH / 2)
        );

        // Center the grid horizontally and vertically
        const gridStartX = this.cameras.main.width / 2;
        const gridStartY = this.cameras.main.height / 2;

        this.tiles = [];
        for (let row = -maxTiles; row < maxTiles; row++) {
            for (let col = -maxTiles; col < maxTiles; col++) {
                const x = gridStartX + (col - row) * (tileW / 2);
                const y = gridStartY + (col + row) * (tileH / 2);
                // Only draw tiles that are on screen
                if (
                    x + tileW / 2 < 0 || x - tileW / 2 > this.cameras.main.width ||
                    y + tileH / 2 < 0 || y - tileH / 2 > this.cameras.main.height
                ) {
                    continue;
                }
                const tile = this.add.graphics();
                this.gridLayer.add(tile);
                
                const tileKey = `${row},${col}`;
                this.tileStates.set(tileKey, {
                    isHovered: false,
                    isSelected: false,
                    isRestricted: this.restrictedTiles.has(tileKey)
                });
                
                this.drawTile(tile, x, y, false, false, this.tileStates.get(tileKey).isRestricted);

                // Diamond-shaped hit area
                const diamond = new Phaser.Geom.Polygon([
                    x, y - tileH / 2, // Top
                    x + tileW / 2, y, // Right
                    x, y + tileH / 2, // Bottom
                    x - tileW / 2, y  // Left
                ]);
                tile.setInteractive(diamond, Phaser.Geom.Polygon.Contains);

                // Store tile information
                const tileInfo = { graphics: tile, x: x, y: y, row: row, col: col };
                this.tiles.push(tileInfo);

                // Add event handlers
                this.setupTileEventHandlers(tileInfo);
            }
        }
    }

    setupTileEventHandlers(tileInfo) {
        const tileKey = `${tileInfo.row},${tileInfo.col}`;
        const state = this.tileStates.get(tileKey);

        tileInfo.graphics.on('pointerover', () => {
            // Only show hover effect if tile is not restricted in normal mode
            if (!state.isRestricted || this.developerMode) {
                state.isHovered = true;
                this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                    state.isHovered, state.isSelected, state.isRestricted);
            }
        });

        tileInfo.graphics.on('pointerout', () => {
            state.isHovered = false;
            this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                state.isHovered, state.isSelected, state.isRestricted);
        });

        tileInfo.graphics.on('pointerdown', () => {
            if (this.restrictionMode) {
                // Handle restriction mode
                state.isRestricted = !state.isRestricted;
                if (state.isRestricted) {
                    this.restrictedTiles.add(tileKey);
                } else {
                    this.restrictedTiles.delete(tileKey);
                }
            } else if (!state.isRestricted) {
                // Handle normal mode - only allow selection of non-restricted tiles
                state.isSelected = !state.isSelected;
            }
            this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                state.isHovered, state.isSelected, state.isRestricted);
        });
    }

    getPointerWorldPosition(pointer) {
        return {
            x: (pointer.x - this.gridLayer.x) / this.gridLayer.scaleX,
            y: (pointer.y - this.gridLayer.y) / this.gridLayer.scaleY
        };
    }

    handleDragEnd(pointer) {
        if (this.draggedItem) {
            const pointerWorld = this.getPointerWorldPosition(pointer);
            let closestTile = null;
            let minDistance = Infinity;
            for (const tile of this.tiles) {
                const distance = Phaser.Math.Distance.Between(
                    pointerWorld.x, pointerWorld.y,
                    tile.x, tile.y
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTile = tile;
                }
            }
            if (closestTile && minDistance < this.tileSize) {
                const tileKey = `${closestTile.row},${closestTile.col}`;
                
                // Check if tile is restricted
                if (this.restrictedTiles.has(tileKey)) {
                    console.log('Cannot place item on restricted tile');
                    this.draggedItem.destroy();
                    this.draggedItem = null;
                    return;
                }

                // Remove existing item if any
                if (this.placedItems.has(tileKey)) {
                    const existingItem = this.placedItems.get(tileKey);
                    // Increment counter for the replaced item
                    const replacedTextureKey = existingItem.textureKey;
                    const replacedCount = this.spriteCounters.get(replacedTextureKey);
                    this.spriteCounters.set(replacedTextureKey, replacedCount + 1);
                    this.scene.get('UIScene').updateSpriteCounter(replacedTextureKey, replacedCount + 1);
                    
                    existingItem.destroy();
                    this.placedItems.delete(tileKey);

                    // If replacing with same type, we've already incremented the counter
                    // so we don't need to decrement it again
                    if (replacedTextureKey === this.draggedItem.textureKey) {
                        this.textures.get(this.draggedItem.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                        const config = this.iconConfig[this.draggedItem.textureKey] || { yOffset: this.tileSize / 4, scale: 1 };
                        const item = this.add.image(closestTile.x, closestTile.y + config.yOffset, this.draggedItem.textureKey);
                        this.gridLayer.add(item);
                        item.setOrigin(0.5, 1);
                        const baseScale = (this.tileSize / item.width) * (config.scale || 1);
                        item.setScale(baseScale * this.baseScale);
                        item.textureKey = this.draggedItem.textureKey;
                        
                        // Make the item interactive for selection
                        item.setInteractive();
                        item.on('pointerdown', () => {
                            if (this.selectedItem === item) {
                                item.setTint(0xffffff);
                                this.selectedItem = null;
                            } else {
                                if (this.selectedItem) {
                                    this.selectedItem.setTint(0xffffff);
                                }
                                this.selectedItem = item;
                                item.setTint(0x666666);
                            }
                        });
                        
                        this.placedItems.set(tileKey, item);
                        this.draggedItem.destroy();
                        this.draggedItem = null;
                        this.gridLayer.list.sort((a, b) => a.y - b.y);
                        return;
                    }
                }

                // Check if we have sprites available
                const remainingSprites = this.spriteCounters.get(this.draggedItem.textureKey);
                if (remainingSprites <= 0) {
                    console.log('No more sprites available for this type');
                    this.draggedItem.destroy();
                    this.draggedItem = null;
                    return;
                }

                // Decrement sprite counter
                this.spriteCounters.set(this.draggedItem.textureKey, remainingSprites - 1);
                
                // Update UI scene with new counter value
                this.scene.get('UIScene').updateSpriteCounter(this.draggedItem.textureKey, remainingSprites - 1);

                this.textures.get(this.draggedItem.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                // Use iconConfig for yOffset and scale
                const config = this.iconConfig[this.draggedItem.textureKey] || { yOffset: this.tileSize / 4, scale: 1 };
                const item = this.add.image(closestTile.x, closestTile.y + config.yOffset, this.draggedItem.textureKey);
                this.gridLayer.add(item);
                item.setOrigin(0.5, 1);
                const baseScale = (this.tileSize / item.width) * (config.scale || 1);
                item.setScale(baseScale * this.baseScale);
                
                // Set the textureKey on the placed item
                item.textureKey = this.draggedItem.textureKey;
                console.log('Placed item textureKey:', item.textureKey);
                
                // Make the item interactive for selection
                item.setInteractive();
                item.on('pointerdown', () => {
                    // If clicking the already selected item, deselect it
                    if (this.selectedItem === item) {
                        item.setTint(0xffffff);
                        this.selectedItem = null;
                    } else {
                        // Deselect previous item if exists
                        if (this.selectedItem) {
                            this.selectedItem.setTint(0xffffff);
                        }
                        // Select new item
                        this.selectedItem = item;
                        item.setTint(0x666666); // Darken the selected item
                    }
                });
                
                this.placedItems.set(tileKey, item);
            }
            this.draggedItem.destroy();
            this.draggedItem = null;
        }
        this.gridLayer.list.sort((a, b) => a.y - b.y);
    }

    drawTile(graphics, x, y, isHovered = false, isSelected = false, isRestricted = false) {
        graphics.clear();
        
        if (this.developerMode) {
            // Developer mode: always show grid, restricted tiles always red
            let strokeColor;
            if (isRestricted) {
                strokeColor = 0xff0000; // Red for restricted tiles
            } else if (isSelected) {
                strokeColor = 0xff00ff; // Magenta for selected tiles
            } else if (isHovered) {
                strokeColor = 0x00ffff; // Cyan for hovered tiles
            } else {
                strokeColor = 0x7cba34; // Green for normal tiles
            }
            const lineWidth = 2 / this.baseScale;
            graphics.lineStyle(lineWidth, strokeColor);
            graphics.beginPath();
            graphics.moveTo(x, y - this.tileSize / 4); // Top
            graphics.lineTo(x + this.tileSize / 2, y); // Right
            graphics.lineTo(x, y + this.tileSize / 4); // Bottom
            graphics.lineTo(x - this.tileSize / 2, y); // Left
            graphics.closePath();
            graphics.strokePath();
        } else {
            // Player mode: restricted tiles are always invisible
            if (isRestricted) {
                return;
            }
            // Only show outline for non-restricted tiles if hovered or selected
            let strokeColor = null;
            if (isSelected) {
                strokeColor = 0xff00ff;
            } else if (isHovered) {
                strokeColor = 0x00ffff;
            }
            if (strokeColor !== null) {
                const lineWidth = 2 / this.baseScale;
                graphics.lineStyle(lineWidth, strokeColor);
                graphics.beginPath();
                graphics.moveTo(x, y - this.tileSize / 4); // Top
                graphics.lineTo(x + this.tileSize / 2, y); // Right
                graphics.lineTo(x, y + this.tileSize / 4); // Bottom
                graphics.lineTo(x - this.tileSize / 2, y); // Left
                graphics.closePath();
                graphics.strokePath();
            }
        }
    }

    updateGridAndItems() {
        // Update grid tiles
        this.tiles.forEach(tile => {
            if (tile.graphics) {
                this.drawTile(tile.graphics, tile.x, tile.y);
            }
        });

        // Update placed items
        this.placedItems.forEach(item => {
            if (item) {
                const config = this.iconConfig[item.textureKey] || { yOffset: this.tileSize / 4, scale: 1 };
                item.setOrigin(0.5, 1);
                const baseScale = (this.tileSize / item.width) * (config.scale || 1);
                item.setScale(baseScale * this.baseScale);
            }
        });
        this.gridLayer.list.sort((a, b) => a.y - b.y);
    }

    toggleDeveloperMode() {
        this.developerMode = !this.developerMode;
        this.restrictionMode = false; // Reset restriction mode when toggling dev mode
        console.log('Developer Mode:', this.developerMode ? 'ON' : 'OFF');
        
        // Visual feedback for developer mode
        if (this.developerMode) {
            this.showDevModeIndicator();
        } else {
            this.hideDevModeIndicator();
        }
    }

    toggleRestrictionMode() {
        if (!this.developerMode) return;
        
        this.restrictionMode = !this.restrictionMode;
        console.log('Restriction Mode:', this.restrictionMode ? 'ON' : 'OFF');
        
        // Reset all tile states when toggling restriction mode
        this.tiles.forEach(tileInfo => {
            const tileKey = `${tileInfo.row},${tileInfo.col}`;
            const state = this.tileStates.get(tileKey);
            state.isSelected = false;
            this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                state.isHovered, state.isSelected, state.isRestricted);
        });
    }

    saveRestrictedTiles() {
        if (!this.developerMode) return;

        const restrictedTilesArray = Array.from(this.restrictedTiles);
        const jsonData = JSON.stringify(restrictedTilesArray, null, 2);
        
        // Create a blob and download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'restricted_tiles.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadRestrictedTiles() {
        try {
            const response = await fetch('restricted_tiles.json');
            const data = await response.json();
            this.restrictedTiles = new Set(data);
            console.log('Loaded restricted tiles:', this.restrictedTiles.size);
        } catch (error) {
            console.log('No restricted tiles file found or error loading:', error);
            this.restrictedTiles = new Set();
        }
    }

    showDevModeIndicator() {
        // Create or show developer mode indicator
        if (!this.devModeText) {
            this.devModeText = this.add.text(10, 10, 'DEV MODE', {
                fontSize: '24px',
                color: '#ff0000',
                fontStyle: 'bold'
            });
            this.devModeText.setDepth(2000);
        } else {
            this.devModeText.setVisible(true);
        }
    }

    hideDevModeIndicator() {
        // Hide developer mode indicator
        if (this.devModeText) {
            this.devModeText.setVisible(false);
        }
    }

    showQuizDialog() {
        // Generate random numbers for the quiz
        const num1 = Phaser.Math.Between(1, 20);
        const num2 = Phaser.Math.Between(1, 20);
        const operation = Phaser.Math.RND.pick(['+', '-']);
        const answer = operation === '+' ? num1 + num2 : num1 - num2;

        // Generate 3 random distractors
        const options = new Set([answer]);
        while (options.size < 4) {
            let delta = Phaser.Math.Between(-10, 10);
            if (delta === 0) delta = 1;
            let distractor = answer + delta;
            if (operation === '-' && distractor < 0) distractor = Math.abs(distractor);
            options.add(distractor);
        }
        const shuffledOptions = Phaser.Utils.Array.Shuffle(Array.from(options));

        // Create dialog box
        const dialogBox = this.add.graphics();
        dialogBox.fillStyle(0x000000, 0.8);
        dialogBox.fillRect(0, 0, 400, 260);
        dialogBox.setPosition(this.cameras.main.width / 2 - 200, this.cameras.main.height / 2 - 130);

        // Add question text
        const questionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 80,
            `What is ${num1} ${operation} ${num2}?`,
            {
                fontSize: '28px',
                color: '#ffffff',
                align: 'center',
                fontFamily: 'monospace',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        // 2x2 grid layout for answer buttons
        const buttonWidth = 90;
        const buttonHeight = 44;
        const buttonSpacingX = 30;
        const buttonSpacingY = 22;
        const gridStartX = this.cameras.main.width / 2 - buttonWidth - buttonSpacingX / 2;
        const gridStartY = this.cameras.main.height / 2 - 10;
        const answerButtons = [];
        for (let i = 0; i < 4; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const btnX = gridStartX + col * (buttonWidth + buttonSpacingX);
            const btnY = gridStartY + row * (buttonHeight + buttonSpacingY);
            const opt = shuffledOptions[i];
            const btn = this.add.text(
                btnX + buttonWidth / 2,
                btnY + buttonHeight / 2,
                opt.toString(),
                {
                    fontSize: '22px',
                    color: '#ffffff',
                    backgroundColor: '#4a4a4a',
                    padding: { x: 18, y: 8 },
                    align: 'center',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                if (opt === answer) {
                    this.coins += 5;
                    this.scene.get('UIScene').updateCoins(this.coins);
                    this.showMessage('Correct! +5 coins!', '#00ff00');
                } else {
                    this.showMessage('Wrong answer!', '#ff0000');
                }
                // Clean up
                dialogBox.destroy();
                questionText.destroy();
                answerButtons.forEach(b => b.destroy());
            });
            answerButtons.push(btn);
        }
    }

    showMessage(text, color) {
        const message = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            text,
            {
                fontSize: '24px',
                color: color,
                align: 'center'
            }
        ).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }
}

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.parentScene = null;
        this.tileSize = 64;
        this.iconConfig = null;
        this.toolbarExpanded = false;
        this.spriteCounters = new Map();
        this.counterTexts = new Map();
        this.shopDialog = null;
    }

    init(data) {
        this.parentScene = data.parentScene;
        this.tileSize = data.tileSize;
        this.iconConfig = data.iconConfig;
        this.coins = data.coins;
    }

    create() {
        this.createToolbarPanel();

        // Move coin display further left to avoid overlap with reset button
        const coinMarginRight = 180; // Increased margin from right edge
        const coinIcon = this.add.image(this.cameras.main.width - coinMarginRight, 30, 'coin');
        coinIcon.setScale(0.1); // 1/5th the original size
        
        this.coinText = this.add.text(this.cameras.main.width - coinMarginRight + 30, 30, this.coins.toString(), {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        // Add shop icon
        const shopIcon = this.add.image(this.cameras.main.width - coinMarginRight - 50, 30, 'shop');
        shopIcon.setScale(0.1);
        shopIcon.setInteractive({ useHandCursor: true });
        shopIcon.on('pointerdown', () => this.showShopDialog());

        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
    }

    createToolbarPanel() {
        // Icon setup
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'fencecorner2', 'edge1', 'edge2', 'timmy'];
        const iconSpacing = this.tileSize + 10;
        const iconMargin = 16;
        const panelPadding = 12;
        const btnRadius = 16;
        const btnX = btnRadius + 4;
        const btnY = btnRadius + 4;
        const iconsPerRow = 4;
        const panelWidth = iconsPerRow * iconSpacing + iconMargin * 2;
        const panelHeight = Math.ceil(iconKeys.length / iconsPerRow) * iconSpacing + iconMargin * 2 + btnRadius * 2 + 8;

        // Create toolbar container
        this.toolbarContainer = this.add.container(20, 20);
        this.toolbarContainer.setDepth(1000);

        // Panel background
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x222222, 0.85);
        panelBg.lineStyle(2, 0xffffff, 0.7);
        panelBg.fillRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        panelBg.strokeRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        this.toolbarContainer.add(panelBg);
        this.panelBg = panelBg;

        // Toggle button
        const toggleBtnBg = this.add.graphics();
        toggleBtnBg.fillStyle(0x444444, 1);
        toggleBtnBg.lineStyle(2, 0xffffff, 0.8);
        toggleBtnBg.fillCircle(btnX, btnY, btnRadius);
        toggleBtnBg.strokeCircle(btnX, btnY, btnRadius);
        this.toolbarContainer.add(toggleBtnBg);

        const toggleBtnText = this.add.text(btnX, btnY, '+', {
            fontSize: '22px',
            color: '#fff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        toggleBtnText.setInteractive({ useHandCursor: true });
        this.toolbarContainer.add(toggleBtnText);

        // Icons container
        this.iconsContainer = this.add.container(iconMargin, btnRadius * 2 + 8 + panelPadding);
        this.toolbarContainer.add(this.iconsContainer);

        // Set initial visibility
        this.iconsContainer.alpha = this.toolbarExpanded ? 1 : 0;
        this.iconsContainer.setVisible(this.toolbarExpanded);
        this.panelBg.alpha = this.toolbarExpanded ? 1 : 0;
        this.panelBg.setVisible(this.toolbarExpanded);

        // Create and layout icons in a grid
        this.toolbarIcons = [];
        iconKeys.forEach((key, i) => {
            const row = Math.floor(i / iconsPerRow);
            const col = i % iconsPerRow;
            const x = col * (this.tileSize + 10) + this.tileSize / 2;
            const y = row * (this.tileSize + 10) + this.tileSize / 2;
            
            // Create icon container
            const iconContainer = this.add.container(x, y);
            this.iconsContainer.add(iconContainer);
            
            // Create icon
            const icon = this.add.image(0, 0, key);
            const scale = (this.tileSize / icon.width) * (this.iconConfig[key].scale || 1);
            icon.setScale(scale);
            icon.setOrigin(0.5, 1);
            icon.setInteractive();
            this.input.setDraggable(icon);
            icon.textureKey = key;
            iconContainer.add(icon);
            
            // Create counter text
            const counterText = this.add.text(0, -this.tileSize/2, '3', {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            iconContainer.add(counterText);
            
            this.counterTexts.set(key, counterText);
            this.toolbarIcons.push(icon);
        });

        // Drag handlers for all icons
        this.toolbarIcons.forEach(icon => {
            icon.on('dragstart', (pointer) => {
                // Check if we have sprites available
                const remainingSprites = this.parentScene.spriteCounters.get(icon.textureKey);
                if (remainingSprites <= 0) {
                    return; // Don't allow drag if no sprites left
                }

                this.textures.get(icon.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                this.parentScene.draggedItem = this.parentScene.add.image(pointer.x, pointer.y, icon.textureKey);
                const scale = this.tileSize / this.parentScene.draggedItem.width;
                this.parentScene.draggedItem.setScale(scale);
                this.parentScene.draggedItem.setOrigin(0.5, 1);
                this.parentScene.draggedItem.setDepth(1000);
                this.parentScene.draggedItem.textureKey = icon.textureKey;
                this.parentScene.draggedItem.setAlpha(0.6);
            });
            icon.on('drag', (pointer) => {
                if (this.parentScene.draggedItem) {
                    this.parentScene.draggedItem.x = pointer.x;
                    this.parentScene.draggedItem.y = pointer.y + (this.tileSize / 4);
                }
            });
            icon.on('dragend', (pointer) => {
                this.parentScene.handleDragEnd(pointer);
            });
        });

        // Toggle button click handler
        toggleBtnText.on('pointerdown', () => {
            this.toolbarExpanded = !this.toolbarExpanded;
            toggleBtnText.setText(this.toolbarExpanded ? '−' : '+');
            this.tweens.add({
                targets: [this.iconsContainer, this.panelBg],
                alpha: this.toolbarExpanded ? 1 : 0,
                duration: 180,
                ease: 'Power2',
                onStart: () => {
                    if (this.toolbarExpanded) {
                        this.iconsContainer.setVisible(true);
                        this.panelBg.setVisible(true);
                    }
                },
                onComplete: () => {
                    if (!this.toolbarExpanded) {
                        this.iconsContainer.setVisible(false);
                        this.panelBg.setVisible(false);
                    }
                }
            });
        });

        // Ensure toggle button is on top
        this.toolbarContainer.bringToTop(toggleBtnBg);
        this.toolbarContainer.bringToTop(toggleBtnText);
    }

    updateSpriteCounter(textureKey, newCount) {
        const counterText = this.counterTexts.get(textureKey);
        if (counterText) {
            counterText.setText(newCount.toString());
            
            // Update icon appearance based on remaining sprites
            const icon = this.toolbarIcons.find(i => i.textureKey === textureKey);
            if (icon) {
                if (newCount <= 0) {
                    icon.setAlpha(0.5); // Make icon translucent when no sprites left
                    icon.disableInteractive(); // Disable dragging
                } else {
                    icon.setAlpha(1);
                    icon.setInteractive();
                    this.input.setDraggable(icon);
                }
            }
        }
    }

    updateCoins(newCoins) {
        this.coins = newCoins;
        this.coinText.setText(this.coins.toString());
    }

    handleResize(gameSize) {
        // Keep toolbar anchored to top-left
        this.toolbarContainer.setPosition(20, 20);
        
        // Update coin display position (keep same margin as above)
        const coinMarginRight = 180;
        if (this.coinText) {
            this.coinText.setPosition(gameSize.width - coinMarginRight + 30, 30);
        }

        // Update shop icon position
        const shopIcon = this.children.list.find(child => child.texture && child.texture.key === 'shop');
        if (shopIcon) {
            shopIcon.setPosition(gameSize.width - coinMarginRight - 50, 30);
        }
    }

    showMessage(text, color) {
        const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 200, text, {
            fontSize: '24px',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }

    showShopDialog() {
        // Remove existing dialog if any
        if (this.shopDialog) {
            this.shopDialog.destroy();
        }

        // Dialog dimensions
        const dialogWidth = 400;
        const dialogHeight = 500;
        const dialogX = this.cameras.main.width / 2 - dialogWidth / 2;
        const dialogY = this.cameras.main.height / 2 - dialogHeight / 2;

        // Create dialog background
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0x000000, 0.8);
        dialogBg.fillRoundedRect(0, 0, dialogWidth, dialogHeight, 16);
        dialogBg.setPosition(dialogX, dialogY);

        // Create dialog container
        this.shopDialog = this.add.container(0, 0);
        this.shopDialog.add(dialogBg);

        // Add title
        const title = this.add.text(this.cameras.main.width / 2, dialogY + 20, 'Shop', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Fredoka One',
        }).setOrigin(0.5, 0);
        this.shopDialog.add(title);

        // Add close button
        const closeBtn = this.add.text(dialogX + dialogWidth - 24, dialogY + 24, 'X', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.shopDialog.destroy());
        this.shopDialog.add(closeBtn);

        // Shop items grid
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'fencecorner2', 'edge1', 'edge2', 'timmy'];
        const itemsPerRow = 4;
        const itemCellWidth = 85;
        const itemCellHeight = 110;
        const gridWidth = itemsPerRow * itemCellWidth;
        const numRows = Math.ceil(iconKeys.length / itemsPerRow);
        const gridHeight = numRows * itemCellHeight;
        const gridStartX = this.cameras.main.width / 2 - gridWidth / 2;
        const gridStartY = dialogY + 70;

        iconKeys.forEach((key, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = gridStartX + col * itemCellWidth + itemCellWidth / 2;
            const y = gridStartY + row * itemCellHeight;

            // Create item container
            const itemContainer = this.add.container(x, y);
            this.shopDialog.add(itemContainer);

            // Add item icon
            const itemIcon = this.add.image(0, 0, key);
            const scale = (this.tileSize / itemIcon.width) * (this.iconConfig[key].scale || 1) * 0.7;
            itemIcon.setScale(scale);
            itemContainer.add(itemIcon);

            // Add price text
            const priceText = this.add.text(0, 38, '5 coins', {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            itemContainer.add(priceText);

            // Add buy button
            const buyBtn = this.add.text(0, 62, 'Buy', {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#4a4a4a',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            buyBtn.on('pointerdown', () => {
                if (this.coins >= 5) {
                    // Update coins
                    this.coins -= 5;
                    this.updateCoins(this.coins);

                    // Update sprite counter
                    const currentCount = this.parentScene.spriteCounters.get(key);
                    this.parentScene.spriteCounters.set(key, currentCount + 1);
                    this.updateSpriteCounter(key, currentCount + 1);

                    // Show success message
                    this.showMessage('Purchase successful!', '#00ff00');
                } else {
                    this.showMessage('Not enough coins!', '#ff0000');
                }
            });
            itemContainer.add(buyBtn);
        });
    }
} 