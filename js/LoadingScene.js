// ===== LOADING SCENE =====
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
      this.load.image('hut-u1', 'assets/hut-u1.png');
      this.load.image('wall', 'assets/wall.png');
      this.load.image('temple', 'assets/temple.png');
      this.load.image('shrine', 'assets/shrine.png');
      this.load.image('shrine-u1', 'assets/shrine-u1.png');
      this.load.image('temple-u1', 'assets/temple-u1.png');
      this.load.image('tower1', 'assets/tower1.png');
      this.load.image('coin', 'assets/coin.png');
      this.load.image('shop', 'assets/shop.png');
      this.load.image('pixie', 'assets/pixie.png');
      this.load.image('cloud', 'assets/cloud.png');
      
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