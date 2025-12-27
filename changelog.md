# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Theme System Revamp:**
  - **Dynamic Theming:** Implemented robust "Cream" (Light) and "Midnight" (Dark) themes with CSS variable injection.
  - **Visual Polish:** Updated "Cream" theme with a modern Sky Blue primary color and Orange literature notes.
  - **Dark Mode Fixes:** Resolved "Midnight" theme white-background bugs and ensured correct glassmorphism rendering.
  - **Legacy Cleanup:** Replaced all outdated `var(--theme-*)` variables with standard tokens (e.g., `var(--text)`, `var(--glass-bg)`).
- **Full-Text Search:**
  - **Deep Search:** Upgraded Fuse.js configuration (`ignoreLocation: true`) to effectively search note content beyond just titles and initial characters.
  - **Smart Snippets:** Implemented HTML stripping to generate clean, readable text previews of search hits.
- **In-Editor Find & Replace:**
  - **Local Find:** Added a native "Find in Note" bar inside the editor, toggled via the toolbar.
  - **Replace Support:** Added full Find & Replace capabilities (Replace, Replace All) to text editing.
  - **Visuals:** Matches are highlighted in real-time with navigation controls (Next/Prev).
- **Text Alignment:**
  - **Controls:** Added specific Left, Center, and Right alignment buttons to the editor toolbar.
  - **Support:** Works on all paragraphs and headings.
- **Wiki-links:**
  - **Syntax:** Support for `[[Note Title]]` syntax to create internal links.
  - **Navigation:** Clicking a wiki-link instantly opens the target note.
- **UI Stability:**
  - **Selection UI:** Fixed visibility issues in selection toggle and toolbar across all themes.
  - **Selection Logic:** Ensure close button in selection toolbar properly exits multi-select mode.
  - **Code Quality:** Cleaned up unused props and legacy state in `NoteEditor.tsx`.
- **Delink Feature:** Added "Delink" context menu option for Notes and Clusters to easily remove connected links with a submenu of targets.
- **Mobile Minimap Improvements:** 
    - **Pinch-to-Zoom:** Added pinch gesture support in minimap for zooming the canvas.
    - **Visibility:** Minimap is now hidden by default on mobile to save screen space, with centered overlay when active.
    - **Touch Interaction:** Improved touch handling for minimap viewport dragging.
- **Feedback Loop:** Built-in feedback system for beta testers.
    - **Firestore Integration:** Submissions are stored directly in the `feedback` collection.
    - **Smart Diagnostics:** Auto-collects device info (browser, screen size, theme) to help debug reports.
    - **Dedicated UI:** Floating glassmorphic button with a clean submission modal.
- **Global Error Handling:** Implemented a failsafe `ErrorBoundary` component.
    - **Auto Error Reporting:** Crashes are now automatically logged to Firestore `reports` collection with full stack traces and system diagnostics.
    - **Crash Screen:** Replaces "white screen of death" with a friendly UI upon unexpected errors.
    - **Recovery Actions:** Users can "Reload" or "Emergency Reset" (clear local data) to recover from crashes.
- **New User Onboarding:** First-time users see a pre-populated example knowledge graph.
    - **Seed Data:** Includes a Hub note, Fleeting note, Literature note, Permanent note, Cluster, and Links.
    - **Teach by Example:** Users learn by interacting with real notes instead of modal tutorials.
    - **Idempotent:** Uses fixed IDs to prevent duplicates across sessions.
- **UI Layering Fix:** Adjusted z-index of User/Settings icon.
    - **Issue:** Fixed overlap where User icon appeared on top of Note Editors.
    - **Fix:** Standardized z-index layers; User icon now sits correctly below modals (z-30 vs z-40).
- **Search & Filter Merge:** Unified Search and Filter components into a single powerful interface using `SearchAndFilter.tsx`.
    - **Combined Logic:** Search queries now respect active tag filters simultaneously.
    - **Cluster Search:** Search now finds **Clusters** in addition to notes, with viewport navigation support.
    - **UI Enhancement:** Single glassmorphic search icon replaced cluttered separate buttons; active filters are clearly indicated.
- **Tag Autocomplete:** Implemented smart autocomplete for note tags.
    - **Suggestions:** Dropdown list of existing tags appears while typing.
    - **Data Source:** Suggestions are dynamically sourced from all existing tags in the knowledge base.
    - **Optimization:** Refactored `TagsPanel` to read directly from the store for reliable synchronization.
- **Smart Link Anchoring:** Links now connect cleanly to the edges of notes (cards and orbs) instead of the center, improving visual clarity.
- **Living Link Animations:** Added a subtle flowing dash animation to links to make the knowledge graph feel more dynamic.
- **Link Visualization 2.0:**
  - **Customizable Styles:** Choose between Solid, Dashed, or Dotted lines and Curved or Straight shapes.
  - **Dynamic Arrows:** Added controls to "Flip" or "Remove" arrows directly.
  - **Clean Defaults:** Links are now label-free by default; custom labels can be added via "Edit Label".
  - **Smart Rendering:** Refactored rendering engine (single component) for seamless animations and perfect arrow alignment.
- **Drill-Down Context Menu:** Replaced expanding submenus with a mobile-native "Drill-Down" navigation (Stack-based) to prevent screen overflow.
- **Minimap 2.0:** Completely rewritten minimap with infinite dynamic bounds and drag-to-pan viewport control.
- **Default Link Style:** New links now default to "Dashed & Straight" for a cleaner initial look.
- **Cluster Gravity:** Cluster-to-Orb connections now flow inward with a dashed animation.
- **Search 2.0:** Completely overhauled search with mobile-responsive modal, arrow-key navigation, and smart text highlighting.
- **Auto-Centering Clusters:** Clusters now magnetically recenter in real-time as you drag their child notes.
- **Global Shortcuts:** Added `Delete`/`Backspace` to delete selected items and full keyboard shortcut documentation.
- **Visual Polish:** Doubled the size of Orbs and adjusted zoom threshold so cards appear sooner (80% zoom).
- **Note Type Specialization:**
  - **Literature Notes:** Added metadata fields (Author, Year, URL) with a collapsible UI.
  - **Hub Notes:** Implemented a connections panel showing cluster contents and backlinks.
  - **Permanent Notes:** Added a dedicated backlinks panel for synthesis.
  - **Fleeting Notes:** Added quick conversion actions to transform into Literature or Permanent types.
  - **Collapsible UI:** Optimized screen space with toggleable panels for all specialized metadata.
  - **Mobile Friendly:** Improved touch targets and responsive layout for all new editor components.

- **Onboarding Stability & Tour Revamp:**
  - **Crash Fix:** Fixed "Rendered more hooks" crash loop for new users.
  - **Data Resilience:** Fixed race condition causing onboarding data to disappear after refresh. Added `isDataLoaded` flag and improved seed timestamps.
  - **Simplified Tour:** Removed complex Phase 2 steps for a streamlined "UI Tour -> Explore" flow.
  - **Auto-Start:** Onboarding tour now automatically launches for all new users.
  - **Power Moves:** Added explicit guidance for double-tap and hold interactions.
  - **DB Robustness:** Switched to safer seeding methods (`bulkPut`) to prevent database consistency errors.

### Fixed
- **Startup Crash:** Fixed critical "Rendered more hooks" error causing blank page after login by ensuring unconditional hook execution.
- **Theme Initialization:** Fixed white-on-white Login page issue by hoisting theme initialization logic to run before authentication checks.
- **Link Rendering:** Fixed "janky" arrow alignment and double-rendering artifacts.
- **Mobile Link Interaction:** Enabled long-press context menu for links on touch devices.
- **PWA Installation:**
  - **Fixed:** Resolved issue where "Install App" button disappeared in Chrome.
  - **Enhanced:** Improved fallback guidance for manual installation (iOS/Desktop).
  - **Reliability:** Hardened Service Worker registration to ensure consistent installability.

## [0.6.0] - 2025-11-29

### Added
- **Mobile Refinements:**
  - **Batch Dragging:** Select multiple notes and move them together.
  - **Batch Actions:** Delete multiple notes or create a cluster from selection.
  - **Context Menu:** Long-press support for Notes and Clusters on touch devices.
  - **Hardware Back Button:** Android back button now clears selection or closes modals.
  - **Touch Events:** Full support for `touchstart`, `touchmove`, `touchend` for smooth interaction.
  - **Floating Action Buttons (FAB):** Optimized mobile UI layout.
