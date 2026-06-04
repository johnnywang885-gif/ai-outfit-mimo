# VTON Simplification Plan

## Objective
Reduce complexity, improve stability, and fix performance issues by removing background pre-rendering and streamlining the VTON pipeline to a single parallel task.

## Key Changes
1.  **Remove Background Triggers**: 
    *   Delete all `preRenderGarment` calls in `ondrop`, `randomize`, and `finishItem`.
    *   Remove `preRenderGarment` function definition.

2.  **Consolidate State**:
    *   Remove `renderedTopUrl`, `renderedBottomUrl`, `activeVTONRequests`, etc.
    *   The state will only exist within the `startVTON` function execution scope.

3.  **Core Logic Refactor (`startVTON`)**:
    *   Start HUD Loading and Timer.
    *   Gather inputs: Base Model (Face-swapped or original), Top Garment, Bottom Garment.
    *   Execute 1 or 2 API calls in parallel using `Promise.all`.
    *   If 2 garments, merge them using `mergeOutfitCanvas`.
    *   Display the result directly.
    *   Stop HUD and Timer.

4.  **Remove Secondary Processing**:
    *   Remove `blendModelWithBackground` and the final `Pixelcut` background removal step to increase speed as requested ("Raw VTON Only").

## Benefits
*   **Stability**: Prevents browser crashes caused by multiple overlapping high-memory Base64 tasks.
*   **Predictability**: The user knows exactly when AI is working and when it's done.
*   **Speed**: Removing the secondary background removal step will shave off 20-30 seconds.
