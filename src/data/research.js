/**
 * Research dossiers. Only facts supplied by the team are stated as facts.
 * "Summary" text is written for this site to explain the area — it is not a paper abstract.
 */
export const DOSSIERS = [
  {
    id: 'ccpm',
    tag: 'Published paper · IRJET',
    title: 'Apply Critical Chain Project Management in Residential Project',
    author: 'Anushka Jaiswal (co-author)',
    area: 'Project management · scheduling',
    meta: [
      ['Journal', 'International Research Journal of Engineering and Technology (IRJET)'],
      ['Issue', 'Volume 8, Issue 7'],
      ['Field', 'Project management · scheduling'],
    ],
    summary: 'Critical Chain Project Management (CCPM) schedules work around the longest chain of dependent tasks and constrained resources, and protects the delivery date with shared buffers rather than padding every individual task.',
    contribution: 'Co-authored the paper applying CCPM to a residential construction project.',
    relevance: 'The team applies the same buffering logic to hardware lead times and sprint planning, so a late part does not silently push the whole competition timeline.',
    references: [{ label: 'IRJET — Volume 8, Issue 7', url: 'https://www.irjet.net/volume8-issue07' }],
  },
  {
    id: 'pyqubit',
    tag: 'Open source · PyPI',
    title: 'PyQubit',
    author: 'Aviral Srivastava (creator)',
    area: 'Quantum machine learning · Python tooling',
    meta: [
      ['Language', 'Python'],
      ['Distribution', 'Python Package Index (PyPI)'],
      ['Adoption', '500+ downloads'],
    ],
    summary: 'PyQubit is an open-source Python library published on PyPI, reflecting Aviral’s work in quantum machine learning (QML).',
    contribution: 'Created, packaged and maintains the library.',
    relevance: 'Maintaining a public package demonstrates the engineering discipline — packaging, versioning, documentation — that the team applies to its flight software.',
    references: [{ label: 'Aviral Srivastava — portfolio', url: 'https://aviralsri.in/' }],
  },
  {
    id: 'wsn',
    tag: 'Research · Wireless sensor networks',
    title: 'WSN clustering and optimisation',
    author: 'Shashi Bhushan Sharma',
    area: 'Wireless sensor networks · meta-heuristic optimisation · antenna design',
    meta: [
      ['Domain', 'Wireless Sensor Networks'],
      ['Methods', 'Clustering · meta-heuristic optimisation'],
      ['Also', 'Antenna design'],
    ],
    summary: 'Clustering protocols group sensor nodes under elected cluster heads to reduce transmission energy and extend network lifetime. Meta-heuristic algorithms search for good cluster configurations where exact optimisation is too expensive.',
    contribution: 'Research focus on WSN clustering, antenna design and meta-heuristic optimisation.',
    relevance: 'Informs the Tier 3 roadmap: relay and cluster-head roles for a multi-drone swarm operating without ground infrastructure, plus resilient telemetry links.',
    references: [{ label: 'LinkedIn profile', url: 'https://www.linkedin.com/in/shashi-bhushan-sharma-922103334/' }],
  },
];
