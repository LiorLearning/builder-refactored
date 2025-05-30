class Shop {
  constructor(scene, parentScene) {
    this.scene = scene; // UIScene reference
    this.parentScene = parentScene; // Main game scene reference
    this.shopDialog = null;
  }

  show() {
    // Remove existing dialog if any
    if (this.shopDialog) {
      this.shopDialog.destroy();
    }

    // Dialog dimensions
    const dialogWidth = 520;
    const dialogHeight = 580;
    const dialogX = this.scene.cameras.main.width / 2 - dialogWidth / 2;
    const dialogY = this.scene.cameras.main.height / 2 - dialogHeight / 2;

    // Create dialog container
    this.shopDialog = this.scene.add.container(0, 0);
    this.shopDialog.setDepth(3000);

    this.createBackground(dialogX, dialogY, dialogWidth, dialogHeight);
    this.createDecorations(dialogX, dialogY, dialogWidth);
    this.createTitle(dialogY);
    this.createCloseButton(dialogX, dialogY, dialogWidth);
    this.createShopItems(dialogX, dialogY, dialogWidth);
    this.animateEntrance();
  }

  createBackground(dialogX, dialogY, dialogWidth, dialogHeight) {
    // Create vibrant garden market background
    const dialogBg = this.scene.add.graphics();
    
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
  }

  createDecorations(dialogX, dialogY, dialogWidth) {
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
      const decoration = this.scene.add.text(dec.x, dec.y, dec.emoji, { fontSize: dec.size });
      this.shopDialog.add(decoration);
      
      // Add gentle floating animation
      this.scene.tweens.add({
        targets: decoration,
        y: dec.y - 5,
        duration: 2000 + Math.random() * 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    });
  }

  createTitle(dialogY) {
    // Add dragon shop title
    const title = this.scene.add.text(this.scene.cameras.main.width / 2, dialogY + 45, '🐲 Dragon Emporium 🐲', {
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
    const banner = this.scene.add.text(this.scene.cameras.main.width / 2, dialogY + 80, 'Legendary Items & Dragon Treasures! 🔥', {
      fontSize: '16px',
      color: '#FF6347',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);
    this.shopDialog.add(banner);
  }

  createCloseButton(dialogX, dialogY, dialogWidth) {
    // Add enhanced close button
    const closeBtnBg = this.scene.add.graphics();
    closeBtnBg.fillStyle(0xFF6B6B, 1);
    closeBtnBg.lineStyle(3, 0xFFFFFF, 1);
    closeBtnBg.fillCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
    closeBtnBg.strokeCircle(dialogX + dialogWidth - 30, dialogY + 30, 18);
    this.shopDialog.add(closeBtnBg);
    
    const closeBtn = this.scene.add.text(dialogX + dialogWidth - 30, dialogY + 30, '✕', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.close());
    
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
  }

  createShopItems(dialogX, dialogY, dialogWidth) {
    // Shop items grid - Market Stall Style
    const iconKeys = ['hut', 'hut-u1', 'shrine', 'shrine-u1', 'temple', 'temple-u1'];
    const itemsPerRow = 4;
    const itemCellWidth = 110;
    const itemCellHeight = 130;
    const gridWidth = itemsPerRow * itemCellWidth;
    const numRows = Math.ceil(iconKeys.length / itemsPerRow);
    const gridHeight = numRows * itemCellHeight;
    const gridStartX = this.scene.cameras.main.width / 2 - gridWidth / 2;
    const gridStartY = dialogY + 110;

    iconKeys.forEach((key, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = gridStartX + col * itemCellWidth + itemCellWidth / 2;
      const y = gridStartY + row * itemCellHeight;

      this.createShopItem(key, x, y);
    });
  }

  createShopItem(key, x, y) {
    // Create market stall display for each item
    const itemContainer = this.scene.add.container(x, y);
    this.shopDialog.add(itemContainer);

    // Create market stall display background
    const stallBg = this.scene.add.graphics();
    
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
    const itemIcon = this.scene.add.image(0, -5, key);
    const scale = Math.min(50 / itemIcon.width, 50 / itemIcon.height) * (this.scene.iconConfig[key].scale || 1);
    itemIcon.setScale(scale);
    itemContainer.add(itemIcon);

    // Add price tag (like market price tags)
    const priceTagBg = this.scene.add.graphics();
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

    const priceText = this.scene.add.text(0, 35, `${price}🪙`, {
      fontSize: '14px',
      color: '#8B4513',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    }).setOrigin(0.5);
    itemContainer.add(priceText);

    // Add buy button
    this.createBuyButton(itemContainer, key, price);
  }

  createBuyButton(itemContainer, key, price) {
    // Add exciting buy button (market style)
    const buyBtnBg = this.scene.add.graphics();
    const canAfford = this.scene.coins >= price;
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

    const buyBtn = this.scene.add.text(0, 62, btnText, {
      fontSize: canAfford ? '12px' : '10px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      stroke: '#2F4F2F',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });

    if (canAfford) {
      this.addItemAnimations(itemContainer);
      this.addBuyButtonFunctionality(buyBtn, buyBtnBg, itemContainer, key, price);
      this.addBuyButtonHoverEffects(buyBtn);
    }

    itemContainer.add(buyBtn);
  }

  addItemAnimations(itemContainer) {
    // Add bounce animation to available items
    const itemIcon = itemContainer.list[1]; // Icon is second element
    const priceTagBg = itemContainer.list[2]; // Price tag background
    const priceText = itemContainer.list[3]; // Price text
    
    this.scene.tweens.add({
      targets: [itemIcon, priceTagBg, priceText],
      y: '+=2',
      duration: 1500 + Math.random() * 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  addBuyButtonFunctionality(buyBtn, buyBtnBg, itemContainer, key, price) {
    // Buy button functionality
    buyBtn.on('pointerdown', () => {
      this.parentScene.sounds.button.play();
      if (this.scene.coins >= price) {
        this.processPurchase(key, price, itemContainer, buyBtn, buyBtnBg);
      } else {
        this.scene.showMessage('❌ Not enough coins! ❌', '#FF6B6B');
      }
    });
  }

  processPurchase(key, price, itemContainer, buyBtn, buyBtnBg) {
    // Update coins
    this.scene.coins -= price;
    this.scene.updateCoins(this.scene.coins);

    // Update sprite counter
    const currentCount = this.parentScene.spriteCounters.get(key);
    this.parentScene.spriteCounters.set(key, currentCount + 1);
    this.scene.updateSpriteCounter(key, currentCount + 1);

    // Play shop sound
    this.parentScene.sounds.shop.play();

    // Add purchase celebration effect
    this.addPurchaseCelebration(itemContainer);

    // Show success message
    this.scene.showMessage('🎉 Purchase successful! 🎉', '#32CD32');
    
    // Update button affordability
    this.updateButtonAffordability(buyBtn, buyBtnBg, price);
  }

  addPurchaseCelebration(itemContainer) {
    const celebration = this.scene.add.text(0, 30, '✨ SOLD! ✨', {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      stroke: '#8B4513',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    itemContainer.add(celebration);
    
    this.scene.tweens.add({
      targets: celebration,
      y: 10,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => celebration.destroy()
    });
  }

  updateButtonAffordability(buyBtn, buyBtnBg, price) {
    // Update this item's affordability in place
    this.scene.time.delayedCall(1000, () => {
      const newCanAfford = this.scene.coins >= price;
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
  }

  addBuyButtonHoverEffects(buyBtn) {
    // Hover effects for affordable items
    buyBtn.on('pointerover', () => {
      this.scene.tweens.add({
        targets: buyBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });

    buyBtn.on('pointerout', () => {
      this.scene.tweens.add({
        targets: buyBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });
  }

  animateEntrance() {
    // Add market entrance animation
    this.shopDialog.setScale(0);
    this.scene.tweens.add({
      targets: this.shopDialog,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  close() {
    if (this.shopDialog) {
      this.shopDialog.destroy();
      this.shopDialog = null;
    }
  }

  destroy() {
    this.close();
  }
} 