# Gathering Gambling

A shared hangout planner for friends around Kyoto University’s Yoshida Campus. The interface starts in English and supports Chinese and Japanese. Pixel illustrations, a purple devil mascot and saturated pink/yellow/blue/purple sit on a white background. Text uses readable system fonts.

## Run it

Install Node.js 24, then run:

```sh
npm run dev
```

Open `http://127.0.0.1:3000`. No dependency installation or AI key is required. The local SQLite database is stored in `work/rooms.sqlite`.

## What works

- Create a room and share its invite link or eight-character code.
- Save names, pixel avatars, activity preferences, budgets and notes.
- Switch English, Chinese and Japanese, remembering the choice on the device.
- Rank plans within the lowest saved budget, or pick one at random.
- Confirm a shared plan and open neighborhood searches in Google Maps.
- Choose “I’m in”, “Maybe”, or “If you go, I’ll go”. The selected person stays private.
- When that person confirms, explicitly confirm your own attendance. Mutual waiting is explained. If a confirmed person changes their mind, confirmed followers return to conditional status and can reconsider.
- Room changes refresh every four seconds. Concurrent changes use compare-and-swap writes to prevent lost updates.

Names and notes are visible to people with the room link. Device-held edit tokens and conditional-attendance relationships are omitted from other visitors’ responses. This prototype uses device-based membership, so another browser or device is a new member.

## Project structure

| File | Purpose |
| --- | --- |
| `web/app.js` | UI, forms, language switching, room navigation |
| `web/i18n.mjs` | English, Chinese and Japanese text |
| `web/style.css` | Responsive layouts and typography |
| `web/art.mjs` | Original SVG pixel characters and scenes |
| `web/planner.mjs` | Budget filtering and preference ranking |
| `worker/api.mjs` | Validation, room persistence and attendance transitions |
| `scripts/local-server.mjs` | Local HTTP server and SQLite adapter |
| `scripts/native-build.mjs` | Packages the UI and API into a Cloudflare Worker |
| `drizzle/0000_rooms.sql` | Hosted D1 database schema |

## Check and build

```sh
npm test
npm run build
node scripts/make-preview.mjs
```

The build produces `dist/server/index.js`. It exports a Cloudflare Worker `fetch` handler. The Worker requires a D1 database binding named `DB` and the schema in `drizzle/0000_rooms.sql`.

The preview command produces `outputs/gathering-gambling-preview.html`, a standalone offline version. Its rooms are stored on one device. Use the hosted website for sharing between devices.

## Publishing and updates

1. Commit the source to this GitHub repository. The old `feat/gather-goblin-home` pull request represents an earlier design. The current source replaces that implementation.
2. Run the tests and build commands above.
3. Publish the Worker and apply the D1 schema using the selected hosting service. This project’s Sites identity is recorded in `.openai/hosting.json`.
4. Set the website’s visitor audience to public when it should be shared with classmates.
5. Test from two separate devices or browser profiles. Create a room on one, join on the other, save both preferences and check attendance changes.
6. For later updates, commit the changes, run tests/build, and publish a new version. Keep the same database binding so existing rooms survive.

GitHub stores the source and its history. The hosting service runs the website and its shared database. GitHub Pages alone does not run this application’s API.

## Classroom explanation

The development process was to define the gathering workflow, sketch the visual direction, implement room persistence, add preference rules, test concurrent changes, and then add localization and conditional attendance. AI coding assistance helped implement and refine the source. The runtime recommendation system currently uses budget and preference rules. A future AI integration will call a model from the server with verified place candidates.

Current neighborhood prices are illustrative estimates. Opening hours, dietary requirements and accessibility need human confirmation. There is no automatic booking. Public event discovery and public profiles are planned for the second presentation.
