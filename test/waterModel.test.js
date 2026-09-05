import { monthlyDemand, seasonalDemand, expectedProductionKg, cubicMetresPerKilo, ET_BY_MONTH, WATER_PER_DUNUM_MONTH } from '../src/domain/waterModel.js';
import { is, ok, close, done } from './helpers.js';

is(ET_BY_MONTH.length, 12, 'an ET multiplier for every month');
ok(ET_BY_MONTH[6] > ET_BY_MONTH[0] * 2, 'summer demand is roughly double winter');

const july = monthlyDemand('Open Field', 10, 6);
const january = monthlyDemand('Open Field', 10, 0);
ok(july > january, 'the same crop costs more water in July');
close(july, 10 * WATER_PER_DUNUM_MONTH['Open Field'] * ET_BY_MONTH[6], 0.001, 'demand is area × rate × ET');
is(monthlyDemand('Open Field', 0, 6), 0, 'no area, no demand');

const season = seasonalDemand('Open Field', 10, 3, 9);
ok(season > monthlyDemand('Open Field', 10, 9), 'a season costs more than one of its months');
close(season, [9, 10, 11].reduce((a, m) => a + monthlyDemand('Open Field', 10, m), 0), 0.001, 'a season walks its own months');

is(expectedProductionKg('Open Field', 10), 40000, 'four tonnes a dunum');
is(expectedProductionKg('Forest Trees', 10), 0, 'forest stands produce nothing to weigh');
close(cubicMetresPerKilo(4000, 40000), 0.1, 0.0001, 'cubic metres per kilo');
is(cubicMetresPerKilo(4000, 0), null, 'no production, no ratio — never a division by zero');

done('waterModel');
