/* What the corrective-actions page is allowed to say.
 *
 * The list was settled in review: over-consumption of water and newly fallow
 * ground, with canopy stress and a weak efficiency score alongside them.
 * Violations and data confidence are not among them. */
import { openIssues, farmerAlerts } from '../src/domain/issues.js';
import { is, ok, done } from './helpers.js';

const base = {
  waterUsePct: 100,
  cultivationSeries: [10, 10, 10, 10, 10, 10, 10, 10],
  canopy: 90,
  efficiency: 90,
  crops: []
};

is(openIssues(base).length, 0, 'a farm inside every range has nothing open');

const over = openIssues({ ...base, waterUsePct: 160, crops: [
  { type: 'Citrus', former: false, demandThisMonth: 100, actualThisMonth: 190 },
  { type: 'Alfalfa', former: false, demandThisMonth: 100, actualThisMonth: 105 }
] });
is(over.length, 1);
is(over[0].id, 'water');
ok(over[0].detail.includes('Citrus'), 'the excess is traced to the crop carrying it');
is(over[0].severity, 'act');

is(openIssues({ ...base, waterUsePct: 125 }).length, 0, '125% is not yet over-allocated');
is(openIssues({ ...base, waterUsePct: 126 })[0].id, 'water', 'above 125% is');
is(openIssues({ ...base, waterUsePct: 70 })[0].id, 'under-water', 'under-irrigating is raised too, as a watch');

const shrunk = openIssues({ ...base, cultivationSeries: [10, 10, 10, 10, 10, 10, 10, 6] });
is(shrunk[0].id, 'fallow', 'land coming out of production is raised');
ok(shrunk[0].detail.includes('4.0'), 'and says how much');

is(openIssues({ ...base, canopy: 40 })[0].id, 'canopy');
is(openIssues({ ...base, canopy: 40 })[0].severity, 'act', 'severe canopy stress is an act, not a watch');
is(openIssues({ ...base, efficiency: 40 })[0].id, 'efficiency');

// Everything raised is stated as something to do.
for (const issue of openIssues({ ...base, waterUsePct: 200, canopy: 40, efficiency: 30, crops: [] })) {
  ok(issue.action && issue.action.length > 10, `${issue.id} carries an action`);
  ok(issue.title && issue.detail, `${issue.id} carries a title and a detail`);
}

const alerts = farmerAlerts({ ...base, waterUsePct: 200, canopy: 40, efficiency: 30, crops: [] });
is(alerts.map((a) => a.id), ['water'], 'only over-consumption and fallow reach the farmer');

done('issues');
