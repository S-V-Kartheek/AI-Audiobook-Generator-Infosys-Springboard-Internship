# Design Guidelines: Document-to-Podcast Converter

## Design Approach

**Selected Approach:** Design System - Utility-Focused  
**System Foundation:** Material Design principles adapted for minimal execution  
**Rationale:** This is a productivity tool where functionality and clarity take priority over visual flourish. The user explicitly requested a "basic" frontend, so we focus on clean layouts, clear information hierarchy, and intuitive interactions.

## Core Design Principles

1. **Function Over Form** - Every element serves a clear purpose
2. **Progressive Disclosure** - Show complexity only when needed
3. **Instant Feedback** - Clear states for uploads, processing, and completion
4. **Scannable Content** - Easy navigation through chapters and controls

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - clean, readable, modern
- Headings: 600 weight
- Body: 400 weight
- Code/Technical: 500 weight (for markdown display)

**Hierarchy:**
- Page Title: text-2xl (24px)
- Section Headers: text-lg (18px) 
- Chapter Headings: text-base font-semibold (16px)
- Body Text: text-sm (14px)
- Labels/Meta: text-xs (12px)

## Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8
- Element gaps: gap-4, gap-6
- Container max-width: max-w-5xl centered

**Grid Structure:**
- Single column on mobile (always)
- Two-column split on desktop for text + audio player (60/40 ratio)
- File upload area: Full width, centered

## Component Library

### A. File Upload Zone
- Dashed border container (border-2 border-dashed)
- Generous padding (p-8)
- Upload icon at top
- Clear "Drop files here or click to browse" messaging
- Supported formats displayed: "PDF, DOCX, TXT, Images"
- Disabled state when processing

### B. Processing States
- Linear progress bar for extraction phase
- Spinner + status text for AI rewriting phase
- Spinner for TTS generation
- Clear labels: "Extracting text...", "Rewriting with AI...", "Generating audio..."

### C. Content Display Area
**Chapter Navigation Sidebar (left on desktop, top on mobile):**
- Compact list of chapter headings
- Active chapter highlighted with subtle background
- Click to jump to chapter + seek audio
- Scrollable if many chapters
- Fixed position on desktop

**Main Text Panel:**
- Clean white/neutral background
- Markdown rendering with proper spacing
- Chapter headers clearly differentiated (border-b)
- Comfortable reading width (max-w-3xl)
- Download button at top-right (ghost button style)

### D. Audio Player
**Sticky Bottom Player:**
- Fixed to bottom on mobile
- Sidebar panel on desktop (40% width)
- Standard controls: play/pause, seek bar, time display
- Current chapter indicator
- Volume control
- Download audio button
- Clean, minimal player design (browser-native enhanced)

### E. Action Buttons
- Primary: Solid background for main actions (Upload, Download)
- Secondary: Outlined for less critical actions
- Icon + text labels for clarity
- Adequate touch targets (min h-10)

## Information Architecture

**Three-State Flow:**

1. **Upload State** (Initial)
   - Centered upload zone
   - Brief instruction text
   - Supported formats

2. **Processing State**
   - Upload zone replaced with progress indicators
   - Status messages
   - Non-interactive during processing

3. **Result State**
   - Chapter navigation visible
   - Text content displayed
   - Audio player active
   - Download options available

## Interaction Patterns

- **Chapter Selection:** Click chapter title → scroll to text + seek audio to timestamp
- **Audio Playback:** Sync chapter highlighting as audio plays
- **Download Actions:** Single click downloads, brief confirmation toast
- **Mobile:** Collapsible chapter list, full-width text, bottom-fixed player

## Visual Hierarchy

**Contrast Levels:**
- High: Active chapter, playing indicator, primary buttons
- Medium: Body text, inactive chapters
- Low: Borders, dividers, metadata

**Visual Weight Distribution:**
- Upload zone: Most prominent when empty
- Text content: Primary focus when populated
- Audio player: Persistent but non-intrusive
- Chapter nav: Supportive, easy to scan

## Accessibility

- Semantic HTML for all controls
- ARIA labels for player controls
- Keyboard navigation for chapter list
- Focus indicators on all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)
- Screen reader announcements for processing states

## Mobile Considerations

- Stack all elements vertically
- Full-width upload zone
- Expandable chapter drawer (tap to show/hide)
- Bottom-fixed player (always visible)
- Adequate spacing for touch targets (min 44px)

## Images

**No hero image needed** - this is a utility application. Focus on functional clarity.

**Icons Only:**
- Upload cloud icon in upload zone
- Play/pause icons in player
- Download icons for download buttons
- Checkmark for completed processing
- Use Heroicons (outline style) for consistency