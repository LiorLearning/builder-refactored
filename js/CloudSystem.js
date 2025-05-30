// ===== CLOUD SYSTEM CLASS =====
// This class handles all cloud-related functionality for the isometric grid scene
// It manages cloud spawning, movement, cleanup, and visual effects

class CloudSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        
        // Load configuration from GameConfig or use provided config
        const gameConfig = window.GameConfig || config;
        
        // Cloud system properties
        this.clouds = []; // Array to hold active clouds
        this.cloudSpawnTimer = gameConfig.cloudSpawnTimer || 10;
        this.cloudSpawnInterval = gameConfig.cloudSpawnInterval || 1000;
        this.maxClouds = gameConfig.maxClouds || 15;
        this.cloudContainer = null; // Container for all clouds
        this.cloudTimer = null; // Timer for cloud spawning
        
        // Cloud appearance configuration
        this.cloudScaleMin = gameConfig.cloudScaleMin || 1.0;
        this.cloudScaleMax = gameConfig.cloudScaleMax || 5.0;
        this.cloudAlphaMin = gameConfig.cloudAlphaMin || 0.5;
        this.cloudAlphaMax = gameConfig.cloudAlphaMax || 1.0;
        
        // Debug logging
        this.enableLogging = config.enableLogging || false;
    }
    
    // ===== INITIALIZATION =====
    initialize() {
        // Create a separate cloud container that's always visible
        this.cloudContainer = this.scene.add.container(0, 0);
        this.cloudContainer.setDepth(50); // Above grid but below UI elements
        
        // Create a timer event for cloud spawning
        this.cloudTimer = this.scene.time.addEvent({
            delay: this.cloudSpawnInterval,
            callback: this.spawnCloud,
            callbackScope: this,
            loop: true
        });
        
        // Spawn the first cloud immediately
        this.spawnCloud();
        
        if (this.enableLogging) {
            console.log('CloudSystem initialized');
        }
    }
    
    // ===== CLOUD SPAWNING =====
    spawnCloud() {
        if (this.clouds.length >= this.maxClouds) return;
        
        // Spawn clouds across the complete screen area
        // Choose randomly between spawning from right edge or bottom edge
        const spawnFromRightEdge = Math.random() < 0.5;
        
        let startX, startY;
        
        if (spawnFromRightEdge) {
            // Spawn from right edge - cover full height of screen
            startX = this.scene.cameras.main.width + 100; // Start off-screen right
            startY = Math.random() * this.scene.cameras.main.height; // Random Y across full screen height
        } else {
            // Spawn from bottom edge - cover full width of screen
            startX = Math.random() * this.scene.cameras.main.width; // Random X across full screen width
            startY = this.scene.cameras.main.height + 100; // Start off-screen bottom
        }
        
        // Calculate end position using the exact isometric grid angle (26.57°)
        // tan(26.57°) = 0.5, so for every 2 units left, move 1 unit up
        const horizontalDistance = startX + 250; // Total horizontal distance to travel
        const verticalDistance = horizontalDistance * 0.5; // Using tan(26.57°) = 0.5
        
        const endX = -250; // End off-screen left
        const endY = startY - verticalDistance; // Move up by the calculated vertical distance
        
        // Create cloud sprite
        const cloud = this.scene.add.image(startX, startY, 'cloud');
        
        // Varied sizes while maintaining aspect ratio (uniform scaling)
        const scale = this.cloudScaleMin + Math.random() * (this.cloudScaleMax - this.cloudScaleMin);
        cloud.setScale(scale); // This maintains aspect ratio
        
        // Varied transparency for depth effect
        const alpha = this.cloudAlphaMin + Math.random() * (this.cloudAlphaMax - this.cloudAlphaMin);
        cloud.setAlpha(alpha);
        
        // Add cloud to the separate cloud container (always visible)
        this.cloudContainer.add(cloud);
        
        // Add to clouds array
        this.clouds.push(cloud);
        
        // Calculate movement duration based on distance
        const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        const duration = distance * 8 + Math.random() * 2000; // Slight speed variation
        
        // Animate cloud movement from bottom-right to top-left
        this.scene.tweens.add({
            targets: cloud,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // Remove cloud when it reaches the end
                this.removeCloud(cloud);
            }
        });
        
        if (this.enableLogging) {
            console.log(`Spawned cloud at (${Math.round(startX)}, ${Math.round(startY)}), total clouds: ${this.clouds.length}`);
        }
    }
    
    // ===== CLOUD REMOVAL =====
    removeCloud(cloud) {
        // Remove from clouds array
        const index = this.clouds.indexOf(cloud);
        if (index > -1) {
            this.clouds.splice(index, 1);
        }
        
        // Destroy the cloud sprite
        if (cloud && !cloud.destroyed) {
            cloud.destroy();
        }
        
        if (this.enableLogging) {
            console.log(`Removed cloud, remaining clouds: ${this.clouds.length}`);
        }
    }
    
    // ===== ZOOM AND POSITIONING =====
    updateZoom(zoomLevel, gridLayerX, gridLayerY) {
        // Apply zoom to cloud container to keep it aligned with the grid
        if (this.cloudContainer) {
            this.cloudContainer.setScale(zoomLevel);
            this.cloudContainer.x = gridLayerX;
            this.cloudContainer.y = gridLayerY;
        }
    }
    
    resetPosition() {
        // Reset cloud container position
        if (this.cloudContainer) {
            this.cloudContainer.setScale(1);
            this.cloudContainer.x = 0;
            this.cloudContainer.y = 0;
        }
    }
    
    // ===== CONFIGURATION UPDATES =====
    updateConfig(newConfig) {
        // Update cloud system configuration
        if (newConfig.cloudSpawnInterval !== undefined) {
            this.cloudSpawnInterval = newConfig.cloudSpawnInterval;
            // Update the timer if it exists
            if (this.cloudTimer) {
                this.cloudTimer.delay = this.cloudSpawnInterval;
            }
        }
        
        if (newConfig.maxClouds !== undefined) {
            this.maxClouds = newConfig.maxClouds;
        }
        
        if (newConfig.cloudScaleMin !== undefined) {
            this.cloudScaleMin = newConfig.cloudScaleMin;
        }
        
        if (newConfig.cloudScaleMax !== undefined) {
            this.cloudScaleMax = newConfig.cloudScaleMax;
        }
        
        if (newConfig.cloudAlphaMin !== undefined) {
            this.cloudAlphaMin = newConfig.cloudAlphaMin;
        }
        
        if (newConfig.cloudAlphaMax !== undefined) {
            this.cloudAlphaMax = newConfig.cloudAlphaMax;
        }
        
        if (newConfig.enableLogging !== undefined) {
            this.enableLogging = newConfig.enableLogging;
        }
    }
    
    // ===== GETTERS =====
    getCloudCount() {
        return this.clouds.length;
    }
    
    getMaxClouds() {
        return this.maxClouds;
    }
    
    getCloudContainer() {
        return this.cloudContainer;
    }
    
    // ===== CLEANUP =====
    cleanup() {
        // Remove cloud timer
        if (this.cloudTimer) {
            this.cloudTimer.destroy();
            this.cloudTimer = null;
        }
        
        // Remove all clouds
        this.clouds.forEach(cloud => {
            if (cloud && !cloud.destroyed) {
                cloud.destroy();
            }
        });
        this.clouds = [];
        
        // Destroy cloud container
        if (this.cloudContainer && !this.cloudContainer.destroyed) {
            this.cloudContainer.destroy();
            this.cloudContainer = null;
        }
        
        if (this.enableLogging) {
            console.log('CloudSystem cleaned up');
        }
    }
    
    // ===== PAUSE/RESUME =====
    pause() {
        if (this.cloudTimer) {
            this.cloudTimer.paused = true;
        }
    }
    
    resume() {
        if (this.cloudTimer) {
            this.cloudTimer.paused = false;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSystem;
} else {
    window.CloudSystem = CloudSystem;
} 