class MessagePopup {
    constructor(scene) {
        this.scene = scene;
        this.activePopups = new Map(); // Track active popups by ID
    }

    /**
     * Show a simple text message that auto-disappears
     * @param {string} text - The message text
     * @param {string} color - Text color
     * @param {number} duration - Duration in milliseconds (default: 2000)
     * @param {Object} position - Position override {x, y}
     */
    showSimpleMessage(text, color = '#FFFFFF', duration = 2000, position = null) {
        const x = position?.x || this.scene.cameras.main.width / 2;
        const y = position?.y || this.scene.cameras.main.height / 2 + 100;

        const message = this.scene.add.text(x, y, text, {
            fontSize: '24px',
            color: color,
            align: 'center',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        message.setDepth(3000);

        // Add fade in animation
        message.setAlpha(0);
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Auto-destroy after duration
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: message,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => message.destroy()
            });
        });

        return message;
    }

    /**
     * Show a chatbox-style message with close button
     * @param {Object} config - Configuration object
     */
    showChatbox(config) {
        const {
            id = 'chatbox',
            text,
            width = 400,
            height = 150,
            x = 200,
            y = this.scene.cameras.main.height - 250,
            theme = 'default',
            decorations = [],
            autoClose = null,
            onClose = null
        } = config;

        // Remove existing chatbox with same ID
        this.destroyPopup(id);

        // Create chatbox container
        const chatbox = this.scene.add.container(0, 0);
        chatbox.setDepth(2000);

        // Create background based on theme
        const bg = this.createChatboxBackground(x, y, width, height, theme);
        chatbox.add(bg);

        // Add decorations
        decorations.forEach(decoration => {
            const decorElement = this.scene.add.text(
                x + decoration.x, 
                y + decoration.y, 
                decoration.emoji, 
                { fontSize: decoration.size || '18px' }
            );
            chatbox.add(decorElement);
        });

        // Add message text
        const message = this.scene.add.text(x + width/2, y + height/2, text, {
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

        // Add close button
        const closeButton = this.createCloseButton(x + width - 25, y + 25, () => {
            if (onClose) onClose();
            this.destroyPopup(id);
        });
        chatbox.add(closeButton.bg);
        chatbox.add(closeButton.text);

        // Store the chatbox
        this.activePopups.set(id, chatbox);

        // Auto-close if specified
        if (autoClose) {
            this.scene.time.delayedCall(autoClose, () => {
                if (this.activePopups.has(id)) {
                    this.destroyPopup(id);
                }
            });
        }

        return chatbox;
    }

    /**
     * Show a complex dialog with custom content
     * @param {Object} config - Configuration object
     */
    showDialog(config) {
        const {
            id = 'dialog',
            title,
            content = [],
            width = 500,
            height = 400,
            theme = 'default',
            animations = {},
            autoClose = null,
            onClose = null
        } = config;

        // Remove existing dialog with same ID
        this.destroyPopup(id);

        const dialogX = this.scene.cameras.main.width / 2;
        const dialogY = this.scene.cameras.main.height / 2;

        // Create dialog container
        const dialogContainer = this.scene.add.container(0, 0);
        dialogContainer.setDepth(3000);

        // Create background
        const bg = this.createDialogBackground(dialogX, dialogY, width, height, theme);
        dialogContainer.add(bg);

        // Add title if provided
        if (title) {
            const titleText = this.scene.add.text(dialogX, dialogY - height/2 + 50, title, {
                fontSize: '32px',
                color: '#FFD700',
                fontStyle: 'bold',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                align: 'center',
                stroke: '#2C3E50',
                strokeThickness: 4
            }).setOrigin(0.5);
            dialogContainer.add(titleText);
        }

        // Add content elements
        content.forEach(item => {
            const element = this.createContentElement(dialogX, dialogY, item);
            if (element) {
                dialogContainer.add(element);
            }
        });

        // Store the dialog
        this.activePopups.set(id, dialogContainer);

        // Add animations
        this.applyDialogAnimations(dialogContainer, animations);

        // Auto-close if specified
        if (autoClose) {
            this.scene.time.delayedCall(autoClose, () => {
                if (this.activePopups.has(id)) {
                    this.destroyPopup(id);
                }
            });
        }

        return dialogContainer;
    }

    /**
     * Create chatbox background based on theme
     */
    createChatboxBackground(x, y, width, height, theme) {
        const bg = this.scene.add.graphics();
        
        // Drop shadow
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(x + 4, y + 4, width, height, 20);
        
        // Main background based on theme
        switch (theme) {
            case 'welcome':
                bg.fillGradientStyle(0x9B59B6, 0xE91E63, 0x3498DB, 0xF39C12, 1);
                break;
            case 'success':
                bg.fillGradientStyle(0x2ECC71, 0x27AE60, 0x3498DB, 0x2980B9, 1);
                break;
            case 'alert':
                bg.fillGradientStyle(0xF39C12, 0xE67E22, 0xF1C40F, 0xE74C3C, 1);
                break;
            default:
                bg.fillGradientStyle(0x3498DB, 0x2980B9, 0x9B59B6, 0x8E44AD, 1);
        }
        bg.fillRoundedRect(x, y, width, height, 20);
        
        // Inner highlight
        bg.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xE8E8E8, 0xE8E8E8, 0.2);
        bg.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 16);
        
        // Border
        bg.lineStyle(3, 0xFFFFFF, 0.9);
        bg.strokeRoundedRect(x, y, width, height, 20);
        
        return bg;
    }

    /**
     * Create dialog background based on theme
     */
    createDialogBackground(x, y, width, height, theme) {
        const bg = this.scene.add.graphics();
        
        switch (theme) {
            case 'completion':
                // Glow effect
                bg.fillStyle(0xFFD700, 0.3);
                bg.fillRoundedRect(x - width/2 - 10, y - height/2 - 10, width + 20, height + 20, 30);
                
                // Main background with gradient
                bg.fillGradientStyle(0x8E44AD, 0x3498DB, 0x1ABC9C, 0xF39C12, 0.95);
                bg.fillRoundedRect(x - width/2, y - height/2, width, height, 25);
                bg.lineStyle(5, 0xFFD700, 1);
                bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 25);
                break;
            case 'levelup':
                bg.fillStyle(0x2C3E50, 0.95);
                bg.fillRoundedRect(x - width/2, y - height/2, width, height, 20);
                bg.lineStyle(4, 0xFFD700, 1);
                bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 20);
                break;
            default:
                bg.fillStyle(0x2C3E50, 0.9);
                bg.fillRoundedRect(x - width/2, y - height/2, width, height, 20);
                bg.lineStyle(3, 0x3498DB, 1);
                bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 20);
        }
        
        bg.setDepth(3000);
        return bg;
    }

    /**
     * Create close button
     */
    createCloseButton(x, y, onClickCallback) {
        const closeBtnBg = this.scene.add.graphics();
        closeBtnBg.fillStyle(0xFF6B6B, 1);
        closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
        closeBtnBg.fillCircle(x, y, 15);
        closeBtnBg.strokeCircle(x, y, 15);
        
        const closeBtn = this.scene.add.text(x, y, '✕', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', onClickCallback);
        
        // Hover effects
        closeBtn.on('pointerover', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF4757, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x, y, 15);
            closeBtnBg.strokeCircle(x, y, 15);
        });
        
        closeBtn.on('pointerout', () => {
            closeBtnBg.clear();
            closeBtnBg.fillStyle(0xFF6B6B, 1);
            closeBtnBg.lineStyle(2, 0xFFFFFF, 1);
            closeBtnBg.fillCircle(x, y, 15);
            closeBtnBg.strokeCircle(x, y, 15);
        });
        
        return { bg: closeBtnBg, text: closeBtn };
    }

    /**
     * Create content element for dialogs
     */
    createContentElement(dialogX, dialogY, item) {
        switch (item.type) {
            case 'text':
                const textStyle = {
                    fontSize: item.fontSize || '18px',
                    color: item.color || '#FFFFFF',
                    fontStyle: item.fontStyle || 'normal',
                    fontFamily: item.fontFamily || 'Comic Sans MS, cursive, sans-serif',
                    align: item.align || 'center',
                    stroke: item.stroke || '#2C3E50',
                    strokeThickness: item.strokeThickness || 2
                };

                // For multi-line text, ensure proper centering
                if (item.text.includes('\n')) {
                    textStyle.align = 'center';
                }

                return this.scene.add.text(
                    dialogX + (item.offsetX || 0), 
                    dialogY + (item.offsetY || 0), 
                    item.text, 
                    textStyle
                ).setOrigin(item.originX || 0.5, item.originY || 0.5).setDepth(3001);
            
            case 'image':
                const image = this.scene.add.image(
                    dialogX + (item.offsetX || 0), 
                    dialogY + (item.offsetY || 0), 
                    item.key
                );
                if (item.scale) image.setScale(item.scale);
                return image.setDepth(3002);
            
            case 'decoration':
                return this.scene.add.text(
                    dialogX + (item.offsetX || 0), 
                    dialogY + (item.offsetY || 0), 
                    item.emoji, 
                    { fontSize: item.size || '20px' }
                ).setOrigin(0.5, 0.5).setDepth(3001);
            
            default:
                return null;
        }
    }

    /**
     * Apply animations to dialog
     */
    applyDialogAnimations(dialogContainer, animations) {
        // Default entrance animation
        dialogContainer.setScale(0);
        this.scene.tweens.add({
            targets: dialogContainer,
            scaleX: animations.entranceScale || 1.1,
            scaleY: animations.entranceScale || 1.1,
            duration: animations.entranceDuration || 500,
            ease: animations.entranceEase || 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: dialogContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });

        // Additional custom animations
        if (animations.pulse) {
            const pulseTargets = animations.pulse.targets || [dialogContainer];
            this.scene.tweens.add({
                targets: pulseTargets,
                alpha: animations.pulse.alpha || 0.8,
                duration: animations.pulse.duration || 1000,
                yoyo: true,
                repeat: animations.pulse.repeat || 3,
                ease: animations.pulse.ease || 'Sine.easeInOut'
            });
        }

        if (animations.float) {
            const floatTargets = animations.float.targets || [dialogContainer];
            this.scene.tweens.add({
                targets: floatTargets,
                y: floatTargets[0].y - (animations.float.distance || 10),
                duration: animations.float.duration || 2000,
                yoyo: true,
                repeat: -1,
                ease: animations.float.ease || 'Sine.easeInOut'
            });
        }
    }

    /**
     * Destroy a popup by ID
     */
    destroyPopup(id) {
        if (this.activePopups.has(id)) {
            const popup = this.activePopups.get(id);
            this.scene.tweens.add({
                targets: popup,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    popup.destroy();
                }
            });
            this.activePopups.delete(id);
        }
    }

    /**
     * Destroy all active popups
     */
    destroyAllPopups() {
        this.activePopups.forEach((popup, id) => {
            this.destroyPopup(id);
        });
    }

    /**
     * Check if a popup with given ID exists
     */
    hasPopup(id) {
        return this.activePopups.has(id);
    }
} 