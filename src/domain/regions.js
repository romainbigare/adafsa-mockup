/* The Abu Dhabi Emirate and its three provinces.
 *
 * Provinces matter here for a reason that is political as much as analytical:
 * each is run by a different member of the royal family, and they ask for their
 * own numbers. Every page carries this selector. */

export const PROVINCES = [
  { id: 'abudhabi', label: 'Abu Dhabi' },
  { id: 'alain', label: 'Al Ain' },
  { id: 'aldhafra', label: 'Al Dhafra' }
];

export const EMIRATE = { id: 'emirate', label: 'Abu Dhabi Emirate' };

export const REGIONS = [EMIRATE, ...PROVINCES];

export const DEFAULT_REGION = EMIRATE.id;

export function regionById(id) {
  return REGIONS.find((r) => r.id === id) || EMIRATE;
}

export const isEmirate = (id) => id === EMIRATE.id;

/* A farm belongs to the emirate view and to exactly one province view. */
export const farmInRegion = (farm, regionId) => isEmirate(regionId) || farm.province === regionId;

/* The province rows every module page carries under its emirate summary. */
export function provinceRows(farms, measure) {
  return PROVINCES.map((p) => {
    const members = farms.filter((f) => f.province === p.id);
    return { id: p.id, label: p.label, farms: members.length, value: measure ? measure(members) : null };
  });
}
