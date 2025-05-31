// ===== ASSET CONFIGURATION =====
// This is the main configuration for all sprites in the game
// You can easily modify population, prices, initial counts, and display properties here

class IsometricGridScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IsometricGridScene' });
    }

    // ===== INITIALIZATION =====
    initializeFromConfig() {
        // Load configuration from GameConfig
        const config = window.GameConfig || GameConfig;
        
        // ===== CLASS PROPERTIES =====
        // Grid and tile properties
        this.tileSize = config.tileSize;
        this.gridSize = config.gridSize;
        this.tiles = [];
        this.tileStates = new Map(); // Map to store tile states
        this.hoveredPlacementTiles = [];
        this.showGrid = config.showGrid;
        
        // Drag and drop properties
        this.draggedItem = null;
        this.placedItems = new Map(); // Map to store placed items with their positions
        this.selectedItem = null; // Track the currently selected item
        this.rotateButton = null; // Track the rotate button
        
        // View and zoom properties
        this.zoomLevel = config.zoomLevel;
        this.minZoom = config.minZoom;
        this.maxZoom = config.maxZoom;
        this.baseScale = config.baseScale;
        
        // Developer mode properties
        this.developerMode = config.developerMode;
        this.restrictionMode = config.restrictionMode;
        this.restrictedTiles = new Set(); // Set to store restricted tile coordinates
        this.devModeKeySequence = config.devModeKeySequence;
        this.devModeTimeout = null; // Timeout for key sequence reset
        
        // Game state properties
        this.coins = config.coins;
        this.firstZeroAssetShown = config.firstZeroAssetShown;
        this.welcomeMessageShown = config.welcomeMessageShown;
        this.secondWelcomeMessageShown = config.secondWelcomeMessageShown;
        this.quizActive = config.quizActive;
        
        // Population tracking
        this.population = config.population;
        this.populationBoosts = { ...config.populationBoosts };
        
        // Level system
        this.currentLevel = config.currentLevel;
        this.level1Unlocked = config.level1Unlocked;
        this.level2Completed = config.level2Completed;
        this.maxPopulationReached = config.maxPopulationReached;
        
        // Multi-grid system properties
        this.currentGridLayer = config.currentGridLayer;
        this.gridLayers = []; // Array to store all three grid layers
        this.gridTiles = []; // Array to store tiles for each grid layer
        this.gridTileStates = []; // Array to store tile states for each grid layer
        this.gridColors = [...config.gridColors];
        this.gridOffsets = [...config.gridOffsets];
        
        // Initialize Cloud System
        this.cloudSystem = new CloudSystem(this, config);
        
        // Audio instances
        this.sounds = {
            bgm: null,
            button: null,
            correct: null,
            pop: null,
            shop: null
        };
        this.isMuted = config.isMuted;
        
        // ===== ASSET CONFIGURATION - EDIT THESE VALUES EASILY =====
        // This is the main configuration for all sprites in the game
        // You can easily modify population, prices, initial counts, and display properties here
        this.assetConfig = { ...config.assetConfig };
        
        // Create backward-compatible references (for existing code)
        this.iconConfig = {};
        this.spriteInitialCounts = {};
        this.spritePrices = {};
        
        // Populate backward-compatible objects from the new unified config
        Object.keys(this.assetConfig).forEach(key => {
            const assetConfig = this.assetConfig[key];
            this.iconConfig[key] = {
                yOffset: assetConfig.yOffset,
                scale: assetConfig.scale,
                tileSpan: assetConfig.tileSpan
            };
            this.spriteInitialCounts[key] = assetConfig.initialCount;
            this.spritePrices[key] = assetConfig.price;
        });
        
        this.toolbarExpanded = config.toolbarExpanded;
        
        // Initialize sprite counters for each icon type
        this.spriteCounters = new Map();
        const iconKeys = ['hut', 'hut-u1', 'shrine', 'shrine-u1', 'temple', 'temple-u1'];
        iconKeys.forEach(key => {
            this.spriteCounters.set(key, this.spriteInitialCounts[key]); // Use individual initial counts
        });
    }

    // ===== PHASER LIFECYCLE =====
    preload() {
        // Assets are now loaded in LoadingScene
    }

    create() {
        // Initialize properties from config first
        this.initializeFromConfig();
        
        // Initialize MessagePopup system
        this.messagePopup = new MessagePopup(this);
        
        // Initialize audio
        const audioConfig = window.GameConfig?.audioVolumes || GameConfig.audioVolumes;
        this.sounds.bgm = this.sound.add('bgm', { loop: true, volume: audioConfig.bgm });
        this.sounds.button = this.sound.add('button', { volume: audioConfig.button });
        this.sounds.correct = this.sound.add('correct', { volume: audioConfig.correct });
        this.sounds.pop = this.sound.add('pop', { volume: audioConfig.pop });
        this.sounds.shop = this.sound.add('shop', { volume: audioConfig.shop });

        // Start background music
        this.sounds.bgm.play();

        // Create a background container that will zoom and pan with the grid
        this.backgroundContainer = this.add.container(0, 0);
        this.backgroundContainer.setDepth(-1000);

        // Add the background image to the background container
        const bg = this.add.image(0, 0, 'ground');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.backgroundContainer.add(bg);
        
        // Create three grid layers with different vertical offsets
        for (let i = 0; i < 3; i++) {
            const gridLayer = this.add.container(0, this.gridOffsets[i]);
            gridLayer.setVisible(i === this.currentGridLayer); // Only show the current grid layer
            this.gridLayers.push(gridLayer);
            
            // Initialize arrays for this grid layer
            this.gridTiles[i] = [];
            this.gridTileStates[i] = new Map();
        }
        
        // Set the primary grid layer reference for compatibility
        this.gridLayer = this.gridLayers[this.currentGridLayer];
        
        // Add pixie image to bottom left corner
        this.pixieImage = this.add.image(100, this.cameras.main.height - 150, 'pixie');
        this.pixieImage.setScale(2); // Increased scale for better visibility
        this.pixieImage.setDepth(2000); // Ensure it's above other elements

        // Load restricted tiles before creating the grid
        this.loadRestrictedTiles().then(() => {
            // Create grids for all three layers
            this.createAllGrids();

            // Launch UI scene
            this.scene.launch('UIScene', { 
                parentScene: this,
                tileSize: this.tileSize,
                iconConfig: this.iconConfig,
                coins: this.coins,
                population: this.population
            });

            // Calculate initial population
            this.updatePopulation();

            // Add reset zoom button to top right
            this.createResetZoomButton();

            // Handle window resize
            this.scale.on('resize', this.handleResize, this);

            // Add spacebar event listener for quiz
            this.input.keyboard.on('keydown-SPACE', () => {
                if (!this.quizActive) { // Only show quiz if no quiz is currently active
                    this.quizActive = true;
                    this.showQuizDialog();
                }
            });

            // Initialize cloud system
            this.cloudSystem.initialize();
            
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
                    
                    // Apply zoom to all grid layers, but only adjust position for visible layer
                    this.gridLayers.forEach((layer, index) => {
                        layer.setScale(this.zoomLevel);
                        if (index === this.currentGridLayer) {
                            // After scaling, adjust gridLayer position so the point under the cursor stays fixed
                            layer.x = pointer.x - worldX * this.zoomLevel;
                            layer.y = pointer.y - worldY * this.zoomLevel;
                        } else {
                            // Keep other layers aligned with the current layer
                            layer.x = this.gridLayer.x;
                            layer.y = this.gridLayer.y;
                        }
                    });
                    
                    // Apply zoom to background container to keep it aligned with grid
                    if (this.backgroundContainer) {
                        this.backgroundContainer.setScale(this.zoomLevel);
                        // Always align background with layer 0 (green layer) since restricted tiles are only there
                        this.backgroundContainer.x = this.gridLayers[0].x;
                        this.backgroundContainer.y = this.gridLayers[0].y;
                    }
                    
                    // Apply zoom to cloud container as well
                    this.cloudSystem.updateZoom(this.zoomLevel, this.gridLayer.x, this.gridLayer.y);
                }
            });
        });

        // Create delete zone in bottom right corner
        this.createDeleteZone();

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
                } else if (event.key === 'g' || event.key === 'G') {
                    // Developer mode: toggle grid with 'G'
                    this.showGrid = !this.showGrid;
                    this.updateGridAndItems();
                    this.showMessage(this.showGrid ? 'Grid ON' : 'Grid OFF', '#ffff00');
                } else if (event.key === 'l' || event.key === 'L') {
                    // Developer mode: switch between grid layers with 'L'
                    this.switchGridLayer();
                }
            }
        });
    }

    // ===== GRID/TILE SYSTEM =====
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
        // Reset all grid layers
        this.gridLayers.forEach((layer, index) => {
            layer.setScale(1);
            layer.x = 0;
            layer.y = this.gridOffsets[index]; // Set to the original offset for each layer
        });
        
        // Reset background container
        if (this.backgroundContainer) {
            this.backgroundContainer.setScale(1);
            // Always align background with layer 0 (green layer) since restricted tiles are only there
            this.backgroundContainer.x = 0;
            this.backgroundContainer.y = this.gridOffsets[0]; // Layer 0 offset (which is 0)
        }
        
        // Reset cloud container
        this.cloudSystem.resetPosition();
    }

    createDeleteZone() {
        const deleteZoneSize = 120;
        const margin = 20;
        const deleteZoneX = this.cameras.main.width - deleteZoneSize - margin;
        const deleteZoneY = this.cameras.main.height - deleteZoneSize - margin;

        // Create delete zone container
        this.deleteZone = this.add.container(deleteZoneX + deleteZoneSize/2, deleteZoneY + deleteZoneSize/2);
        this.deleteZone.setDepth(1500);

        // Background circle (initially subtle)
        this.deleteZoneBg = this.add.graphics();
        this.deleteZoneBg.fillStyle(0x444444, 0.6);
        this.deleteZoneBg.lineStyle(3, 0xff4444, 0.8);
        this.deleteZoneBg.fillCircle(0, 0, deleteZoneSize/2);
        this.deleteZoneBg.strokeCircle(0, 0, deleteZoneSize/2);
        this.deleteZone.add(this.deleteZoneBg);

        // Trash can icon (using text for simplicity)
        this.deleteZoneIcon = this.add.text(0, 0, '🗑️', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.deleteZone.add(this.deleteZoneIcon);

        // "Delete" text
        this.deleteZoneText = this.add.text(0, 35, 'Delete', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.deleteZone.add(this.deleteZoneText);

        // Store delete zone bounds for collision detection
        this.deleteZoneBounds = {
            x: deleteZoneX,
            y: deleteZoneY,
            width: deleteZoneSize,
            height: deleteZoneSize
        };

        // Handle window resize
        this.scale.on('resize', (gameSize) => {
            const newX = gameSize.width - deleteZoneSize - margin;
            const newY = gameSize.height - deleteZoneSize - margin;
            this.deleteZone.setPosition(newX + deleteZoneSize/2, newY + deleteZoneSize/2);
            this.deleteZoneBounds.x = newX;
            this.deleteZoneBounds.y = newY;
        });

        // Add subtle pulse animation to make delete zone more noticeable
        this.tweens.add({
            targets: this.deleteZone,
            alpha: 0.7,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
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

        // Update population bar positioning
        if (this.populationContainer && this.populationBarBg && this.populationBarFill) {
            // Recalculate bar dimensions
            const toolbarRightEdge = 20 + 200;
            const shopLeftEdge = gameSize.width - coinMarginRight - 50 - 25;
            const newBarX = toolbarRightEdge + 20;
            const newBarWidth = shopLeftEdge - newBarX - 20;
            
            // Store new dimensions
            this.barX = newBarX;
            this.barWidth = newBarWidth;
            
            // Recreate the population bar with new dimensions
            this.populationContainer.destroy();
            const btnX = 0; // Not used in new implementation
            const btnY = 0; // Not used in new implementation  
            const btnRadius = 0; // Not used in new implementation
            this.createPopulationCounter(btnX, btnY, btnRadius);
        }

        // Update pixie position
        if (this.pixieImage) {
            this.pixieImage.setPosition(100, gameSize.height - 1000);
        }
    }

    createAllGrids() {
        // Create grids for all three layers
        for (let layerIndex = 0; layerIndex < 3; layerIndex++) {
            this.createGrid(layerIndex);
        }
        
        // Maintain compatibility with existing code
        this.tiles = this.gridTiles[this.currentGridLayer];
        this.tileStates = this.gridTileStates[this.currentGridLayer];
    }

    createGrid(layerIndex = 0) {
        const tileW = this.tileSize;
        const tileH = this.tileSize / 2;

        // Create a fixed large grid area to ensure all tiles are always in memory
        // This ensures restricted tiles are preserved when panning/zooming
        const maxTiles = 50; // Fixed large area instead of screen-dependent

        // Center the grid horizontally and vertically
        const gridStartX = this.cameras.main.width / 2;
        const gridStartY = this.cameras.main.height / 2;

        this.gridTiles[layerIndex] = [];
        let restrictedCount = 0; // Debug counter
        let checkedTiles = []; // Track tiles we check
        let foundRestrictedSamples = []; // Sample of found restricted tiles
        
        console.log(`Starting grid creation for layer ${layerIndex}...`);
        console.log('restrictedTiles Set size at grid creation:', this.restrictedTiles.size);
        
        for (let row = -maxTiles; row < maxTiles; row++) {
            for (let col = -maxTiles; col < maxTiles; col++) {
                const x = gridStartX + (col - row) * (tileW / 2);
                const y = gridStartY + (col + row) * (tileH / 2);
                
                // Create all tiles in the grid area (removed screen bounds check)
                const tile = this.add.graphics();
                this.gridLayers[layerIndex].add(tile);
                
                const tileKey = `${row},${col}`;
                const isRestricted = layerIndex === 0 && this.restrictedTiles.has(tileKey); // Only apply restrictions to green layer
                
                // Debug: Track some specific tiles
                if (["-18,-6", "-19,-6", "-20,-6", "-5,5", "0,0"].includes(tileKey)) {
                    checkedTiles.push({key: tileKey, restricted: isRestricted});
                }
                
                // Debug: Count restricted tiles and collect samples
                if (isRestricted) {
                    restrictedCount++;
                    if (foundRestrictedSamples.length < 10) {
                        foundRestrictedSamples.push(tileKey);
                    }
                }
                
                this.gridTileStates[layerIndex].set(tileKey, {
                    isHovered: false,
                    isSelected: false,
                    isRestricted: isRestricted
                });
                
                // Only draw tiles that are visible on screen for performance
                const isVisible = !(
                    x + tileW / 2 < 0 || x - tileW / 2 > this.cameras.main.width ||
                    y + tileH / 2 < 0 || y - tileH / 2 > this.cameras.main.height
                );
                
                if (isVisible) {
                    this.drawTile(tile, x, y, false, false, this.gridTileStates[layerIndex].get(tileKey).isRestricted, tileKey, layerIndex);
                }

                // Diamond-shaped hit area
                const diamond = new Phaser.Geom.Polygon([
                    x, y - tileH / 2, // Top
                    x + tileW / 2, y, // Right
                    x, y + tileH / 2, // Bottom
                    x - tileW / 2, y  // Left
                ]);
                tile.setInteractive(diamond, Phaser.Geom.Polygon.Contains);

                // Store tile information
                const tileInfo = { graphics: tile, x: x, y: y, row: row, col: col, layerIndex: layerIndex };
                this.gridTiles[layerIndex].push(tileInfo);

                // Add event handlers
                this.setupTileEventHandlers(tileInfo);
            }
        }
        
        console.log(`Grid layer ${layerIndex} created with ${restrictedCount} restricted tiles out of ${this.gridTiles[layerIndex].length} total tiles`);
        console.log('Checked specific tiles:', checkedTiles);
        console.log('Found restricted samples:', foundRestrictedSamples);
    }

    setupTileEventHandlers(tileInfo) {
        const tileKey = `${tileInfo.row},${tileInfo.col}`;
        const layerIndex = tileInfo.layerIndex;
        const state = this.gridTileStates[layerIndex].get(tileKey);

        tileInfo.graphics.on('pointerover', () => {
            // Only show hover effect if tile is not restricted in normal mode
            if (!state.isRestricted || this.developerMode) {
                state.isHovered = true;
                this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                    state.isHovered, state.isSelected, state.isRestricted, tileKey, layerIndex);
            }
        });

        tileInfo.graphics.on('pointerout', () => {
            state.isHovered = false;
            this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                state.isHovered, state.isSelected, state.isRestricted, tileKey, layerIndex);
        });

        tileInfo.graphics.on('pointerdown', () => {
            if (this.restrictionMode && layerIndex === 0) {
                // Handle restriction mode - only allow on green layer
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
                state.isHovered, state.isSelected, state.isRestricted, tileKey, layerIndex);
        });
    }

    // ===== CLOUD SYSTEM =====
    // Cloud functionality has been moved to the CloudSystem class
    // The cloud system is initialized in the create() method with this.cloudSystem.initialize()

    // ===== DRAG & DROP SYSTEM =====
    getPointerWorldPosition(pointer) {
        // Convert screen coordinates to world coordinates
        const worldX = (pointer.x - this.gridLayer.x) / this.gridLayer.scaleX;
        const worldY = (pointer.y - this.gridLayer.y) / this.gridLayer.scaleY;
        
        return {
            x: worldX,
            y: worldY
        };
    }

    getPointerWorldPositionForTileSelection(pointer) {
        // Convert screen coordinates to world coordinates
        const worldX = (pointer.x - this.gridLayer.x) / this.gridLayer.scaleX;
        const worldY = (pointer.y - this.gridLayer.y) / this.gridLayer.scaleY;
        
        // Apply calibration offset for better isometric tile selection
        // Since the user reports that hovering over a sprite selects the tile below,
        // we need to offset the Y coordinate upward in the isometric space
        const calibrationOffsetY = -this.tileSize / 4; // Offset upward by quarter tile height
        
        return {
            x: worldX,
            y: worldY + calibrationOffsetY
        };
    }

    handleDragEnd(pointer) {
        if (this.draggedItem) {
            const pointerWorld = this.getPointerWorldPositionForTileSelection(pointer);
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
                const config = this.iconConfig[this.draggedItem.textureKey] || { yOffset: this.tileSize / 4, scale: 1, tileSpan: 1 };
                const tileSpan = config.tileSpan || 1;
                let multiTiles = [];
                if (tileSpan > 1) {
                    // Collect all tile keys in the square area
                    for (let dr = 0; dr < tileSpan; dr++) {
                        for (let dc = 0; dc < tileSpan; dc++) {
                            multiTiles.push(`${closestTile.row+dr},${closestTile.col+dc}`);
                        }
                    }
                    // Check all tiles are available
                    for (const key of multiTiles) {
                        if (this.restrictedTiles.has(key) || this.placedItems.has(key)) {
                            this.draggedItem.destroy();
                            this.draggedItem = null;
                            return;
                        }
                    }
                } else {
                    // Check if tile is restricted
                    if (this.restrictedTiles.has(tileKey)) {
                        this.draggedItem.destroy();
                        this.draggedItem = null;
                        return;
                    }
                }
                // Remove existing item if any (for single-tile)
                if (tileSpan === 1 && this.placedItems.has(tileKey)) {
                    const existingItem = this.placedItems.get(tileKey);
                    const replacedTextureKey = existingItem.textureKey;
                    const replacedCount = this.spriteCounters.get(replacedTextureKey);
                    this.spriteCounters.set(replacedTextureKey, replacedCount + 1);
                    this.scene.get('UIScene').updateSpriteCounter(replacedTextureKey, replacedCount + 1);
                    existingItem.destroy();
                    this.placedItems.delete(tileKey);
                }
                // Check if we have sprites available
                const remainingSprites = this.spriteCounters.get(this.draggedItem.textureKey);
                if (remainingSprites <= 0) {
                    this.draggedItem.destroy();
                    this.draggedItem = null;
                    if (!this.firstZeroAssetShown) {
                        this.showFirstZeroAssetMessage();
                        this.firstZeroAssetShown = true;
                    }
                    return;
                }
                this.spriteCounters.set(this.draggedItem.textureKey, remainingSprites - 1);
                this.scene.get('UIScene').updateSpriteCounter(this.draggedItem.textureKey, remainingSprites - 1);
                this.textures.get(this.draggedItem.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                let item;
                if (tileSpan > 1) {
                    // Center over the multi-tile area
                    const topLeft = this.tiles.find(t => `${t.row},${t.col}` === multiTiles[0]);
                    const bottomRight = this.tiles.find(t => `${t.row},${t.col}` === multiTiles[multiTiles.length-1]);
                    const centerX = (topLeft.x + bottomRight.x) / 2;
                    const centerY = (topLeft.y + bottomRight.y) / 2 + config.yOffset;
                    item = this.add.image(centerX, centerY, this.draggedItem.textureKey);
                    this.gridLayer.add(item);
                    item.setOrigin(0.5, 1);
                    // SCALE: always tileSpan * tileSize
                    const baseScale = (this.tileSize * tileSpan / item.width);
                    item.setScale(baseScale * (config.scale || 1) * this.baseScale);
                    item.textureKey = this.draggedItem.textureKey;
                    item.multiTileKeys = multiTiles;
                    for (const key of multiTiles) {
                        this.placedItems.set(key, item);
                    }
                } else {
                    item = this.add.image(closestTile.x, closestTile.y + config.yOffset, this.draggedItem.textureKey);
                    this.gridLayer.add(item);
                    item.setOrigin(0.5, 1);
                    // SCALE: always tileSpan * tileSize (tileSpan=1 here)
                    const baseScale = (this.tileSize * tileSpan / item.width);
                    item.setScale(baseScale * (config.scale || 1) * this.baseScale);
                    item.textureKey = this.draggedItem.textureKey;
                    this.placedItems.set(tileKey, item);
                }
                // Make the item interactive for selection and dragging
                item.setInteractive();
                this.input.setDraggable(item);
                
                // Handle selection
                item.on('pointerdown', () => {
                    console.log('[DEBUG] Sprite clicked! Current selectedItem:', this.selectedItem);
                    console.log('[DEBUG] Clicked item:', item);
                    if (this.selectedItem === item) {
                        console.log('[DEBUG] Deselecting sprite');
                        item.setTint(0xffffff);
                        this.selectedItem = null;
                        this.destroyRotateButton();
                    } else {
                        console.log('[DEBUG] Selecting new sprite');
                        if (this.selectedItem) {
                            console.log('[DEBUG] Clearing previous selection');
                            this.selectedItem.setTint(0xffffff);
                            this.destroyRotateButton();
                        }
                        this.selectedItem = item;
                        item.setTint(0x666666);
                        console.log('[DEBUG] About to create rotate button');
                        this.createRotateButton(item);
                    }
                });

                // Handle dragging placed sprites
                item.on('dragstart', (pointer) => {
                    // Store original position for potential restoration
                    item.originalX = item.x;
                    item.originalY = item.y;
                    item.setDepth(1000); // Bring to front while dragging
                    item.setAlpha(0.7); // Make slightly transparent while dragging
                    
                    // Remove from current position in placedItems map
                    if (item.multiTileKeys) {
                        // Multi-tile item (like castle)
                        for (const key of item.multiTileKeys) {
                            this.placedItems.delete(key);
                        }
                    } else {
                        // Single-tile item
                        for (const [key, placedItem] of this.placedItems.entries()) {
                            if (placedItem === item) {
                                this.placedItems.delete(key);
                                break;
                            }
                        }
                    }
                });

                item.on('drag', (pointer) => {
                    const pointerWorld = this.getPointerWorldPosition(pointer);
                    item.x = pointerWorld.x;
                    item.y = pointerWorld.y;
                    
                    // Update rotate button position if this is the selected item
                    if (this.selectedItem === item) {
                        this.updateRotateButtonPosition();
                    }
                    
                    // Check if hovering over delete zone
                    if (this.checkDeleteZoneHover(pointer)) {
                        this.activateDeleteZone();
                        this.hoveredPlacementTiles = []; // Clear tile highlights when over delete zone
                    } else {
                        this.deactivateDeleteZone();
                        // Show tile highlights while dragging placed sprites
                        this.updateDragHoverTiles(item, pointer);
                    }
                });

                item.on('dragend', (pointer) => {
                    this.handlePlacedSpriteDragEnd(item, pointer);
                });
                this.sounds.pop.play();
                this.draggedItem.destroy();
                this.draggedItem = null;
                this.sortByIsometricDepth();
                // Show second welcome message only once
                if (this.messagePopup.hasPopup('welcome') && !this.secondWelcomeMessageShown) {
                    this.messagePopup.destroyPopup('welcome');
                    this.showSecondWelcomeMessage();
                    this.secondWelcomeMessageShown = true;
                }
                
                // Update population after placing an item
                this.updatePopulation();
                
                return;
            }
            this.draggedItem.destroy();
            this.draggedItem = null;
        }
        this.sortByIsometricDepth();
    }

    handlePlacedSpriteDragEnd(item, pointer) {
        // Clear hover tiles when drag ends
        this.hoveredPlacementTiles = [];
        this.deactivateDeleteZone();
        
        // Check if dropped in delete zone
        if (this.checkDeleteZoneHover(pointer)) {
            this.deleteSprite(item);
                return;
            }
        
        const pointerWorld = this.getPointerWorldPositionForTileSelection(pointer);
        let closestTile = null;
        let minDistance = Infinity;

        // Find the closest tile
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

        // Reset sprite appearance
        item.setAlpha(1);
        item.setDepth(100);

        if (closestTile && minDistance < this.tileSize) {
            const config = this.iconConfig[item.textureKey] || { yOffset: this.tileSize / 4, scale: 1, tileSpan: 1 };
            const tileSpan = config.tileSpan || 1;
            const newTileKey = `${closestTile.row},${closestTile.col}`;

            // Check if the new location is valid
            let canPlace = true;
            let targetTiles = [];

            if (tileSpan > 1) {
                // Multi-tile sprite (like castle)
                for (let dr = 0; dr < tileSpan; dr++) {
                    for (let dc = 0; dc < tileSpan; dc++) {
                        const checkKey = `${closestTile.row+dr},${closestTile.col+dc}`;
                        targetTiles.push(checkKey);
                        
                        // Check if tile is restricted or occupied
                        if (this.restrictedTiles.has(checkKey) || this.placedItems.has(checkKey)) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }
            } else {
                // Single-tile sprite
                targetTiles = [newTileKey];
                if (this.restrictedTiles.has(newTileKey) || this.placedItems.has(newTileKey)) {
                    canPlace = false;
                }
            }

            if (canPlace) {
                // Place sprite at new location
                if (tileSpan > 1) {
                    // Multi-tile sprite positioning
                    const topLeft = this.tiles.find(t => `${t.row},${t.col}` === targetTiles[0]);
                    const bottomRight = this.tiles.find(t => `${t.row},${t.col}` === targetTiles[targetTiles.length-1]);
                    const centerX = (topLeft.x + bottomRight.x) / 2;
                    const centerY = (topLeft.y + bottomRight.y) / 2 + config.yOffset;
                    
                    item.x = centerX;
                    item.y = centerY;
                    item.multiTileKeys = targetTiles;
                    
                    // Update placedItems map for all tiles
                    for (const key of targetTiles) {
                        this.placedItems.set(key, item);
                    }
                } else {
                    // Single-tile sprite positioning
                    item.x = closestTile.x;
                    item.y = closestTile.y + config.yOffset;
                    
                    // Update placedItems map
                    this.placedItems.set(newTileKey, item);
                }

                // Play placement sound
                this.sounds.pop.play();
                
                // Update rotate button position if this item is selected
                if (this.selectedItem === item) {
                    this.updateRotateButtonPosition();
                }
                
                // Update population after moving an item
                this.updatePopulation();
            } else {
                // Invalid location - restore to original position
                item.x = item.originalX;
                item.y = item.originalY;
                
                // Re-add to placedItems map at original location
                if (item.multiTileKeys) {
                    // Multi-tile item
                    for (const key of item.multiTileKeys) {
                        this.placedItems.set(key, item);
                    }
                } else {
                    // Single-tile item - find original position
                    for (const tile of this.tiles) {
                        const config = this.iconConfig[item.textureKey] || { yOffset: this.tileSize / 4 };
                        if (Math.abs(tile.x - item.originalX) < 5 && 
                            Math.abs(tile.y + config.yOffset - item.originalY) < 5) {
                            const tileKey = `${tile.row},${tile.col}`;
                            this.placedItems.set(tileKey, item);
                            break;
        }
                    }
                }
                
                // Show feedback for invalid placement
                this.showMessage('Cannot place here!', '#ff0000');
            }
        } else {
            // No valid tile found - restore to original position
            item.x = item.originalX;
            item.y = item.originalY;
            
            // Re-add to placedItems map at original location
            if (item.multiTileKeys) {
                // Multi-tile item
                for (const key of item.multiTileKeys) {
                    this.placedItems.set(key, item);
                }
            } else {
                // Single-tile item - find original position
                for (const tile of this.tiles) {
                    const config = this.iconConfig[item.textureKey] || { yOffset: this.tileSize / 4 };
                    if (Math.abs(tile.x - item.originalX) < 5 && 
                        Math.abs(tile.y + config.yOffset - item.originalY) < 5) {
                        const tileKey = `${tile.row},${tile.col}`;
                        this.placedItems.set(tileKey, item);
                        break;
                    }
                }
            }
        }

        // Clean up temporary properties
        delete item.originalX;
        delete item.originalY;

        // Update grid to clear any remaining hover effects
        this.updateGridAndItems();

        // Re-sort depth
        this.sortByIsometricDepth();
    }

    updateDragHoverTiles(draggedSprite, pointer) {
        const pointerWorld = this.getPointerWorldPositionForTileSelection(pointer);
        let closestTile = null;
        let minDistance = Infinity;

        // Find the closest tile
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
            const config = this.iconConfig[draggedSprite.textureKey] || { tileSpan: 1 };
            const tileSpan = config.tileSpan || 1;
            let hoverTiles = [];

            // Calculate which tiles would be affected
            for (let dr = 0; dr < tileSpan; dr++) {
                for (let dc = 0; dc < tileSpan; dc++) {
                    hoverTiles.push(`${closestTile.row+dr},${closestTile.col+dc}`);
                }
            }

            this.hoveredPlacementTiles = hoverTiles;
        } else {
            this.hoveredPlacementTiles = [];
        }

        // Update grid to show highlights
        this.updateGridAndItems();
    }

    checkDeleteZoneHover(pointer) {
        if (!this.deleteZoneBounds) return false;
        
        return pointer.x >= this.deleteZoneBounds.x && 
               pointer.x <= this.deleteZoneBounds.x + this.deleteZoneBounds.width &&
               pointer.y >= this.deleteZoneBounds.y && 
               pointer.y <= this.deleteZoneBounds.y + this.deleteZoneBounds.height;
    }

    activateDeleteZone() {
        if (!this.deleteZone) return;
        
        // Enhance visual feedback when hovering over delete zone
        this.deleteZoneBg.clear();
        this.deleteZoneBg.fillStyle(0xff4444, 0.9);
        this.deleteZoneBg.lineStyle(4, 0xffffff, 1);
        this.deleteZoneBg.fillCircle(0, 0, 60);
        this.deleteZoneBg.strokeCircle(0, 0, 60);
        
        // Scale up the icon
        this.tweens.add({
            targets: [this.deleteZoneIcon, this.deleteZoneText],
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            ease: 'Power2'
        });
    }

    deactivateDeleteZone() {
        if (!this.deleteZone) return;
        
        // Return to normal appearance
        this.deleteZoneBg.clear();
        this.deleteZoneBg.fillStyle(0x444444, 0.6);
        this.deleteZoneBg.lineStyle(3, 0xff4444, 0.8);
        this.deleteZoneBg.fillCircle(0, 0, 60);
        this.deleteZoneBg.strokeCircle(0, 0, 60);
        
        // Scale back to normal
        this.tweens.add({
            targets: [this.deleteZoneIcon, this.deleteZoneText],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
        });
    }

    deleteSprite(item) {
        // Remove from placedItems map
        if (item.multiTileKeys) {
            // Multi-tile item (like castle)
            for (const key of item.multiTileKeys) {
                this.placedItems.delete(key);
            }
        } else {
            // Single-tile item
            for (const [key, placedItem] of this.placedItems.entries()) {
                if (placedItem === item) {
                    this.placedItems.delete(key);
                    break;
                }
            }
        }

        // Return sprite to inventory
        const textureKey = item.textureKey;
        const currentCount = this.spriteCounters.get(textureKey);
        this.spriteCounters.set(textureKey, currentCount + 1);
        this.scene.get('UIScene').updateSpriteCounter(textureKey, currentCount + 1);

        // Clear selection if this was the selected item
        if (this.selectedItem === item) {
            this.selectedItem = null;
            this.destroyRotateButton();
        }

        // Create deletion effect
        this.createDeletionEffect(item.x, item.y);

        // Destroy the sprite
        item.destroy();

        // Show feedback message
        this.showMessage('Item deleted!', '#ff4444');
        
        // Update population after deleting an item
        this.updatePopulation();
    }

    createDeletionEffect(x, y) {
        // Create puff of smoke effect
        const particles = this.add.particles(x, y, 'coin', {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 500,
            quantity: 8,
            tint: 0x666666
        });

        // Remove particles after animation
        this.time.delayedCall(600, () => {
            particles.destroy();
        });

        // Play sound effect
        this.sounds.pop.play();
    }

    drawTile(graphics, x, y, isHovered = false, isSelected = false, isRestricted = false, tileKey = null, layerIndex = 0) {
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
                strokeColor = this.gridColors[layerIndex]; // Use grid-specific color
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
            if (isRestricted) {
                return;
            }
            // Darken if this tile is in hoveredPlacementTiles
            if (tileKey && this.hoveredPlacementTiles && this.hoveredPlacementTiles.includes(tileKey)) {
                console.log('[DEBUG] drawTile: darken tile', tileKey, 'hoveredPlacementTiles:', this.hoveredPlacementTiles);
                graphics.fillStyle(0x000000, 0.35);
                graphics.beginPath();
                graphics.moveTo(x, y - this.tileSize / 4); // Top
                graphics.lineTo(x + this.tileSize / 2, y); // Right
                graphics.lineTo(x, y + this.tileSize / 4); // Bottom
                graphics.lineTo(x - this.tileSize / 2, y); // Left
                graphics.closePath();
                graphics.fillPath();
            }
            let strokeColor = null;
            if (!this.showGrid) return;
            if (isSelected) {
                strokeColor = 0xff00ff;
            } else if (isHovered) {
                strokeColor = 0x00ffff;
            } else {
                strokeColor = this.gridColors[layerIndex]; // Use grid-specific color
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
        console.log('[DEBUG] updateGridAndItems called, hoveredPlacementTiles:', this.hoveredPlacementTiles, 'draggedItem:', this.draggedItem ? this.draggedItem.textureKey : null);
        // Update grid tiles (only redraw visible ones for performance)
        this.tiles.forEach(tile => {
            if (tile.graphics) {
                const tileKey = `${tile.row},${tile.col}`;
                const tileW = this.tileSize;
                
                // Check if tile is visible on screen
                const isVisible = !(
                    tile.x + tileW / 2 < 0 || tile.x - tileW / 2 > this.cameras.main.width ||
                    tile.y + tileW / 4 < 0 || tile.y - tileW / 4 > this.cameras.main.height
                );
                
                if (isVisible) {
                    this.drawTile(tile.graphics, tile.x, tile.y, false, false, this.tileStates.get(tileKey).isRestricted, tileKey, this.currentGridLayer);
                }
            }
        });
        // Update placed items
        this.placedItems.forEach(item => {
            if (item) {
                const config = this.iconConfig[item.textureKey] || { yOffset: this.tileSize / 4, scale: 1, tileSpan: 1 };
                const tileSpan = config.tileSpan || 1;
                item.setOrigin(0.5, 1);
                // SCALE: always tileSpan * tileSize
                const baseScale = (this.tileSize * tileSpan / item.width);
                const newScale = baseScale * (config.scale || 1) * this.baseScale;
                
                // Preserve rotation state (horizontal flip)
                const isFlipped = item.scaleX < 0;
                item.setScale(newScale);
                if (isFlipped) {
                    item.scaleX *= -1; // Maintain the flip
                }
            }
        });
        this.sortByIsometricDepth();
    }

    switchGridLayer() {
        if (!this.developerMode) return;
        
        // Hide current grid layer
        this.gridLayers[this.currentGridLayer].setVisible(false);
        
        // Switch to next grid layer (cycle through 0, 1, 2)
        this.currentGridLayer = (this.currentGridLayer + 1) % 3;
        
        // Show new grid layer
        this.gridLayers[this.currentGridLayer].setVisible(true);
        
        // Update references for compatibility
        this.gridLayer = this.gridLayers[this.currentGridLayer];
        this.tiles = this.gridTiles[this.currentGridLayer];
        this.tileStates = this.gridTileStates[this.currentGridLayer];
        
        // Update zoom scaling for the new layer
        this.gridLayer.setScale(this.zoomLevel);
        
        // Ensure background stays aligned with layer 0 when switching layers
        if (this.backgroundContainer) {
            this.backgroundContainer.x = this.gridLayers[0].x;
            this.backgroundContainer.y = this.gridLayers[0].y;
        }
        
        // Update the grid layer indicator
        this.updateGridLayerIndicator();
        
        // Show message indicating which layer is active
        const layerNames = ['Ground Layer', 'Mid Layer', 'Top Layer'];
        const layerColors = ['Green', 'Blue', 'Yellow'];
        this.showMessage(`Switched to: ${layerNames[this.currentGridLayer]} (${layerColors[this.currentGridLayer]})`, this.gridColors[this.currentGridLayer]);
        
        console.log(`Switched to grid layer ${this.currentGridLayer}`);
    }

    // ===== DEVELOPER TOOLS =====
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
                state.isHovered, state.isSelected, state.isRestricted, tileKey);
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
            // Add cache-busting to prevent stale data
            const cacheBuster = new Date().getTime();
            const response = await fetch(`restricted_tiles.json?v=${cacheBuster}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const data = await response.json();
            console.log('Raw JSON data length:', data.length);
            console.log('First 5 raw entries:', data.slice(0, 5));
            
            this.restrictedTiles = new Set(data);
            console.log('Loaded restricted tiles:', this.restrictedTiles.size);
            console.log('Set size after conversion:', this.restrictedTiles.size);
            
            // Verify Set contents
            const arrayFromSet = Array.from(this.restrictedTiles);
            console.log('Sample restricted tiles from Set:', arrayFromSet.slice(0, 5));
            
            // Debug: Check a few specific tiles
            const testTiles = ["-18,-6", "-19,-6", "0,0", "-23,-11", "12,23"];
            testTiles.forEach(tile => {
                console.log(`Tile ${tile} is restricted:`, this.restrictedTiles.has(tile));
            });
            
            // Double-check some tiles that should exist
            console.log('Checking specific tiles that should be restricted:');
            ["-18,-6", "-19,-6", "-20,-6"].forEach(tile => {
                console.log(`  ${tile}: ${this.restrictedTiles.has(tile)}`);
            });
            
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
            
            // Add grid layer indicator
            this.gridLayerText = this.add.text(10, 40, '', {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
                backgroundColor: '#000000'
            });
            this.gridLayerText.setDepth(2000);
            
            // Add instructions text
            this.instructionsText = this.add.text(10, 70, 'Press L to switch layers', {
                fontSize: '14px',
                color: '#ffff00',
                fontStyle: 'bold'
            });
            this.instructionsText.setDepth(2000);
        } else {
            this.devModeText.setVisible(true);
        }
        
        this.updateGridLayerIndicator();
    }

    updateGridLayerIndicator() {
        if (this.gridLayerText) {
            const layerNames = ['Ground Layer', 'Mid Layer', 'Top Layer'];
            const layerColors = ['Green', 'Blue', 'Yellow'];
            this.gridLayerText.setText(`Layer: ${layerNames[this.currentGridLayer]} (${layerColors[this.currentGridLayer]})`);
            this.gridLayerText.setStyle({ color: `#${this.gridColors[this.currentGridLayer].toString(16).padStart(6, '0')}` });
        }
        
        if (this.instructionsText) {
            this.instructionsText.setVisible(true);
        }
    }

    hideDevModeIndicator() {
        // Hide developer mode indicator
        if (this.devModeText) {
            this.devModeText.setVisible(false);
        }
        if (this.gridLayerText) {
            this.gridLayerText.setVisible(false);
        }
        if (this.instructionsText) {
            this.instructionsText.setVisible(false);
        }
    }

    // ===== UI/MISCELLANEOUS =====
    showQuizDialog() {
        // Generate random multiplication question
        let num1, num2, answer;
        
        // Randomly choose between 1x1 digit or 2x1 digit multiplication
        const use2x1 = Phaser.Math.Between(0, 100) < 30; // 30% chance for 2x1 digit
        
        if (use2x1) {
            // 2x1 digit multiplication (10-99 x 1-9, answer must not exceed 150)
            num1 = Phaser.Math.Between(10, 16); // Limited range to ensure answer ≤ 150
            num2 = Phaser.Math.Between(1, 9);
            answer = num1 * num2;
            
            // Double check answer doesn't exceed 150
            if (answer > 150) {
                num1 = Phaser.Math.Between(1, 9);
                num2 = Phaser.Math.Between(1, 9);
                answer = num1 * num2;
            }
        } else {
            // 1x1 digit multiplication
            num1 = Phaser.Math.Between(1, 9);
            num2 = Phaser.Math.Between(1, 9);
            answer = num1 * num2;
        }

        // Generate answer options
        const options = [answer]; // Start with correct answer
        const usedAnswers = new Set([answer]);
        
        // Generate 3 incorrect answer options
        while (options.length < 4) {
            let wrongAnswer;
            
            if (use2x1) {
                // For 2x1 digit questions, generate realistic wrong answers
                const variation = Phaser.Math.Between(-20, 20);
                wrongAnswer = answer + variation;
                
                // Ensure it's positive and different from existing answers
                if (wrongAnswer <= 0 || usedAnswers.has(wrongAnswer)) {
                    wrongAnswer = Phaser.Math.Between(answer - 30, answer + 30);
                }
            } else {
                // For 1x1 digit questions, use nearby multiplication results
                const wrongNum1 = Phaser.Math.Between(1, 9);
                const wrongNum2 = Phaser.Math.Between(1, 9);
                wrongAnswer = wrongNum1 * wrongNum2;
                
                // If it's the same as correct answer, modify it
                if (wrongAnswer === answer) {
                    wrongAnswer = answer + Phaser.Math.Between(-10, 10);
                }
            }
            
            // Ensure answer is positive and unique
            if (wrongAnswer > 0 && !usedAnswers.has(wrongAnswer)) {
                options.push(wrongAnswer);
                usedAnswers.add(wrongAnswer);
            }
        }
        
        // Shuffle the options
        Phaser.Utils.Array.Shuffle(options);

        // Create the quiz dialog with integer options
        this.createKidFriendlyQuizDialog(num1, num2, answer, answer, options);
    }

    createKidFriendlyQuizDialog(num1, num2, answer, correctOption, options) {
        // Dynamic sizing based on content
        const padding = 60;
        const minBoxWidth = 500;
        const maxBoxWidth = 800;
        
        // Measure content width
        const tempText = this.add.text(0, 0, '', { 
            fontSize: '32px', 
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        });

        // Measure question width
        tempText.setText(`${num1} × ${num2} = ?`);
        let maxWidth = tempText.width;

        // Measure option widths
        options.forEach(option => {
            tempText.setText(option);
            if (tempText.width > maxWidth) maxWidth = tempText.width;
        });
        tempText.destroy();

        let dialogWidth = Math.min(Math.max(maxWidth + padding * 2, minBoxWidth), maxBoxWidth);
        let dialogHeight = 500;
        let dialogX = this.cameras.main.width / 2 - dialogWidth / 2;
        let dialogY = this.cameras.main.height / 2 - dialogHeight / 2;

        // Create main container
        this.quizContainer = this.add.container(0, 0);
        this.quizContainer.setDepth(3000);

        // Create animated background with gradient effect
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x4A90E2, 0x7B68EE, 0x50E3C2, 0xF093FB, 1);
        bgGraphics.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 25);
        bgGraphics.lineStyle(5, 0xFFFFFF, 0.8);
        bgGraphics.strokeRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 25);
        this.quizContainer.add(bgGraphics);

        // Add sparkle decorations
        this.createSparkleDecorations(dialogX, dialogY, dialogWidth, dialogHeight);

        // Title with fun styling
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            dialogY + 40,
            '🧮 Math Challenge! 🧮',
            {
                fontSize: '28px',
                color: '#FFFFFF',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                fontStyle: 'bold',
                stroke: '#2C3E50',
                strokeThickness: 4,
                shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
            }
        ).setOrigin(0.5);
        this.quizContainer.add(titleText);

        // Question with emojis and better styling
        const questionText = this.add.text(
            this.cameras.main.width / 2,
            dialogY + 120,
            `✨ ${num1} × ${num2} = ? ✨`,
            {
                fontSize: '36px',
                color: '#FFFFFF',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                fontStyle: 'bold',
                stroke: '#2C3E50',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
            }
        ).setOrigin(0.5);
        this.quizContainer.add(questionText);

        // Instruction text
        const instructionText = this.add.text(
            this.cameras.main.width / 2,
            dialogY + 170,
            'Choose the correct answer:',
            {
                fontSize: '18px',
                color: '#FFE4B5',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.quizContainer.add(instructionText);

        // Create option buttons with improved styling
        this.createQuizOptionButtons(options, correctOption, answer, dialogX, dialogY + 210, dialogWidth);

        // Add floating animation to the entire dialog
        this.tweens.add({
            targets: this.quizContainer,
            y: '+=10',
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Entry animation
        this.quizContainer.setScale(0);
        this.tweens.add({
            targets: this.quizContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }

    createSparkleDecorations(x, y, width, height) {
        const sparklePositions = [
            { x: x + 30, y: y + 30 },
            { x: x + width - 30, y: y + 30 },
            { x: x + 30, y: y + height - 30 },
            { x: x + width - 30, y: y + height - 30 },
            { x: x + width/2, y: y + 20 },
            { x: x + 20, y: y + height/2 },
            { x: x + width - 20, y: y + height/2 }
        ];

        sparklePositions.forEach((pos, index) => {
            const sparkle = this.add.text(pos.x, pos.y, '✨', {
                fontSize: '20px'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: sparkle,
                alpha: 0.3,
                scale: 0.8,
                duration: 1000 + (index * 200),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            this.quizContainer.add(sparkle);
        });
    }

    createQuizOptionButtons(options, correctOption, answer, dialogX, startY, dialogWidth) {
        const buttonHeight = 50;
        const buttonSpacing = 15;
        const buttonWidth = dialogWidth - 100;
        let attempts = 0;
        const maxAttempts = 3; // Allow more attempts
        let correctAnswered = false; // Flag to track if the correct answer has been selected

        options.forEach((option, index) => {
            const buttonY = startY + index * (buttonHeight + buttonSpacing);

            // Create button background
            const buttonBg = this.add.graphics();
            buttonBg.fillGradientStyle(0x3498DB, 0x2980B9, 0x3498DB, 0x2980B9, 1);
            buttonBg.fillRoundedRect(
                dialogX + 50, 
                buttonY, 
                buttonWidth, 
                buttonHeight, 
                15
            );
            buttonBg.lineStyle(3, 0xFFFFFF, 0.8);
            buttonBg.strokeRoundedRect(
                dialogX + 50, 
                buttonY, 
                buttonWidth, 
                buttonHeight, 
                15
            );
            
            // Store original button properties for restoration
            buttonBg.originalFillStyle = {
                color1: 0x3498DB,
                color2: 0x2980B9
            };
            buttonBg.isDisabled = false;
            
            // Make it interactive
            buttonBg.setInteractive(
                new Phaser.Geom.Rectangle(dialogX + 50, buttonY, buttonWidth, buttonHeight),
                Phaser.Geom.Rectangle.Contains
            );

            // Button text
            const buttonText = this.add.text(
                this.cameras.main.width / 2,
                buttonY + buttonHeight/2,
                option.toString(), // Convert number to string for display
                {
                    fontSize: '20px',
                    color: '#FFFFFF',
                    fontFamily: 'Comic Sans MS, cursive, sans-serif',
                    fontStyle: 'bold',
                    stroke: '#2C3E50',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);

            // Hover effects
            buttonBg.on('pointerover', () => {
                if (correctAnswered || buttonBg.isDisabled) return; // Don't show hover effects if game over or button disabled
                buttonBg.clear();
                buttonBg.fillGradientStyle(0x2980B9, 0x1A5276, 0x2980B9, 0x1A5276, 1);
                buttonBg.fillRoundedRect(
                    dialogX + 50, 
                    buttonY, 
                    buttonWidth, 
                    buttonHeight, 
                    15
                );
                buttonBg.lineStyle(3, 0xFFFFFF, 0.8);
                buttonBg.strokeRoundedRect(
                    dialogX + 50, 
                    buttonY, 
                    buttonWidth, 
                    buttonHeight, 
                    15
                );
            });

            buttonBg.on('pointerout', () => {
                if (correctAnswered || buttonBg.isDisabled) return; // Don't restore if disabled or game over
                buttonBg.clear();
                buttonBg.fillGradientStyle(buttonBg.originalFillStyle.color1, buttonBg.originalFillStyle.color2, buttonBg.originalFillStyle.color1, buttonBg.originalFillStyle.color2, 1);
                buttonBg.fillRoundedRect(
                    dialogX + 50, 
                    buttonY, 
                    buttonWidth, 
                    buttonHeight, 
                    15
                );
                buttonBg.lineStyle(3, 0xFFFFFF, 0.8);
                buttonBg.strokeRoundedRect(
                    dialogX + 50, 
                    buttonY, 
                    buttonWidth, 
                    buttonHeight, 
                    15
                );
            });

            // Click handler
            buttonBg.on('pointerdown', () => {
                // Prevent clicks on disabled buttons or if already answered correctly
                if (correctAnswered || buttonBg.isDisabled) return;
                
                this.sounds.button.play();
                
                if (option === answer) {
                    // Correct answer - celebrate and close quiz immediately
                    correctAnswered = true;
                    
                    // Disable all buttons
                    this.quizContainer.list.forEach(child => {
                        if (child.input) {
                            child.disableInteractive();
                        }
                    });
                    
                    this.celebrateCorrectAnswer(buttonBg, buttonText);
                    
                    // Close quiz immediately after brief celebration
                    this.time.delayedCall(1000, () => {
                        this.quizContainer.destroy();
                        this.quizActive = false;
                    });
                } else {
                    // Wrong answer - mark this button as wrong and disabled
                    attempts++;
                    buttonBg.isDisabled = true;
                    this.showWrongAnswer(buttonBg, buttonText, attempts >= maxAttempts);
                    
                    // If max attempts reached, disable all buttons and end quiz
                    if (attempts >= maxAttempts) {
                        this.quizContainer.list.forEach(child => {
                            if (child.input) {
                                child.disableInteractive();
                            }
                        });
                        
                        this.time.delayedCall(2000, () => {
                            this.quizContainer.destroy();
                            this.quizActive = false;
                            this.showMessage('Try again next time! 🌟', '#FF6B6B');
                        });
                    }
                }
            });

            this.quizContainer.add(buttonBg);
            this.quizContainer.add(buttonText);
        });
    }

    celebrateCorrectAnswer(buttonBg, buttonText) {
        // Change button to green with celebration
        buttonBg.clear();
        buttonBg.fillGradientStyle(0x2ECC71, 0x27AE60, 0x2ECC71, 0x27AE60, 1);
        buttonBg.fillRoundedRect(
            buttonBg.x, buttonBg.y, 
            buttonBg.width, buttonBg.height, 
            15
        );

        // Create a coin sprite that will animate to the coin counter
        const coin = this.add.image(buttonText.x, buttonText.y, 'coin');
        coin.setScale(0.5);
        coin.setDepth(3001);

        // Get the position of the coin counter in the UI scene
        const uiScene = this.scene.get('UIScene');
        const coinCounterPos = uiScene.getCoinCounterPosition();

        // Animate the coin to the coin counter
        this.tweens.add({
            targets: coin,
            x: coinCounterPos.x,
            y: coinCounterPos.y,
            scale: 0.3,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                coin.destroy();
                // Give 20 coins - update both scenes to keep them in sync
                this.coins += 20;
                uiScene.coins += 20;
                uiScene.updateCoins(uiScene.coins);
                this.sounds.correct.play();
            }
        });
    }

    showWrongAnswer(buttonBg, buttonText, isGameOver) {
        // Change button to red
        buttonBg.clear();
        buttonBg.fillGradientStyle(0xE74C3C, 0xC0392B, 0xE74C3C, 0xC0392B, 1);
        buttonBg.fillRoundedRect(
            buttonBg.x, buttonBg.y,
            buttonBg.width, buttonBg.height,
            15
        );

        // Shake animation
        this.tweens.add({
            targets: [buttonBg, buttonText],
            x: '+=10',
            duration: 100,
            ease: 'Power2',
            yoyo: true,
            repeat: 2
        });

        const message = isGameOver ? 'Game Over! 😢' : 'Try again! 💪';
        this.showMessage(message, '#FF6B6B');
    }

    showVictoryCelebration() {
        // Create victory message
        const victoryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            '🎉 AMAZING! 🎉',
            {
                fontSize: '40px',
                color: '#FFD700',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                fontStyle: 'bold',
                stroke: '#2C3E50',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Victory animation
        victoryText.setScale(0);
        this.tweens.add({
            targets: victoryText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: victoryText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300
                });
            }
        });

        // Remove victory text after animation
        this.time.delayedCall(2000, () => {
            victoryText.destroy();
        });
    }

    showMessage(text, color) {
        return this.messagePopup.showSimpleMessage(text, color);
    }

    showWelcomeMessage() {
        return this.messagePopup.showChatbox({
            id: 'welcome',
            text: "Hey, I'm Link\nDrag and drop an item\nto the ground",
            theme: 'welcome',
            decorations: [
                { emoji: '⭐', x: 30, y: 20, size: '20px' },
                { emoji: '✨', x: 350, y: 25, size: '16px' },
                { emoji: '🌟', x: 50, y: 110, size: '18px' }
            ]
        });
    }

    showSecondWelcomeMessage() {
        return this.messagePopup.showChatbox({
            id: 'secondWelcome',
            text: "Now create your own dragon city!",
            theme: 'success',
            decorations: [
                { emoji: '🌱', x: 30, y: 20, size: '20px' },
                { emoji: '🌸', x: 350, y: 25, size: '18px' },
                { emoji: '🌿', x: 50, y: 115, size: '16px' },
                { emoji: '✨', x: 330, y: 115, size: '16px' }
            ],
            autoClose: 10000
        });
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

    addEnhancedChatboxGlow(chatbox, x, y, width, height) {
        // Create enhanced glow graphics with multiple colors
        const glow = this.add.graphics();
        glow.setDepth(1999); // Just below the chatbox
        
        // Initial glow state
        let alpha = 1;
        let growing = false;
        let colorPhase = 0;
        
        // Color array for cycling glow effect
        const glowColors = [0x00FF00, 0x00FFFF, 0x0080FF, 0x8000FF]; // Green to cyan to blue to purple
        
        // Enhanced animation function
        const updateGlow = () => {
            glow.clear();
            
            // Update alpha
            if (growing) {
                alpha += 0.03;
                if (alpha >= 1) {
                    alpha = 1;
                    growing = false;
                }
            } else {
                alpha -= 0.03;
                if (alpha <= 0.4) {
                    alpha = 0.4;
                    growing = true;
                    colorPhase = (colorPhase + 1) % glowColors.length; // Cycle colors
                }
            }
            
            // Draw multiple glow layers for enhanced effect
            const currentColor = glowColors[colorPhase];
            
            // Outer glow (larger, more transparent)
            glow.lineStyle(6, currentColor, alpha * 0.3);
            glow.strokeRoundedRect(x - 4, y - 4, width + 8, height + 8, 24);
            
            // Middle glow
            glow.lineStyle(4, currentColor, alpha * 0.6);
            glow.strokeRoundedRect(x - 2, y - 2, width + 4, height + 4, 22);
            
            // Inner glow (brightest)
            glow.lineStyle(2, currentColor, alpha);
            glow.strokeRoundedRect(x, y, width, height, 20);
        };
        
        // Start the enhanced animation
        const glowEvent = this.time.addEvent({
            delay: 60, // Faster animation for more excitement
            callback: updateGlow,
            callbackScope: this,
            loop: true
        });
        
        // Store the glow and animation event for cleanup
        chatbox.glow = glow;
        chatbox.glowEvent = this.time.addEvent({
            delay: 5000, // Longer glow duration for the new message
            callback: () => {
                glow.destroy();
                glowEvent.remove();
                chatbox.glow = null;
            }
        });
    }

    showFirstZeroAssetMessage() {
        console.log('Creating chatbox');
        return this.messagePopup.showChatbox({
            id: 'firstZeroAsset',
            text: "Press Spacebar to collect coins\nand buy more assets",
            theme: 'alert',
            decorations: [
                { emoji: '🪙', x: 25, y: 15, size: '18px' },
                { emoji: '💰', x: 355, y: 20, size: '16px' },
                { emoji: '🛒', x: 40, y: 115, size: '16px' }
            ],
            autoClose: 10000
        });
    }

    showShopDialog() {
        // Remove existing dialog if any
        if (this.shopDialog) {
            this.shopDialog.destroy();
        }

        // Dialog dimensions
        const dialogWidth = 520;
        const dialogHeight = 580;
        const dialogX = this.cameras.main.width / 2 - dialogWidth / 2;
        const dialogY = this.cameras.main.height / 2 - dialogHeight / 2;

        // Create dialog container
        this.shopDialog = this.add.container(0, 0);
        this.shopDialog.setDepth(3000);

        // Create mystical dragon shop background
        const dialogBg = this.add.graphics();
        
        // Outer shadow for depth
        dialogBg.fillStyle(0x000000, 0.5);
        dialogBg.fillRoundedRect(dialogX + 8, dialogY + 8, dialogWidth, dialogHeight, 30);
        
        // Main dragon shop background (dark mystical colors)
        dialogBg.fillGradientStyle(0x2C1810, 0x8B0000, 0x4B0000, 0x1F1F1F, 1);
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 30);
        
        // Dragon fire glow effect at top
        dialogBg.fillGradientStyle(0xFF4500, 0xFF6347, 0xFF8C00, 0xFFD700, 0.7);
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogWidth, 90, 30);
        dialogBg.fillRect(dialogX, dialogY + 60, dialogWidth, 30);
        
        // Stone texture effect
        for (let i = 0; i < 6; i++) {
            const stoneY = dialogY + 90 + (i * 80);
            dialogBg.lineStyle(1, 0x696969, 0.4);
            dialogBg.beginPath();
            dialogBg.moveTo(dialogX + 15, stoneY);
            dialogBg.lineTo(dialogX + dialogWidth - 15, stoneY);
            dialogBg.strokePath();
        }
        
        // Dragon shop border with mystical glow
        dialogBg.lineStyle(8, 0xFFD700, 0.9);
        dialogBg.strokeRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 30);
        dialogBg.lineStyle(4, 0xFF4500, 0.7);
        dialogBg.strokeRoundedRect(dialogX + 4, dialogY + 4, dialogWidth - 8, dialogHeight - 8, 26);
        
        this.shopDialog.add(dialogBg);

        // Add dragon decorations
        const decorations = [
            { emoji: '🐲', x: dialogX + 40, y: dialogY + 25, size: '28px' },
            { emoji: '🔥', x: dialogX + dialogWidth - 60, y: dialogY + 30, size: '24px' },
            { emoji: '💎', x: dialogX + 80, y: dialogY + 50, size: '20px' },
            { emoji: '⚡', x: dialogX + dialogWidth - 90, y: dialogY + 55, size: '18px' },
            { emoji: '✨', x: dialogX + dialogWidth / 2 - 40, y: dialogY + 20, size: '22px' },
            { emoji: '🌟', x: dialogX + dialogWidth / 2 + 40, y: dialogY + 25, size: '20px' }
        ];
        
        decorations.forEach(dec => {
            const decoration = this.add.text(dec.x, dec.y, dec.emoji, { fontSize: dec.size });
            this.shopDialog.add(decoration);
            
            // Add mystical floating animation
            this.tweens.add({
                targets: decoration,
                y: dec.y - 8,
                rotation: dec.emoji === '🐲' ? 0.1 : 0.05,
                duration: 2500 + Math.random() * 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        });

        // Add dragon shop title
        const title = this.add.text(this.cameras.main.width / 2, dialogY + 45, '🐲 Dragon Emporium 🐲', {
            fontSize: '30px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#8B0000',
            strokeThickness: 5,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5, 0);
        this.shopDialog.add(title);

        // Add dragon shop banner
        const banner = this.add.text(this.cameras.main.width / 2, dialogY + 80, 'Legendary Items & Dragon Treasures! 🔥', {
            fontSize: '16px',
            color: '#FF6347',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);
        this.shopDialog.add(banner);

        // Add enhanced close button
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(3, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
        closeBtnBg.strokeCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
        this.shopDialog.add(closeBtnBg);
        
        const closeBtn = this.add.text(dialogX + dialogWidth - 30, dialogY + 30, '✕', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => this.shopDialog.destroy());
        
        // Close button hover effect
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(3, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
            closeBtnBg.strokeCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(3, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
            closeBtnBg.strokeCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
        });
        
        this.shopDialog.add(closeBtn);

        // Dragon Shop items grid - Dragon Theme
        const iconKeys = ['hut', 'hut-u1', 'shrine', 'shrine-u1', 'temple', 'temple-u1'];
        const itemNames = {
            hut: 'Dragon Hut',
            'hut-u1': 'Upgraded Hut',
            shrine: 'Dragon Shrine',
            'shrine-u1': 'Legendary Shrine',
            temple: 'Temple',
            'temple-u1': 'Legendary Temple'
        };
        
        const itemsPerRow = 4;
        const itemCellWidth = 110;
        const itemCellHeight = 130;
        const gridWidth = itemsPerRow * itemCellWidth;
        const numRows = Math.ceil(iconKeys.length / itemsPerRow);
        const gridHeight = numRows * itemCellHeight;
        const gridStartX = this.cameras.main.width / 2 - gridWidth / 2;
        const gridStartY = dialogY + 110;

        iconKeys.forEach((key, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = gridStartX + col * itemCellWidth + itemCellWidth / 2;
            const y = gridStartY + row * itemCellHeight;

            // Create dragon treasure display for each item
            const itemContainer = this.add.container(x, y);
            this.shopDialog.add(itemContainer);

            // Create mystical dragon treasure display background
            const treasureBg = this.add.graphics();
            
            // Treasure shadow
            treasureBg.fillStyle(0x000000, 0.4);
            treasureBg.fillRoundedRect(-45, -15, 90, 100, 15);
            
            // Treasure base (mystical dark stone look)
            treasureBg.fillGradientStyle(0x2F1B14, 0x8B0000, 0x654321, 0x2F4F4F, 0.9);
            treasureBg.fillRoundedRect(-48, -18, 90, 100, 15);
            
            // Dragon scale effect
            treasureBg.lineStyle(1, 0xFFD700, 0.3);
            for (let i = 0; i < 4; i++) {
                const scaleY = -10 + (i * 20);
                treasureBg.beginPath();
                treasureBg.moveTo(-40, scaleY);
                treasureBg.lineTo(35, scaleY);
                treasureBg.strokePath();
            }
            
            // Mystical border (glowing effect)
            treasureBg.lineStyle(3, 0xFFD700, 0.8);
            treasureBg.strokeRoundedRect(-48, -18, 90, 100, 15);
            treasureBg.lineStyle(1, 0xFF4500, 0.6);
            treasureBg.strokeRoundedRect(-46, -16, 86, 96, 13);
            
            itemContainer.add(treasureBg);

            // Add item icon with mystical glow
            const itemIcon = this.add.image(0, -5, key);
            const scale = Math.min(50 / itemIcon.width, 50 / itemIcon.height) * (this.iconConfig[key].scale || 1);
            itemIcon.setScale(scale);
            itemContainer.add(itemIcon);

            // Add price tag (like dragon treasure tags)
            const priceTagBg = this.add.graphics();
            const price = this.spritePrices[key];
            
            // Price tag background (mystical gold)
            priceTagBg.fillGradientStyle(0xFFD700, 0xFFA500, 0xFF8C00, 0xDAA520, 1);
            priceTagBg.fillRoundedRect(-25, 25, 50, 20, 10);
            priceTagBg.lineStyle(2, 0x8B0000, 1);
            priceTagBg.strokeRoundedRect(-25, 25, 50, 20, 10);
            
            // Price tag chain effect
            priceTagBg.lineStyle(2, 0x696969, 0.7);
            priceTagBg.beginPath();
            priceTagBg.moveTo(0, 15);
            priceTagBg.lineTo(0, 25);
            priceTagBg.strokePath();
            
            itemContainer.add(priceTagBg);

            const priceText = this.add.text(0, 35, `${price} 💰`, {
                fontSize: '14px',
                color: '#8B0000',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                stroke: '#FFD700',
                strokeThickness: 1
            }).setOrigin(0.5);
            itemContainer.add(priceText);

            // Add dragon-style buy button
            const buyBtnBg = this.add.graphics();
            const canAfford = this.coins >= price;
            const btnColor = canAfford ? 0x228B22 : 0x8B0000;
            const btnText = canAfford ? 'OBTAIN!' : 'Need Gold 💰';
            
            // Button shadow
            buyBtnBg.fillStyle(0x000000, 0.4);
            buyBtnBg.fillRoundedRect(-30, 52, 60, 24, 12);
            
            // Button gradient with dragon theme
            buyBtnBg.fillGradientStyle(btnColor, btnColor * 0.7, btnColor * 1.3, btnColor, 1);
            buyBtnBg.fillRoundedRect(-32, 50, 60, 24, 12);
            
            // Button highlight
            buyBtnBg.fillGradientStyle(0xFFD700, 0xFFD700, 0xFFA500, 0xFFA500, 0.4);
            buyBtnBg.fillRoundedRect(-30, 52, 56, 8, 8);
            
            // Button mystical border
            buyBtnBg.lineStyle(2, 0xFFD700, 0.9);
            buyBtnBg.strokeRoundedRect(-32, 50, 60, 24, 12);
            
            itemContainer.add(buyBtnBg);

            const buyBtn = this.add.text(0, 62, btnText, {
                fontSize: canAfford ? '11px' : '9px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });

            if (canAfford) {
                // Add mystical glow animation to available items
                this.tweens.add({
                    targets: [itemIcon, priceTagBg, priceText],
                    y: '+=3',
                    alpha: 0.8,
                    duration: 1800 + Math.random() * 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });

                // Buy button functionality
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

                        // Add dragon purchase celebration effect
                        const celebration = this.add.text(0, 30, '🐲 ACQUIRED! 🔥', {
                            fontSize: '16px',
                            color: '#FFD700',
                            fontStyle: 'bold',
                            fontFamily: 'Comic Sans MS, cursive, sans-serif',
                            stroke: '#8B0000',
                            strokeThickness: 2
                        }).setOrigin(0.5);
                        
                        itemContainer.add(celebration);
                        
                        this.tweens.add({
                            targets: celebration,
                            y: 10,
                            alpha: 0,
                            scaleX: 1.5,
                            scaleY: 1.5,
                            rotation: 0.1,
                            duration: 1200,
                            ease: 'Power2',
                            onComplete: () => celebration.destroy()
                        });

                        // Show dragon success message
                        this.showMessage('🐲 Dragon treasure acquired! 🔥', '#FFD700');
                        
                        // Update this item's affordability in place
                        this.time.delayedCall(1000, () => {
                            const newCanAfford = this.coins >= price;
                            if (!newCanAfford) {
                                // Update button appearance to "can't afford"
                                buyBtnBg.clear();
                                
                                // Button shadow
                                buyBtnBg.fillStyle(0x000000, 0.4);
                                buyBtnBg.fillRoundedRect(-30, 52, 60, 24, 12);
                                
                                // Button gradient (red for can't afford)
                                buyBtnBg.fillGradientStyle(0x8B0000, 0x8B0000 * 0.7, 0x8B0000 * 1.3, 0x8B0000, 1);
                                buyBtnBg.fillRoundedRect(-32, 50, 60, 24, 12);
                                
                                // Button highlight
                                buyBtnBg.fillGradientStyle(0xFFD700, 0xFFD700, 0xFFA500, 0xFFA500, 0.4);
                                buyBtnBg.fillRoundedRect(-30, 52, 56, 8, 8);
                                
                                // Button border
                                buyBtnBg.lineStyle(2, 0xFFD700, 0.9);
                                buyBtnBg.strokeRoundedRect(-32, 50, 60, 24, 12);
                                
                                // Update button text
                                buyBtn.setText('Need Gold 💰');
                                buyBtn.setFontSize('9px');
                                buyBtn.disableInteractive();
                            }
                        });
                    } else {
                        this.showMessage('🐲 Insufficient dragon gold! 💰', '#FF4500');
                    }
                });

                // Hover effects for affordable items
                buyBtn.on('pointerover', () => {
                    this.tweens.add({
                        targets: buyBtn,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 200,
                        ease: 'Power2'
                    });
                });

                buyBtn.on('pointerout', () => {
                    this.tweens.add({
                        targets: buyBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                        ease: 'Power2'
                    });
                });
            }

            itemContainer.add(buyBtn);
        });

        // Add mystical dragon shop entrance animation
        this.shopDialog.setScale(0);
        this.tweens.add({
            targets: this.shopDialog,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut'
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

    createRotateButton(item) {
        console.log('[DEBUG] createRotateButton called for item:', item);
        console.log('[DEBUG] Item position:', item.x, item.y);
        console.log('[DEBUG] Current zoom level:', this.zoomLevel);
        console.log('[DEBUG] GridLayer position:', this.gridLayer.x, this.gridLayer.y);
        
        // Calculate screen position of the item considering zoom and pan
        const screenX = (item.x * this.zoomLevel) + this.gridLayer.x;
        const screenY = ((item.y - 80) * this.zoomLevel) + this.gridLayer.y;
        
        console.log('[DEBUG] Calculated screen position:', screenX, screenY);
        console.log('[DEBUG] Camera dimensions:', this.cameras.main.width, this.cameras.main.height);
        
        // Destroy existing rotate button if any
        if (this.rotateButton) {
            console.log('[DEBUG] Destroying existing rotate button');
            this.rotateButton.destroy();
            this.rotateButton = null;
        }
        
        // Create rotate button container at screen coordinates (NOT added to gridLayer)
        this.rotateButton = this.add.container(screenX, screenY);
        this.rotateButton.setDepth(5000); // Even higher depth to ensure visibility
        
        console.log('[DEBUG] Rotate button created with depth:', this.rotateButton.depth);
        console.log('[DEBUG] Rotate button position:', this.rotateButton.x, this.rotateButton.y);
        console.log('[DEBUG] Rotate button visible:', this.rotateButton.visible);
        console.log('[DEBUG] Rotate button alpha:', this.rotateButton.alpha);
        
        // Create button background circle (smaller and positioned above sprite)
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x4A90E2, 1);
        btnBg.lineStyle(2, 0xFFFFFF, 1);
        btnBg.fillCircle(0, 0, 18);
        btnBg.strokeCircle(0, 0, 18);
        this.rotateButton.add(btnBg);
        
        // Create rotate icon (using text for simplicity)
        const rotateIcon = this.add.text(0, 0, '↻', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.rotateButton.add(rotateIcon);
        
        console.log('[DEBUG] Button background and icon added');
        console.log('[DEBUG] Container children count:', this.rotateButton.list.length);
        
        // Make button interactive with appropriate hit area
        btnBg.setInteractive(new Phaser.Geom.Circle(0, 0, 18), Phaser.Geom.Circle.Contains);
        btnBg.on('pointerdown', (pointer) => {
            console.log('[DEBUG] Rotate button clicked!');
            // Stop event propagation to prevent sprite deselection
            pointer.event.stopPropagation();
            this.rotateItem(item);
        });
        
        // Add hover effects
        btnBg.on('pointerover', () => {
            console.log('[DEBUG] Rotate button hovered');
            btnBg.clear();
            btnBg.fillStyle(0x357ABD, 1);
            btnBg.lineStyle(2, 0xFFFFFF, 1);
            btnBg.fillCircle(0, 0, 18);
            btnBg.strokeCircle(0, 0, 18);
            this.rotateButton.setScale(1.1); // Slight scale up on hover
        });
        
        btnBg.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x4A90E2, 1);
            btnBg.lineStyle(2, 0xFFFFFF, 1);
            btnBg.fillCircle(0, 0, 18);
            btnBg.strokeCircle(0, 0, 18);
            this.rotateButton.setScale(1); // Back to normal scale
        });
        
        // Store reference to the item for position updates
        this.rotateButton.targetItem = item;
        
        // Add a subtle pulsing animation to make it more noticeable
        this.tweens.add({
            targets: this.rotateButton,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        console.log('[DEBUG] Rotate button creation completed');
        
        // Additional debug: force position to center of screen temporarily for testing
        // this.rotateButton.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
        // console.log('[DEBUG] TEMP: Positioned button at screen center for testing');
    }

    destroyRotateButton() {
        console.log('[DEBUG] destroyRotateButton called, current button:', this.rotateButton);
        if (this.rotateButton) {
            console.log('[DEBUG] Destroying rotate button');
            this.rotateButton.destroy();
            this.rotateButton = null;
        } else {
            console.log('[DEBUG] No rotate button to destroy');
        }
    }

    updateRotateButtonPosition() {
        if (this.rotateButton && this.rotateButton.targetItem) {
            // Calculate screen position considering zoom and pan
            const item = this.rotateButton.targetItem;
            const screenX = (item.x * this.zoomLevel) + this.gridLayer.x;
            const screenY = ((item.y - 80) * this.zoomLevel) + this.gridLayer.y;
            
            this.rotateButton.setPosition(screenX, screenY);
        }
    }

    rotateItem(item) {
        // Flip the sprite horizontally
        item.scaleX *= -1;
        this.sounds.button.play();
        
        // Automatically deselect the sprite to "commit" the rotation
        if (this.selectedItem === item) {
            item.setTint(0xffffff); // Remove selection tint
            this.selectedItem = null;
            this.destroyRotateButton(); // Hide the rotate button
        }
        
        console.log('[DEBUG] Sprite rotated and deselected. New scaleX:', item.scaleX);
    }

    calculatePopulation() {
        let totalPopulation = 0;
        
        // Track unique items to avoid counting multi-tile items multiple times
        const uniqueItems = new Set();
        const itemCounts = {};
        
        // Initialize counters for all assets that have population values
        Object.keys(this.assetConfig).forEach(key => {
            if (this.assetConfig[key].population > 0) {
                itemCounts[key] = 0;
            }
        });
        
        // Count unique placed items (avoid counting multi-tile items multiple times)
        this.placedItems.forEach(item => {
            // Use the item object reference as unique identifier
            if (!uniqueItems.has(item)) {
                uniqueItems.add(item);
                const textureKey = item.textureKey;
                if (itemCounts.hasOwnProperty(textureKey)) {
                    itemCounts[textureKey]++;
                }
            }
        });
        
        // Calculate total population using the new asset configuration
        Object.keys(itemCounts).forEach(key => {
            const count = itemCounts[key];
            const populationBoost = this.assetConfig[key].population;
            totalPopulation += count * populationBoost;
        });
        
        this.population = totalPopulation;
        
        // Update UI scene with new population
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
            uiScene.updatePopulation(this.population);
        }
        
        return totalPopulation;
    }

    updatePopulation() {
        this.calculatePopulation();
        
        // Check for level progression
        this.checkLevelProgression();
    }
    
    checkLevelProgression() {
        // Update max population reached
        if (this.population > this.maxPopulationReached) {
            this.maxPopulationReached = this.population;
        }
        
        // Check if level 1 should be unlocked (reaching 150 population for first time)
        if (!this.level1Unlocked && this.maxPopulationReached >= 150) {
            this.unlockLevel1();
        }
        
        // Check if level 2 should be completed (all items unlocked AND population >= 600)
        if (!this.level2Completed && this.level1Unlocked && this.population >= 600) {
            this.completeLevel2();
        }
    }
    
    unlockLevel1() {
        this.level1Unlocked = true;
        this.currentLevel = 1;
        
        // No longer give free items - players must purchase them
        // Just unlock the ability to use u1 items they've purchased
        
        // Update UI to reflect the unlock (items may now be draggable)
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
            // Refresh all u1 items to make them draggable if owned
            ['hut-u1', 'shrine-u1', 'temple-u1'].forEach(key => {
                const currentCount = this.spriteCounters.get(key) || 0;
                uiScene.updateSpriteCounter(key, currentCount);
            });
            
            // Update the population bar to show extended range
            uiScene.updatePopulationBar();
        }
        
        // Show level up message
        this.showLevelUpMessage();
    }
    
    showLevelUpMessage() {
        return this.messagePopup.showDialog({
            id: 'levelUp',
            title: '🎉 LEVEL UP! 🎉',
            width: 400,
            height: 350,
            theme: 'levelup',
            content: [
                {
                    type: 'text',
                    text: 'New Buildings Unlocked!',
                    offsetY: -80,
                    fontSize: '18px',
                    color: '#ECF0F1'
                },
                {
                    type: 'text',
                    text: '• Upgraded Hut (+15 population)\n• Legendary Shrine (+50 population)\n• Legendary Temple (+100 population)',
                    offsetY: -20,
                    fontSize: '16px',
                    color: '#52C4B0',
                    align: 'left'
                },
                {
                    type: 'text',
                    text: 'Purchase them from the shop! 🛒\nPopulation bar extended to 600! 📊',
                    offsetY: 80,
                    fontSize: '16px',
                    color: '#BDC3C7'
                }
            ],
            animations: {
                entranceScale: 1.1,
                pulse: {
                    alpha: 0.8,
                    duration: 1000,
                    repeat: 3
                }
            },
            autoClose: 6000
        });
    }

    // Improved depth sorting for isometric view
    // Primary sort: Y position (closer to bottom boundary = in front)
    // Secondary sort: X position (closer to right boundary = in front) when Y values are very close
    // For multi-tile sprites, use the topmost tile position for depth calculation
    sortByIsometricDepth() {
        this.gridLayer.list.sort((a, b) => {
            // Calculate effective position for depth sorting
            let aY = a.y;
            let aX = a.x;
            let bY = b.y;
            let bX = b.x;
            
            // For multi-tile sprites, use the topmost tile position
            if (a.multiTileKeys && a.multiTileKeys.length > 0) {
                // Find the topmost tile (smallest row value)
                let topTile = null;
                let minRow = Infinity;
                
                for (const tileKey of a.multiTileKeys) {
                    const [row, col] = tileKey.split(',').map(Number);
                    if (row < minRow) {
                        minRow = row;
                        topTile = this.tiles.find(t => t.row === row && t.col === parseInt(col));
                    }
                }
                
                if (topTile) {
                    aY = topTile.y;
                    aX = topTile.x;
                }
            }
            
            if (b.multiTileKeys && b.multiTileKeys.length > 0) {
                // Find the topmost tile (smallest row value)
                let topTile = null;
                let minRow = Infinity;
                
                for (const tileKey of b.multiTileKeys) {
                    const [row, col] = tileKey.split(',').map(Number);
                    if (row < minRow) {
                        minRow = row;
                        topTile = this.tiles.find(t => t.row === row && t.col === parseInt(col));
                    }
                }
                
                if (topTile) {
                    bY = topTile.y;
                    bX = topTile.x;
                }
            }
            
            // Primary sort by Y position (higher Y = closer to bottom = in front)
            const yDiff = aY - bY;
            
            // If Y positions are very close (within 10 pixels), use X position as tiebreaker
            if (Math.abs(yDiff) < 10) {
                // Secondary sort by X position (higher X = closer to right = in front)
                return aX - bX;
            }
            
            return yDiff;
        });
    }
    
    completeLevel2() {
        this.level2Completed = true;
        this.currentLevel = 2;
        
        // Show level 2 completion message
        this.showLevel2CompletionMessage();
    }
    
    showLevel2CompletionMessage() {
        // Play epic celebration sound
        this.sounds.correct.play();
        
        // Add screen particles effect
        this.createLevel2ParticleEffect();
        
        return this.messagePopup.showDialog({
            id: 'level2Completion',
            title: '🏆 LEVEL 2 COMPLETE! 🏆',
            width: 500,
            height: 400,
            theme: 'completion',
            content: [
                {
                    type: 'text',
                    text: 'MAXIMUM POPULATION ACHIEVED!',
                    offsetY: -150,
                    fontSize: '20px',
                    fontStyle: 'bold',
                    strokeThickness: 2,
                    align: 'center'
                },
                {
                    type: 'text',
                    text: '✨ ALL BUILDINGS UNLOCKED ✨\n🌟 POPULATION: 600/600 🌟\n🎯 CITY MASTERY COMPLETE 🎯',
                    offsetY: -50,
                    fontSize: '18px',
                    strokeThickness: 2,
                    align: 'center'
                },
                {
                    type: 'text',
                    text: 'Congratulations, Master Builder!\nYou have created the ultimate city!',
                    offsetY: 50,
                    fontSize: '16px',
                    color: '#BDC3C7',
                    fontStyle: 'italic',
                    align: 'center'
                },
                {
                    type: 'text',
                    text: '🎊 Continue building and exploring! 🎊',
                    offsetY: 150,
                    fontSize: '18px',
                    color: '#F39C12',
                    fontStyle: 'bold',
                    align: 'center'
                }
            ],
            animations: {
                entranceScale: 1.2,
                entranceDuration: 800,
                pulse: {
                    alpha: 0.8,
                    duration: 1000,
                    repeat: -1
                }
            },
            autoClose: 10000
        });
    }
    
    createLevel2ParticleEffect() {
        // Create celebratory particles across the screen
        for (let i = 0; i < 20; i++) {
            const particle = this.add.text(
                Phaser.Math.Between(0, this.cameras.main.width),
                Phaser.Math.Between(0, this.cameras.main.height),
                ['⭐', '🌟', '✨', '🎉', '🏆', '👑'][Phaser.Math.Between(0, 5)],
                { fontSize: '24px' }
            );
            particle.setDepth(3500);
            
            // Animate particles
            this.tweens.add({
                targets: particle,
                y: particle.y - 200,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 3000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
}
