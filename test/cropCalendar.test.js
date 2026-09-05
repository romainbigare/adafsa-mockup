/* Growing windows read as a curve rather than a box — a few growers plant early
 * and a few late, which is what the calendar page is meant to show. */
import { monthlyCurve, windowFor, peakMonthOf, isInSeason, CYCLE_MONTHS } from '../src/domain/cropCalendar.js';
import { is, ok, done } from './helpers.js';

const tomato = monthlyCurve('Open Field', 'Tomato');
is(tomato.length, 12, 'twelve months');
is(tomato[6], 0, 'no tomatoes in July');
ok(tomato[8] > 0, 'tomatoes are in the ground in September');
ok(Math.max(...tomato) <= 1, 'weights stay within one');
ok(tomato.filter((v) => v > 0).length === 7, 'the September–March window is seven months');

// The window wraps the year end, so December and January are both inside it.
ok(isInSeason('Open Field', 'Tomato', 11) && isInSeason('Open Field', 'Tomato', 0), 'the window wraps December into January');

const perennial = monthlyCurve('Date Palm', 'Date Palm');
is(perennial, Array(12).fill(1), 'a tree is in the ground all year');
is(windowFor('Fodder', 'Alfalfa'), null, 'fodder has no season');

const curve = monthlyCurve('Open Field', 'Tomato');
const shoulders = [curve[8], curve[2]].filter((v) => v > 0 && v < Math.max(...curve));
is(shoulders.length, 2, 'the shoulders are lower than the peak but not zero');
ok(peakMonthOf('Open Field', 'Tomato') >= 8 || peakMonthOf('Open Field', 'Tomato') <= 2, 'the peak sits inside the window');
is(CYCLE_MONTHS['Open Field'], 3, 'a vegetable cycle is three months');

done('cropCalendar');
