/* Tree Monitoring — tree count.
 *
 * Tree location, tree count and species classification belong on one page. The
 * map counts farms while you are looking at the emirate and only breaks into
 * individual trees once you have zoomed into a holding, because species
 * colouring above the farm says nothing: every farm here is a mix, and a
 * province coloured by its commonest cultivar would be an invention.
 *
 * It is the module with the largest share of the contract, so it is the one to
 * show. */

import { h } from '../../app/dom.js';
import { section, intro } from '../../components/section.js';
import { figures } from '../../components/figures.js';
import { summaryTable, countFormat } from '../../components/summaryTable.js';
import { mapBand } from '../../components/mapBand.js';
import { dataTable, farmColumns } from '../../components/dataTable.js';
import { barList } from '../../charts/barList.js';
import { query, taxonomyEntries } from '../../data/store.js';
import { taxonomyBreakdown } from '../../domain/aggregate.js';
import { TREE_CATEGORIES } from '../../domain/taxonomy.js';
import { categoryColor } from '../../domain/palette.js';
import { int, dec, compact } from '../../domain/format.js';
import { varietyTotals, varietyPalette, MAPPED_CATEGORIES } from './varieties.js';
import { regionById } from '../../domain/regions.js';
import { TODAY } from '../../domain/periods.js';

const CAPTIONS = {
  overview: 'Numbers of farms growing trees',
  close: 'Trees and their variety'
};

export function render({ selection }) {
  const all = query({ region: selection.region });
  const farms = query({ region: selection.region, types: selection.types });
  const treed = farms.filter((farm) => farm.trees > 0);
  const entries = taxonomyEntries(farms, { types: selection.types });
  const breakdown = taxonomyBreakdown(entries, { categories: TREE_CATEGORIES });

  const palms = treed.reduce((total, farm) => total + farm.palms, 0);
  const fruit = treed.reduce((total, farm) => total + farm.fruitTrees, 0);
  const forest = treed.reduce((total, farm) => total + farm.forestTrees, 0);

  const species = new Map();
  for (const farm of treed) {
    for (const entry of farm.species) species.set(entry.name, (species.get(entry.name) || 0) + entry.trees);
  }

  /* The map's own vocabulary: every cultivar and species on screen, each with
   * its own tint, drawn only once the reader is close enough to a farm for the
   * distinction to be real. */
  const mapped = varietyTotals(treed, { categories: MAPPED_CATEGORIES });
  const colourOfVariety = varietyPalette(mapped);
  const palmVarieties = mapped.filter((row) => row.category === 'Date Palm');
  /* A key rather than a tally: the map is showing one farm by the time these
   * colours matter, and an emirate-wide count beside it would be read as that
   * farm's. The counts live in the charts below. */
  const legend = mapped.slice(0, 10).map((row) => ({ label: row.name, color: colourOfVariety(row) }));

  /* The caption says what the map is showing, and the map is showing two
   * different things: how many farms grow trees, and then the trees. */
  const mapCaption = h('span', { text: CAPTIONS.overview });

  return {
    filterScope: 'tree',
    content: [
      figures([
        { value: compact(palms + fruit + forest), label: 'Trees counted', icon: 'trees' },
        { value: compact(palms), label: 'Date palms', icon: 'trees' },
        { value: compact(fruit), label: 'Fruit trees', icon: 'trees' },
        { value: compact(forest), label: 'Forest trees', icon: 'trees' },
        { value: int(palmVarieties.length), label: 'Palm varieties found', icon: 'layers' }
      ]),

      section('Where the trees are', { icon: 'pin', note: mapCaption, flush: true },
        h('div', { style: { padding: '0 16px 16px' } }, mapBand('trees-inventory', {
          mode: 'trees',
          farms: treed,
          region: selection.region,
          varietiesOf: (farm) => (farm.varieties || []).filter((v) => MAPPED_CATEGORIES.includes(v.category)),
          varietyColor: colourOfVariety,
          onStage: (stage) => { mapCaption.textContent = CAPTIONS[stage]; },
          legend,
          legendTitle: 'Variety'
        }))),


      section('Area by tree group', { icon: 'trees', half: true, note: 'Click a group to see its species.', flush: true },
        summaryTable(breakdown.rows, { measure: 'area', measureLabel: 'Dunums', format: (v) => dec(v, 1), totalLabel: 'All tree stands' })),

      section('Farms with each group', { icon: 'farms', half: true, note: 'A farm can have several groups.', flush: true },
        summaryTable(breakdown.rows, { measure: 'farms', measureLabel: 'Farms', format: countFormat, showTotal: false })),

      section('Date palm varieties', { icon: 'trees', half: true, note: 'Number of palms of each variety.' },
        palmVarieties.length
          ? barList(palmVarieties.map((row) => ({ label: row.name, value: row.trees, color: colourOfVariety(row) })),
              { format: compact })
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
            farmColumns.centre,
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
