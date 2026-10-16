# Gather Goblin

A playful React + Vite homepage for indecisive friends. Cream paper, pastel cards, hand-drawn SVG goblin, and a little less chaos.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Node 24 supported).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, usually http://127.0.0.1:5173.

```sh
npm test
npm run lint
npm run build
npm run preview
```

## Homepage 2.0

- Original inline SVG mascot: floating, blinking, hover wiggle, and click bounce.
- Random speech on click, with no immediately repeated line; accessible with keyboard and announced through a polite live region.
- Pink gathering, yellow food, and green profile cards with hover and press feedback.
- Native accessible dialogs explain the upcoming food/profile features, support Escape, and restore focus.
- The primary hero link and gathering card open the planner at `#plan`.
- Desktop two-column hero and three-card row; mobile stacked layout at 700px.
- Reduced-motion preferences disable animation and smooth scrolling.
- All assets are local. No database, authentication, external fonts, or backend services.

## Gathering planner

1. Open **Plan a Gathering** or **Let’s make a little plan**.
2. Enter a name, meeting area, date/start time, people (2–30), duration (2/3/4/6 hours), and per-person spending limit (whole amounts, including zero). Choose JPY, USD, CNY, or EUR, at least one vibe, and indoor/outdoor. Group notes are optional.
3. Generate a three-stop itinerary. Time allocations add up to the selected duration; per-stop spending caps add up to the per-person limit. Overnight times show `(+1 day)`.
4. Edit each activity’s title, meeting place, and notes, then apply the edits. **Try another idea** cycles through the selected vibes and alternate activity templates.
5. **Save this plan** stores it in this browser’s plan jar. Reopen a saved plan to edit it. **Copy plan** copies a plain-text version suitable for pasting into a group chat; if clipboard access fails, a selectable text field appears.

Plans are stored under `gather-goblin:plans:v1` in localStorage, up to 20 plans. No account or device sync is provided. The UI reports read/write failures and does not overwrite malformed storage. Saving reads the latest storage first so plans saved in another tab are retained. Unsaved generated plans and activity edits trigger a browser unload warning. Returning home keeps the current form and plan in memory; replacing a changed plan or form asks for confirmation. Clearing browser data removes saved plans, so copy important plans elsewhere.

Activity suggestions come from bundled rules. There is no AI API, maps, venue lookup, live pricing, weather lookup, or booking. Spending caps are allocations of the user’s own budget, not estimates of real prices. Group notes are displayed verbatim for the group to review; they do not automatically filter venues or guarantee suitability.

## Checks

`npm test` runs Node’s built-in test runner without additional dependencies. It checks input validation, date handling, all supported durations/vibes/settings, exact budget/time totals, rerolls, midnight rollover, persistence and edits, malformed/blocked storage, and capacity limits.

## Source

- `src/App.jsx`: hash navigation, page composition, and feature information dialogs.
- `src/components/GatheringPlanner.jsx` and `.css`: planning form, editable timeline, confirmation flow, and saved plan jar.
- `src/lib/planner.js`: validation, itinerary rules, formatting, and storage helpers.
- `tests/planner.test.mjs`: planner and persistence regression tests.
- `src/components/Navbar.jsx`: navigation.
- `src/components/GoblinHero.jsx`: hero and randomized mascot interaction.
- `src/components/Goblin.jsx`: original layered vector mascot.
- `src/components/FeatureCards.jsx`: three feature cards.
- `src/App.css`: layout, colors, responsive styles, and animations.
- `src/index.css`: global styles, focus states, and reduced-motion support.
- `src/main.jsx`: React entry point.
- `public/goblin.svg`: local mascot favicon and small logo.

The repository initially contained only this README, so the React/Vite entry points and project configuration were added alongside the homepage. The browser-local gathering planner is implemented. Shared planning, real venue recommendations, and profiles are reserved for later work.
