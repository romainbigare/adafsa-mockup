/* The crop calendar has to read as a curve, not a block.
 *
 * "There are zero farms doing tomatoes in August, but there are 6,000 farms
 * doing tomatoes in September" — the shape matters as much as the totals, and
 * it comes from each holding planting on its own schedule rather than from a
 * smoothing applied afterwards. */
import { allFarms, cropRows } from '../src/data/store.js';
import { CYCLE_MONTHS } from '../src/domain/cropCalendar.js';
import { is, ok, done } from './helpers.js';

const rows = cropRows(allFarms());
const tomato = rows.filter((row) => row.type === 'Tomato');
ok(tomato.length > 10, 'enough tomato plantings to have a shape');

const farmsByMonth = Array.from({ length: 12 }, (_, month) => tomato.filter((row) => row.monthly[month] > 0).length);
const peak = Math.max(...farmsByMonth);
const peakMonth = farmsByMonth.indexOf(peak);

ok(farmsByMonth.some((count) => count === 0), 'there are months with no tomatoes at all');
ok(farmsByMonth[peakMonth - 1] > 0 && farmsByMonth[peakMonth - 1] < peak, 'the month before the peak is lower but not empty');
ok(new Set(farmsByMonth.filter((n) => n > 0)).size > 2, 'the curve has more than two levels — it is not a block');

// Every planting sits in the ground for its crop's cycle, no more and no less.
for (const row of tomato.slice(0, 40)) {
  const months = row.monthly.filter((area) => area > 0).length;
  is(months, CYCLE_MONTHS['Open Field'], 'a tomato planting occupies exactly its cycle');
}

// A perennial is in the ground all year.
const palms = rows.filter((row) => row.category === 'Date Palm').slice(0, 20);
for (const row of palms) is(row.monthly.filter((a) => a > 0).length, 12, 'a palm stand is there every month');

done('calendar shape');
