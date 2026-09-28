/** Dual-path contingency architecture and decoupled flight-control components. */
export const ARCHITECTURES = {
  baseline: {
    id: 'baseline',
    label: 'Baseline',
    subtitle: 'Fallback · Unfunded',
    specs: [
      ['Compute', 'Raspberry Pi 5'],
      ['Perception', 'Pi Camera + Quantized YOLO'],
      ['Proximity', '4-Point ToF Array'],
      ['Pathfinding', '2D Occupancy Grid DFS/BFS'],
      ['Frame', 'F450 Multirotor'],
      ['Flight Control', 'Pixhawk · NuttX RTOS'],
      ['Link', 'MAVLink over serial (TELEM2)'],
    ],
    node: 'Raspberry Pi 5',
    nodeSub: 'Pi Camera · quantized YOLO · 2D DFS/BFS',
    note: 'The fallback path. A lightweight 2D occupancy grid keeps full-area search within the Raspberry Pi 5 compute budget, while the ToF array provides reactive proximity safety.',
    // Illustrative performance figures for the demo — replace with bench data.
    perf: [
      { label: 'Inference latency', value: 110, unit: 'ms', max: 150 },
      { label: 'Map fidelity', value: 45, unit: '%', max: 100 },
      { label: 'Compute power draw', value: 8, unit: 'W', max: 25 },
      { label: 'Planner update rate', value: 5, unit: 'Hz', max: 20 },
    ],
    telemetry: { mode: '2D GRID', rate: 'ToF 4 × 50 Hz', compute: 'RPi 5 · 62% load' },
  },
  upgraded: {
    id: 'upgraded',
    label: 'Upgraded',
    subtitle: 'Optimal · Funded',
    specs: [
      ['Compute', 'NVIDIA Jetson Orin Nano'],
      ['Perception', 'OAK-D Spatial AI'],
      ['Spatial Mapping', '3D LiDAR'],
      ['Pathfinding', 'Real-Time 3D LiDAR SLAM'],
      ['Frame', 'Custom Payload Frame'],
      ['Flight Control', 'Pixhawk · NuttX RTOS'],
      ['Link', 'MAVLink over serial (TELEM2)'],
    ],
    node: 'NVIDIA Jetson Orin Nano',
    nodeSub: 'OAK-D Spatial AI · 3D LiDAR SLAM',
    note: 'The funded path. GPU-accelerated inference and LiDAR enable full 3D SLAM, richer spatial reasoning and higher-fidelity maps — on the same flight-control core.',
    perf: [
      { label: 'Inference latency', value: 22, unit: 'ms', max: 150 },
      { label: 'Map fidelity', value: 94, unit: '%', max: 100 },
      { label: 'Compute power draw', value: 15, unit: 'W', max: 25 },
      { label: 'Planner update rate', value: 15, unit: 'Hz', max: 20 },
    ],
    telemetry: { mode: '3D SLAM', rate: 'LiDAR 480 pts/sec', compute: 'Orin Nano · 48% load' },
  },
};

export const CORE_DELIVERABLES = ['Full arena coverage', 'Survivor localisation', 'Live mapping to local GCS', 'Autonomous flight'];

export const REUSABLE_ASSETS = ['Jetson Orin Nano', 'Gazebo simulation stack', 'LiDAR rig'];

/** Components of the decoupled diagram; each opens an explanation modal. */
export const FLOW_COMPONENTS = {
  compute: {
    title: 'High-level compute',
    tag: 'COMPANION COMPUTER',
    items: ['Vision', 'AI inference', 'Path planning', 'SLAM'],
    body: 'The companion computer is the mission commander. It processes the camera feed for survivor detection, runs the DFS/BFS explorer or LiDAR SLAM, and sends position or velocity setpoints to the flight controller. Its workload is heavy and its timing is unpredictable, which is exactly why it is kept away from the stabilisation loop.',
    points: ['Raspberry Pi 5 on the baseline path, Jetson Orin Nano when funded', 'Runs perception and planning entirely on board — no cloud dependency', 'Renders the live map and survivor positions to the local ground station'],
  },
  link: {
    title: 'MAVLink over TELEM2',
    tag: 'SERIAL LINK',
    items: ['MAVLink v2', 'TELEM2 serial'],
    body: 'MAVLink is a lightweight messaging protocol for drones. The companion computer and the Pixhawk exchange heartbeats, telemetry and commands over a dedicated serial port (TELEM2). The link is the only coupling between the two layers.',
    points: ['Heartbeat messages let each side detect when the other has gone silent', 'Setpoints flow down; attitude, position and battery telemetry flow up', 'A lost link triggers the flight controller’s own failsafe'],
  },
  fc: {
    title: 'Low-level flight control',
    tag: 'PIXHAWK · NUTTX RTOS',
    items: ['Pixhawk', 'NuttX RTOS', 'Stabilisation', 'Motor control'],
    body: 'The Pixhawk runs the PX4 flight stack on the NuttX real-time operating system. It fuses IMU, gyroscope and barometer data at high frequency to keep the aircraft stable, and modules communicate over the uORB publish-subscribe bus.',
    points: ['Stabilisation loop is isolated from companion-computer crashes', 'Can hold position or Return-To-Launch if the companion goes down', 'Drives the ESCs and motors directly'],
  },
  tof: {
    title: 'Reactive safety layer',
    tag: '4-POINT TOF ARRAY',
    items: ['ToF sensors', 'Proximity override'],
    body: 'Four Time-of-Flight sensors measure distance to nearby obstacles with low latency. If something unmapped comes too close, this reactive layer halts or diverts the vehicle ahead of the global planner.',
    points: ['Covers dynamic obstacles the global map has not seen', 'Low latency compared with vision-based detection', 'Prevents airframe loss while the planner re-routes'],
  },
  gcs: {
    title: 'Local ground control station',
    tag: 'GCS',
    items: ['Live map', 'Survivor markers'],
    body: 'The ground station shows the live map, the drone’s track and the location of every detected survivor. It is fed locally, so operators get actionable information even where cellular networks are down.',
    points: ['Survivor detections are logged with coordinates and overlaid on the map', 'No reliance on cloud infrastructure', 'Operators can intervene or trigger return-to-launch'],
  },
};
