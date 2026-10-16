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
npm run lint
npm run build
npm run preview
```

## Homepage 2.0

- Original inline SVG mascot: floating, blinking, hover wiggle, and click bounce.
- Random speech on click, with no immediately repeated line; accessible with keyboard and announced through a polite live region.
- Pink gathering, yellow food, and green profile cards with hover and press feedback.
- Native accessible dialogs explain upcoming features, support Escape, and restore focus.
- Desktop two-column hero and three-card row; mobile stacked layout at 700px.
- Reduced-motion preferences disable animation and smooth scrolling.
- All assets are local. No database, authentication, external fonts, or backend services.

## Source

- `src/App.jsx`: page composition and feature information dialogs.
- `src/components/Navbar.jsx`: navigation.
- `src/components/GoblinHero.jsx`: hero and randomized mascot interaction.
- `src/components/Goblin.jsx`: original layered vector mascot.
- `src/components/FeatureCards.jsx`: three feature cards.
- `src/App.css`: layout, colors, responsive styles, and animations.
- `src/index.css`: global styles, focus states, and reduced-motion support.
- `src/main.jsx`: React entry point.
- `public/goblin.svg`: local mascot favicon and small logo.

The repository initially contained only this README, so the React/Vite entry points and project configuration were added alongside the homepage. Full gathering planning, food recommendations, and profile functionality are intentionally reserved for later work.
