# Coin Quest Adventure - Design Document

## Goal

Autonomously design and implement a visually appealing, functional 2D platformer prototype named "Coin Quest Adventure". The game will feature a score system, multiple levels, and rich aesthetics using platform-native web technologies.

## Tech Stack

- **Web:** HTML5 Canvas, Vanilla JavaScript (ES6+), Vanilla CSS.
- No external game engines or frameworks (like Phaser) will be used to ensure a lightweight, standalone prototype.

## Core Mechanics

1.  **Player Controller:**
    - Horizontal movement (left/right arrow keys or A/D).
    - Jumping (Up arrow, W, or Spacebar).
    - Physics: Gravity, friction, terminal velocity.
2.  **Collision Detection:**
    - Axis-Aligned Bounding Box (AABB) collision for platforms (static), hazards, and collectibles.
3.  **Progression & Scoring:**
    - **Coins:** Collecting coins increases the score.
    - **Levels:** Reaching a designated "Goal" area advances the player to the next level.
    - **Hazards:** Touching spikes or falling off the bottom of the screen resets the current level (or reduces lives if implemented).
4.  **Game States:**
    - Start Menu -> Playing -> Level Complete -> Game Over / Victory.

## Visuals & Aesthetics

- **Rendering:** Graphics will be procedurally drawn using the Canvas API.
- **Player:** A stylized character (e.g., a colored square with eyes, or a simple animated sprite if time permits).
- **Environment:**
  - Dynamic, gradient backgrounds based on the current level theme (e.g., Sky blue for level 1, dark purple/grey for a cave level).
  - Platforms will have distinct colors and potentially simple internal patterns (drawn via canvas).
- **Collectibles:** Glowing golden circles or stylized coin shapes.
- **UI:** Clean, modern CSS overlays for score, level indication, and menus.

## Architecture

1.  **`index.html`:** The main entry point containing the `<canvas>` element and UI overlays.
2.  **`style.css`:** Styling for the UI, menus, and canvas positioning.
3.  **`src/` directory:**
    - `main.js`: Game loop (`requestAnimationFrame`), state management, input handling, and initialization.
    - `Player.js`: Player entity, physics, and input application.
    - `Level.js`: Level parsing, rendering, and collision boundaries.
    - `Entities.js`: Classes for `Coin`, `Spike`, `Goal`, etc.
    - `LevelData.js`: Data structures (e.g., 2D arrays or coordinate lists) defining the layout of each level.

## Implementation Steps

1.  **Setup:** Create project structure and initialize the canvas.
2.  **Player & Physics:** Implement the player character with basic gravity and movement.
3.  **Levels & Collision:** Create a static platform system and implement AABB collision to allow the player to stand on and bump into walls. Add a camera system to follow the player if levels extend beyond the screen width.
4.  **Interactables:** Add Coins (scoring) and the Goal (level transition).
5.  **Hazards & Polish:** Add spikes/pits, implement game states (menus), and refine the visual aesthetics (colors, gradients, particle effects if possible).

## Level Design Strategy

Levels will be defined using grid-based tile maps (e.g., 2D arrays of integers where 0=empty, 1=solid block, 2=coin, 3=spike, 4=goal). This allows for rapid creation and modification of levels.
