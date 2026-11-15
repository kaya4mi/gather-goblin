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
- Save names, pixel avatars, food and activity choices, custom activities, budgets and notes.
- Plan for groups of around ten, without a product-level member cap. Expected size is only an estimate. Show five avatars plus a count and expand the full member list.
- Use the independent lunch finder, or create custom shared polls from the homepage. Each device has one changeable vote per poll.
- Save exact meeting points and up to four destinations, then open the ordered route in Google Maps. Transit supports one destination at a time.
- Switch English, Chinese and Japanese, remembering the choice on the device.
- Summarize saved preferences in a food / activities / extras timeline with counts and member names. Leading preferences are not treated as unanimous decisions.
- Confirm one food choice and multiple activities separately. Confirmations show who made them and need review after relevant preferences or votes change.
- Start a prefilled vote for a timeline step, confirm a unique current result explicitly, then search actual venues in Google Maps and save an ordered route.
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
| `web/planner.mjs` | Preference categories, counts, decision freshness and Maps links |
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

The development process was to define the gathering workflow, sketch the visual direction, implement room persistence, add preference rules, test concurrent changes, and then add localization and conditional attendance. AI coding assistance helped implement and refine the source. The runtime summarizes saved preferences and supports explicit shared decisions. It does not generate itineraries or call a live AI model.

Saved budgets are discussion context, not verified venue prices. Opening hours, dietary requirements and accessibility need human confirmation. There is no automatic booking. Public event discovery and public profiles are planned for the second presentation.

## Real venue and route integration

The lunch finder accepts a location, available break time, meal duration, maximum one-way walk, budget, cuisine and preferences. Its server adapter calls Google Places (New) and Routes, compares real walking durations against the break, and distinguishes confirmed price ranges from unknown menu prices. Queues, table capacity and dietary needs still require venue confirmation. No live model is connected.

Google Maps URLs work without a key. In-app restaurant results require enabling Places API (New) and Routes API, billing, and a server-side `GOOGLE_MAPS_API_KEY`. Set a Google Cloud API quota. The app also defaults to 30 searches per UTC day through `GOOGLE_MAPS_DAILY_SEARCH_LIMIT`, counted atomically in D1. Each search may make one origin lookup, one restaurant lookup, and up to five route calls. The product’s daily search count is separate from Google billing quotas.

For local testing, copy `.env.example` to `.env.local` and set the key there. Hosted deployment requires setting the same key as a secret in Sites and redeploying. Without a key, the interface clearly offers a Google Maps search link instead of invented restaurant results. Google-provided venue details are not persisted in room records.

The database migration `0001_service_usage.sql` stores aggregate daily usage counts. The local server applies schema migrations on startup. The hosted publisher applies them during deployment.

Meeting locations include Kyoto University, Hyakumanben, Demachiyanagi and Shugakuin International House, plus custom locations. Lunch search currently supports Kyoto.

There is no product-level member limit. Storage, Worker memory and database quotas remain finite. Collaboration tests cover 60 independent member identities, joining and voting in concurrent groups of ten. Identity is device-based: tabs in one browser share a member token; separate devices/profiles are distinct members.
