// ===== GAME CONFIGURATION =====
// This file contains all the configuration for the IsometricGridScene
// You can easily modify population, prices, initial counts, and display properties here

const GameConfig = {
    // ===== GRID AND TILE PROPERTIES =====
    tileSize: 64, // Size of the diamond tile
    gridSize: 10, // 10x10 grid
    showGrid: false, // Grid is hidden by default (toggle available in dev mode)
    
    // ===== VIEW AND ZOOM PROPERTIES =====
    zoomLevel: 1, // Track current zoom level
    minZoom: 1, // Minimum zoom level (100% of original size)
    maxZoom: 2, // Maximum zoom level (200% of original size)
    baseScale: 1, // Base scale for all elements
    
    // ===== GAME STATE PROPERTIES =====
    coins: 0, // Track number of coins
    population: 0, // Current population count
    currentLevel: 0, // Track current level (0 = starting, 1 = after first 150 population)
    maxPopulationReached: 0, // Track the highest population reached
    
    // ===== POPULATION BOOSTS =====
    populationBoosts: {
        hut: 5,           // Each hut gives +5 population
        shrine: 20,       // Each shrine gives +20 population (to be added)
        temple: 40,       // Each mini time temple gives +40 population
        legendary_temple: 70  // Each legendary time temple gives +100 population (to be added)
    },
    
    // ===== MULTI-GRID SYSTEM PROPERTIES =====
    currentGridLayer: 0, // Track which grid layer is active (0, 1, or 2)
    gridColors: [0x7cba34, 0x3498db, 0xffff00], // Green, Blue, Yellow
    gridOffsets: [0, -40, -80], // Vertical offsets for each grid layer
    
    // ===== CLOUD SYSTEM PROPERTIES =====
    cloudSpawnTimer: 10, // Timer for spawning new clouds
    cloudSpawnInterval: 1000, // Spawn a new cloud every 1.5 seconds (faster for better coverage)
    maxClouds: 15, // Maximum number of clouds on screen (increased for grid coverage)
    
    // Cloud appearance configuration
    cloudScaleMin: 1.0, // Minimum cloud scale
    cloudScaleMax: 5.0, // Maximum cloud scale
    cloudAlphaMin: 0.5, // Minimum cloud transparency (60%)
    cloudAlphaMax: 1.0, // Maximum cloud transparency (100%)
    
    // ===== AUDIO CONFIGURATION =====
    audioVolumes: {
        bgm: 0.5,
        button: 0.7,
        correct: 0.7,
        pop: 0.7,
        shop: 0.7
    },
    isMuted: false, // Track mute state
    
    // ===== GAME STATE FLAGS =====
    firstZeroAssetShown: false, // Track if first zero asset message has been shown
    welcomeMessageShown: false, // Track if welcome message has been shown
    secondWelcomeMessageShown: false, // Track if second welcome message has been shown
    quizActive: false, // Add flag to track if quiz is active
    level1Unlocked: false, // Track if level 1 upgrades have been unlocked
    level2Completed: false, // Track if level 2 has been completed
    toolbarExpanded: false, // Start closed
    
    // ===== DEVELOPER MODE PROPERTIES =====
    developerMode: false, // Developer mode state
    restrictionMode: false, // Tile restriction mode
    devModeKeySequence: '', // Store key sequence for developer mode
    
    // ===== ASSET CONFIGURATION - EDIT THESE VALUES EASILY =====
    // This is the main configuration for all sprites in the game
    // You can easily modify population, prices, initial counts, and display properties here
    assetConfig: {
        hut: {
            // Display properties
            yOffset: 64 / 4 + 6, // Using tileSize value directly
            scale: 1.0,
            tileSpan: 1,
            // Game mechanics
            population: 10,       // 🏠 Population boost (EDIT THIS)
            price: 50,           // 💰 Shop price (EDIT THIS)
            initialCount: 2      // 📦 Starting inventory (EDIT THIS)
        },
        'hut-u1': {
            // Display properties
            yOffset: 64 / 4 + 1, // Using tileSize value directly
            scale: 1.0,
            tileSpan: 1,
            // Game mechanics
            population: 15,       // 🏠 Population boost (EDIT THIS)
            price: 75,           // 💰 Shop price (EDIT THIS)
            initialCount: 2,     // 📦 Starting inventory (available for purchase but locked until level 1)
            requiresLevel: 1     // Level required to use this item
        },
        shrine: {
            yOffset: 64 / 4 + 28, // Using tileSize value directly
            scale: 1.2,
            tileSpan: 2,
            population: 20,       // 🏠 Population boost (EDIT THIS)
            price: 150,          // 💰 Shop price (EDIT THIS)
            initialCount: 1      // 📦 Starting inventory (EDIT THIS)
        },
        'shrine-u1': {
            yOffset: 64 / 4 + 20, // Using tileSize value directly
            scale: 1.1,
            tileSpan: 2,
            population: 35,       // 🏠 Population boost (EDIT THIS)
            price: 250,          // 💰 Shop price (EDIT THIS)
            initialCount: 0,     // 📦 Starting inventory (available for purchase but locked until level 1)
            requiresLevel: 1     // Level required to use this item
        },
        temple: {
            yOffset: 64 / 4 + 28, // Using tileSize value directly
            scale: 1.4,
            tileSpan: 2,
            population: 40,       // 🏠 Population boost (EDIT THIS)
            price: 200,          // 💰 Shop price (EDIT THIS)
            initialCount: 30      // 📦 Starting inventory (EDIT THIS)
        },
        'temple-u1': {
            yOffset: 64 / 4 + 35, // Using tileSize value directly
            scale: 1.6,
            tileSpan: 3,
            population: 70,      // 🏠 Population boost (EDIT THIS)
            price: 500,          // 💰 Shop price (EDIT THIS)
            initialCount: 20,     // 📦 Starting inventory (available for purchase but locked until level 1)
            requiresLevel: 1     // Level required to use this item
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} else {
    window.GameConfig = GameConfig;
} 