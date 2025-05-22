class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.loadingProgress = 0;
    }

    preload() {
        // Load the loading screen background first
        this.load.image('loadingBg', 'assets/loading-screen.png');
        
        // Load all game assets
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
        this.load.image('castle', 'assets/castle.png');
        this.load.image('hut', 'assets/hut.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('wave-wall', 'assets/wave-wall.png');
        this.load.image('tower1', 'assets/tower1.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('shop', 'assets/shop.png');
        this.load.image('pixie', 'assets/pixie.png');
        
        // Load audio files
        this.load.audio('bgm', 'assets/audio/bgm.mp3');
        this.load.audio('button', 'assets/audio/button.mp3');
        this.load.audio('correct', 'assets/audio/correct.mp3');
        this.load.audio('pop', 'assets/audio/pop.mp3');
        this.load.audio('shop', 'assets/audio/shop.mp3');

        // Store progress for later use
        this.loadingProgress = 0;
        
        // Set up loading progress events
        this.load.on('progress', (percentage) => {
            this.loadingProgress = percentage;
            // Only update if loading bar exists
            if (this.loadingBar) {
                this.updateLoadingBar(percentage);
            }
        });

        this.load.on('complete', () => {
            // Show start game button when loading is complete
            this.time.delayedCall(500, () => {
                this.showStartButton();
            });
        });
    }

    create() {
        // Create background
        const bg = this.add.image(0, 0, 'loadingBg');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Create loading bar graphics now that camera is available
        this.createLoadingBar();
        
        // Update with current progress if any loading has happened
        if (this.loadingProgress > 0) {
            this.updateLoadingBar(this.loadingProgress);
        }

        // Create loading text with beautiful styling
        this.loadingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.7, 
            'Loading Your Magical Garden...', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            fontStyle: 'bold',
            stroke: '#2C3E50',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5);

        // Add loading animation
        this.tweens.add({
            targets: this.loadingText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add magical sparkles
        this.createSparkles();
    }

    createLoadingBar() {
        const barWidth = 400;
        const barHeight = 20;
        const barX = this.cameras.main.width / 2 - barWidth / 2;
        const barY = this.cameras.main.height * 0.8;

        // Loading bar background
        this.loadingBarBg = this.add.graphics();
        this.loadingBarBg.fillStyle(0x000000, 0.7);
        this.loadingBarBg.fillRoundedRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10, 10);
        this.loadingBarBg.lineStyle(3, 0xFFFFFF, 0.8);
        this.loadingBarBg.strokeRoundedRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10, 10);

        // Loading bar fill
        this.loadingBar = this.add.graphics();

        // Loading percentage text
        this.percentageText = this.add.text(this.cameras.main.width / 2, barY + 40, '0%', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            fontStyle: 'bold',
            stroke: '#2C3E50',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    updateLoadingBar(percentage) {
        // Safety check to ensure loading bar exists
        if (!this.loadingBar || !this.percentageText) {
            return;
        }
        
        const barWidth = 400;
        const barHeight = 20;
        const barX = this.cameras.main.width / 2 - barWidth / 2;
        const barY = this.cameras.main.height * 0.8;

        this.loadingBar.clear();
        
        // Gradient fill based on progress
        const fillWidth = barWidth * percentage;
        if (fillWidth > 0) {
            // Create a colorful gradient that changes as loading progresses
            let startColor, endColor;
            if (percentage < 0.33) {
                startColor = 0xFF6B6B; // Red to orange
                endColor = 0xFFA500;
            } else if (percentage < 0.66) {
                startColor = 0xFFA500; // Orange to yellow
                endColor = 0xFFD700;
            } else {
                startColor = 0xFFD700; // Yellow to green
                endColor = 0x32CD32;
            }
            
            this.loadingBar.fillGradientStyle(startColor, endColor, startColor, endColor, 1);
            this.loadingBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 8);
        }

        // Update percentage text
        this.percentageText.setText(Math.round(percentage * 100) + '%');
        
        // Update loading text when complete
        if (percentage >= 1) {
            this.loadingText.setText('Loading Complete!');
            this.loadingText.setStyle({ color: '#32CD32' }); // Green color for completion
        }
    }

    showStartButton() {
        // Create start game button
        const buttonY = this.cameras.main.height * 0.9;
        
        // Button background with beautiful styling
        const startButtonBg = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = this.cameras.main.width / 2 - buttonWidth / 2;
        
        // Button shadow
        startButtonBg.fillStyle(0x000000, 0.3);
        startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight, 15);
        
        // Main button gradient (vibrant blue to green)
        startButtonBg.fillGradientStyle(0x4CAF50, 0x45A049, 0x66BB6A, 0x4CAF50, 1);
        startButtonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        
        // Button highlight
        startButtonBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
        startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth - 8, buttonHeight / 2, 12);
        
        // Button border
        startButtonBg.lineStyle(3, 0xFFFFFF, 0.8);
        startButtonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        
        // Button text
        const startButtonText = this.add.text(
            this.cameras.main.width / 2,
            buttonY + buttonHeight / 2,
            'START GAME',
            {
                fontSize: '24px',
                color: '#FFFFFF',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                fontStyle: 'bold',
                stroke: '#2C5530',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
            }
        ).setOrigin(0.5);
        
        // Make button interactive
        const buttonArea = this.add.rectangle(
            this.cameras.main.width / 2,
            buttonY + buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        buttonArea.setInteractive({ useHandCursor: true });
        
        // Button click handler
        buttonArea.on('pointerdown', () => {
            // Button press animation
            this.tweens.add({
                targets: [startButtonBg, startButtonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    // Start the main game
                    this.scene.start('IsometricGridScene');
                }
            });
        });
        
        // Button hover effects
        buttonArea.on('pointerover', () => {
            this.tweens.add({
                targets: [startButtonBg, startButtonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
            
            // Change button color on hover
            startButtonBg.clear();
            // Button shadow
            startButtonBg.fillStyle(0x000000, 0.4);
            startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight, 15);
            
            // Brighter gradient on hover
            startButtonBg.fillGradientStyle(0x66BB6A, 0x4CAF50, 0x81C784, 0x66BB6A, 1);
            startButtonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
            
            // Button highlight
            startButtonBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.4);
            startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth - 8, buttonHeight / 2, 12);
            
            // Button border
            startButtonBg.lineStyle(4, 0xFFFFFF, 1);
            startButtonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        });
        
        buttonArea.on('pointerout', () => {
            this.tweens.add({
                targets: [startButtonBg, startButtonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
            
            // Return to normal color
            startButtonBg.clear();
            // Button shadow
            startButtonBg.fillStyle(0x000000, 0.3);
            startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth, buttonHeight, 15);
            
            // Normal gradient
            startButtonBg.fillGradientStyle(0x4CAF50, 0x45A049, 0x66BB6A, 0x4CAF50, 1);
            startButtonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
            
            // Button highlight
            startButtonBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
            startButtonBg.fillRoundedRect(buttonX + 4, buttonY + 4, buttonWidth - 8, buttonHeight / 2, 12);
            
            // Button border
            startButtonBg.lineStyle(3, 0xFFFFFF, 0.8);
            startButtonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        });
        
        // Button entrance animation
        startButtonBg.setScale(0);
        startButtonText.setScale(0);
        
        this.tweens.add({
            targets: [startButtonBg, startButtonText],
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut'
        });
        
        // Add pulsing animation to make it more noticeable
        this.tweens.add({
            targets: [startButtonBg, startButtonText],
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createSparkles() {
        // Create floating sparkles around the screen
        const sparkleCount = 15;
        for (let i = 0; i < sparkleCount; i++) {
            const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
            const y = Phaser.Math.Between(50, this.cameras.main.height - 100);
            
            const sparkle = this.add.text(x, y, '✨', {
                fontSize: Phaser.Math.Between(16, 28) + 'px'
            }).setOrigin(0.5);

            // Random floating animation
            this.tweens.add({
                targets: sparkle,
                y: y - Phaser.Math.Between(20, 40),
                alpha: 0.3,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });

            // Rotation animation
            this.tweens.add({
                targets: sparkle,
                rotation: Math.PI * 2,
                duration: Phaser.Math.Between(3000, 5000),
                ease: 'Linear',
                repeat: -1
            });
        }
    }
}

class IsometricGridScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IsometricGridScene' });
        this.tileSize = 64; // Size of the diamond tile
        this.gridSize = 10; // 10x10 grid
        this.tiles = [];
        this.draggedItem = null;
        this.placedItems = new Map(); // Map to store placed items with their positions
        this.selectedItem = null; // Track the currently selected item
        this.rotateButton = null; // Track the rotate button
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
        this.secondWelcomeMessageShown = false; // Track if second welcome message has been shown
        this.showGrid = false; // Grid is hidden by default (toggle available in dev mode)
        this.hoveredPlacementTiles = [];
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
            fence:  { yOffset: this.tileSize / 4 + 10,  scale: 1, tileSpan: 1 },
            fence2: { yOffset: this.tileSize / 4 + 10,  scale: 1, tileSpan: 1 },
            castle: { yOffset: this.tileSize / 4 + 19, scale: 1.1, tileSpan: 2 },
            hut: { yOffset: this.tileSize / 4 + 2, scale: 1.0, tileSpan: 1 },
            wall: { yOffset: this.tileSize / 4 + 8, scale: 1.0, tileSpan: 1 },
            'wave-wall': { yOffset: this.tileSize / 4 + 8, scale: 1.0, tileSpan: 1 },
            tower1: { yOffset: this.tileSize / 4 + 5, scale: 1.1, tileSpan: 1 }
        };
        // Configuration for initial sprite counts
        this.spriteInitialCounts = {
            fence: 1,
            fence2: 1,
            castle: 0,
            hut: 2,
            wall: 0,
            'wave-wall': 1,
            tower1: 0
        };
        // Configuration for shop prices - Dragon City Theme
        this.spritePrices = {
            fence: 15,      // Dragon Fence
            fence2: 15,     // Magic Barrier
            castle: 50,     // Dragon Castle
            hut: 20,        // Dragon Hut
            wall: 30,       // Dragon Wall
            'wave-wall': 35,  // Wave Dragon Wall
            tower1: 40      // Dragon Tower
        };
        this.toolbarExpanded = false; // Start closed
        
        // Initialize sprite counters for each icon type
        this.spriteCounters = new Map();
        const iconKeys = ['fence', 'fence2', 'castle', 'hut', 'wall', 'wave-wall', 'tower1'];
        iconKeys.forEach(key => {
            this.spriteCounters.set(key, this.spriteInitialCounts[key]); // Use individual initial counts
        });
    }

    preload() {
        // Assets are now loaded in LoadingScene
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

        // Update pixie position
        if (this.pixieImage) {
            this.pixieImage.setPosition(100, gameSize.height - 150);
        }
    }

    createGrid() {
        const tileW = this.tileSize;
        const tileH = this.tileSize / 2;

        // Create a fixed large grid area to ensure all tiles are always in memory
        // This ensures restricted tiles are preserved when panning/zooming
        const maxTiles = 50; // Fixed large area instead of screen-dependent

        // Center the grid horizontally and vertically
        const gridStartX = this.cameras.main.width / 2;
        const gridStartY = this.cameras.main.height / 2;

        this.tiles = [];
        let restrictedCount = 0; // Debug counter
        let checkedTiles = []; // Track tiles we check
        let foundRestrictedSamples = []; // Sample of found restricted tiles
        
        console.log('Starting grid creation...');
        console.log('restrictedTiles Set size at grid creation:', this.restrictedTiles.size);
        
        for (let row = -maxTiles; row < maxTiles; row++) {
            for (let col = -maxTiles; col < maxTiles; col++) {
                const x = gridStartX + (col - row) * (tileW / 2);
                const y = gridStartY + (col + row) * (tileH / 2);
                
                // Create all tiles in the grid area (removed screen bounds check)
                const tile = this.add.graphics();
                this.gridLayer.add(tile);
                
                const tileKey = `${row},${col}`;
                const isRestricted = this.restrictedTiles.has(tileKey);
                
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
                
                this.tileStates.set(tileKey, {
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
                    this.drawTile(tile, x, y, false, false, this.tileStates.get(tileKey).isRestricted, tileKey);
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
                const tileInfo = { graphics: tile, x: x, y: y, row: row, col: col };
                this.tiles.push(tileInfo);

                // Add event handlers
                this.setupTileEventHandlers(tileInfo);
            }
        }
        
        console.log(`Grid created with ${restrictedCount} restricted tiles out of ${this.tiles.length} total tiles`);
        console.log('Checked specific tiles:', checkedTiles);
        console.log('Found restricted samples:', foundRestrictedSamples);
    }

    setupTileEventHandlers(tileInfo) {
        const tileKey = `${tileInfo.row},${tileInfo.col}`;
        const state = this.tileStates.get(tileKey);

        tileInfo.graphics.on('pointerover', () => {
            // Only show hover effect if tile is not restricted in normal mode
            if (!state.isRestricted || this.developerMode) {
                state.isHovered = true;
                this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                    state.isHovered, state.isSelected, state.isRestricted, tileKey);
            }
        });

        tileInfo.graphics.on('pointerout', () => {
            state.isHovered = false;
            this.drawTile(tileInfo.graphics, tileInfo.x, tileInfo.y, 
                state.isHovered, state.isSelected, state.isRestricted, tileKey);
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
                state.isHovered, state.isSelected, state.isRestricted, tileKey);
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
                this.gridLayer.list.sort((a, b) => a.y - b.y);
                // Show second welcome message only once
                if (this.welcomeChatbox && !this.secondWelcomeMessageShown) {
                    this.welcomeChatbox.destroy();
                    this.showSecondWelcomeMessage();
                    this.secondWelcomeMessageShown = true;
                }
                return;
            }
            this.draggedItem.destroy();
            this.draggedItem = null;
        }
        this.gridLayer.list.sort((a, b) => a.y - b.y);
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
        
        const pointerWorld = this.getPointerWorldPosition(pointer);
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
        this.gridLayer.list.sort((a, b) => a.y - b.y);
    }

    updateDragHoverTiles(draggedSprite, pointer) {
        const pointerWorld = this.getPointerWorldPosition(pointer);
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

    drawTile(graphics, x, y, isHovered = false, isSelected = false, isRestricted = false, tileKey = null) {
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
                strokeColor = 0x7cba34;
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
                    this.drawTile(tile.graphics, tile.x, tile.y, false, false, this.tileStates.get(tileKey).isRestricted, tileKey);
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
        const num1 = Phaser.Math.Between(2, 10);
        const num2 = Phaser.Math.Between(2, 10);
        const answer = num1 * num2;

        // Randomly decide which repeated addition to use for the correct answer
        const useNum1 = Phaser.Math.Between(0, 1) === 0;
        let correctOption;
        if (useNum1) {
            correctOption = Array(num2).fill(num1).join('+');
        } else {
            correctOption = Array(num1).fill(num2).join('+');
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
        Phaser.Utils.Array.Shuffle(options);

        // Create the new kid-friendly quiz dialog
        this.createKidFriendlyQuizDialog(num1, num2, answer, correctOption, options);
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
            'Choose the correct repeated addition:',
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
        const maxAttempts = 2;

        const evaluateRepeatedAddition = (expression) => {
            const parts = expression.split('+');
            return parts.reduce((sum, num) => sum + parseInt(num), 0);
        };

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
            
            // Make it interactive
            buttonBg.setInteractive(
                new Phaser.Geom.Rectangle(dialogX + 50, buttonY, buttonWidth, buttonHeight),
                Phaser.Geom.Rectangle.Contains
            );

            // Button text
            const buttonText = this.add.text(
                this.cameras.main.width / 2,
                buttonY + buttonHeight/2,
                option,
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
                buttonBg.clear();
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
            });

            // Click handler
            buttonBg.on('pointerdown', () => {
                this.sounds.button.play();
                const result = evaluateRepeatedAddition(option);
                
                if (result === answer && option === correctOption) {
                    // Correct answer - celebrate and complete quiz
                    this.celebrateCorrectAnswer(buttonBg, buttonText);
                    this.time.delayedCall(2000, () => {
                        this.quizContainer.destroy();
                        this.showVictoryCelebration();
                    });
                } else {
                    // Wrong answer
                    attempts++;
                    this.showWrongAnswer(buttonBg, buttonText, attempts >= maxAttempts);
                    
                    if (attempts >= maxAttempts) {
                        this.time.delayedCall(2000, () => {
                            this.quizContainer.destroy();
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
                // Update coins after animation
                        this.coins += 20;
                uiScene.updateCoins(this.coins);
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
            '🎉 AMAZING! 🎉\nYou earned 20 coins!',
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

        this.time.delayedCall(3000, () => {
            victoryText.destroy();
        });
    }

    evaluateRepeatedAddition(expression) {
        const parts = expression.split('+');
        return parts.reduce((sum, num) => sum + parseInt(num), 0);
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

        // Create chatbox background with gradient and kid-friendly styling
        const bg = this.add.graphics();
        
        // Drop shadow effect
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(x + 4, y + 4, width, height, 20);
        
        // Main gradient background (purple to pink)
        bg.fillGradientStyle(0x9B59B6, 0xE91E63, 0x3498DB, 0xF39C12, 1);
        bg.fillRoundedRect(x, y, width, height, 20);
        
        // Inner highlight for depth
        bg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.2);
        bg.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 16);
        
        // Bright border with glow effect
        bg.lineStyle(3, 0xFFFFFF, 0.9);
        bg.strokeRoundedRect(x, y, width, height, 20);
        
        this.welcomeChatbox.add(bg);

        // Add decorative stars
        const star1 = this.add.text(x + 30, y + 20, '⭐', { fontSize: '20px' });
        const star2 = this.add.text(x + width - 50, y + 25, '✨', { fontSize: '16px' });
        const star3 = this.add.text(x + 50, y + height - 40, '🌟', { fontSize: '18px' });
        this.welcomeChatbox.add(star1);
        this.welcomeChatbox.add(star2);
        this.welcomeChatbox.add(star3);
        
        // Add message text with better styling
        const message = this.add.text(x + width/2, y + height/2, 
            "Hey, I'm Athena\nDrag and drop an item\nto the ground", {
            fontSize: '22px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#2C3E50',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        this.welcomeChatbox.add(message);

        // Add close button with better styling
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
        closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        this.welcomeChatbox.add(closeBtnBg);
        
        const closeBtn = this.add.text(x + width - 25, y + 25, '✕', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            this.welcomeChatbox.destroy();
        });
        
        // Add hover effect to close button
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        this.welcomeChatbox.add(closeBtn);

        // Add initial glow effect
        this.addChatboxGlow(this.welcomeChatbox, x, y, width, height);
    }

    showSecondWelcomeMessage() {
        // Create second chatbox container
        this.welcomeChatbox = this.add.container(0, 0);
        this.welcomeChatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.cameras.main.height - 250;

        // Create chatbox background with gradient and kid-friendly styling
        const bg = this.add.graphics();
        
        // Drop shadow effect
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(x + 4, y + 4, width, height, 20);
        
        // Main gradient background (green to blue for success/progress)
        bg.fillGradientStyle(0x2ECC71, 0x27AE60, 0x3498DB, 0x2980B9, 1);
        bg.fillRoundedRect(x, y, width, height, 20);
        
        // Inner highlight for depth
        bg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.2);
        bg.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 16);
        
        // Bright border with glow effect
        bg.lineStyle(3, 0xFFFFFF, 0.9);
        bg.strokeRoundedRect(x, y, width, height, 20);
        
        this.welcomeChatbox.add(bg);

        // Add decorative elements for garden theme
        const plant1 = this.add.text(x + 30, y + 20, '🌱', { fontSize: '20px' });
        const plant2 = this.add.text(x + width - 50, y + 25, '🌸', { fontSize: '18px' });
        const plant3 = this.add.text(x + 50, y + height - 40, '🌿', { fontSize: '16px' });
        const sparkle = this.add.text(x + width - 70, y + height - 35, '✨', { fontSize: '16px' });
        this.welcomeChatbox.add(plant1);
        this.welcomeChatbox.add(plant2);
        this.welcomeChatbox.add(plant3);
        this.welcomeChatbox.add(sparkle);
        
        // Add message text with better styling
        const message = this.add.text(x + width/2, y + height/2, 
            "Now create your own dragon city!", {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#2C3E50',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        this.welcomeChatbox.add(message);

        // Add close button with better styling
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
        closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        this.welcomeChatbox.add(closeBtnBg);
        
        const closeBtn = this.add.text(x + width - 25, y + 25, '✕', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            // Cancel the auto-destroy timer when manually closed
            if (this.secondWelcomeMessageTimer) {
                this.secondWelcomeMessageTimer.remove();
                this.secondWelcomeMessageTimer = null;
            }
            this.welcomeChatbox.destroy();
            this.welcomeChatbox = null;
        });
        
        // Add hover effect to close button
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        this.welcomeChatbox.add(closeBtn);

        // Add entrance animation
        this.welcomeChatbox.setScale(0);
        this.tweens.add({
            targets: this.welcomeChatbox,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add enhanced glow effect for the new message
                this.addEnhancedChatboxGlow(this.welcomeChatbox, x, y, width, height);
            }
        });

        // Auto-destroy after 10 seconds of inactivity
        this.secondWelcomeMessageTimer = this.time.delayedCall(10000, () => {
            if (this.welcomeChatbox && this.welcomeChatbox.active) {
                this.welcomeChatbox.destroy();
                this.welcomeChatbox = null;
            }
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
        // Create chatbox container
        const chatbox = this.add.container(0, 0);
        chatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.cameras.main.height - 250;

        console.log('Chatbox position:', x, y);

        // Create chatbox background with gradient and kid-friendly styling
        const bg = this.add.graphics();
        
        // Drop shadow effect
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(x + 4, y + 4, width, height, 20);
        
        // Main gradient background (orange to yellow for alert)
        bg.fillGradientStyle(0xF39C12, 0xE67E22, 0xF1C40F, 0xE74C3C, 1);
        bg.fillRoundedRect(x, y, width, height, 20);
        
        // Inner highlight for depth
        bg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.2);
        bg.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 16);
        
        // Bright border with glow effect
        bg.lineStyle(3, 0xFFFFFF, 0.9);
        bg.strokeRoundedRect(x, y, width, height, 20);
        
        chatbox.add(bg);

        // Add decorative icons
        const coin1 = this.add.text(x + 25, y + 15, '🪙', { fontSize: '18px' });
        const coin2 = this.add.text(x + width - 45, y + 20, '💰', { fontSize: '16px' });
        const shopping = this.add.text(x + 40, y + height - 35, '🛒', { fontSize: '16px' });
        chatbox.add(coin1);
        chatbox.add(coin2);
        chatbox.add(shopping);
        
        // Add message text with better styling
        const message = this.add.text(x + width/2, y + height/2, 
            "Press Spacebar to collect coins\nand buy more assets", {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#2C3E50',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        chatbox.add(message);

        // Add close button with better styling
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
        closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        chatbox.add(closeBtnBg);
        
        const closeBtn = this.add.text(x + width - 25, y + 25, '✕', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            console.log('Closing chatbox');
            chatbox.destroy();
        });
        
        // Add hover effect to close button
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
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
        const iconKeys = ['fence', 'fence2', 'castle', 'hut', 'wall', 'wave-wall', 'tower1'];
        const itemNames = {
            fence: 'Dragon Fence',
            fence2: 'Magic Barrier',
            castle: 'Dragon Castle',
            hut: 'Dragon Hut',
            wall: 'Dragon Wall',
            'wave-wall': 'Wave Dragon Wall',
            tower1: 'Dragon Tower'
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
        this.coins = data.coins || 0;
        this.toolbarExpanded = true;
    }

    getCoinCounterPosition() {
        // Return the position of the coin counter in screen coordinates
        // The coin counter is positioned with coinMarginRight = 180 from the right edge
        return {
            x: this.cameras.main.width - 150, // Near the coin counter in top right
            y: 30   // Same y position as the coin counter
        };
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

        this.input.on('pointermove', (pointer) => {
            if (this.parentScene.draggedItem) {
                const pointerWorld = this.parentScene.getPointerWorldPosition(pointer);
                let closestTile = null;
                let minDistance = Infinity;
                for (const tile of this.parentScene.tiles) {
                    const distance = Phaser.Math.Distance.Between(
                        pointerWorld.x, pointerWorld.y,
                        tile.x, tile.y
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTile = tile;
                    }
                }
                if (closestTile && minDistance < this.parentScene.tileSize) {
                    const config = this.parentScene.iconConfig[this.parentScene.draggedItem.textureKey] || { tileSpan: 1 };
                    const tileSpan = config.tileSpan || 1;
                    let hoverTiles = [];
                    for (let dr = 0; dr < tileSpan; dr++) {
                        for (let dc = 0; dc < tileSpan; dc++) {
                            hoverTiles.push(`${closestTile.row+dr},${closestTile.col+dc}`);
                        }
                    }
                    this.parentScene.hoveredPlacementTiles = hoverTiles;
                } else {
                    this.parentScene.hoveredPlacementTiles = [];
                }
                this.parentScene.updateGridAndItems();
            } else if (this.parentScene.hoveredPlacementTiles.length > 0) {
                this.parentScene.hoveredPlacementTiles = [];
                this.parentScene.updateGridAndItems();
            }
        });
    }

    createToolbarPanel() {
        // Icon setup
        const iconKeys = ['fence', 'fence2', 'castle', 'hut', 'wall', 'wave-wall', 'tower1'];
        const iconSpacing = this.tileSize + 20; // Increased spacing for gaps between boxes
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

        // Enhanced panel background with gradient and depth
        const panelBg = this.add.graphics();
        
        // Drop shadow for depth
        panelBg.fillStyle(0x000000, 0.4);
        panelBg.fillRoundedRect(4, btnRadius * 2 + 12, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        
        // Main gradient background (dark blue to purple)
        panelBg.fillGradientStyle(0x2C3E50, 0x34495E, 0x8E44AD, 0x9B59B6, 0.95);
        panelBg.fillRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        
        // Inner highlight for modern look
        panelBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.1);
        panelBg.fillRoundedRect(6, btnRadius * 2 + 14, panelWidth - 12, panelHeight - (btnRadius * 2 + 20), 12);
        
        // Bright border with glow
        panelBg.lineStyle(3, 0x3498DB, 0.8);
        panelBg.strokeRoundedRect(0, btnRadius * 2 + 8, panelWidth, panelHeight - (btnRadius * 2 + 8), 18);
        
        this.toolbarContainer.add(panelBg);
        this.panelBg = panelBg;

        // Enhanced toggle button with gradient and glow
        const toggleBtnBg = this.add.graphics();
        
        // Button shadow
        toggleBtnBg.fillStyle(0x000000, 0.3);
        toggleBtnBg.fillCircle(btnX + 2, btnY + 2, btnRadius);
        
        // Main button gradient (vibrant blue to purple)
        toggleBtnBg.fillGradientStyle(0x3498DB, 0x2980B9, 0x9B59B6, 0x8E44AD, 1);
        toggleBtnBg.fillCircle(btnX, btnY, btnRadius);
        
        // Inner highlight for 3D effect
        toggleBtnBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
        toggleBtnBg.fillCircle(btnX, btnY - 2, btnRadius - 4);
        
        // Bright border with double ring effect
        toggleBtnBg.lineStyle(3, 0xFFFFFF, 0.9);
        toggleBtnBg.strokeCircle(btnX, btnY, btnRadius);
        toggleBtnBg.lineStyle(1, 0x3498DB, 0.7);
        toggleBtnBg.strokeCircle(btnX, btnY, btnRadius + 2);
        
        this.toolbarContainer.add(toggleBtnBg);
        this.toggleBtnBg = toggleBtnBg; // Store reference for hover effects

        this.toggleBtnText = this.add.text(btnX, btnY, this.toolbarExpanded ? '−' : '+', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#2C3E50',
            strokeThickness: 2,
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
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
            const x = col * iconSpacing + this.tileSize / 2; // Use new spacing
            const y = row * iconSpacing + this.tileSize / 2;
            
            // Create enhanced icon container with background
            const iconContainer = this.add.container(x, y);
            this.iconsContainer.add(iconContainer);
            
            // Create icon slot background (smaller with gaps)
            const slotBg = this.add.graphics();
            const slotSize = this.tileSize - 4; // Reduced size for smaller boxes with gaps
            
            // Slot shadow
            slotBg.fillStyle(0x000000, 0.3);
            slotBg.fillRoundedRect(-slotSize/2 + 2, -slotSize/2 + 2, slotSize, slotSize, 8);
            
            // Slot gradient background
            slotBg.fillGradientStyle(0x34495E, 0x2C3E50, 0x5D6D7E, 0x34495E, 0.8);
            slotBg.fillRoundedRect(-slotSize/2, -slotSize/2, slotSize, slotSize, 8);
            
            // Inner highlight
            slotBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.1);
            slotBg.fillRoundedRect(-slotSize/2 + 3, -slotSize/2 + 3, slotSize - 6, slotSize - 6, 5);
            
            // Slot border
            slotBg.lineStyle(2, 0x3498DB, 0.6);
            slotBg.strokeRoundedRect(-slotSize/2, -slotSize/2, slotSize, slotSize, 8);
            
            iconContainer.add(slotBg);
            
            // Create icon (properly centered)
            const icon = this.add.image(0, 5, key); // Slightly offset down for better centering
            const scale = (slotSize / icon.width) * (this.iconConfig[key].scale || 1) * 0.7; // Scale based on slot size
            icon.setScale(scale);
            icon.setOrigin(0.5, 0.5); // Center the icon properly
            icon.setInteractive();
            this.input.setDraggable(icon);
            icon.textureKey = key;
            
            // Set initial alpha based on sprite count
            const initialCount = this.parentScene.spriteCounters.get(key);
            if (initialCount <= 0) {
                icon.setAlpha(0.5);
                icon.disableInteractive();
                slotBg.setAlpha(0.5);
            }
            
            iconContainer.add(icon);
            
            // Create enhanced counter badge
            const counterBg = this.add.graphics();
            const counterValue = this.parentScene.spriteCounters.get(key);
            
            // Counter badge background (different colors based on quantity)
            let badgeColor = 0xE74C3C; // Red for 0
            if (counterValue > 0) badgeColor = 0x27AE60; // Green for available
            if (counterValue > 5) badgeColor = 0x3498DB; // Blue for plenty
            if (counterValue > 10) badgeColor = 0x9B59B6; // Purple for lots
            
            // Badge shadow
            counterBg.fillStyle(0x000000, 0.4);
            counterBg.fillCircle(slotSize/2 - 8, -slotSize/2 + 10, 12);
            
            // Main badge
            counterBg.fillStyle(badgeColor, 1);
            counterBg.fillCircle(slotSize/2 - 10, -slotSize/2 + 8, 12);
            
            // Badge highlight
            counterBg.fillStyle(0xFFFFFF, 0.3);
            counterBg.fillCircle(slotSize/2 - 12, -slotSize/2 + 6, 6);
            
            // Badge border
            counterBg.lineStyle(2, 0xFFFFFF, 0.8);
            counterBg.strokeCircle(slotSize/2 - 10, -slotSize/2 + 8, 12);
            
            iconContainer.add(counterBg);
            
            // Create counter text
            const counterText = this.add.text(slotSize/2 - 10, -slotSize/2 + 8, counterValue.toString(), {
                fontSize: '14px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
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

        // Add hover effects to toggle button
        this.toggleBtnText.on('pointerover', () => {
            this.tweens.add({
                targets: this.toggleBtnText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                ease: 'Power2'
            });
            
            // Enhanced button glow on hover
            this.toggleBtnBg.clear();
            // Button shadow
            this.toggleBtnBg.fillStyle(0x000000, 0.4);
            this.toggleBtnBg.fillCircle(btnX + 3, btnY + 3, btnRadius);
            
            // Brighter gradient on hover
            this.toggleBtnBg.fillGradientStyle(0x52C8F5, 0x3498DB, 0xBF7AE0, 0x9B59B6, 1);
            this.toggleBtnBg.fillCircle(btnX, btnY, btnRadius);
            
            // Inner highlight
            this.toggleBtnBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.4);
            this.toggleBtnBg.fillCircle(btnX, btnY - 2, btnRadius - 4);
            
            // Animated border
            this.toggleBtnBg.lineStyle(4, 0xFFFFFF, 1);
            this.toggleBtnBg.strokeCircle(btnX, btnY, btnRadius);
            this.toggleBtnBg.lineStyle(2, 0x52C8F5, 1);
            this.toggleBtnBg.strokeCircle(btnX, btnY, btnRadius + 3);
        });
        
        this.toggleBtnText.on('pointerout', () => {
            this.tweens.add({
                targets: this.toggleBtnText,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
            
            // Return to normal appearance
            this.toggleBtnBg.clear();
            // Button shadow
            this.toggleBtnBg.fillStyle(0x000000, 0.3);
            this.toggleBtnBg.fillCircle(btnX + 2, btnY + 2, btnRadius);
            
            // Normal gradient
            this.toggleBtnBg.fillGradientStyle(0x3498DB, 0x2980B9, 0x9B59B6, 0x8E44AD, 1);
            this.toggleBtnBg.fillCircle(btnX, btnY, btnRadius);
            
            // Inner highlight
            this.toggleBtnBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
            this.toggleBtnBg.fillCircle(btnX, btnY - 2, btnRadius - 4);
            
            // Normal border
            this.toggleBtnBg.lineStyle(3, 0xFFFFFF, 0.9);
            this.toggleBtnBg.strokeCircle(btnX, btnY, btnRadius);
            this.toggleBtnBg.lineStyle(1, 0x3498DB, 0.7);
            this.toggleBtnBg.strokeCircle(btnX, btnY, btnRadius + 2);
        });

        // Toggle button click handler
        this.toggleBtnText.on('pointerdown', () => {
            this.parentScene.sounds.button.play();
            this.toolbarExpanded = !this.toolbarExpanded;
            this.toggleBtnText.setText(this.toolbarExpanded ? '−' : '+');
            
            // Add button press animation
            this.tweens.add({
                targets: this.toggleBtnText,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true
            });
            
            this.tweens.add({
                targets: [this.iconsContainer, this.panelBg],
                alpha: this.toolbarExpanded ? 1 : 0,
                duration: 300,
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
            
            // Find the icon and its container
            const icon = this.toolbarIcons.find(i => i.textureKey === textureKey);
            if (icon) {
                const iconContainer = icon.parentContainer;
                const slotBg = iconContainer.list[0]; // First element is the slot background
                const counterBg = iconContainer.list[iconContainer.list.length - 2]; // Counter badge background
                
                // Update counter badge color based on quantity
                let badgeColor = 0xE74C3C; // Red for 0
                if (newCount > 0) badgeColor = 0x27AE60; // Green for available
                if (newCount > 5) badgeColor = 0x3498DB; // Blue for plenty
                if (newCount > 10) badgeColor = 0x9B59B6; // Purple for lots
                
                // Redraw counter badge with new color
                const slotSize = this.tileSize - 4; // Match the size used in creation
                counterBg.clear();
                
                // Badge shadow
                counterBg.fillStyle(0x000000, 0.4);
                counterBg.fillCircle(slotSize/2 - 8, -slotSize/2 + 10, 12);
                
                // Main badge with dynamic color
                counterBg.fillStyle(badgeColor, 1);
                counterBg.fillCircle(slotSize/2 - 10, -slotSize/2 + 8, 12);
                
                // Badge highlight
                counterBg.fillStyle(0xFFFFFF, 0.3);
                counterBg.fillCircle(slotSize/2 - 12, -slotSize/2 + 6, 6);
                
                // Badge border
                counterBg.lineStyle(2, 0xFFFFFF, 0.8);
                counterBg.strokeCircle(slotSize/2 - 10, -slotSize/2 + 8, 12);
                
                // Update icon and slot appearance
                if (newCount <= 0) {
                    icon.setAlpha(0.5); // Make icon translucent when no sprites left
                    slotBg.setAlpha(0.5); // Dim the slot background too
                    icon.disableInteractive(); // Disable dragging
                    this.input.setDraggable(icon, false); // Ensure dragging is disabled
                    
                    // Show first zero asset message if not shown before
                    if (!this.firstZeroAssetShown) {
                        this.showFirstZeroAssetMessage();
                        this.firstZeroAssetShown = true;
                    }
                } else {
                    icon.setAlpha(1);
                    slotBg.setAlpha(1);
                    icon.setInteractive();
                    this.input.setDraggable(icon, true);
                }
                
                // Add a small bounce animation to the counter when it changes
                this.tweens.add({
                    targets: [counterBg, counterText],
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 200,
                    ease: 'Power2',
                    yoyo: true
                });
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
        const dialogWidth = 520;
        const dialogHeight = 580;
        const dialogX = this.cameras.main.width / 2 - dialogWidth / 2;
        const dialogY = this.cameras.main.height / 2 - dialogHeight / 2;

        // Create dialog container
        this.shopDialog = this.add.container(0, 0);
        this.shopDialog.setDepth(3000);

        // Create vibrant garden market background
        const dialogBg = this.add.graphics();
        
        // Outer shadow for depth
        dialogBg.fillStyle(0x000000, 0.4);
        dialogBg.fillRoundedRect(dialogX + 6, dialogY + 6, dialogWidth, dialogHeight, 25);
        
        // Main market stall background (warm wood colors)
        dialogBg.fillGradientStyle(0xD2691E, 0xCD853F, 0xF4A460, 0xDEB887, 1);
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 25);
        
        // Market awning effect (green canvas top)
        dialogBg.fillGradientStyle(0x228B22, 0x32CD32, 0x90EE90, 0x98FB98, 0.9);
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogWidth, 80, 25);
        dialogBg.fillRect(dialogX, dialogY + 50, dialogWidth, 30);
        
        // Wooden planks effect
        for (let i = 0; i < 5; i++) {
            const plankY = dialogY + 80 + (i * 100);
            dialogBg.lineStyle(2, 0x8B4513, 0.3);
            dialogBg.beginPath();
            dialogBg.moveTo(dialogX + 20, plankY);
            dialogBg.lineTo(dialogX + dialogWidth - 20, plankY);
            dialogBg.strokePath();
        }
        
        // Market stall border with rope effect
        dialogBg.lineStyle(6, 0x8B4513, 0.8);
        dialogBg.strokeRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 25);
        dialogBg.lineStyle(3, 0xF4A460, 0.6);
        dialogBg.strokeRoundedRect(dialogX + 3, dialogY + 3, dialogWidth - 6, dialogHeight - 6, 22);
        
        this.shopDialog.add(dialogBg);

        // Add market decorations
        const decorations = [
            { emoji: '🌻', x: dialogX + 30, y: dialogY + 20, size: '24px' },
            { emoji: '🌿', x: dialogX + dialogWidth - 50, y: dialogY + 25, size: '20px' },
            { emoji: '🥕', x: dialogX + 60, y: dialogY + 45, size: '18px' },
            { emoji: '🌱', x: dialogX + dialogWidth - 80, y: dialogY + 50, size: '16px' },
            { emoji: '🍃', x: dialogX + dialogWidth / 2 - 30, y: dialogY + 15, size: '20px' },
            { emoji: '🌾', x: dialogX + dialogWidth / 2 + 30, y: dialogY + 20, size: '18px' }
        ];
        
        decorations.forEach(dec => {
            const decoration = this.add.text(dec.x, dec.y, dec.emoji, { fontSize: dec.size });
            this.shopDialog.add(decoration);
            
            // Add gentle floating animation
            this.tweens.add({
                targets: decoration,
                y: dec.y - 5,
                duration: 2000 + Math.random() * 1000,
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

        // Shop items grid - Market Stall Style
        const iconKeys = ['fence', 'fence2', 'castle', 'hut', 'wall', 'wave-wall', 'tower1'];
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

            // Create market stall display for each item
            const itemContainer = this.add.container(x, y);
            this.shopDialog.add(itemContainer);

            // Create market stall display background
            const stallBg = this.add.graphics();
            
            // Stall shadow
            stallBg.fillStyle(0x000000, 0.3);
            stallBg.fillRoundedRect(-45, -15, 90, 100, 12);
            
            // Stall base (wooden crate look)
            stallBg.fillGradientStyle(0xDEB887, 0xD2B48C, 0xF5DEB3, 0xFFE4B5, 0.9);
            stallBg.fillRoundedRect(-48, -18, 90, 100, 12);
            
            // Wood grain effect
            stallBg.lineStyle(1, 0xCD853F, 0.4);
            for (let i = 0; i < 4; i++) {
                const lineY = -10 + (i * 20);
                stallBg.beginPath();
                stallBg.moveTo(-40, lineY);
                stallBg.lineTo(35, lineY);
                stallBg.strokePath();
            }
            
            // Stall border (rope effect)
            stallBg.lineStyle(3, 0x8B4513, 0.8);
            stallBg.strokeRoundedRect(-48, -18, 90, 100, 12);
            
            itemContainer.add(stallBg);

            // Add item icon with market display
            const itemIcon = this.add.image(0, -5, key);
            const scale = Math.min(50 / itemIcon.width, 50 / itemIcon.height) * (this.iconConfig[key].scale || 1);
            itemIcon.setScale(scale);
            itemContainer.add(itemIcon);

            // Add price tag (like market price tags)
            const priceTagBg = this.add.graphics();
            const price = this.parentScene.spritePrices[key];
            
            // Price tag background (bright yellow like market tags)
            priceTagBg.fillStyle(0xFFD700, 1);
            priceTagBg.fillRoundedRect(-25, 25, 50, 20, 8);
            priceTagBg.lineStyle(2, 0xFFA500, 1);
            priceTagBg.strokeRoundedRect(-25, 25, 50, 20, 8);
            
            // Price tag string effect
            priceTagBg.lineStyle(2, 0x8B4513, 0.6);
            priceTagBg.beginPath();
            priceTagBg.moveTo(0, 15);
            priceTagBg.lineTo(0, 25);
            priceTagBg.strokePath();
            
            itemContainer.add(priceTagBg);

            const priceText = this.add.text(0, 35, `${price}🪙`, {
                fontSize: '14px',
                color: '#8B4513',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
            }).setOrigin(0.5);
            itemContainer.add(priceText);

            // Add exciting buy button (market style)
            const buyBtnBg = this.add.graphics();
            const canAfford = this.coins >= price;
            const btnColor = canAfford ? 0x32CD32 : 0xFF6B6B;
            const btnText = canAfford ? 'BUY!' : 'Need More 🪙';
            
            // Button shadow
            buyBtnBg.fillStyle(0x000000, 0.3);
            buyBtnBg.fillRoundedRect(-30, 52, 60, 24, 12);
            
            // Button gradient
            buyBtnBg.fillGradientStyle(btnColor, btnColor * 0.8, btnColor * 1.2, btnColor, 1);
            buyBtnBg.fillRoundedRect(-32, 50, 60, 24, 12);
            
            // Button highlight
            buyBtnBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
            buyBtnBg.fillRoundedRect(-30, 52, 56, 8, 8);
            
            // Button border
            buyBtnBg.lineStyle(2, 0xFFFFFF, 0.8);
            buyBtnBg.strokeRoundedRect(-32, 50, 60, 24, 12);
            
            itemContainer.add(buyBtnBg);

            const buyBtn = this.add.text(0, 62, btnText, {
                fontSize: canAfford ? '12px' : '10px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                stroke: '#2F4F2F',
                strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });

            if (canAfford) {
                // Add bounce animation to available items
                this.tweens.add({
                    targets: [itemIcon, priceTagBg, priceText],
                    y: '+=2',
                    duration: 1500 + Math.random() * 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });

                // Buy button functionality
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

                        // Add purchase celebration effect
                        const celebration = this.add.text(0, 30, '✨ SOLD! ✨', {
                            fontSize: '16px',
                            color: '#FFD700',
                            fontStyle: 'bold',
                            fontFamily: 'Comic Sans MS, cursive, sans-serif',
                            stroke: '#8B4513',
                            strokeThickness: 2
                        }).setOrigin(0.5);
                        
                        itemContainer.add(celebration);
                        
                        this.tweens.add({
                            targets: celebration,
                            y: 10,
                            alpha: 0,
                            scaleX: 1.5,
                            scaleY: 1.5,
                            duration: 1000,
                            ease: 'Power2',
                            onComplete: () => celebration.destroy()
                        });

                                                 // Show success message
                         this.showMessage('🎉 Purchase successful! 🎉', '#32CD32');
                         
                         // Update this item's affordability in place
                         this.time.delayedCall(1000, () => {
                             const newCanAfford = this.coins >= price;
                             if (!newCanAfford) {
                                 // Update button appearance to "can't afford"
                                 buyBtnBg.clear();
                                 
                                 // Button shadow
                                 buyBtnBg.fillStyle(0x000000, 0.3);
                                 buyBtnBg.fillRoundedRect(-30, 52, 60, 24, 12);
                                 
                                 // Button gradient (red for can't afford)
                                 buyBtnBg.fillGradientStyle(0xFF6B6B, 0xFF6B6B * 0.8, 0xFF6B6B * 1.2, 0xFF6B6B, 1);
                                 buyBtnBg.fillRoundedRect(-32, 50, 60, 24, 12);
                                 
                                 // Button highlight
                                 buyBtnBg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.3);
                                 buyBtnBg.fillRoundedRect(-30, 52, 56, 8, 8);
                                 
                                 // Button border
                                 buyBtnBg.lineStyle(2, 0xFFFFFF, 0.8);
                                 buyBtnBg.strokeRoundedRect(-32, 50, 60, 24, 12);
                                 
                                 // Update button text
                                 buyBtn.setText('Need More 🪙');
                                 buyBtn.setFontSize('10px');
                                 buyBtn.disableInteractive();
                             }
                         });
                    } else {
                        this.showMessage('❌ Not enough coins! ❌', '#FF6B6B');
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

        // Add market entrance animation
        this.shopDialog.setScale(0);
        this.tweens.add({
            targets: this.shopDialog,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
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

        // Create chatbox background with gradient and kid-friendly styling
        const bg = this.add.graphics();
        
        // Drop shadow effect
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(x + 4, y + 4, width, height, 20);
        
        // Main gradient background (orange to yellow for alert)
        bg.fillGradientStyle(0xF39C12, 0xE67E22, 0xF1C40F, 0xE74C3C, 1);
        bg.fillRoundedRect(x, y, width, height, 20);
        
        // Inner highlight for depth
        bg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.2);
        bg.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 16);
        
        // Bright border with glow effect
        bg.lineStyle(3, 0xFFFFFF, 0.9);
        bg.strokeRoundedRect(x, y, width, height, 20);
        
        chatbox.add(bg);

        // Add decorative icons
        const coin1 = this.add.text(x + 25, y + 15, '🪙', { fontSize: '18px' });
        const coin2 = this.add.text(x + width - 45, y + 20, '💰', { fontSize: '16px' });
        const shopping = this.add.text(x + 40, y + height - 35, '🛒', { fontSize: '16px' });
        chatbox.add(coin1);
        chatbox.add(coin2);
        chatbox.add(shopping);

        // Add message text with better styling
        const message = this.add.text(x + width/2, y + height/2, 
            "Press Spacebar to collect coins\nand buy more assets", {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#2C3E50',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        chatbox.add(message);

        // Add close button with better styling
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
        closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        chatbox.add(closeBtnBg);
        
        const closeBtn = this.add.text(x + width - 25, y + 25, '✕', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            console.log('Closing chatbox');
            chatbox.destroy();
        });
        
        // Add hover effect to close button
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
            closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
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