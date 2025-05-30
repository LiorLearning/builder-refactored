class Toolbar {
    constructor(scene, parentScene, config) {
        this.scene = scene;
        this.parentScene = parentScene;
        this.tileSize = config.tileSize;
        this.iconConfig = config.iconConfig;
        this.toolbarExpanded = true; // Start with toolbar open
        this.spriteCounters = new Map();
        this.counterTexts = new Map();
        this.firstZeroAssetShown = false; // Track if first zero asset message has been shown
        this.toggleBtnText = null; // Store reference to toggle button text
        this.toolbarContainer = null;
        this.iconsContainer = null;
        this.panelBg = null;
        this.toggleBtnBg = null;
        this.toolbarIcons = [];
    }

    create() {
        this.createToolbarPanel();
        this.setupDragHandlers();
    }

    createToolbarPanel() {
        // Icon setup
        const iconKeys = ['hut', 'hut-u1', 'shrine', 'shrine-u1', 'temple', 'temple-u1'];
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
        this.toolbarContainer = this.scene.add.container(20, 20);
        this.toolbarContainer.setDepth(1000);

        // Enhanced panel background with gradient and depth
        const panelBg = this.scene.add.graphics();
        
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
        const toggleBtnBg = this.scene.add.graphics();
        
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

        this.toggleBtnText = this.scene.add.text(btnX, btnY, this.toolbarExpanded ? '−' : '+', {
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
        this.iconsContainer = this.scene.add.container(iconMargin, btnRadius * 2 + 8 + panelPadding);
        this.toolbarContainer.add(this.iconsContainer);

        // Set initial visibility
        this.iconsContainer.alpha = this.toolbarExpanded ? 1 : 0;
        this.iconsContainer.setVisible(this.toolbarExpanded);
        this.panelBg.alpha = this.toolbarExpanded ? 1 : 0;
        this.panelBg.setVisible(this.toolbarExpanded);

        // Create and layout icons in a grid
        this.createIcons(iconKeys, iconsPerRow, iconSpacing);

        // Setup toggle button interactions
        this.setupToggleButton(btnX, btnY, btnRadius);

        // Ensure toggle button is on top
        this.toolbarContainer.bringToTop(toggleBtnBg);
        this.toolbarContainer.bringToTop(this.toggleBtnText);
    }

    createIcons(iconKeys, iconsPerRow, iconSpacing) {
        iconKeys.forEach((key, i) => {
            const row = Math.floor(i / iconsPerRow);
            const col = i % iconsPerRow;
            const x = col * iconSpacing + this.tileSize / 2;
            const y = row * iconSpacing + this.tileSize / 2;
            
            // Create enhanced icon container with background
            const iconContainer = this.scene.add.container(x, y);
            this.iconsContainer.add(iconContainer);
            
            // Create icon slot background (smaller with gaps)
            const slotBg = this.scene.add.graphics();
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
            const icon = this.scene.add.image(0, 5, key); // Slightly offset down for better centering
            const scale = (slotSize / icon.width) * (this.iconConfig[key].scale || 1) * 0.7; // Scale based on slot size
            icon.setScale(scale);
            icon.setOrigin(0.5, 0.5); // Center the icon properly
            icon.setInteractive();
            
            // Check level requirements
            const config = this.parentScene.assetConfig[key];
            const requiresLevel = config ? config.requiresLevel : 0;
            const isLevelLocked = requiresLevel > this.parentScene.currentLevel;
            
            // Only make draggable if level requirement is met
            if (!isLevelLocked) {
                this.scene.input.setDraggable(icon);
            }
            
            icon.textureKey = key;
            
            // Set initial alpha based on sprite count and level lock
            const initialCount = this.parentScene.spriteCounters.get(key);
            if (initialCount <= 0 || isLevelLocked) {
                icon.setAlpha(isLevelLocked ? 0.3 : 0.5); // More transparent if level locked
                if (initialCount <= 0) {
                    icon.disableInteractive();
                }
                slotBg.setAlpha(isLevelLocked ? 0.3 : 0.5);
            }
            
            iconContainer.add(icon);
            
            // Add lock overlay if level locked
            if (isLevelLocked) {
                const lockIcon = this.scene.add.text(0, 5, '🔒', {
                    fontSize: '16px'
                }).setOrigin(0.5);
                iconContainer.add(lockIcon);
                
                // Store reference for later removal
                icon.lockIcon = lockIcon;
            }
            
            // Create enhanced counter badge
            this.createCounterBadge(iconContainer, key, slotSize);
            
            this.toolbarIcons.push(icon);
        });
    }

    createCounterBadge(iconContainer, key, slotSize) {
        const counterBg = this.scene.add.graphics();
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
        const counterText = this.scene.add.text(slotSize/2 - 10, -slotSize/2 + 8, counterValue.toString(), {
            fontSize: '14px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        iconContainer.add(counterText);
        
        this.counterTexts.set(key, counterText);
    }

    setupToggleButton(btnX, btnY, btnRadius) {
        // Add hover effects to toggle button
        this.toggleBtnText.on('pointerover', () => {
            this.scene.tweens.add({
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
            this.scene.tweens.add({
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
            this.scene.tweens.add({
                targets: this.toggleBtnText,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true
            });
            
            this.scene.tweens.add({
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
    }

    setupDragHandlers() {
        // Drag handlers for all icons
        this.toolbarIcons.forEach(icon => {
            icon.on('dragstart', (pointer) => {
                // Check if we have sprites available
                const remainingSprites = this.parentScene.spriteCounters.get(icon.textureKey);
                if (remainingSprites <= 0) {
                    return; // Don't allow drag if no sprites left
                }
                
                // Check level requirements
                const config = this.parentScene.assetConfig[icon.textureKey];
                const requiresLevel = config ? config.requiresLevel : 0;
                if (requiresLevel > this.parentScene.currentLevel) {
                    // Show feedback that item is level locked
                    this.parentScene.showMessage(`Requires Level ${requiresLevel}!`, '#ff6b6b');
                    return; // Don't allow drag if level requirement not met
                }

                this.scene.textures.get(icon.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
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
                
                // Check level requirements
                const config = this.parentScene.assetConfig[textureKey];
                const requiresLevel = config ? config.requiresLevel : 0;
                const isLevelLocked = requiresLevel > this.parentScene.currentLevel;
                
                // Update icon and slot appearance
                if (newCount <= 0 || isLevelLocked) {
                    icon.setAlpha(isLevelLocked ? 0.3 : 0.5); // More transparent if level locked
                    slotBg.setAlpha(isLevelLocked ? 0.3 : 0.5);
                    
                    if (newCount <= 0) {
                        icon.disableInteractive(); // Disable dragging when no items
                        this.scene.input.setDraggable(icon, false);
                        
                        // Show first zero asset message if not shown before
                        if (!this.firstZeroAssetShown) {
                            this.showFirstZeroAssetMessage();
                            this.firstZeroAssetShown = true;
                        }
                    } else if (isLevelLocked) {
                        // Item available but level locked - keep interactive for shop but not draggable
                        icon.setInteractive();
                        this.scene.input.setDraggable(icon, false);
                    }
                    
                    // Add or update lock icon
                    if (isLevelLocked && !icon.lockIcon) {
                        const lockIcon = this.scene.add.text(0, 5, '🔒', {
                            fontSize: '16px'
                        }).setOrigin(0.5);
                        iconContainer.add(lockIcon);
                        icon.lockIcon = lockIcon;
                        
                        // Add hover tooltip for locked items
                        if (!icon.hasLockTooltip) {
                            icon.on('pointerover', () => {
                                if (isLevelLocked) {
                                    this.parentScene.showMessage(`Requires Level ${requiresLevel}!`, '#ff6b6b');
                                }
                            });
                            icon.hasLockTooltip = true;
                        }
                    }
                } else {
                    // Item available and unlocked
                    icon.setAlpha(1);
                    slotBg.setAlpha(1);
                    icon.setInteractive();
                    this.scene.input.setDraggable(icon, true);
                    
                    // Remove lock icon if it exists
                    if (icon.lockIcon) {
                        icon.lockIcon.destroy();
                        icon.lockIcon = null;
                    }
                }
                
                // Add a small bounce animation to the counter when it changes
                this.scene.tweens.add({
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

    showFirstZeroAssetMessage() {
        console.log('Creating chatbox');
        // Create chatbox container
        const chatbox = this.scene.add.container(0, 0);
        chatbox.setDepth(2000);

        // Chatbox dimensions and position
        const width = 400;
        const height = 150;
        const x = 200; // Position near pixie
        const y = this.scene.cameras.main.height - 250;

        console.log('Chatbox position:', x, y);

        // Create chatbox background with gradient and kid-friendly styling
        const bg = this.scene.add.graphics();
        
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
        const coin1 = this.scene.add.text(x + 25, y + 15, '🪙', { fontSize: '18px' });
        const coin2 = this.scene.add.text(x + width - 45, y + 20, '💰', { fontSize: '16px' });
        const shopping = this.scene.add.text(x + 40, y + height - 35, '🛒', { fontSize: '16px' });
        chatbox.add(coin1);
        chatbox.add(coin2);
        chatbox.add(shopping);
        
        // Add message text with better styling
        const message = this.scene.add.text(x + width/2, y + height/2, 
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
        const closeBtnBg = this.scene.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x + width - 25, y + 25, 15);
        closeBtnBg.strokeCircle(x + width - 25, y + 25, 15);
        chatbox.add(closeBtnBg);
        
        const closeBtn = this.scene.add.text(x + width - 25, y + 25, '✕', {
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
        this.scene.time.delayedCall(10000, () => {
            if (chatbox.active) {
                console.log('Auto-destroying chatbox');
                chatbox.destroy();
            }
        });
    }

    destroy() {
        if (this.toolbarContainer) {
            this.toolbarContainer.destroy();
        }
        this.counterTexts.clear();
        this.toolbarIcons = [];
    }
} 