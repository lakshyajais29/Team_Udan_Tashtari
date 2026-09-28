/** Headline metrics (animated counters) and the full competition record. */
export const METRICS = [
  { value: 1.14, decimals: 2, suffix: ' Cr+', label: 'Registrations outperformed', detail: 'Top 4 nationwide at India Innovates 2026, presented at the Delhi Secretariat.', tone: 'cyan' },
  { prefix: 'AIR ', value: 10, label: 'e-Yantra Robotics Competition', detail: 'National finals, IIT Bombay.', tone: 'cyan' },
  { text: 'AIR 3 & 13', label: 'ABU Robocon India', detail: 'National Championship.', tone: 'cyan' },
  { text: 'National Runner-Up', label: 'SIH & JIIT Drone-O-War 1.0', detail: 'Smart India Hackathon and JIIT aerial robotics.', tone: 'amber' },
  { text: 'Silver · Gold', label: 'AKTU Robotics Competition', detail: 'State-level Silver, Zonal Gold.', tone: 'amber' },
  { value: 100, suffix: '%', label: 'Deliverable reliability', detail: 'Decoupled RTOS architecture — core deliverables preserved on both hardware paths.', tone: 'green' },
];

export const COMPETITIONS = [
  { event: 'India Innovates 2026', result: 'Top 4 nationwide', focus: 'Civic innovation · Team Udan-Tashtari' },
  { event: 'Smart India Hackathon', result: 'National Runner-Up', focus: 'Edge-AI drone with real-time perception' },
  { event: 'e-Yantra Robotics Competition', result: 'AIR 10', focus: 'Embedded systems · ROS · autonomous tasks' },
  { event: 'ABU Robocon India', result: 'AIR 3 & AIR 13', focus: 'Dynamic control systems' },
  { event: 'JIIT Drone-O-War 1.0', result: 'National Runner-Up', focus: 'Aerial robotics · manoeuvrability' },
  { event: 'AKTU Robotics (State / Zonal)', result: 'Silver / Gold', focus: 'Institutional robotics' },
  { event: 'DSE Business Plan', result: 'Runner-Up', focus: 'Product viability & market analysis' },
];

/**
 * Civic spotlight — facts as supplied by the team.
 * The application areas below should be confirmed by the team before publishing.
 */
export const CIVIC = {
  team: 'Team Udan-Tashtari',
  members: ['Kaustuv', 'Aviral Srivastava', 'Ayush Gupta', 'Lakshya Jaiswal'],
  venue: 'Delhi Secretariat',
  audience: "Smt. Rekha Gupta Ji, Hon'ble Chief Minister of Delhi, and Cabinet Ministers",
  programme: 'India Innovates 2026',
  funnel: [
    { value: '1.14 Cr+', label: 'Registrations' },
    { value: 'Top 60', label: 'Shortlist' },
    { value: 'Top 4', label: 'Invited to present' },
  ],
  applications: [
    { title: 'Disaster response', text: 'Autonomous search over collapsed or flooded zones, with survivor locations mapped on a local ground station.' },
    { title: 'Civic monitoring', text: 'Aerial sensing for city-scale environmental issues such as pollution hot-spots.' },
    { title: 'Resilient operation', text: 'All perception and planning run on board, so the system works when networks are down.' },
  ],
};
