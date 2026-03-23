// Medal Ribbon Badge Animations - Lottie JSON format

export const goldMedalBadge = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 250,
  nm: 'Gold Medal Ribbon',
  ddd: 0,
  assets: [],
  layers: [
    // Ribbon Tails
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Left Ribbon',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: -15 },
        p: { a: 0, k: [80, 120, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [100, 100, 100] },
          { t: 30, s: [100, 100, 100] }
        ]}
      },
      shapes: [{
        ty: 'gr',
        it: [
          { ty: 'rc', p: { a: 0, k: [0, 40] }, s: { a: 0, k: [20, 80] }, r: { a: 0, k: 3 } },
          { ty: 'fl', c: { a: 0, k: [0.8, 0.2, 0.2, 1] }, o: { a: 0, k: 100 } }
        ]
      }]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Right Ribbon',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 15 },
        p: { a: 0, k: [120, 120, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [100, 100, 100] },
          { t: 30, s: [100, 100, 100] }
        ]}
      },
      shapes: [{
        ty: 'gr',
        it: [
          { ty: 'rc', p: { a: 0, k: [0, 40] }, s: { a: 0, k: [20, 80] }, r: { a: 0, k: 3 } },
          { ty: 'fl', c: { a: 0, k: [0.2, 0.4, 0.8, 1] }, o: { a: 0, k: 100 } }
        ]
      }]
    },
    // Circular Medal
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Medal Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [100, 80, 0] },
        s: { a: 1, k: [
          { t: 15, s: [0, 0, 100], e: [110, 110, 100] },
          { t: 45, s: [110, 110, 100], e: [100, 100, 100] },
          { t: 90, s: [100, 100, 100] }
        ]}
      },
      shapes: [{
        ty: 'gr',
        it: [
          { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [70, 70] } },
          { ty: 'fl', c: { a: 0, k: [1, 0.843, 0, 1] }, o: { a: 0, k: 100 } },
          { ty: 'st', c: { a: 0, k: [0.8, 0.6, 0, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 } }
        ]
      }]
    },
    // Star in center
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Star',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [
          { t: 30, s: [0], e: [360] },
          { t: 90, s: [360] }
        ]},
        p: { a: 0, k: [100, 80, 0] },
        s: { a: 1, k: [
          { t: 30, s: [0, 0, 100], e: [100, 100, 100] },
          { t: 60, s: [100, 100, 100] }
        ]}
      },
      shapes: [{
        ty: 'gr',
        it: [
          { ty: 'sr', p: { a: 0, k: [0, 0] }, or: { a: 0, k: 25 }, ir: { a: 0, k: 12 }, pt: { a: 0, k: 5 } },
          { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
        ]
      }]
    }
  ]
};

export const silverMedalBadge = {
  ...goldMedalBadge,
  nm: 'Silver Medal Ribbon',
  layers: goldMedalBadge.layers.map((layer, idx) => {
    if (idx === 2) { // Medal circle
      return {
        ...layer,
        shapes: [{
          ty: 'gr',
          it: [
            { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [70, 70] } },
            { ty: 'fl', c: { a: 0, k: [0.75, 0.75, 0.75, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.5, 0.5, 0.5, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 } }
          ]
        }]
      };
    }
    return layer;
  })
};

export const bronzeMedalBadge = {
  ...goldMedalBadge,
  nm: 'Bronze Medal Ribbon',
  layers: goldMedalBadge.layers.map((layer, idx) => {
    if (idx === 2) { // Medal circle
      return {
        ...layer,
        shapes: [{
          ty: 'gr',
          it: [
            { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [70, 70] } },
            { ty: 'fl', c: { a: 0, k: [0.804, 0.498, 0.196, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.6, 0.3, 0.1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 } }
          ]
        }]
      };
    }
    return layer;
  })
};

export const rankMedalBadge = {
  ...goldMedalBadge,
  nm: 'Rank Medal Badge'
};
