## Plan: Satisfactory Load Balancing Webapp

Build a vanilla JavaScript webapp using HTML5 Canvas for designing Satisfactory load balancing systems. Focus on core interactivity first, then simulation and UI polish.

**Steps**

1. Set up basic HTML structure with canvas element and include app.js and styles.css.
2. Implement canvas rendering with zoom and pan controls (mouse wheel for zoom, drag for pan).
3. Add double-click event on canvas to show context menu for selecting component type (Merger, Splitter, Input, Output, Helper Input).
4. Define component classes in JS: Merger (3 inputs, 1 output), Splitter (1 input, 3 outputs), Input (configurable rate), Output (sink), HelperInput (for mergers).
5. Implement component placement: on context menu selection, place component at click position.
6. Add component dragging: allow moving components around the canvas.
7. Implement belt creation: on drag from a component's output/input, show context menu to select destination component and port.
8. Validate belt connections: ensure valid flows (e.g., output to input, respect max connections).
9. Add flow simulation: calculate and display item rates through the system based on merger summing and splitter even distribution.
10. Implement settings panel: toggle grid snapping, adjust canvas settings.
11. Add properties panel: configure input rates, view component details.

**Relevant files**

- planning/output/index.html — Main HTML file with canvas.
- planning/output/app.js — Core JavaScript logic for components, canvas, interactions.
- planning/output/styles.css — Basic styling.

**Verification**

1. Open index.html in browser, test zoom/pan.
2. Place components via context menu, drag them.
3. Create belts between components, verify connections.
4. Run simulation, check if rates propagate correctly (e.g., input 100 to splitter with 2 outputs → 50 each).
5. Test settings and properties panels.

**Decisions**

- Use HTML5 Canvas for rendering due to infinite canvas and performance for many components.
- Avoid frameworks: pure vanilla JS, HTML, CSS.
- Components have fixed max ports as per requirements; belts connect ports.
- Simulation runs on demand or real-time as components change.

**Further Considerations**

1. Performance: For large designs, optimize canvas redraws.
2. Undo/redo: Add later if needed.
3. Save/load designs: JSON export/import for persistence.
