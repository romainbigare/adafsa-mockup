(function (W) {
  "use strict";

  W.dashboard = W.dashboard || {};

  // Color palette by Type — same 21-entry map used across the plots/landuse
  // layers; lives in the shared kernel (js/lib/color.js).
  var TYPE_COLORS = W.color.TYPE_COLORS;

  var CROP_COLORS = { 'Palm': '#00ff00', 'No Palm': '#a1d99b', 'No palm': '#a1d99b' };

  // Category -> list of types mapping (built from data)
  var CATEGORY_OF_TYPE = {
    'Barren Land': ['Barren Land'],
    'Open Agriculture': ['Cultivated Fields', 'Fallow Land', 'Palm Trees', 'Fruit Trees', 'Other Trees'],
    'Protected Agriculture': ['Greenhouse', 'PolyHouse', 'Glass House', 'Shade House', 'Open Shed'],
    'Structures': ['Warehouse', 'Residential', 'Labour Housing', 'Commercial', 'Vehicle', 'Animal Pens', 'Machine Storage', 'Water Storage', 'Irrigation & Utilities', 'Other Structures']
  };

  // Full Land Use tree (category -> types with colors)
  var LAND_USE_TREE = [
    { name: 'Barren Land', color: '#f0e68c', types: [{ name: 'Barren Land', color: '#f0e68c' }] },
    { name: 'Open Agriculture', color: '#78c679', types: [
      { name: 'Cultivated Fields', color: '#78c679' },
      { name: 'Fallow Land', color: '#f0e68c' },
      { name: 'Forest Trees', color: '#a1d99b' },
      { name: 'Fruit Trees', color: '#31a354' },
      { name: 'Palm Trees', color: '#00ff00' }
    ]},
    { name: 'Protected Agriculture', color: '#41ab5d', types: [
      { name: 'Greenhouse', color: '#41ab5d' },
      { name: 'Open Shed', color: '#bdbdbd' },
      { name: 'Shade House', color: '#a1d99b' }
    ]},
    { name: 'Structures', color: '#fc8d59', types: [
      { name: 'Animal Pens', color: '#c49a6c' },
      { name: 'Commercial', color: '#e84a3b' },
      { name: 'Irrigation & Utilities', color: '#2171b5' },
      { name: 'Labour Housing', color: '#fed976' },
      { name: 'Machine Storage', color: '#969696' },
      { name: 'Other Structures', color: '#d9d9d9' },
      { name: 'Residential', color: '#fc8d59' },
      { name: 'Vehicle', color: '#756bb1' },
      { name: 'Warehouse', color: '#7f7f7f' },
      { name: 'Water Storage', color: '#4fc3f7' }
    ]}
  ];

  // Full Crops & Trees taxonomy (category -> types with colors)
  var CROP_TREE = [
    { name: 'Cereals', color: '#d4a017', types: [
      { name: 'Barley', color: '#c9b870' },
      { name: 'Quinoa', color: '#b7472a' },
      { name: 'Wheat', color: '#e0a82e' }
    ]},
    { name: 'Date Palm', color: '#7b4b2a', types: [
      { name: 'Date Palm', color: '#7b4b2a' }
    ]},
    { name: 'Fodder', color: '#4c9a2a', types: [
      { name: 'Alfalfa', color: '#5aa02c' },
      { name: 'Maize', color: '#f2c811' },
      { name: 'Rhodes Grass', color: '#9acd32' },
      { name: 'Sorghum', color: '#a0522d' },
      { name: 'Sudan Grass', color: '#2e8b57' }
    ]},
    { name: 'Fruit Trees', color: '#e67e22', types: [
      { name: 'Avocado', color: '#5c8a2e' },
      { name: 'Banana', color: '#f4d03f' },
      { name: 'Dragon Fruit', color: '#c72c6b' },
      { name: 'Fig', color: '#7b466a' },
      { name: 'Guava', color: '#de8aa0' },
      { name: 'Lemon', color: '#f2e22e' },
      { name: 'Lime', color: '#a8d44a' },
      { name: 'Mandarin', color: '#ed8b16' },
      { name: 'Mango', color: '#f0932b' },
      { name: 'Melon', color: '#e8a15a' },
      { name: 'Pomegranate', color: '#9b1b30' },
      { name: 'Strawberry', color: '#e63946' },
      { name: 'Tahiti Lime', color: '#7cb342' },
      { name: 'Watermelon', color: '#3e7c3a' }
    ]},
    { name: 'Open-Field Produce', color: '#8e44ad', types: [
      { name: 'Beans', color: '#558b2f' },
      { name: 'Cabbage', color: '#26a69a' },
      { name: 'Capsicum', color: '#e74c3c' },
      { name: 'Coriander', color: '#cddc39' },
      { name: 'Cucumber', color: '#4caf50' },
      { name: 'Eggplant', color: '#6a1b9a' },
      { name: 'Garlic', color: '#d7cca3' },
      { name: 'Lettuce', color: '#aed581' },
      { name: 'Muskmelon', color: '#e8943a' },
      { name: 'Okra', color: '#827717' },
      { name: 'Onion', color: '#c2569e' },
      { name: 'Potato', color: '#c8a165' },
      { name: 'Radish', color: '#e03b5b' },
      { name: 'Spinach', color: '#1b5e20' },
      { name: 'Sweet Potato', color: '#e07b39' },
      { name: 'Tomato', color: '#ff6347' },
      { name: 'Watermelon', color: '#e63946' },
      { name: 'Zucchini', color: '#33691e' }
    ]}
  ];

  // Map crops.json level_3 values to CROP_TREE type names
  var CROP_NORMALIZE = {
    'Cantaloupe/Muskmelon': 'Muskmelon',
    'Corn': 'Maize',
    'Olive': 'Fig' // Olive appears in Fruit Trees in data; closest tree type
  };

  // Color lookup by crop type name (built from CROP_TREE)
  var CROP_COLORS_BY_TYPE = {};
  for (var i = 0; i < CROP_TREE.length; i++) {
    var cat = CROP_TREE[i];
    CROP_COLORS_BY_TYPE[cat.name] = cat.color;
    for (var j = 0; j < cat.types.length; j++) {
      CROP_COLORS_BY_TYPE[cat.types[j].name] = cat.types[j].color;
    }
  }

  W.dashboard.taxonomy = {
    TYPE_COLORS: TYPE_COLORS,
    CROP_COLORS: CROP_COLORS,
    CATEGORY_OF_TYPE: CATEGORY_OF_TYPE,
    LAND_USE_TREE: LAND_USE_TREE,
    CROP_TREE: CROP_TREE,
    CROP_NORMALIZE: CROP_NORMALIZE,
    CROP_COLORS_BY_TYPE: CROP_COLORS_BY_TYPE
  };

})(window.Wafra);
