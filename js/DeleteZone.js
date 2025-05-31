class DeleteZone {
    constructor(scene) {
        this.scene = scene;
        this.deleteZone = null;
        this.deleteZoneBg = null;
        this.deleteZoneIcon = null;
        this.deleteZoneText = null;
        this.deleteZoneBounds = null;
        this.deleteZoneSize = 120;
        this.margin = 20;
        
        this.create();
    }

    create() {
        const deleteZoneX = this.scene.cameras.main.width - this.deleteZoneSize - this.margin;
        const deleteZoneY = this.scene.cameras.main.height - this.deleteZoneSize - this.margin;

        // Create delete zone container
        this.deleteZone = this.scene.add.container(
            deleteZoneX + this.deleteZoneSize / 2, 
            deleteZoneY + this.deleteZoneSize / 2
        );
        this.deleteZone.setDepth(1500);

        // Background circle (initially subtle)
        this.deleteZoneBg = this.scene.add.graphics();
        this.deleteZoneBg.fillStyle(0x444444, 0.6);
        this.deleteZoneBg.lineStyle(3, 0xff4444, 0.8);
        this.deleteZoneBg.fillCircle(0, 0, this.deleteZoneSize / 2);
        this.deleteZoneBg.strokeCircle(0, 0, this.deleteZoneSize / 2);
        this.deleteZone.add(this.deleteZoneBg);

        // Trash can icon (using text for simplicity)
        this.deleteZoneIcon = this.scene.add.text(0, 0, '🗑️', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.deleteZone.add(this.deleteZoneIcon);

        // "Delete" text
        this.deleteZoneText = this.scene.add.text(0, 35, 'Delete', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.deleteZone.add(this.deleteZoneText);

        // Store delete zone bounds for collision detection
        this.deleteZoneBounds = {
            x: deleteZoneX,
            y: deleteZoneY,
            width: this.deleteZoneSize,
            height: this.deleteZoneSize
        };

        // Handle window resize
        this.scene.scale.on('resize', (gameSize) => {
            this.handleResize(gameSize);
        });

        // Add subtle pulse animation to make delete zone more noticeable
        this.scene.tweens.add({
            targets: this.deleteZone,
            alpha: 0.7,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    handleResize(gameSize) {
        if (!this.deleteZone) return;
        
        const newX = gameSize.width - this.deleteZoneSize - this.margin;
        const newY = gameSize.height - this.deleteZoneSize - this.margin;
        this.deleteZone.setPosition(newX + this.deleteZoneSize / 2, newY + this.deleteZoneSize / 2);
        this.deleteZoneBounds.x = newX;
        this.deleteZoneBounds.y = newY;
    }

    checkHover(pointer) {
        if (!this.deleteZoneBounds) return false;
        
        return pointer.x >= this.deleteZoneBounds.x && 
               pointer.x <= this.deleteZoneBounds.x + this.deleteZoneBounds.width &&
               pointer.y >= this.deleteZoneBounds.y && 
               pointer.y <= this.deleteZoneBounds.y + this.deleteZoneBounds.height;
    }

    activate() {
        if (!this.deleteZone) return;
        
        // Enhance visual feedback when hovering over delete zone
        this.deleteZoneBg.clear();
        this.deleteZoneBg.fillStyle(0xff4444, 0.9);
        this.deleteZoneBg.lineStyle(4, 0xffffff, 1);
        this.deleteZoneBg.fillCircle(0, 0, 60);
        this.deleteZoneBg.strokeCircle(0, 0, 60);
        
        // Scale up the icon
        this.scene.tweens.add({
            targets: [this.deleteZoneIcon, this.deleteZoneText],
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            ease: 'Power2'
        });
    }

    deactivate() {
        if (!this.deleteZone) return;
        
        // Return to normal appearance
        this.deleteZoneBg.clear();
        this.deleteZoneBg.fillStyle(0x444444, 0.6);
        this.deleteZoneBg.lineStyle(3, 0xff4444, 0.8);
        this.deleteZoneBg.fillCircle(0, 0, 60);
        this.deleteZoneBg.strokeCircle(0, 0, 60);
        
        // Scale back to normal
        this.scene.tweens.add({
            targets: [this.deleteZoneIcon, this.deleteZoneText],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
        });
    }

    deleteItem(item) {
        // Remove from placedItems map
        if (item.multiTileKeys) {
            // Multi-tile item (like castle)
            for (const key of item.multiTileKeys) {
                this.scene.placedItems.delete(key);
            }
        } else {
            // Single-tile item
            for (const [key, placedItem] of this.scene.placedItems.entries()) {
                if (placedItem === item) {
                    this.scene.placedItems.delete(key);
                    break;
                }
            }
        }

        // Return sprite to inventory
        const textureKey = item.textureKey;
        const currentCount = this.scene.spriteCounters.get(textureKey);
        this.scene.spriteCounters.set(textureKey, currentCount + 1);
        this.scene.scene.get('UIScene').updateSpriteCounter(textureKey, currentCount + 1);

        // Clear selection if this was the selected item
        if (this.scene.selectedItem === item) {
            this.scene.selectedItem = null;
            this.scene.destroyRotateButton();
        }

        // Create deletion effect
        this.createDeletionEffect(item.x, item.y);

        // Destroy the sprite
        item.destroy();

        // Show feedback message
        this.scene.showMessage('Item deleted!', '#ff4444');
        
        // Update population after deleting an item
        this.scene.updatePopulation();
    }

    createDeletionEffect(x, y) {
        // Create puff of smoke effect
        const particles = this.scene.add.particles(x, y, 'coin', {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 500,
            quantity: 8,
            tint: 0x666666
        });

        // Remove particles after animation
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });

        // Play sound effect
        this.scene.sounds.pop.play();
    }

    destroy() {
        if (this.deleteZone) {
            this.deleteZone.destroy();
            this.deleteZone = null;
            this.deleteZoneBg = null;
            this.deleteZoneIcon = null;
            this.deleteZoneText = null;
            this.deleteZoneBounds = null;
        }
    }
} 