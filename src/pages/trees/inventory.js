/* Tree Monitoring — trees, species and varieties.
 *
 * Tree location, tree count and species classification belong on one page with
 * a map coloured by species. That was agreed directly in review, and it is the
 * module with the largest share of the contract, so it is the one to show. */

import { h } from '../../app/dom.js';
import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { summaryTable, countFormat } from '../../components/summaryTable.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable } from '../../components/dataTable.js';
import { barList } from '../../charts/barList.js';
import { query, taxonomyEntries } from '../../data/store.js';
import { taxonomyBreakdown } from '../../domain/aggregate.js';
import { TREE_CATEGORIES } from '../../domain/taxonomy.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, compact } from '../../domain/format.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

const dominantTree = (farm) =>
  farm.palms >= farm.fruitTrees && farm.palms >= farm.forestTrees ? 'Date Palm'
    : farm.fruitTrees >= farm.forestTrees ? 'Fruit Trees' : 'Forest Trees';

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const treed = farms.filter((farm) => farm.trees > 0);
  const entries = taxonomyEntries(farms, { types: selection.types });
  const breakdown = taxonomyBreakdown(entries, { categories: TREE_CATEGORIES });

  const palms = treed.reduce((total, farm) => total + farm.palms, 0);
  const fruit = treed.reduce((total, farm) => total + farm.fruitTrees, 0);
  const forest = treed.reduce((total, farm) => total + farm.forestTrees, 0);

  const cultivars = new Map();
  for (const farm of treed) {
    if (!farm.cultivar) continue;
    cultivars.set(farm.cultivar, (cultivars.get(farm.cultivar) || 0) + farm.palms);
  }
  const species = new Map();
  for (const farm of treed) {
    for (const entry of farm.species) species.set(entry.name, (species.get(entry.name) || 0) + entry.trees);
  }

  const legend = TREE_CATEGORIES.map((name) => ({
    label: name,
    color: categoryColor(name),
    count: treed.filter((farm) => dominantTree(farm) === name).length
  })).filter((entry) => entry.count > 0);

  return {
    filterScope: 'tree',
    content: [
      figures([
        { value: compact(palms + fruit + forest), label: 'Trees counted', icon: 'trees' },
        { value: compact(palms), label: 'Date palms', icon: 'trees' },
        { value: compact(fruit), label: 'Fruit trees', icon: 'trees' },
        { value: compact(forest), label: 'Forest trees', icon: 'trees' },
        { value: int(cultivars.size), label: 'Palm varieties found', icon: 'layers' }
      ]),

      section('Where the trees are', { icon: 'pin', note: 'Colour shows the main tree group.', flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('trees-inventory', {
          mode: 'category',
          farms: treed,
          region: selection.region,
          colorOf: (farm) => categoryColor(dominantTree(farm)),
          labelOf: (farm) => `${compact(farm.trees)} trees · ${dominantTree(farm)}`,
          legend,
          legendTitle: 'Main stand',
          note: 'Click a farm to open it.'
        }))),


      section('Area by tree group', { icon: 'trees', half: true, note: 'Click a group to see its species.', flush: true },
        summaryTable(breakdown.rows, { measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1), totalLabel: 'All tree stands' })),

      section('Farms with each group', { icon: 'farms', half: true, note: 'A farm can have several groups.', flush: true },
        summaryTable(breakdown.rows, { measure: 'farms', measureLabel: 'Farms', format: countFormat, totalLabel: 'Farms with trees' })),

      section('Date palm varieties', { icon: 'trees', half: true, note: 'Number of palms of each variety.' },
        cultivars.size
          ? barList([...cultivars.entries()].map(([name, trees]) => ({ label: name, value: trees }))
              .sort((a, b) => b.value - a.value), { format: compact, color: categoryColor('Date Palm') })
          : intro('No palms selected.')),

      section('Fruit tree species', { icon: 'trees', half: true, note: 'Number of trees of each species.' },
        species.size
          ? barList([...species.entries()].map(([name, trees]) => ({ label: name, value: trees }))
              .sort((a, b) => b.value - a.value), { format: compact, color: categoryColor('Fruit Trees') })
          : intro('No fruit trees selected.')),

      section('Every farm with trees', { icon: 'table', note: 'Click a column title to sort.', flush: true },
        dataTable(treed, {
          selection,
          searchable: true,
          csvName: 'tree-inventory',
          hrefFor: (farm) => `#/farm/${farm.fid}`,
          columns: [
            { key: 'fid', label: 'Farm', strong: true, value: (f) => f.fid, cell: (f) => `#${f.fid}` },
            { key: 'owner', label: 'Owner', value: (f) => f.owner },
            { key: 'province', label: 'Province', value: (f) => regionById(f.province).label },
            { key: 'trees', label: 'Trees', align: 'num', defaultSort: true, value: (f) => f.trees, cell: (f) => int(f.trees) },
            { key: 'palms', label: 'Date palms', align: 'num', value: (f) => f.palms, cell: (f) => int(f.palms) },
            { key: 'fruit', label: 'Fruit', align: 'num', value: (f) => f.fruitTrees, cell: (f) => int(f.fruitTrees) },
            { key: 'forest', label: 'Forest', align: 'num', value: (f) => f.forestTrees, cell: (f) => int(f.forestTrees) },
            { key: 'cultivar', label: 'Main cultivar', value: (f) => f.cultivar || '—' }
          ]
        }))
    ]
  };
}
