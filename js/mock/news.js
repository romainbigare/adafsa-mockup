(function (W) {
  "use strict";

  W.mock = W.mock || {};

  var NEWS_TEMPLATES = [
    { icon: 'satellite_alt', color: '#6b7280', text: function (v) { return 'Satellite scan completed for Farm #' + v.farm; } },
    { icon: 'water_drop', color: '#2196f3', text: function () { return Math.floor(Math.random() * 4 + 1) + ' farms achieved irrigation level GOOD'; } },
    { icon: 'agriculture', color: '#16a34a', text: function (v) { return 'Farm #' + v.farm + ' harvested ' + Math.floor(Math.random() * 500 + 50) + ' dunums of ' + v.crop; } },
    { icon: 'satellite_alt', color: '#6b7280', text: function () { return 'Satellite scan completed for Al Ain region'; } },
    { icon: 'eco', color: '#16a34a', text: function () { return 'NDVI improved on ' + Math.floor(Math.random() * 8 + 2) + ' farms in viewport'; } },
    { icon: 'psychology', color: '#7c3aed', text: function (v) { return 'AI crop assessment refreshed for Farm #' + v.farm; } },
    { icon: 'grass', color: '#8bc34a', text: function () { return 'New cultivation registered: ' + Math.floor(Math.random() * 30 + 5) + ' dunums'; } },
    { icon: 'trending_up', color: '#16a34a', text: function (v) { return 'Farm #' + v.farm + ' growth grade upgraded to ' + (Math.floor(Math.random() * 2) + 4) + '/5'; } }
  ];
  var CROPS = ['Date Palm', 'Alfalfa', 'Rhodes Grass', 'Tomato', 'Cucumber', 'Wheat'];

  function generateNewsItem() {
    var tpl = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
    var farm = Math.floor(Math.random() * 5320 + 1);
    var crop = CROPS[Math.floor(Math.random() * CROPS.length)];
    var now = new Date();
    var time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      icon: tpl.icon,
      color: tpl.color,
      text: tpl.text({ farm: farm, crop: crop }),
      time: time
    };
  }

  W.mock.news = {
    NEWS_TEMPLATES: NEWS_TEMPLATES,
    CROPS: CROPS,
    generateNewsItem: generateNewsItem
  };

})(window.Wafra);
