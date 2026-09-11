import referenceTracking from './masterplan2-tracking.json';
import southBeachTrack from './masterplan2-south-beach-track.json';

// Move the display pin within its estate so it remains in the final camera view.
// Keep the original calibration landmarks and highlighted boundaries unchanged.
const tracking = {
  ...referenceTracking,
  frames: referenceTracking.frames.map((frame, index) => [southBeachTrack[index], ...frame.slice(1)]),
};

// Names, metrics and images supplied in the MAP HOVER references.
const landmarks = [
  [
    "South Beach & Hill Estate",
    [
      [
        "Land Area",
        "45 Ha"
      ],
      [
        "Villas",
        "54 Villas"
      ]
    ]
  ],
  [
    "Cheval Blanc",
    [
      [
        "Land Area",
        "14.2 Ha"
      ],
      [
        "Hotel",
        "50 Keys"
      ],
      [
        "Villas",
        "16 Villas"
      ]
    ]
  ],
  [
    "Raffles Hotel",
    [
      [
        "Land Area",
        "13.1 Ha"
      ],
      [
        "Hotel",
        "50 Keys"
      ],
      [
        "Bungalow",
        "30 Keys"
      ],
      [
        "Villas",
        "24 Villas"
      ]
    ]
  ],
  [
    "Sazan Forest & Lagoon",
    [
      [
        "Land Area",
        "64.2 Ha"
      ],
      [
        "Villas",
        "149 Villas"
      ]
    ]
  ],
  [
    "Sazan West",
    [
      [
        "Land Area",
        "14.8 Ha"
      ],
      [
        "Villas",
        "39 nos"
      ]
    ]
  ],
  [
    "Sazan Lake",
    [
      [
        "Land Area",
        "17.2 Ha"
      ],
      [
        "Villas",
        "73 Villas"
      ]
    ]
  ],
  [
    "Sazan Townhouse",
    [
      [
        "Land Area",
        "28.5 Ha"
      ],
      [
        "Town Houses",
        "850 nos"
      ]
    ]
  ],
  [
    "Atlantis",
    [
      [
        "Land Area",
        "26.1 Ha"
      ],
      [
        "Marina",
        "(346) 17 Ha"
      ],
      [
        "Hotel",
        "500 Keys"
      ],
      [
        "Villas",
        "30 Villas"
      ],
      [
        "Apartment",
        "250 nos"
      ]
    ]
  ],
  [
    "Aliee",
    [
      [
        "Land Area",
        "17.4 Ha"
      ],
      [
        "Hotel",
        "90 Keys"
      ],
      [
        "Hotel Apartments",
        "140 nos"
      ],
      [
        "Apartments",
        "150 nos"
      ]
    ]
  ],
  [
    "Sazan Apartments",
    [
      [
        "Land Area",
        "17.4 Ha"
      ],
      [
        "Apartments",
        "600 nos"
      ]
    ]
  ]
];

export const masterplan2Locations = landmarks.map(([name, stats], index) => ({
  name, stats,
  image: `/masterplan/locations/location-${index + 1}.jpg`,
  position: { left: `${tracking.frames[0][index][0]}%`, top: `${tracking.frames[0][index][1]}%` },
}));

export { tracking as masterplan2Tracking };
