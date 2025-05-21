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
        };
        this.toolbarExpanded = false; // Start closed
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

        // Create the grid in grid layer
        this.createGrid();

        // Launch UI scene
        this.scene.launch('UIScene', { 
            parentScene: this,
            tileSize: this.tileSize,
            iconConfig: this.iconConfig
        });

        // Add reset zoom button to top right
        this.createResetZoomButton();

        // Handle window resize
        this.scale.on('resize', this.handleResize, this);

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

        // Add keyboard delete functionality
        const deleteHandler = () => {
            console.log('Delete key pressed');
            if (this.selectedItem) {
                console.log('Selected item found, attempting to delete');
                // Find and remove the item from placedItems
                for (const [key, item] of this.placedItems.entries()) {
                    if (item === this.selectedItem) {
                        console.log('Item found in placedItems, removing');
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

        // Add a general keydown listener for debugging
        this.input.keyboard.on('keydown', (event) => {
            console.log('Key pressed:', event.key);
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
        // Update grid and items after resize
        this.updateGridAndItems();
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
                this.drawTile(tile, x, y);

                // Diamond-shaped hit area
                const diamond = new Phaser.Geom.Polygon([
                    x, y - tileH / 2, // Top
                    x + tileW / 2, y, // Right
                    x, y + tileH / 2, // Bottom
                    x - tileW / 2, y  // Left
                ]);
                tile.setInteractive(diamond, Phaser.Geom.Polygon.Contains);

                tile.on('pointerover', () => {
                    this.drawTile(tile, x, y, true);
                });
                tile.on('pointerout', () => {
                    this.drawTile(tile, x, y, false);
                });
                tile.on('pointerdown', () => {
                    this.drawTile(tile, x, y, false, true);
                });
                this.tiles.push({ graphics: tile, x: x, y: y, row: row, col: col });
            }
        }
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
                if (this.placedItems.has(tileKey)) {
                    this.placedItems.get(tileKey).destroy();
                    this.placedItems.delete(tileKey);
                }
                this.textures.get(this.draggedItem.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                // Use iconConfig for yOffset and scale
                const config = this.iconConfig[this.draggedItem.textureKey] || { yOffset: this.tileSize / 4, scale: 1 };
                const item = this.add.image(closestTile.x, closestTile.y + config.yOffset, this.draggedItem.textureKey);
                this.gridLayer.add(item);
                item.setOrigin(0.5, 1);
                const baseScale = (this.tileSize / item.width) * (config.scale || 1);
                item.setScale(baseScale * this.baseScale);
                
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
                    this.updateDeleteButtonState(); // Update delete button state
                });
                
                this.placedItems.set(tileKey, item);
            }
            this.draggedItem.destroy();
            this.draggedItem = null;
        }
        this.gridLayer.list.sort((a, b) => a.y - b.y);
    }

    drawTile(graphics, x, y, isHovered = false, isSelected = false) {
        graphics.clear();
        
        // Draw only the outline for the grid
        const strokeColor = isSelected ? 0xff0000 : (isHovered ? 0x00ffff : 0x7cba34);
        
        // Scale the line width inversely to maintain consistent appearance
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
}

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.parentScene = data.parentScene;
        this.tileSize = data.tileSize;
        this.iconConfig = data.iconConfig;
        this.toolbarExpanded = false;
    }

    create() {
        // Create toolbar panel
        this.createToolbarPanel();

        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
    }

    createToolbarPanel() {
        // Icon setup
        const iconKeys = ['tree', 'grass', 'grass1', 'flower', 'flower2', 'fence', 'fence2', 'fencecorner', 'fencecorner2', 'edge1', 'edge2'];
        const iconSpacing = this.tileSize + 10;
        const iconMargin = 16;
        const panelPadding = 12;
        const btnRadius = 16;
        const btnX = btnRadius + 4;
        const btnY = btnRadius + 4;
        const panelWidth = this.tileSize + iconMargin * 2;
        const panelHeight = iconKeys.length * this.tileSize + (iconKeys.length - 1) * 10 + panelPadding * 2 + btnRadius * 2 + 8;

        // Create container for the toolbar
        this.toolbarContainer = this.add.container(20, 20);
        this.toolbarContainer.setDepth(1000);

        // Panel background with rounded corners and border (starts below the button)
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x222222, 0.85);
        panelBg.lineStyle(2, 0xffffff, 0.7);
        panelBg.fillRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        panelBg.strokeRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        this.toolbarContainer.add(panelBg);
        this.panelBg = panelBg; // Save reference for toggling

        // Toggle button (circle with +/−) at top-left
        const toggleBtnBg = this.add.graphics();
        toggleBtnBg.fillStyle(0x444444, 1);
        toggleBtnBg.lineStyle(2, 0xffffff, 0.8);
        toggleBtnBg.fillCircle(btnX, btnY, btnRadius);
        toggleBtnBg.strokeCircle(btnX, btnY, btnRadius);
        this.toolbarContainer.add(toggleBtnBg);
        const toggleBtnText = this.add.text(btnX, btnY, this.toolbarExpanded ? '−' : '+', {
            fontSize: '22px',
            color: '#fff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        toggleBtnText.setInteractive({ useHandCursor: true });
        this.toolbarContainer.add(toggleBtnText);

        // Icons container (vertical, below the button)
        this.iconsContainer = this.add.container(iconMargin, btnRadius * 2 + 8 + panelPadding);
        this.toolbarContainer.add(this.iconsContainer);

        // Set initial visibility based on toolbarExpanded
        this.iconsContainer.alpha = this.toolbarExpanded ? 1 : 0;
        this.iconsContainer.setVisible(this.toolbarExpanded);
        this.panelBg.alpha = this.toolbarExpanded ? 1 : 0;
        this.panelBg.setVisible(this.toolbarExpanded);

        // Create and layout icons vertically
        this.toolbarIcons = [];
        iconKeys.forEach((key, i) => {
            const icon = this.add.image(panelWidth / 2 - iconMargin, i * iconSpacing + this.tileSize / 2, key);
            const scale = (this.tileSize / icon.width) * (this.iconConfig[key].scale || 1);
            icon.setScale(scale);
            icon.setOrigin(0.5, 1);
            icon.setInteractive();
            this.input.setDraggable(icon);
            icon.textureKey = key;
            this.iconsContainer.add(icon);
            this.toolbarIcons.push(icon);
        });

        // Drag handlers for all icons
        this.toolbarIcons.forEach(icon => {
            icon.on('dragstart', (pointer) => {
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

    handleResize(gameSize) {
        // Keep toolbar anchored to top-left
        this.toolbarContainer.setPosition(20, 20);
    }
} 