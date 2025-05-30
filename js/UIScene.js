class UIScene extends Phaser.Scene {
  constructor() {
      super({ key: 'UIScene' });
      this.parentScene = null;
      this.tileSize = 64;
      this.iconConfig = null;
      this.toolbar = null; // Toolbar instance
      this.shop = null; // Shop instance
      this.population = 0; // Track population
      this.populationText = null; // Store reference to population text
  }

  init(data) {
      this.parentScene = data.parentScene;
      this.tileSize = data.tileSize;
      this.iconConfig = data.iconConfig;
      this.coins = data.coins || 0;
      this.population = data.population || 0;
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
      // Initialize shop
      this.shop = new Shop(this, this.parentScene);
      
      // Initialize toolbar
      this.toolbar = new Toolbar(this, this.parentScene, {
          tileSize: this.tileSize,
          iconConfig: this.iconConfig
      });
      this.toolbar.create();

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
      shopIcon.on('pointerdown', () => this.shop.show());

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
      
      // Add population counter
      this.createPopulationCounter();
  }

  createPopulationCounter() {
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
      // Delegate to toolbar
      if (this.toolbar) {
          this.toolbar.updateSpriteCounter(textureKey, newCount);
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
} 
