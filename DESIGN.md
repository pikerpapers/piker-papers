# Design System Documentation: The Unredacted Dossier

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Archive**
This design system rejects the "softness" of modern SaaS. It is an intentional move toward **Structural Honesty** and **Raw Information Architecture**. By combining the utilitarian grit of a classified intelligence briefing with high-end editorial precision, we create an experience that feels authoritative, urgent, and unredacted.

The system breaks the "template" look through **Extreme Asymmetry**. Layouts should feel like a "data dump" that has been perfectly curated. We utilize heavy structural framing contrasted with vast "Surface" voids to create a sense of high-stakes importance. There is no decoration here—only information and the architecture required to hold it.

---

## 2. Colors
The palette is a high-contrast study in monochrome, punctuated by a singular "Action" frequency: Safety Orange.

*   **Primary (#000000):** Used for structural framing, heavy headers, and total-impact text.
*   **Surface (#f9f9f9) & Surface Containers:** Our "paper" stock.
*   **Tertiary/Safety Orange (#771300 - #FF5733):** Reserved exclusively for "Top Secret" stamps, critical alerts, and high-priority data points.

### The "No-Line" Rule
To maintain a premium editorial feel, designers are **prohibited from using 1px solid borders for internal sectioning.** Internal boundaries must be defined solely through background color shifts. Use `surface-container-low` sections sitting on a `surface` background to denote change in context. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Base:** `surface` (#f9f9f9)
*   **Nested Context:** Use `surface-container-low` for large content blocks.
*   **High-Priority Data:** Use `surface-container-highest` (#e2e2e2) for inset data modules.
Instead of a flat grid, stack these tiers to create a sense of "nested" dossiers.

### The "Glass & Gradient" Rule
While the system is brutalist, we avoid "flatness" by using Glassmorphism for floating "Intelligence Overlays." Use semi-transparent `surface` colors with a heavy backdrop-blur (20px+) to suggest a digital lens over raw data. For primary CTAs, a subtle gradient from `primary` (#000000) to `primary-container` (#3b3b3b) adds a "carbon-fiber" depth that feels high-end and engineered.

---

## 3. Typography
The typography is a dialogue between "The Record" and "The Report."

*   **Display & Headline (Epilogue):** This is our "Impact" face. It should be used for massive, bold headers that feel like headlines on a classified document. Epilogue’s geometric weight provides the "High-End" anchor to the brutalist layout.
*   **Title, Body, & Label (Space Grotesk):** This is our "Data" face. While not a true monospace, its idiosyncratic, technical curves provide a "classified" and "utilitarian" feel while remaining highly legible for long-form dossiers.

**Hierarchy Strategy:**
Use extreme scale contrast. A `display-lg` header may sit directly next to a `label-sm` metadata timestamp to emphasize the raw, unedited nature of the intelligence.

---

## 4. Elevation & Depth
In this system, shadows are a weakness. We convey hierarchy through **Tonal Layering** and physical stacking.

*   **The Layering Principle:** Depth is achieved by "stacking" the `surface-container` tiers. A `surface-container-lowest` card placed on a `surface-container-low` section creates a sharp, architectural lift without the need for artificial shadows.
*   **Ambient Shadows (The Exception):** If a floating element (like a modal dossier) requires separation, use an "Extra-Diffused" shadow: 60px blur, 4% opacity, using a tinted `on-surface` color. It should feel like a physical sheet of paper casting a faint light-bleed, not a digital effect.
*   **The "Ghost Border" Fallback:** For input fields or essential containment, use the **Ghost Border**: the `outline-variant` token at 15% opacity. Never use 100% opaque lines for internal elements.

---

## 5. Components

### Buttons: The "Command" Units
*   **Primary:** Solid `primary` (#000000) with `on-primary` text. Square corners (`0px`).
*   **Tertiary (Alert):** Solid `tertiary` (#771300). Used only for destructive or "Top Secret" actions.
*   **Padding:** Use the Spacing Scale (e.g., `spacing-4` horizontal, `spacing-2.5` vertical) to ensure a "chunky," utilitarian feel.

### Chips: Data Tags
*   Use `surface-container-highest` with `label-md` text. Chips should look like "punched" labels from a physical filing system. No rounded corners.

### Lists: The Data Stream
*   **Forbid dividers.** Use `spacing-5` vertical margins to separate items. Leading elements (like status icons in Safety Orange) should be used to create a vertical rhythm that guides the eye.

### Input Fields: Metadata Entry
*   Background: `surface-container-low`.
*   Border: Bottom-only "Ghost Border" (2px `outline-variant` at 20% opacity).
*   Label: `label-sm` in all caps to mimic form-entry metadata.

### Dossier Cards
*   Never use a border. Use a background shift to `surface-container-lowest` (#ffffff). If multiple cards are present, use asymmetrical widths (e.g., one card at 60% width, the next at 40%) to break the "standard grid" feel.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align text to the far left and metadata to the far right with massive white space between.
*   **Use Heavy Framing:** Use 4px to 8px `primary` (#000000) blocks at the very top or bottom of a page to "anchor" the data.
*   **Monochrome with Intent:** Use the Safety Orange (#FF5733) only for things that require immediate human intervention.

### Don't:
*   **No Rounded Corners:** `0px` is the absolute rule. Any radius is a violation of the system’s utilitarian integrity.
*   **No Dividers:** If you feel the need for a line, use white space or a subtle background color shift instead.
*   **No Centered Layouts:** Information is rarely "centered" in a raw archive. Keep elements anchored to the grid edges to maintain the "dossier" aesthetic.
*   **No Soft Grays:** Avoid mid-tones. Stick to the high-contrast relationship between deep blacks, crisp whites, and the "punched" Safety Orange.