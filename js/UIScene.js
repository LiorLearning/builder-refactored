
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
      this.population = 0; // Track population
      this.populationText = null; // Store reference to population text
  }

  init(data) {
      this.parentScene = data.parentScene;
      this.tileSize = data.tileSize;
      this.iconConfig = data.iconConfig;
      this.coins = data.coins || 0;
      this.population = data.population || 0;
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
              const pointerWorld = this.parentScene.getPointerWorldPositionForTileSelection(pointer);
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
          
          // Check level requirements
          const config = this.parentScene.assetConfig[key];
          const requiresLevel = config ? config.requiresLevel : 0;
          const isLevelLocked = requiresLevel > this.parentScene.currentLevel;
          
          // Only make draggable if level requirement is met
          if (!isLevelLocked) {
              this.input.setDraggable(icon);
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
              const lockIcon = this.add.text(0, 5, '🔒', {
                  fontSize: '16px'
              }).setOrigin(0.5);
              iconContainer.add(lockIcon);
              
              // Store reference for later removal
              icon.lockIcon = lockIcon;
          }
          
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
              
              // Check level requirements
              const config = this.parentScene.assetConfig[icon.textureKey];
              const requiresLevel = config ? config.requiresLevel : 0;
              if (requiresLevel > this.parentScene.currentLevel) {
                  // Show feedback that item is level locked
                  this.parentScene.showMessage(`Requires Level ${requiresLevel}!`, '#ff6b6b');
                  return; // Don't allow drag if level requirement not met
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
      
      // Add population counter next to the toggle button
      this.createPopulationCounter(btnX, btnY, btnRadius);
  }

  createPopulationCounter(btnX, btnY, btnRadius) {
      // Calculate the position for the population bar
      // From right edge of toolbar to left edge of shop
      const toolbarRightEdge = 20 + 200; // toolbar x + estimated toolbar width
      const coinMarginRight = 180;
      const shopLeftEdge = this.cameras.main.width - coinMarginRight - 50 - 25; // shop position minus half shop width
      
      const barX = toolbarRightEdge + 20; // Start 20px from toolbar
      const barY = 35; // Same height as other UI elements
      const barWidth = shopLeftEdge - barX - 20; // End 20px before shop
      const barHeight = 20;
      
      // Create population bar container
      this.populationContainer = this.add.container(0, 0);
      this.populationContainer.setDepth(1001); // Above toolbar
      
      // Create the bar background
      const barBg = this.add.graphics();
      
      // Background shadow
      barBg.fillStyle(0x000000, 0.3);
      barBg.fillRoundedRect(barX + 2, barY + 2, barWidth, barHeight, 10);
      
      // Main background (dark frame)
      barBg.fillStyle(0x2C3E50, 0.9);
      barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 10);
      
      // Inner background (where progress fills)
      barBg.fillStyle(0x34495E, 1);
      barBg.fillRoundedRect(barX + 2, barY + 2, barWidth - 4, barHeight - 4, 8);
      
      // Border
      barBg.lineStyle(2, 0x3498DB, 0.8);
      barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 10);
      
      this.populationContainer.add(barBg);
      this.populationBarBg = barBg;
      
      // Create the progress bar fill
      this.populationBarFill = this.add.graphics();
      this.populationContainer.add(this.populationBarFill);
      
      // Store bar dimensions for updates
      this.barX = barX;
      this.barY = barY;
      this.barWidth = barWidth;
      this.barHeight = barHeight;
      
      // Population icon at the start of the bar
      const popIcon = this.add.text(barX - 25, barY + barHeight/2, '👥', {
          fontSize: '20px'
      }).setOrigin(0.5);
      this.populationContainer.add(popIcon);
      
      // Population text overlay (centered on bar)
      this.populationText = this.add.text(barX + barWidth/2, barY + barHeight/2, `${this.population}`, {
          fontSize: '14px',
          color: '#FFFFFF',
          fontStyle: 'bold',
          fontFamily: 'Comic Sans MS, cursive, sans-serif',
          stroke: '#000000',
          strokeThickness: 2
      }).setOrigin(0.5);
      this.populationContainer.add(this.populationText);
      
      // Update the progress bar fill
      this.updatePopulationBar();
      
      // Make population bar interactive for tooltip
      const hitArea = this.add.rectangle(barX + barWidth/2, barY + barHeight/2, barWidth, barHeight);
      hitArea.setInteractive({ useHandCursor: true });
      this.populationContainer.add(hitArea);
      
      // Add hover effects and tooltip
      hitArea.on('pointerover', () => {
          this.showPopulationTooltip();
      });
      
      hitArea.on('pointerout', () => {
          this.hidePopulationTooltip();
      });
  }
  
  updatePopulationBar() {
      if (!this.populationBarFill) return;
      
      // Dynamic maximum population based on level
      const baseMaxPopulation = 150; // Level 0 max
      const extendedMaxPopulation = 600; // Level 1+ max
      const maxPopulation = this.parentScene.level1Unlocked ? extendedMaxPopulation : baseMaxPopulation;
      
      // Calculate fill percentage
      const fillPercentage = Math.min(this.population / maxPopulation, 1);
      const fillWidth = (this.barWidth - 4) * fillPercentage;
      
      // Clear previous fill
      this.populationBarFill.clear();
      
      if (fillWidth > 0) {
          // For extended bar (level 1+), show different visual segments
          if (this.parentScene.level1Unlocked && maxPopulation === extendedMaxPopulation) {
              // Show completed first segment (0-150)
              const firstSegmentWidth = (this.barWidth - 4) * (baseMaxPopulation / extendedMaxPopulation);
              
              // First segment (completed) - green
              this.populationBarFill.fillGradientStyle(0x27AE60, 0x2ECC71, 0x27AE60, 0x2ECC71, 1);
              this.populationBarFill.fillRoundedRect(this.barX + 2, this.barY + 2, firstSegmentWidth, this.barHeight - 4, 8);
              
              // Add completed segment shine
              this.populationBarFill.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0.4);
              this.populationBarFill.fillRoundedRect(this.barX + 2, this.barY + 2, firstSegmentWidth, (this.barHeight - 4) / 3, 8);
              
              // Second segment (current progress beyond 150)
              if (this.population > baseMaxPopulation) {
                  const secondSegmentProgress = this.population - baseMaxPopulation;
                  const secondSegmentMax = extendedMaxPopulation - baseMaxPopulation;
                  const secondSegmentPercentage = Math.min(secondSegmentProgress / secondSegmentMax, 1);
                  const secondSegmentWidth = (this.barWidth - 4 - firstSegmentWidth) * secondSegmentPercentage;
                  
                  // Choose color based on progress in second segment
                  let fillColor1, fillColor2;
                  if (secondSegmentPercentage < 0.3) {
                      // Early second segment - blue to cyan
                      fillColor1 = 0x3498DB;
                      fillColor2 = 0x1ABC9C;
                  } else if (secondSegmentPercentage < 0.7) {
                      // Mid second segment - cyan to purple
                      fillColor1 = 0x1ABC9C;
                      fillColor2 = 0x9B59B6;
                  } else {
                      // Late second segment - purple to gold
                      fillColor1 = 0x9B59B6;
                      fillColor2 = 0xFFD700;
                  }
                  
                  this.populationBarFill.fillGradientStyle(fillColor1, fillColor2, fillColor1, fillColor2, 1);
                  this.populationBarFill.fillRoundedRect(this.barX + 2 + firstSegmentWidth, this.barY + 2, secondSegmentWidth, this.barHeight - 4, 8);
                  
                  // Add second segment shine
                  this.populationBarFill.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0.3);
                  this.populationBarFill.fillRoundedRect(this.barX + 2 + firstSegmentWidth, this.barY + 2, secondSegmentWidth, (this.barHeight - 4) / 3, 8);
              }
              
              // Add visual separator between segments
              this.populationBarFill.lineStyle(2, 0xFFFFFF, 0.6);
              this.populationBarFill.lineBetween(
                  this.barX + 2 + firstSegmentWidth, this.barY + 2,
                  this.barX + 2 + firstSegmentWidth, this.barY + this.barHeight - 2
              );
          } else {
              // Regular single-segment bar (level 0)
              let fillColor1, fillColor2;
              if (fillPercentage < 0.3) {
                  // Low population - red to orange
                  fillColor1 = 0xE74C3C;
                  fillColor2 = 0xE67E22;
              } else if (fillPercentage < 0.7) {
                  // Medium population - orange to yellow
                  fillColor1 = 0xE67E22;
                  fillColor2 = 0xF1C40F;
              } else {
                  // High population - yellow to green
                  fillColor1 = 0xF1C40F;
                  fillColor2 = 0x27AE60;
              }
              
              // Fill with gradient
              this.populationBarFill.fillGradientStyle(fillColor1, fillColor2, fillColor1, fillColor2, 1);
              this.populationBarFill.fillRoundedRect(this.barX + 2, this.barY + 2, fillWidth, this.barHeight - 4, 8);
              
              // Add shine effect
              this.populationBarFill.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0.3);
              this.populationBarFill.fillRoundedRect(this.barX + 2, this.barY + 2, fillWidth, (this.barHeight - 4) / 3, 8);
          }
      }
      
      // Update text to show current/max with level info
      if (this.populationText) {
          const levelText = this.parentScene.currentLevel > 0 ? ` (Lv.${this.parentScene.currentLevel})` : '';
          this.populationText.setText(`${this.population}/${maxPopulation}${levelText}`);
      }
  }

  showPopulationTooltip() {
      if (this.populationTooltip) {
          this.populationTooltip.destroy();
      }
      
      // Calculate population breakdown using the new system
      const uniqueItems = new Set();
      const itemCounts = {};
      
      // Initialize counters for all assets that have population values
      Object.keys(this.parentScene.assetConfig).forEach(key => {
          if (this.parentScene.assetConfig[key].population > 0) {
              itemCounts[key] = 0;
          }
      });
      
      // Count unique placed items from parent scene
      this.parentScene.placedItems.forEach(item => {
          if (!uniqueItems.has(item)) {
              uniqueItems.add(item);
              const textureKey = item.textureKey;
              if (itemCounts.hasOwnProperty(textureKey)) {
                  itemCounts[textureKey]++;
              }
          }
      });
      
      // Create tooltip content with emojis for each building type
      const buildingEmojis = {
          hut: '🏠',
          'hut-u1': '🏡',
          shrine: '⛩️',
          'shrine-u1': '🏯',
          temple: '🏛️',
          'temple-u1': '🏯',
          legendary_temple: '🏯',
          castle: '🏰',
          tower1: '🗼'
      };
      
      let tooltipText = 'City Population Breakdown:\n\n';
      let hasBuildings = false;
      
      Object.keys(itemCounts).forEach(key => {
          const count = itemCounts[key];
          if (count > 0) {
              hasBuildings = true;
              const populationBoost = this.parentScene.assetConfig[key].population;
              const emoji = buildingEmojis[key] || '🏢';
              const name = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
              tooltipText += `${emoji} ${name}: ${count} × ${populationBoost} = ${count * populationBoost}\n`;
          }
      });
      
      if (!hasBuildings) {
          tooltipText = 'Build huts and temples to\nincrease your city population!\n\n🏠 Hut = +10 population\n🏡 Hut-U1 = +15 population (purchasable)\n🏛️ Temple = +40 population\n🏯 Shrine = +20 population (purchasable)\n🏯 Shrine-U1 = +35 population (purchasable)';
          
          // Add unlock information if not at level 1 yet
          if (!this.parentScene.level1Unlocked) {
              tooltipText += '\n\n🔒 U1 buildings can be bought but not used until Level 1!';
          }
      } else {
          const baseMaxPopulation = 150;
          const extendedMaxPopulation = 600;
          const maxPopulation = this.parentScene.level1Unlocked ? extendedMaxPopulation : baseMaxPopulation;
          const currentLevel = this.parentScene.currentLevel;
          const levelText = currentLevel > 0 ? ` (Level ${currentLevel})` : '';
          tooltipText += `\nTotal Population: ${this.population}/${maxPopulation}${levelText}`;
          
          // Add progress information based on level
          if (!this.parentScene.level1Unlocked) {
              const remaining = baseMaxPopulation - this.population;
              tooltipText += `\n🔒 ${remaining} more to unlock U1 buildings!`;
          } else if (this.population < extendedMaxPopulation) {
              const remaining = extendedMaxPopulation - this.population;
              tooltipText += `\n🎯 ${remaining} more to max population!`;
          } else {
              tooltipText += '\n🏆 Maximum population reached!';
          }
      }
      
      // Position tooltip above the population bar
      const tooltipX = this.barX + this.barWidth/2;
      const tooltipY = this.barY - 20;
      
      // Create tooltip background
      const tooltipBg = this.add.graphics();
      const lines = tooltipText.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      const tooltipWidth = Math.max(200, maxLineLength * 8);
      const tooltipHeight = lines.length * 16 + 20;
      
      // Tooltip shadow
      tooltipBg.fillStyle(0x000000, 0.4);
      tooltipBg.fillRoundedRect(tooltipX - tooltipWidth/2 + 2, tooltipY - tooltipHeight/2 + 2, tooltipWidth, tooltipHeight, 8);
      
      // Tooltip background
      tooltipBg.fillGradientStyle(0x2C3E50, 0x34495E, 0x8E44AD, 0x9B59B6, 0.95);
      tooltipBg.fillRoundedRect(tooltipX - tooltipWidth/2, tooltipY - tooltipHeight/2, tooltipWidth, tooltipHeight, 8);
      
      // Tooltip border
      tooltipBg.lineStyle(2, 0xFFFFFF, 0.8);
      tooltipBg.strokeRoundedRect(tooltipX - tooltipWidth/2, tooltipY - tooltipHeight/2, tooltipWidth, tooltipHeight, 8);
      
      // Tooltip text
      const tooltipTextObj = this.add.text(tooltipX, tooltipY, tooltipText, {
          fontSize: '12px',
          color: '#FFFFFF',
          fontStyle: 'bold',
          fontFamily: 'Comic Sans MS, cursive, sans-serif',
          align: 'center',
          stroke: '#2C3E50',
          strokeThickness: 1
      }).setOrigin(0.5);
      
      // Create tooltip container
      this.populationTooltip = this.add.container(0, 0);
      this.populationTooltip.add(tooltipBg);
      this.populationTooltip.add(tooltipTextObj);
      this.populationTooltip.setDepth(2000);
      
      // Entrance animation
      this.populationTooltip.setScale(0);
      this.tweens.add({
          targets: this.populationTooltip,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut'
      });
  }

  hidePopulationTooltip() {
      if (this.populationTooltip) {
          this.tweens.add({
              targets: this.populationTooltip,
              scaleX: 0,
              scaleY: 0,
              duration: 150,
              ease: 'Power2',
              onComplete: () => {
                  this.populationTooltip.destroy();
                  this.populationTooltip = null;
              }
          });
      }
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
                      this.input.setDraggable(icon, false);
                      
                      // Show first zero asset message if not shown before
                      if (!this.firstZeroAssetShown) {
                          this.showFirstZeroAssetMessage();
                          this.firstZeroAssetShown = true;
                      }
                  } else if (isLevelLocked) {
                      // Item available but level locked - keep interactive for shop but not draggable
                      icon.setInteractive();
                      this.input.setDraggable(icon, false);
                  }
                  
                  // Add or update lock icon
                  if (isLevelLocked && !icon.lockIcon) {
                      const lockIcon = this.add.text(0, 5, '🔒', {
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
                  this.input.setDraggable(icon, true);
                  
                  // Remove lock icon if it exists
                  if (icon.lockIcon) {
                      icon.lockIcon.destroy();
                      icon.lockIcon = null;
                  }
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

  updatePopulation(newPopulation) {
      this.population = newPopulation;
      if (this.populationText) {
          // Update the population bar
          this.updatePopulationBar();
          
          // Add a small bounce animation when population changes
          this.tweens.add({
              targets: this.populationText,
              scaleX: 1.3,
              scaleY: 1.3,
              duration: 200,
              ease: 'Power2',
              yoyo: true
          });
      }
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
          this.pixieImage.setPosition(100, gameSize.height - 1000);
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
      const iconKeys = ['hut', 'hut-u1', 'shrine', 'shrine-u1', 'temple', 'temple-u1'];
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
