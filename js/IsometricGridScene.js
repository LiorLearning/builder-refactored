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
        this.firstZeroAssetShown = false; // Track if first zero asset message has been shown
        this.welcomeMessageShown = false; // Track if welcome message has been shown
        // Audio instances
        this.sounds = {
            bgm: null,
            button: null,
            correct: null,
            pop: null,
            shop: null
        };
        this.isMuted = false; // Track mute state
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
            mystical1: { yOffset: this.tileSize / 4 + 5, scale: 1.2 },
            mystical2: { yOffset: this.tileSize / 4 + 5, scale: 1.2 }
        };
        // Configuration for initial sprite counts
        this.spriteInitialCounts = {
            tree: 1,
            grass: 1,
            grass1: 1,
            flower: 1,
            flower2: 1,
            fence: 1,
            fence2: 1,
            fencecorner: 1,
            mystical1: 0,
            mystical2: 0
        };
        // Configuration for shop prices
        this.spritePrices = {
            tree: 5,
            grass: 3,
            grass1: 3,
            flower: 4,
            flower2: 4,
            fence: 6,
            fence2: 6,
            fencecorner: 6,
            mystical1: 10,
            mystical2: 10
        };
        this.toolbarExpanded = false; // Start closed
        
        // Initialize sprite counters for each icon type
        this.spriteCounters = new Map();
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'mystical1', 'mystical2'];
        iconKeys.forEach(key => {
            this.spriteCounters.set(key, this.spriteInitialCounts[key]); // Use individual initial counts
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
        this.load.image('mystical1', 'assets/mystical1.png');
        this.load.image('mystical2', 'assets/mystical2.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('shop', 'assets/shop.png');
        this.load.image('pixie', 'assets/pixie.png');
        // Load audio files
        this.load.audio('bgm', 'assets/audio/bgm.mp3');
        this.load.audio('button', 'assets/audio/button.mp3');
        this.load.audio('correct', 'assets/audio/correct.mp3');
        this.load.audio('pop', 'assets/audio/pop.mp3');
        this.load.audio('shop', 'assets/audio/shop.mp3');
    }

    create() {
        // Initialize audio
        this.sounds.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
        this.sounds.button = this.sound.add('button', { volume: 0.7 });
        this.sounds.correct = this.sound.add('correct', { volume: 0.7 });
        this.sounds.pop = this.sound.add('pop', { volume: 0.7 });
        this.sounds.shop = this.sound.add('shop', { volume: 0.7 });

        // Start background music
        this.sounds.bgm.play();

        // Create grid layer
        this.gridLayer = this.add.container(0, 0); // Use a container for all grid content
        
        // Add the background image to grid layer
        const bg = this.add.image(0, 0, 'ground');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        bg.setDepth(-1000);
        this.gridLayer.add(bg);

        // Add pixie image to bottom left corner
        this.pixieImage = this.add.image(100, this.cameras.main.height - 150, 'pixie');
        this.pixieImage.setScale(1); // Increased scale for better visibility
        this.pixieImage.setDepth(2000); // Ensure it's above other elements

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

            // Show welcome message
            this.showWelcomeMessage();

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

        // Create mute button below reset button
        const muteBtnY = btnY + buttonSize + 10; // 10 pixels below reset button
        this.muteButton = this.add.container(btnX, muteBtnY);
        this.muteButton.setDepth(2000);

        // Mute button background
        const muteBg = this.add.graphics();
        muteBg.fillStyle(0x444444, 1);
        muteBg.lineStyle(2, 0xffffff, 0.8);
        muteBg.fillCircle(0, 0, buttonSize / 2);
        muteBg.strokeCircle(0, 0, buttonSize / 2);
        this.muteButton.add(muteBg);

        // Mute button text
        const muteTxt = this.add.text(0, 0, '🔊', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.muteButton.add(muteTxt);

        // Make mute button interactive
        muteBg.setInteractive(new Phaser.Geom.Circle(0, 0, buttonSize / 2), Phaser.Geom.Circle.Contains);
        muteBg.on('pointerdown', () => {
            this.toggleMute();
            muteTxt.setText(this.isMuted ? '🔇' : '🔊');
        });

        // Adjust position on resize
        this.scale.on('resize', (gameSize) => {
            this.resetZoomButton.setPosition(
                gameSize.width - buttonSize / 2 - margin,
                buttonSize / 2 + margin
            );
            this.muteButton.setPosition(
                gameSize.width - buttonSize / 2 - margin,
                buttonSize / 2 + margin + buttonSize + 10
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

        // Update pixie position
        if (this.pixieImage) {
            this.pixieImage.setPosition(100, gameSize.height - 150);
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

                        // Update welcome message if it exists
                        if (this.welcomeChatbox) {
                            // Find the message text in the chatbox
                            const messageText = this.welcomeChatbox.getAt(1); // The text is the second element added to the container
                            if (messageText) {
                                messageText.setText("Now create your own garden!");
                                
                                // Add new glow effect
                                const x = 200;
                                const y = this.cameras.main.height - 250;
                                const width = 400;
                                const height = 150;
                                
                                // Clean up old glow if it exists
                                if (this.welcomeChatbox.glow) {
                                    this.welcomeChatbox.glow.destroy();
                                    if (this.welcomeChatbox.glowEvent) {
                                        this.welcomeChatbox.glowEvent.remove();
                                    }
                                }
                                
                                // Add new glow
                                this.addChatboxGlow(this.welcomeChatbox, x, y, width, height);
                            }
                        }
                        return;
                    }
                }

                // Check if we have sprites available
                const remainingSprites = this.spriteCounters.get(this.draggedItem.textureKey);
                if (remainingSprites <= 0) {
                    console.log('No more sprites available for this type');
                    this.draggedItem.destroy();
                    this.draggedItem = null;
                    
                    // Show first zero asset message if not shown before
                    if (!this.firstZeroAssetShown) {
                        this.showFirstZeroAssetMessage();
                        this.firstZeroAssetShown = true;
                    }
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
                
                // Play pop sound when item is placed
                this.sounds.pop.play();
                
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

                // Update welcome message if it exists
                if (this.welcomeChatbox) {
                    // Find the message text in the chatbox
                    const messageText = this.welcomeChatbox.getAt(1); // The text is the second element added to the container
                    if (messageText) {
                        messageText.setText("Now create your own garden!");
                        
                        // Add new glow effect
                        const x = 200;
                        const y = this.cameras.main.height - 250;
                        const width = 400;
                        const height = 150;
                        
                        // Clean up old glow if it exists
                        if (this.welcomeChatbox.glow) {
                            this.welcomeChatbox.glow.destroy();
                            if (this.welcomeChatbox.glowEvent) {
                                this.welcomeChatbox.glowEvent.remove();
                            }
                        }
                        
                        // Add new glow
                        this.addChatboxGlow(this.welcomeChatbox, x, y, width, height);
                    }
                }
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
        const num1 = Phaser.Math.Between(2, 10); // First number between 2-10
        const num2 = Phaser.Math.Between(2, 10); // Second number between 2-10
        const answer = num1 * num2;

        // Randomly decide which repeated addition to use for the correct answer
        const useNum1 = Phaser.Math.Between(0, 1) === 0;
        let correctOption;
        if (useNum1) {
            correctOption = Array(num2).fill(num1).join('+'); // num1 added num2 times
        } else {
            correctOption = Array(num1).fill(num2).join('+'); // num2 added num1 times
        }

        // Helper to generate a plausible but incorrect repeated addition
        function generateDistractor() {
            let a, b;
            do {
                a = Phaser.Math.Between(2, 10);
                b = Phaser.Math.Between(2, 10);
            } while ((a === num1 && b === num2) || (a === num2 && b === num1) || a * b === answer);
            return Array(b).fill(a).join('+');
        }

        // Build options: 1 correct, 3 distractors
        const options = [correctOption];
        while (options.length < 4) {
            let distractor = generateDistractor();
            if (!options.includes(distractor)) {
                options.push(distractor);
            }
        }
        // Shuffle options
        Phaser.Utils.Array.Shuffle(options);

        // --- Stage 1 Dialog ---
        const dialogBox = this.add.graphics();
        dialogBox.fillStyle(0x000000, 0.8);
        dialogBox.fillRect(0, 0, 400, 300);
        dialogBox.setPosition(this.cameras.main.width / 2 - 200, this.cameras.main.height / 2 - 150);

        const questionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            `${num1} times ${num2} = ?`,
            {
                fontSize: '28px',
                color: '#ffffff',
                align: 'center',
                fontFamily: 'monospace',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        const optionsContainer = this.add.container(0, 0);
        let attempts = 0;
        const maxAttempts = 2;

        const evaluateRepeatedAddition = (expression) => {
            const parts = expression.split('+');
            return parts.reduce((sum, num) => sum + parseInt(num), 0);
        };

        // --- Stage 2 Dialog ---
        const showStage2 = (repeatedAddition) => {
            // Clean up stage 1
            dialogBox.destroy();
            questionText.destroy();
            optionsContainer.destroy();

            // Stage 2 setup
            const stage2Box = this.add.graphics();
            stage2Box.fillStyle(0x000000, 0.8);
            stage2Box.fillRect(0, 0, 400, 220);
            stage2Box.setPosition(this.cameras.main.width / 2 - 200, this.cameras.main.height / 2 - 110);

            const correctSum = evaluateRepeatedAddition(repeatedAddition);
            const stage2Question = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 60,
                `${repeatedAddition} = ?`,
                {
                    fontSize: '28px',
                    color: '#ffffff',
                    align: 'center',
                    fontFamily: 'monospace',
                    fontStyle: 'bold',
                }
            ).setOrigin(0.5);

            // Generate 3 distractor numbers
            const distractors = new Set();
            while (distractors.size < 3) {
                let delta = Phaser.Math.Between(-6, 6);
                if (delta === 0) continue;
                let distractor = correctSum + delta;
                if (distractor > 0 && distractor !== correctSum) {
                    distractors.add(distractor);
                }
            }
            const stage2Options = [correctSum, ...Array.from(distractors)];
            Phaser.Utils.Array.Shuffle(stage2Options);

            let stage2Attempts = 0;
            const stage2MaxAttempts = 2;
            const stage2OptionsContainer = this.add.container(0, 0);
            const buttonWidth = 100;
            const buttonHeight = 44;
            const buttonSpacing = 18;
            const startY = this.cameras.main.height / 2 - 10;

            stage2Options.forEach((opt, idx) => {
                const button = this.add.text(
                    this.cameras.main.width / 2,
                    startY + idx * (buttonHeight + buttonSpacing),
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

                button.on('pointerdown', () => {
                    this.sounds.button.play();
                    if (opt === correctSum) {
                        this.coins += 20;
                        this.scene.get('UIScene').updateCoins(this.coins);
                        this.showMessage('Correct! +20 coins!', '#00ff00');
                        this.sounds.correct.play();
                        // Clean up
                        stage2Box.destroy();
                        stage2Question.destroy();
                        stage2OptionsContainer.destroy();
                    } else {
                        stage2Attempts++;
                        if (stage2Attempts >= stage2MaxAttempts) {
                            this.showMessage('Game Over! Try again.', '#ff0000');
                            stage2Box.destroy();
                            stage2Question.destroy();
                            stage2OptionsContainer.destroy();
                        } else {
                            button.setStyle({ backgroundColor: '#ff0000' });
                            this.showMessage('Wrong answer! Try again.', '#ff0000');
                        }
                    }
                });
                stage2OptionsContainer.add(button);
            });
        };

        // --- Stage 1 Option Buttons ---
        const buttonWidth = 180;
        const buttonHeight = 44;
        const buttonSpacing = 20;
        const startY = this.cameras.main.height / 2 - 30;

        options.forEach((option, index) => {
            const button = this.add.text(
                this.cameras.main.width / 2,
                startY + index * (buttonHeight + buttonSpacing),
                option,
                {
                    fontSize: '20px',
                    color: '#ffffff',
                    backgroundColor: '#4a4a4a',
                    padding: { x: 15, y: 10 },
                    align: 'center',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5).setInteractive({ useHandCursor: true });

            button.on('pointerdown', () => {
                this.sounds.button.play();
                const result = evaluateRepeatedAddition(option);
                if (result === answer && option === correctOption) {
                    // Proceed to stage 2
                    showStage2(option);
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        this.showMessage('Game Over! Try again.', '#ff0000');
                        dialogBox.destroy();
                        questionText.destroy();
                        optionsContainer.destroy();
                    } else {
                        button.setStyle({ backgroundColor: '#ff0000' });
                        this.showMessage('Wrong answer! Try again.', '#ff0000');
                    }
                }
            });
            optionsContainer.add(button);
        });
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

    showWelcomeMessage() {
        // Create chatbox container
        this.welcomeChatbox = this.add.container(0, 0);
        this.welcomeChatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.cameras.main.height - 250;

        // Create chatbox background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(x, y, width, height, 16);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.strokeRoundedRect(x, y, width, height, 16);
        this.welcomeChatbox.add(bg);

        // Add message text
        const message = this.add.text(x + width/2, y + height/2, 
            "Drag and drop an item\nto the ground", {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.welcomeChatbox.add(message);

        // Add close button
        const closeBtn = this.add.text(x + width - 20, y + 20, 'X', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            this.welcomeChatbox.destroy();
        });
        this.welcomeChatbox.add(closeBtn);

        // Add initial glow effect
        this.addChatboxGlow(this.welcomeChatbox, x, y, width, height);
    }

    addChatboxGlow(chatbox, x, y, width, height) {
        // Create glow graphics
        const glow = this.add.graphics();
        glow.setDepth(1999); // Just below the chatbox
        
        // Initial glow state
        let alpha = 1;
        let growing = false;
        
        // Animation function
        const updateGlow = () => {
            glow.clear();
            
            // Update alpha
            if (growing) {
                alpha += 0.05;
                if (alpha >= 1) {
                    alpha = 1;
                    growing = false;
                }
            } else {
                alpha -= 0.05;
                if (alpha <= 0.3) {
                    alpha = 0.3;
                    growing = true;
                }
            }
            
            // Draw glow
            glow.lineStyle(4, 0xffff00, alpha);
            glow.strokeRoundedRect(x - 2, y - 2, width + 4, height + 4, 18);
        };
        
        // Start the animation
        this.time.addEvent({
            delay: 50,
            callback: updateGlow,
            callbackScope: this,
            loop: true
        });
        
        // Store the glow and animation event for cleanup
        chatbox.glow = glow;
        chatbox.glowEvent = this.time.addEvent({
            delay: 3000, // Stop glow after 3 seconds
            callback: () => {
                glow.destroy();
                chatbox.glow = null;
            }
        });
    }

    showFirstZeroAssetMessage() {
        console.log('Creating chatbox');
        // Create chatbox container
        const chatbox = this.add.container(0, 0);
        chatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.cameras.main.height - 250;

        console.log('Chatbox position:', x, y);

        // Create chatbox background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(x, y, width, height, 16);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.strokeRoundedRect(x, y, width, height, 16);
        chatbox.add(bg);

        // Add message text
        const message = this.add.text(x + width/2, y + height/2, 
            "Press Spacebar to collect coins\nand buy more assets", {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        chatbox.add(message);

        // Add close button
        const closeBtn = this.add.text(x + width - 20, y + 20, 'X', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            console.log('Closing chatbox');
            chatbox.destroy();
        });
        chatbox.add(closeBtn);

        // Auto-destroy after 10 seconds
        this.time.delayedCall(10000, () => {
            if (chatbox.active) {
                console.log('Auto-destroying chatbox');
                chatbox.destroy();
            }
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
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'mystical1', 'mystical2'];
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
            const price = this.spritePrices[key];
            const priceText = this.add.text(0, 38, `${price} coins`, {
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
                this.sounds.button.play();
                if (this.coins >= price) {
                    // Update coins
                    this.coins -= price;
                    this.updateCoins(this.coins);

                    // Update sprite counter
                    const currentCount = this.spriteCounters.get(key);
                    this.spriteCounters.set(key, currentCount + 1);
                    this.updateSpriteCounter(key, currentCount + 1);

                    // Play shop sound
                    this.sounds.shop.play();

                    // Show success message
                    this.showMessage('Purchase successful!', '#00ff00');
                } else {
                    this.showMessage('Not enough coins!', '#ff0000');
                }
            });
            itemContainer.add(buyBtn);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : 0.5;
        this.sounds.bgm.setVolume(volume);
        this.sounds.button.setVolume(this.isMuted ? 0 : 0.7);
        this.sounds.correct.setVolume(this.isMuted ? 0 : 0.7);
        this.sounds.pop.setVolume(this.isMuted ? 0 : 0.7);
        this.sounds.shop.setVolume(this.isMuted ? 0 : 0.7);
    }
}

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.parentScene = null;
        this.tileSize = 64;
        this.iconConfig = null;
        this.toolbarExpanded = true; // Start with toolbar open
        this.spriteCounters = new Map();
        this.counterTexts = new Map();
        this.shopDialog = null;
        this.firstZeroAssetShown = false; // Track if first zero asset message has been shown
        this.toggleBtnText = null; // Store reference to toggle button text
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
        shopIcon.setScale(0.15);
        shopIcon.setInteractive({ useHandCursor: true });
        shopIcon.on('pointerdown', () => this.showShopDialog());

        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
    }

    createToolbarPanel() {
        // Icon setup
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'mystical1', 'mystical2'];
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

        this.toggleBtnText = this.add.text(btnX, btnY, this.toolbarExpanded ? '−' : '+', {
            fontSize: '22px',
            color: '#fff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.toggleBtnText.setInteractive({ useHandCursor: true });
        this.toolbarContainer.add(this.toggleBtnText);

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
            
            // Set initial alpha based on sprite count
            const initialCount = this.parentScene.spriteCounters.get(key);
            if (initialCount <= 0) {
                icon.setAlpha(0.5);
                icon.disableInteractive();
            }
            
            iconContainer.add(icon);
            
            // Create counter text
            const counterText = this.add.text(0, -this.tileSize/2, this.parentScene.spriteCounters.get(key).toString(), {
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
        this.toggleBtnText.on('pointerdown', () => {
            this.parentScene.sounds.button.play();
            this.toolbarExpanded = !this.toolbarExpanded;
            this.toggleBtnText.setText(this.toolbarExpanded ? '−' : '+');
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
        this.toolbarContainer.bringToTop(this.toggleBtnText);
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
                    this.input.setDraggable(icon, false); // Ensure dragging is disabled
                    
                    // Show first zero asset message if not shown before
                    if (!this.firstZeroAssetShown) {
                        this.showFirstZeroAssetMessage();
                        this.firstZeroAssetShown = true;
                    }
                } else {
                    icon.setAlpha(1);
                    icon.setInteractive();
                    this.input.setDraggable(icon, true);
                }
            }
        }
    }

    updateCoins(newCoins) {
        this.coins = newCoins;
        this.coinText.setText(this.coins.toString());
    }

    handleResize(gameSize) {
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

        // Update pixie position
        if (this.pixieImage) {
            this.pixieImage.setPosition(100, gameSize.height - 150);
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
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'mystical1', 'mystical2'];
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
            const price = this.parentScene.spritePrices[key];
            const priceText = this.add.text(0, 38, `${price} coins`, {
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
                this.parentScene.sounds.button.play();
                if (this.coins >= price) {
                    // Update coins
                    this.coins -= price;
                    this.updateCoins(this.coins);

                    // Update sprite counter
                    const currentCount = this.parentScene.spriteCounters.get(key);
                    this.parentScene.spriteCounters.set(key, currentCount + 1);
                    this.updateSpriteCounter(key, currentCount + 1);

                    // Play shop sound
                    this.parentScene.sounds.shop.play();

                    // Show success message
                    this.showMessage('Purchase successful!', '#00ff00');
                } else {
                    this.showMessage('Not enough coins!', '#ff0000');
                }
            });
            itemContainer.add(buyBtn);
        });
    }

    showFirstZeroAssetMessage() {
        console.log('Creating chatbox');
        // Create chatbox container
        const chatbox = this.add.container(0, 0);
        chatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.cameras.main.height - 250;

        console.log('Chatbox position:', x, y);

        // Create chatbox background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(x, y, width, height, 16);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.strokeRoundedRect(x, y, width, height, 16);
        chatbox.add(bg);

        // Add message text
        const message = this.add.text(x + width/2, y + height/2, 
            "Press Spacebar to collect coins\nand buy more assets", {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        chatbox.add(message);

        // Add close button
        const closeBtn = this.add.text(x + width - 20, y + 20, 'X', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            console.log('Closing chatbox');
            chatbox.destroy();
        });
        chatbox.add(closeBtn);

        // Auto-destroy after 10 seconds
        this.time.delayedCall(10000, () => {
            if (chatbox.active) {
                console.log('Auto-destroying chatbox');
                chatbox.destroy();
            }
        });
    }
} 