/** Sponsorship tiers for the ROI capability scaler. Amounts in INR. */
export const FUND_MIN = 25000;
export const FUND_MAX = 500000;
export const FUND_STEP = 5000;
export const FUND_MARKS = [25000, 50000, 100000, 250000, 500000];

export const TIERS = [
  {
    id: 1,
    range: 'Below ₹1L',
    title: 'Baseline UAS',
    items: ['Raspberry Pi 5', '4-Point ToF', '2D DFS/BFS', 'Baseline UAS'],
    unlocks: 'A complete autonomous search drone: full-area coverage on a 2D grid, on-board survivor detection and reactive obstacle safety.',
  },
  {
    id: 2,
    range: '₹1L – ₹2.5L',
    title: 'Spatial AI Upgrade',
    items: ['Jetson Orin Nano', 'OAK-D', '3D LiDAR', 'SLAM'],
    unlocks: 'GPU inference and LiDAR move the drone from a flat grid to a live 3D map — faster detection, better obstacle reasoning and higher-fidelity maps for responders.',
  },
  {
    id: 3,
    range: 'Above ₹2.5L',
    title: 'Swarm & Thermal',
    items: ['Multi-Drone Swarm', 'Dual Jetson Payload', 'Thermal Infrared', 'Victim Search'],
    unlocks: 'Several drones split the search area in parallel, and thermal imaging finds people under smoke, debris or darkness where a normal camera cannot.',
  },
];

export const tierFor = (amount) => (amount < 100000 ? 1 : amount <= 250000 ? 2 : 3);

export const formatINR = (v) => '₹' + Number(v).toLocaleString('en-IN');

export const SPONSOR_INTERESTS = [
  'Funding sponsorship',
  'Hardware sponsorship',
  'CSR partnership',
  'Mentorship / technical partnership',
  'Media / outreach',
];
