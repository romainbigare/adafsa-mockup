(function (W) {
  "use strict";

  W.mock = W.mock || {};

  // ---- Violation type metadata ----
  var VIOLATION_TYPES = [
    { type: 'Agricultural Waste', icon: 'delete', color: '#e84a3b' },
    { type: 'Illegal Burning', icon: 'local_fire_department', color: '#ff6f00' },
    { type: 'Flood Irrigation', icon: 'water_drop', color: '#2196f3' },
    { type: 'Abandoned Farms', icon: 'bedroom_parent', color: '#795548' },
    { type: 'Illegal Usage of Land', icon: 'gavel', color: '#9c27b0' },
    { type: 'Tree Canopy Exceeds Boundaries', icon: 'park', color: '#4caf50' },
    { type: 'Uncovered Water Body', icon: 'pool', color: '#00bcd4' },
  ];

  // Detection method explanations per violation type — describes how the satellite + AI model identified it
  var DETECTION_METHODS = {
    'Agricultural Waste': {
      satellite: 'Sentinel-2 L2A (10 m) + PlanetScope (3 m) tasking',
      bands: 'RGB + NIR + SWIR',
      indices: 'NDWI, NBR',
      model: 'U-Net semantic segmentation (ResNet-34 backbone)',
      explanation: 'Spectral anomaly detection flagged non-photosynthetic material accumulation within cultivated parcel boundaries. The SWIR band (Band 12) showed elevated reflectance consistent with dry organic debris, while NDWI confirmed absence of active vegetation. The AI model cross-referenced the parcel\'s registered land-use type and detected a >35% deviation from expected crop reflectance signatures.',
    },
    'Illegal Burning': {
      satellite: 'Sentinel-2 L2A + MODIS Active Fire (FIRMS)',
      bands: 'SWIR (B12), NIR (B8), Red (B4)',
      indices: 'NBR, dNBR, BAIS2',
      model: 'Random Forest classifier + active-fire hotspot correlation',
      explanation: 'The Normalized Burn Ratio (NBR) dropped by 0.42 between two consecutive passes (6-day interval), indicating sudden vegetation removal. dNBR classification confirmed a burn scar. MODIS FIRMS active-fire detections were correlated spatially and temporally. The AI model verified the burn area falls within a registered agricultural parcel and that no burn permit is on file.',
    },
    'Flood Irrigation': {
      satellite: 'Sentinel-2 L2A (10 m) + Sentinel-1 SAR',
      bands: 'NIR (B8), SWIR (B11), VH-polarization',
      indices: 'NDWI, NDVI, SAR backscatter',
      model: 'CNN (EfficientNet-B0) on multi-temporal stack',
      explanation: 'Persistent surface water was detected via NDWI > 0.3 across 3 consecutive passes, inconsistent with drip-irrigation signatures. Sentinel-1 SAR confirmed high backwater reflectance (VH < -15 dB) indicating standing water. The model classified the irrigation pattern as flood-type by comparing spatial water distribution against the registered irrigation system (drip/sprinkler).',
    },
    'Abandoned Farms': {
      satellite: 'Sentinel-2 L2A (10 m, 6-month time series)',
      bands: 'Red (B4), NIR (B8), SWIR (B11)',
      indices: 'NDVI, EVI, temporal trend',
      model: 'LSTM time-series classifier (12-month window)',
      explanation: 'NDVI temporal analysis over 6 months showed no cultivation cycle (no planting/harvest peaks), with values persistently below 0.25. The LSTM model classified the parcel as "abandoned" with 92% confidence by matching the flat, low-biomass signature against the known abandonment pattern library. Cross-check confirmed no irrigation activity via SAR.',
    },
    'Illegal Usage of Land': {
      satellite: 'Sentinel-2 L2A + WorldView-3 (0.3 m, tasked)',
      bands: 'RGB + NIR + SWIR',
      indices: 'NDVI, NDBI',
      model: 'Object detection (YOLOv8) + land-use classifier',
      explanation: 'The land-use classifier detected a class change from "Cultivated Fields" to "Structures/Commercial" with NDBI > 0.05 indicating built-up surface. High-resolution WorldView-3 imagery confirmed unpermitted construction. The model compared current classification against the AD-3 registry land-use baseline and flagged the divergence.',
    },
    'Tree Canopy Exceeds Boundaries': {
      satellite: 'Sentinel-2 L2A + PlanetScope (3 m)',
      bands: 'NIR (B8), Red-Edge (B5)',
      indices: 'NDVI, canopy mask',
      model: 'U-Net canopy segmentation + parcel boundary overlay',
      explanation: 'Canopy segmentation identified tree cover extending beyond the registered parcel polygon by >2 meters. NDVI thresholding (>0.6) isolated woody vegetation. The model overlaid the canopy mask on the cadastral boundary layer and computed the encroachment area. Cross-referenced with the registered crop type (Palm/Fruit trees) to confirm it is cultivated canopy, not wild growth.',
    },
    'Uncovered Water Body': {
      satellite: 'Sentinel-2 L2A (10 m)',
      bands: 'NIR (B8), SWIR (B11), Green (B3)',
      indices: 'NDWI, MNDWI',
      model: 'Water mask (U-Net) + shade-net spectral filter',
      explanation: 'NDWI > 0.3 detected an open water surface. The model cross-referenced the farm\'s registered infrastructure (shade-net / cover requirement) and confirmed no covering material signature in the SWIR band. Temporal analysis showed the water body persisted across 4 passes, ruling out transient rainfall pooling.',
    },
  };

  // ---- Violation records (with confidence + detection details) ----
  var VIOLATIONS = [
    {
      id: 'V-9001', type: 'Agricultural Waste', farmId: '0042', severity: 'Critical',
      detected: '2d ago', detectedDate: '2026-06-25', status: 'In Review',
      confidence: 0.94, lat: 23.882, lng: 53.791, area: 1.4,
      satellite: 'Sentinel-2 L2A', passDate: '2026-06-25',
    },
    {
      id: 'V-9002', type: 'Illegal Burning', farmId: '0118', severity: 'Critical',
      detected: '3d ago', detectedDate: '2026-06-24', status: 'Open',
      confidence: 0.97, lat: 23.834, lng: 53.802, area: 0.8,
      satellite: 'Sentinel-2 L2A + MODIS', passDate: '2026-06-24',
    },
    {
      id: 'V-9003', type: 'Flood Irrigation', farmId: '0067', severity: 'Warning',
      detected: '4d ago', detectedDate: '2026-06-23', status: 'In Review',
      confidence: 0.81, lat: 23.861, lng: 53.768, area: 2.1,
      satellite: 'Sentinel-2 + Sentinel-1', passDate: '2026-06-23',
    },
    {
      id: 'V-9004', type: 'Abandoned Farms', farmId: '0031', severity: 'Warning',
      detected: '5d ago', detectedDate: '2026-06-22', status: 'Resolved',
      confidence: 0.88, lat: 23.845, lng: 53.815, area: 3.6,
      satellite: 'Sentinel-2 L2A', passDate: '2026-06-22',
    },
    {
      id: 'V-9005', type: 'Illegal Usage of Land', farmId: '0089', severity: 'Critical',
      detected: '6d ago', detectedDate: '2026-06-21', status: 'Open',
      confidence: 0.91, lat: 23.872, lng: 53.773, area: 0.5,
      satellite: 'Sentinel-2 + WorldView-3', passDate: '2026-06-21',
    },
    {
      id: 'V-9006', type: 'Tree Canopy Exceeds Boundaries', farmId: '0156', severity: 'Notice',
      detected: '1w ago', detectedDate: '2026-06-20', status: 'In Review',
      confidence: 0.76, lat: 23.829, lng: 53.788, area: 0.3,
      satellite: 'Sentinel-2 + PlanetScope', passDate: '2026-06-20',
    },
    {
      id: 'V-9007', type: 'Uncovered Water Body', farmId: '0203', severity: 'Warning',
      detected: '1w ago', detectedDate: '2026-06-20', status: 'Resolved',
      confidence: 0.85, lat: 23.856, lng: 53.825, area: 0.6,
      satellite: 'Sentinel-2 L2A', passDate: '2026-06-20',
    },
  ];

  W.mock.violationsData = {
    VIOLATION_TYPES: VIOLATION_TYPES,
    VIOLATIONS: VIOLATIONS,
    DETECTION_METHODS: DETECTION_METHODS
  };

})(window.Wafra);
