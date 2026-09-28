# Team Udan-Tashtari — Team Udan-Tashtari

**Edge-AI Autonomous UAS & Cyber-Physical Intelligence Platform**
Team Udan-Tashtari · civic initiative Team Udan-Tashtari · KIET Group of Institutions

---

## Project overview

Team Udan-Tashtari is the website for Team Udan-Tashtari's autonomous-drone work in disaster search and rescue.
It works as a portfolio, a technical showcase and a sponsorship pitch. Visitors can fly a pathfinding
simulator, compare the two hardware paths, use a MAVLink console and see what their funding would unlock.

## Features

| Area | What it does |
|---|---|
| **Status bar** | Persistent simulated telemetry: UTC, MAVLink latency, battery, GPS, flight mode, arm state |
| **Hero + AHRS** | Canvas artificial horizon with AUTO / MANUAL / RESET. In manual mode you fly it with sliders, by dragging, or with the arrow keys |
| **Impact metrics** | Animated counters and the competition record |
| **Civic spotlight** | The India Innovates 2026 presentation at the Delhi Secretariat |
| **Mission Control** | Dual-engine simulator. **Engine 1:** a 2D occupancy grid with animated BFS/DFS search, start, destination and click-to-place obstacles. **Engine 2:** a pseudo-3D LiDAR SLAM point cloud at 480 pts/sec with map confidence. Controls: START, PAUSE, RESET, CLEAR OBSTACLES, RESET HOME and a 0.5×–3.0× speed slider |
| **Telemetry analytics** | Chart.js line (battery vs compute load, streaming), bar (latency) and radar (team competency) charts |
| **MAVLink CLI** | `help status telemetry heartbeat arm disarm mode mission version clear`. Includes history (↑/↓), timestamps, blinking cursor and auto-scroll. `arm` and `mode` update the status bar |
| **Architecture** | Baseline ↔ Upgraded switcher. Specs, performance, telemetry profile and the diagram all update together. Every block in the diagram opens an explanation |
| **Team** | Filterable engineers matrix with deep-dive profile modals |
| **Research** | Dossiers covering CCPM (IRJET), PyQubit and WSN clustering |
| **Sponsor ROI** | A ₹25k–₹5L+ slider unlocks three capability tiers, plus an inquiry form with a simulated submission |

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Chart.js 4 (react-chartjs-2) · HTML5 Canvas · Lucide icons

## Project structure

```text
udan-tashtari/
├── index.html                 # HTML shell with SEO + Open Graph meta
├── public/                    # favicon.svg, logo.svg, _redirects (Netlify)
├── vercel.json                # SPA rewrite for Vercel
└── src/
    ├── main.jsx               # entry: router + providers
    ├── App.jsx                # layout, lazy routes, error boundary
    ├── pages/                 # Home, MissionControlPage, ArchitecturePage, ResearchPage, TeamPage, SponsorPage, NotFound
    ├── components/            # UI sections (Hero, MissionControl, Terminal, Telemetry, …)
    │   ├── modals/            # Modal shell + Team / Dossier / Sponsor / Architecture modals
    │   └── ui/                # SectionHeader, SimBadge, Reveal, Logo, Avatar
    ├── context/               # TelemetryContext (shared sim state), ModalContext
    ├── hooks/                 # useTelemetry, useMissionSimulator, useTerminal, useReveal, useCountUp, …
    ├── utils/                 # pathfinding.js, simulation.js, telemetry.js, ahrs.js, terminalCommands.js
    ├── data/                  # team, achievements, architecture, research, sponsor — edit content here
    └── styles/                # globals.css, animations.css, simulator.css
```

The simulation logic in `utils/` is plain JavaScript with no React. The hooks connect it to the UI with a single
`requestAnimationFrame` loop per canvas, and React state updates are throttled.

## Installation

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Development

- **Content:** edit the files in `src/data/`. You don't need to touch components to change team bios, achievements, specs, tiers or dossiers.
- **Colours and fonts:** `tailwind.config.js` and the `:root` tokens in `src/styles/globals.css`.
- **Terminal commands:** `src/utils/terminalCommands.js`.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

## Deployment

`dist/` is a static site. It uses client-side routing, so the host must serve `index.html` for every path:

- **Netlify:** `public/_redirects` is already included.
- **Vercel:** `vercel.json` is already included.
- **GitHub Pages / other hosts:** add an equivalent SPA fallback, or switch `BrowserRouter` to `HashRouter` in `src/main.jsx`.

To make the sponsor form actually send inquiries, replace `submitInquiry()` in
`src/components/modals/SponsorModal.jsx` with a call to a form backend such as Formspree, Web3Forms or your own API.

## Simulation disclaimer

This is a **demonstration / portfolio platform**. Every piece of telemetry, flight data, SLAM, LiDAR, ToF, MAVLink
and sensor output on the site is **simulated in the browser**. None of it comes from a real vehicle. Data displays
carry a **SIMULATED** badge. The latency, performance and competency figures are illustrative and should be replaced
with logged bench and flight data. The sponsor form doesn't send or store anything until a backend is connected.

## Before publishing — checklist for the team

- [ ] Each team member reviews and approves their own bio in `src/data/team.js`
- [ ] Confirm the civic application areas in `src/data/achievements.js` (`CIVIC.applications`)
- [ ] Confirm the Drone-O-War 1.0 result wording ("National Runner-Up")
- [ ] Replace illustrative chart and performance numbers with measured data
- [ ] Connect the sponsor form to a real backend
