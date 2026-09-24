/* The bilingual tour: what each slide says, and where its markers point.
 *
 * Pure data, read by tools/tourdeck.mjs and checked by test/tour.test.js.
 * Everything a reader sees is written here, once, in both languages, so a
 * wording change never means touching the typesetting.
 *
 * Written for readers whose English is a second or third language, and for
 * Azerbaijani readers first: short sentences, common words, one idea each.
 * The screens themselves are the English website with sample data, and the
 * cover says so.
 *
 * A marker is anchored to an element on the page, not to a position on the
 * picture. The deck finds the element when it photographs the screen and puts
 * the number on it, so a layout change moves the marker with it rather than
 * leaving it pointing at the wrong thing.
 *
 *   sel     a CSS selector
 *   text    optional: the element must contain this text
 *   within  optional { sel, text }: look only inside the first match of this
 *   x, y    where on the element: 'left' | 'center' | 'right', 'top' | 'middle'
 *           | 'bottom', or a share of its width / height (0 to 1)
 *   ink     optional: measure the element's words, not its box
 *   dx, dy  a nudge in CSS pixels, applied after x and y. A marker on an
 *           element's left edge is pulled 8 pixels further left unless dx says
 *           otherwise, so it sits on the border rather than on the first word.
 *
 * The farm used as the worked example is #182: a small mixed holding near
 * Al Ain with palms of three varieties, strawberries and vegetables, whose
 * trees score in the lowest band, so its first problem is the trees. The
 * orchard map uses #123 instead — palms of three varieties and a block of
 * limes, dense enough for the dots to read as an orchard at this size.
 *
 * The screens are laptop screens with the menu folded narrow, and the points
 * sit in a column 2.25 inches wide down each side of the laptop, so the lines
 * are kept short: a heading of a few words and one sentence under it. */

/* The farm the two farm-level slides follow. */
export const EXAMPLE_FARM = 182;
/* The holding the tree map zooms into. */
export const ORCHARD_FARM = 123;

export const COVER = {
  /* The picture on the cover is one of the screens below, by id. */
  screen: 'orchards',
  en: {
    title: 'Plant health, crops and orchards',
    subtitle: 'A short tour of our farm monitoring website',
    line: 'For teams who look after hundreds of farms at once.'
  },
  az: {
    title: 'Bitki sağlamlığı, əkinlər və bağlar',
    subtitle: 'Təsərrüfat monitorinqi saytımıza qısa baxış',
    line: 'Eyni anda yüzlərlə təsərrüfata baxan komandalar üçün.'
  },
  footnote: {
    en: 'The screens are from the English version of the website, with sample data.',
    az: 'Ekranlar saytın ingilis dilindəki versiyasındandır, nümunə məlumatlarla.'
  }
};

/* Markers sit in the white space beside what they point at wherever the page
 * leaves some — next to a figure's number, at the end of a row of chips, on
 * the edge of a card — so they never cover the words they explain. */
export const SCREENS = [
  {
    id: 'overview',
    route: '#/overview',
    en: {
      title: 'All your farms on one page',
      intro: 'The first page. It shows what is grown in the whole region, and where.',
      points: [
        { head: 'The menu', text: 'Every part of the website. Point at an icon to see its pages.' },
        { head: 'Choose what to count', text: 'A region, and the crop groups.' },
        { head: 'The big numbers', text: 'Farms, land, and land in use. 10 dunums = 1 hectare.' },
        { head: 'Where the farms are', text: 'Each circle is a group of farms. Zoom in to split it.' }
      ]
    },
    az: {
      title: 'Bütün təsərrüfatlar bir səhifədə',
      intro: 'İlk səhifə. Bütün bölgədə nəyin və harada becərildiyini göstərir.',
      points: [
        { head: 'Menyu', text: 'Saytın bütün bölmələri. Səhifələri görmək üçün ikonun üzərinə gəlin.' },
        { head: 'Nəyi sayacağınızı seçin', text: 'Bölgə və bitki qrupları.' },
        { head: 'Əsas rəqəmlər', text: 'Təsərrüfatlar, torpaq və istifadə olunan torpaq. 10 dönüm = 1 hektar.' },
        { head: 'Təsərrüfatlar haradadır', text: 'Hər dairə bir qrup təsərrüfatdır. Bölmək üçün yaxınlaşdırın.' }
      ]
    },
    markers: [
      { sel: '.nav-list', x: 'right', y: 0.45, dx: 4 },
      { sel: '.filter-bar .chip-toggle', text: 'Forest Trees', x: 'right', y: 'middle', dx: 34 },
      { sel: '.figure .value', ink: true, x: 'right', y: 'bottom', dx: 34, dy: 8 },
      { sel: '.leaflet-container', x: 0.1, y: 0.6 }
    ]
  },
  {
    id: 'crops',
    route: '#/m/crop/inventory',
    en: {
      title: 'What grows where',
      intro: 'The field crops on every farm: which crop, on how much land, and on which farm.',
      points: [
        { head: 'Open a crop group', text: 'Tick a group, or open it to pick one crop.' },
        { head: 'Coloured by crop', text: 'Each dot is a farm, in the colour of its main crop.' },
        { head: 'Land for each crop', text: 'Dunums and share. Click a group to see its crops.' }
      ]
    },
    az: {
      title: 'Harada nə becərilir',
      intro: 'Hər təsərrüfatda tarla bitkiləri: hansı bitki, nə qədər torpaqda və hansı təsərrüfatda.',
      points: [
        { head: 'Bitki qrupunu açın', text: 'Qrupu seçin və ya açıb bir bitki seçin.' },
        { head: 'Bitkiyə görə rəng', text: 'Hər nöqtə bir təsərrüfatdır, əsas bitkisinin rəngində.' },
        { head: 'Hər bitkinin torpağı', text: 'Dönüm və pay. Bitkiləri görmək üçün qrupa klikləyin.' }
      ]
    },
    markers: [
      { sel: '.filter-bar .chip-toggle', text: 'Open Field', x: 'right', y: 'middle', dx: 34 },
      { sel: '.map-legend', x: 'right', y: 'middle', dx: 34 },
      { sel: 'section.card', text: 'Area by crop', x: 'left', y: 'top', dy: 22, dx: -12 }
    ]
  },
  {
    id: 'orchards',
    route: '#/m/trees/inventory',
    map: { id: 'trees-inventory', farm: ORCHARD_FARM, zoom: 18 },
    en: {
      title: 'Every tree, in every orchard',
      intro: 'The satellite finds each tree, counts it, and tells its kind.',
      points: [
        { head: 'All trees, counted', text: 'Date palms, fruit trees and forest trees.' },
        { head: 'One dot, one tree', text: 'Zoom in to a farm. The colour of a dot is its variety.' },
        { head: 'Which variety', text: 'Each colour is one variety of palm or fruit tree.' },
        { head: 'Land under trees', text: 'Dunums of palms, fruit trees and forest trees.' }
      ]
    },
    az: {
      title: 'Hər bağda hər ağac',
      intro: 'Peyk hər ağacı tapır, sayır və onun növünü deyir.',
      points: [
        { head: 'Bütün ağaclar sayılır', text: 'Xurma palmaları, meyvə və meşə ağacları.' },
        { head: 'Bir nöqtə, bir ağac', text: 'Təsərrüfata yaxınlaşın. Nöqtənin rəngi sortu göstərir.' },
        { head: 'Hansı sort', text: 'Hər rəng bir xurma və ya meyvə ağacı sortudur.' },
        { head: 'Ağacların torpağı', text: 'Xurma, meyvə və meşə ağaclarının dönümü.' }
      ]
    },
    markers: [
      { sel: '.figure .value', ink: true, x: 'right', y: 'bottom', dx: 34, dy: 8 },
      { sel: '.leaflet-container', x: 0.64, y: 0.5 },
      { sel: '.map-legend', x: 'right', y: 'top', dx: 34, dy: 16 },
      { sel: 'section.card', text: 'Area by tree group', x: 'left', y: 'top', dy: 22, dx: -12 }
    ]
  },
  {
    id: 'health',
    route: '#/m/trees/canopy',
    map: { id: 'trees-canopy', fitFarms: true },
    en: {
      title: 'Plant health, farm by farm',
      intro: 'The satellite measures how green and strong the trees are. A low score is an early warning.',
      points: [
        { head: 'A score from 0 to 100', text: 'For palms and fruit trees. 80 or more is healthy.' },
        { head: 'Who to visit first', text: 'Here: 6 farms have very stressed trees.' },
        { head: 'Four levels', text: 'Healthy, fair, stressed, very stressed.' },
        { head: 'Health on the map', text: 'The score of each area. Zoom in to see each farm.' }
      ]
    },
    az: {
      title: 'Hər təsərrüfatda bitki sağlamlığı',
      intro: 'Peyk ağacların nə qədər yaşıl və güclü olduğunu ölçür. Aşağı bal erkən xəbərdarlıqdır.',
      points: [
        { head: '0-dan 100-ə qədər bal', text: 'Xurma və meyvə ağacları üçün. 80 və yuxarı sağlamdır.' },
        { head: 'Əvvəlcə kimə baş çəkmək', text: 'Burada: 6 təsərrüfatda ağaclar çox zəifdir.' },
        { head: 'Dörd səviyyə', text: 'Sağlam, orta, zəif, çox zəif.' },
        { head: 'Xəritədə sağlamlıq', text: 'Hər ərazinin balı. Hər təsərrüfatı görmək üçün yaxınlaşdırın.' }
      ]
    },
    markers: [
      { sel: '.figure .value', ink: true, x: 'right', y: 'bottom', dx: 34, dy: 8 },
      { sel: '.callout', x: 0.45, y: 'middle' },
      { sel: 'section.card', text: 'Palm trees', x: 'left', y: 'top', dy: 57, dx: -12 },
      { sel: '.leaflet-container', x: 'left', y: 0.3 }
    ]
  },
  {
    id: 'farm',
    route: `#/farm/${EXAMPLE_FARM}`,
    en: {
      title: 'One farm, everything in one place',
      intro: 'Open any farm. You see its land, crops, trees and water, and what needs attention.',
      points: [
        { head: 'The farm in numbers', text: 'Size, land in use, trees, and how many problems.' },
        { head: 'What is wrong', text: 'Here: the trees look very stressed.' },
        { head: 'What it grows now', text: 'Each crop, and how much land it takes.' },
        { head: 'Its trees', text: 'Here: 59 palms, with a health score of 46.' }
      ]
    },
    az: {
      title: 'Bir təsərrüfat, hər şey bir yerdə',
      intro: 'İstənilən təsərrüfatı açın. Torpağını, bitkilərini, ağaclarını, suyunu və problemlərini görürsünüz.',
      points: [
        { head: 'Rəqəmlərlə təsərrüfat', text: 'Ölçü, istifadə olunan torpaq, ağaclar və problemlərin sayı.' },
        { head: 'Nə problem var', text: 'Burada: ağaclar çox zəif görünür.' },
        { head: 'İndi nə becərir', text: 'Hər bitki və onun tutduğu torpaq.' },
        { head: 'Ağacları', text: 'Burada: 59 xurma palması, sağlamlıq balı 46.' }
      ]
    },
    markers: [
      { sel: '.figure .value', ink: true, x: 'right', y: 'bottom', dx: 34, dy: 8 },
      { sel: '.callout', x: 0.6, y: 'middle' },
      { sel: 'section.card', text: 'What it grows now', x: 'left', y: 'top', dy: 22, dx: -10 },
      { sel: 'section.card', text: 'Every variety on this holding', x: 'left', y: 'top', dy: 22, dx: -12 }
    ]
  },
  {
    id: 'actions',
    route: `#/farm/${EXAMPLE_FARM}/actions`,
    en: {
      title: 'From a score to a farm visit',
      intro: 'What to check on this farm. The website does not name the disease. It shows where to look.',
      points: [
        { head: 'Most urgent first', text: 'Each problem, with a short reason.' },
        { head: 'What to do', text: 'Look for lack of water, salt in the soil, or pests.' },
        { head: 'Take it to the farm', text: 'Print one page for the visit.' },
        { head: 'A possible cause', text: 'The farm used only 70% of the water it is allowed.' }
      ]
    },
    az: {
      title: 'Baldan təsərrüfat ziyarətinə',
      intro: 'Bu təsərrüfatda nəyi yoxlamaq lazımdır. Sayt xəstəliyin adını demir. Harada baxmağı göstərir.',
      points: [
        { head: 'Ən təcili birinci', text: 'Hər problem və qısa səbəbi.' },
        { head: 'Nə etməli', text: 'Su çatışmazlığını, torpaqda duzu və ya zərərvericiləri axtarın.' },
        { head: 'Təsərrüfata aparın', text: 'Ziyarət üçün bir səhifə çap edin.' },
        { head: 'Mümkün səbəb', text: 'Təsərrüfat ona ayrılan suyun yalnız 70 faizini istifadə edib.' }
      ]
    },
    markers: [
      { sel: 'section.card', text: 'What needs attention', x: 'left', y: 'top', dy: 22, dx: -12 },
      { sel: '.issue .action', x: 'left', y: 'middle', dx: -34 },
      { sel: '.header-tools .btn', text: 'Print', x: 'center', y: 'bottom', dy: 22 },
      { sel: 'section.card', text: 'Water in', x: 'left', y: 'top', dy: 22, dx: -12 }
    ]
  }
];

/* The last page: the path from the satellite to a person on the farm, the
 * website's own step highlighted. Icons are names from src/app/icons.js. */
export const CLOSING = {
  en: {
    title: 'From the satellite to the farm visit',
    next: 'Next step: a live demo of the website.'
  },
  az: {
    title: 'Peykdən təsərrüfat ziyarətinə',
    next: 'Növbəti addım: saytın canlı nümayişi.'
  },
  steps: [
    {
      icon: 'layers',
      en: { head: 'We watch every farm', text: 'From the satellite, every season.' },
      az: { head: 'Hər təsərrüfatı izləyirik', text: 'Peykdən, hər mövsüm.' }
    },
    {
      icon: 'crop',
      en: { head: 'The AI counts and scores', text: 'Crops, trees and plant health.' },
      az: { head: 'Süni intellekt sayır və qiymətləndirir', text: 'Bitkilər, ağaclar və bitki sağlamlığı.' }
    },
    {
      icon: 'alert',
      highlight: true,
      en: { head: 'The website ranks the farms', text: 'Farms that need help come first.' },
      az: { head: 'Sayt təsərrüfatları sıralayır', text: 'Köməyə ehtiyacı olanlar birinci gəlir.' }
    },
    {
      icon: 'print',
      en: { head: 'Your team visits', text: 'With one page: what to check.' },
      az: { head: 'Komandanız baş çəkir', text: 'Bir səhifə ilə: nəyi yoxlamaq lazımdır.' }
    }
  ]
};
