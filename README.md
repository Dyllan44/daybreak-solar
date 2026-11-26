# 057 — Daybreak Solar website

Phase 1 implements Home and the shared visual foundation for the fictional Daybreak Solar concept. The page follows the approved v2 showcase design, which is kept in the Quick Sites workspace.

## Preview and build

Open [index.html](index.html) in a local browser. HTML, CSS, classic scripts, images and icons load from this folder, and there are no dependencies or build steps. To serve the same files over a local HTTP connection, run from this folder:

```powershell
python -m http.server 8357 --bind 127.0.0.1
```

Open http://127.0.0.1:8357/.

## Deploy on Vercel

Import `Dyllan44/daybreak-solar` and use the repository root. Choose the **Other** framework preset and leave the build command blank. The output is the repository root, which contains `index.html`. The site requires no environment variables.

## Source and images

- [index.html](index.html) contains the home sections, shared header and footer, copy and inline icons.
- `styles/base.css` holds design tokens, typography, reusable components and navigation styles. `styles/home.css` and `styles/motion.css` hold page layout and motion.
- `scripts/navigation.js` handles the mobile menu. `scripts/home.js` handles the system filters, backup essentials and assessment preview. `scripts/motion.js` powers the scroll reveals, reading-line sun, energy route and badges, process lighting, parallax, card tilt, pausing of offscreen loops and the floating assessment button.
- `images/` contains responsive JPEG variants and the brand mark. In the Quick Sites workspace, the concept folder's `assets/` directory holds the eleven PNG originals and their generation prompts. Regenerate the JPEGs on Windows with `pwsh -File .\tools\prepare-images.ps1` from this directory.

## Motion upgrade (2026-11-26)

The motion pass replaces the original subtle entrances with a daybreak and energy-line system modelled on Copperline (031) and Chair & Line (062).

- **Sunrise hero:** the photo brightens from dawn blue, a soft glow rises behind the headline, the lines rise and "work." flashes once. The lime trace draws in, then a light pulse runs along it.
- **Sun on the reading line:** a glowing sun rides the header progress line as you read.
- **Energy cutaway:** the route fills as you scroll, and the Sun, Home and Battery badges switch on as the current reaches them. Once the route is full, a pulse keeps running through it.
- **Backup essentials meter:** a battery-style meter charges one cell per selected essential. It is decorative, and the existing status text still announces the selection.
- **Installation steps:** the line fills with a bright head and each step icon powers on.
- **Photos and cards:** photos open like blinds and brighten from dawn tones. Setup tiles and system cards tilt toward the pointer with a lime spotlight. Filter results animate in.
- **Assessment:** a slow sunburst turns behind the lime band. Choosing a property or goal elsewhere on the page flashes the matching form field.
- **Floating assessment button:** on phones it appears after the hero and hides before the assessment section.

Looping light (pulses and the sunburst) pauses offscreen. Reveals use the `.motion` head-script opt-in with a 3-second failsafe, show focused content immediately and reveal anything skipped by a fast scroll. With reduced motion, everything is static.

Verified on 2026-11-26 in the in-app browser at about 800 px and 375 px. Checks covered the hero choreography, reveals in every section, energy-route progress and badge lighting, the essentials meter and status text, process step lighting, property filters, card pre-selection with the field flash, the assessment preview with essentials, floating-button visibility, no horizontal overflow, a static no-`.motion` fallback with nothing left hidden, and no console errors. The browser pane was hidden during the check, which throttles animation timing, so check pacing on a real device.

## Assessment and verification

The assessment preview runs entirely in the page. It accepts a property type and a priority, carries selected essentials into the summary and collects no contact details. Live enquiries would require a verified business destination, validation and delivery.

On 2026-11-20, static checks covered the page's local links, icon references, eleven image sources, 23 responsive JPEGs and JavaScript syntax. Script simulations covered menu and keyboard focus behaviour, property filters, assessment preselection, preview and edit, energy trace and reduced-motion state. The local server started, but the automated browser could not reach it. The browser tool also blocked workspace-file URLs. Visual desktop and mobile verification remains pending.
