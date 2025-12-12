# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Smart Link Anchoring:** Links now connect cleanly to the edges of notes (cards and orbs) instead of the center, improving visual clarity.
- **Living Link Animations:** Added a subtle flowing dash animation to links to make the knowledge graph feel more dynamic.
- **Link Visualization 2.0:**
  - **Customizable Styles:** Choose between Solid, Dashed, or Dotted lines and Curved or Straight shapes.
  - **Dynamic Arrows:** Added controls to "Flip" or "Remove" arrows directly.
  - **Clean Defaults:** Links are now label-free by default; custom labels can be added via "Edit Label".
  - **Smart Rendering:** Refactored rendering engine (single component) for seamless animations and perfect arrow alignment.
- **Drill-Down Context Menu:** Replaced expanding submenus with a mobile-native "Drill-Down" navigation (Stack-based) to prevent screen overflow.

### Fixed
- **Link Rendering:** Fixed "janky" arrow alignment and double-rendering artifacts.
- **Mobile Link Interaction:** Enabled long-press context menu for links on touch devices.

## [0.6.0] - 2025-11-29

### Added
- **Mobile Refinements:**
  - **Batch Dragging:** Select multiple notes and move them together.
  - **Batch Actions:** Delete multiple notes or create a cluster from selection.
  - **Context Menu:** Long-press support for Notes and Clusters on touch devices.
  - **Hardware Back Button:** Android back button now clears selection or closes modals.
  - **Touch Events:** Full support for `touchstart`, `touchmove`, `touchend` for smooth interaction.
  - **Floating Action Buttons (FAB):** Optimized mobile UI layout.
