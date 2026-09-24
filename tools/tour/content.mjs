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
 *   dx, dy  a nudge in CSS pixels, applied after x and y. A marker on an
 *           element's left edge is pulled 8 pixels further left unless dx says
 *           otherwise, so it sits on the border rather than on the first word.
 *
 * The farm used as the worked example is #182: a small mixed holding near
 * Al Ain with palms of three varieties, strawberries and vegetables, whose
 * trees score in the lowest band, so its first problem is the trees. The
 * orchard map uses #123 instead — palms of three varieties and a block of
 * limes, dense enough for the dots to read as an orchard at this size. */

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

export const SCREENS = [
  {
    id: 'overview',
    route: '#/overview',
    en: {
      title: 'All your farms on one page',
      intro: 'The first page. It shows what is grown in the whole region, and where.',
      points: [
        { head: 'Choose what to count', text: 'A region, and the crop groups: cereals, fodder, vegetables, palms, fruit trees.' },
        { head: 'The big numbers', text: 'Farms, land, and land in use. 10 dunums = 1 hectare.' },
        { head: 'Where the farms are', text: 'Each circle is a number of farms. Zoom in, and it splits.' },
        { head: 'What is grown', text: 'Each crop group, by land and by number of farms.' }
      ]
    },
    az: {
      title: 'Bütün təsərrüfatlarınız bir səhifədə',
      intro: 'İlk səhifə. Bütün bölgədə nəyin və harada becərildiyini göstərir.',
      points: [
        { head: 'Nəyi sayacağınızı seçin', text: 'Bölgə və bitki qrupları: dənli, yem, tərəvəz, xurma, meyvə ağacları.' },
        { head: 'Əsas rəqəmlər', text: 'Təsərrüfatlar, torpaq və istifadə olunan torpaq. 10 dönüm = 1 hektar.' },
        { head: 'Təsərrüfatlar haradadır', text: 'Hər dairə bir neçə təsərrüfatdır. Yaxınlaşdırın, dairə bölünür.' },
        { head: 'Nə becərilir', text: 'Hər bitki qrupu: torpağa və təsərrüfat sayına görə.' }
      ]
    },
    markers: [
      { sel: '.filter-bar .select', x: 'left', y: 'middle' },
      { sel: '.figure', x: 'left', y: 'middle' },
      { sel: '.leaflet-container', x: 'left', y: 0.3 },
      { sel: 'section.card', text: 'Crops by area', x: 'left', y: 'top', dy: 22 }
    ]
  },
  {
    id: 'crops',
    route: '#/m/crop/inventory',
    map: { id: 'crop-inventory', fitFarms: true },
    en: {
      title: 'What grows where',
      intro: 'The field crops on every farm: which crop, on how much land, and on which farm.',
      points: [
        { head: 'Open a crop group', text: 'Tick a group, or open it and pick one crop, like alfalfa or tomato.' },
        { head: 'Coloured by crop', text: 'Each dot is a farm. The colour is its main crop group.' },
        { head: 'Land for each crop', text: 'Dunums and share. Click a group to see its crops.' }
      ]
    },
    az: {
      title: 'Harada nə becərilir',
      intro: 'Hər təsərrüfatda tarla bitkiləri: hansı bitki, nə qədər torpaqda və hansı təsərrüfatda.',
      points: [
        { head: 'Bitki qrupunu açın', text: 'Qrupu seçin və ya açıb bir bitki seçin, məsələn, yonca və ya pomidor.' },
        { head: 'Bitkiyə görə rəng', text: 'Hər nöqtə bir təsərrüfatdır. Rəng onun əsas bitki qrupudur.' },
        { head: 'Hər bitkinin torpağı', text: 'Dönüm və pay. Bitkiləri görmək üçün qrupa klikləyin.' }
      ]
    },
    markers: [
      { sel: '.filter-bar .chip-toggle', text: 'Fodder', x: 'right', y: 'middle', dx: 18 },
      { sel: '.map-legend', x: 'right', y: 'middle', dx: 30 },
      { sel: 'section.card', text: 'Area by crop', x: 'left', y: 'top', dy: 22 }
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
        { head: 'One dot, one tree', text: 'Zoom in to a farm. The colour of the dot is the variety.' },
        { head: 'Which variety', text: 'Each colour is one variety of palm or fruit tree.' },
        { head: 'Land under trees', text: 'Dunums of palms, fruit trees and forest trees.' }
      ]
    },
    az: {
      title: 'Hər bağda hər ağac',
      intro: 'Peyk hər ağacı tapır, sayır və onun növünü deyir.',
      points: [
        { head: 'Bütün ağaclar sayılır', text: 'Xurma palmaları, meyvə ağacları və meşə ağacları.' },
        { head: 'Bir nöqtə, bir ağac', text: 'Təsərrüfata yaxınlaşın. Nöqtənin rəngi sortu göstərir.' },
        { head: 'Hansı sort', text: 'Hər rəng bir xurma və ya meyvə ağacı sortudur.' },
        { head: 'Ağacların torpağı', text: 'Xurma, meyvə və meşə ağaclarının dönümü.' }
      ]
    },
    markers: [
      { sel: '.figure', x: 'left', y: 'middle' },
      { sel: '.leaflet-container', x: 0.62, y: 0.55 },
      { sel: '.map-legend', x: 'right', y: 'top', dy: 14 },
      { sel: 'section.card', text: 'Area by tree group', x: 'left', y: 'top', dy: 22 }
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
        { head: 'A score from 0 to 100', text: 'For palms and for fruit trees. 80 or more is healthy.' },
        { head: 'Who to visit first', text: 'Here: 6 farms have very stressed trees.' },
        { head: 'Four levels', text: 'Healthy, fair, stressed, very stressed. Green is good, red is bad.' },
        { head: 'Health on the map', text: 'The score of each area. Zoom in to see each farm.' }
      ]
    },
    az: {
      title: 'Bitki sağlamlığı, təsərrüfat-təsərrüfat',
      intro: 'Peyk ağacların nə qədər yaşıl və güclü olduğunu ölçür. Aşağı bal erkən xəbərdarlıqdır.',
      points: [
        { head: '0-dan 100-ə qədər bal', text: 'Xurma və meyvə ağacları üçün. 80 və yuxarı sağlamdır.' },
        { head: 'Əvvəlcə kimə baş çəkmək', text: 'Burada: 6 təsərrüfatda ağaclar çox zəifdir.' },
        { head: 'Dörd səviyyə', text: 'Sağlam, orta, zəif, çox zəif. Yaşıl yaxşıdır, qırmızı pisdir.' },
        { head: 'Xəritədə sağlamlıq', text: 'Hər ərazinin balı. Hər təsərrüfatı görmək üçün yaxınlaşdırın.' }
      ]
    },
    markers: [
      { sel: '.figure', x: 'left', y: 'middle' },
      { sel: '.callout', x: 'left', y: 'middle' },
      { sel: 'section.card', text: 'Palm trees', x: 'left', y: 'top', dy: 50 },
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
        { head: 'Where it is', text: 'The farm’s real boundary, on the satellite picture.' },
        { head: 'What it grows now', text: 'Each crop, and how much land it takes.' }
      ]
    },
    az: {
      title: 'Bir təsərrüfat, hər şey bir yerdə',
      intro: 'İstənilən təsərrüfatı açın. Torpağını, bitkilərini, ağaclarını, suyunu və problemlərini görürsünüz.',
      points: [
        { head: 'Rəqəmlərlə təsərrüfat', text: 'Ölçü, istifadə olunan torpaq, ağaclar və problemlərin sayı.' },
        { head: 'Nə problem var', text: 'Burada: ağaclar çox zəif görünür.' },
        { head: 'Harada yerləşir', text: 'Təsərrüfatın həqiqi sərhədi, peyk şəklində.' },
        { head: 'İndi nə becərir', text: 'Hər bitki və onun tutduğu torpaq.' }
      ]
    },
    markers: [
      { sel: '.figure', x: 'left', y: 'middle' },
      { sel: '.callout', x: 'left', y: 'middle' },
      { sel: 'section.card', text: 'Where it is', x: 'left', y: 'top', dy: 22 },
      { sel: 'section.card', text: 'What it grows now', x: 'left', y: 'top', dy: 22 }
    ]
  },
  {
    id: 'actions',
    route: `#/farm/${EXAMPLE_FARM}/actions`,
    en: {
      title: 'From a score to a farm visit',
      intro: 'What to check on this farm. The website does not name the disease. It shows where to look.',
      points: [
        { head: 'Most urgent first', text: 'Each problem, with a short reason in plain words.' },
        { head: 'What to do', text: 'Here: look for lack of water, salt in the soil, or pests.' },
        { head: 'Take it to the farm', text: 'Print one page for the visit.' },
        { head: 'A possible cause', text: 'Here the farm used only 70% of the water it is allowed.' }
      ]
    },
    az: {
      title: 'Baldan təsərrüfat ziyarətinə',
      intro: 'Bu təsərrüfatda nəyi yoxlamaq lazımdır. Sayt xəstəliyin adını demir. Harada baxmağı göstərir.',
      points: [
        { head: 'Ən təcili birinci', text: 'Hər problem və sadə sözlərlə qısa səbəbi.' },
        { head: 'Nə etməli', text: 'Burada: su çatışmazlığını, torpaqda duzu və ya zərərvericiləri axtarın.' },
        { head: 'Təsərrüfata aparın', text: 'Ziyarət üçün bir səhifə çap edin.' },
        { head: 'Mümkün səbəb', text: 'Burada təsərrüfat ona ayrılan suyun yalnız 70 faizini istifadə edib.' }
      ]
    },
    markers: [
      { sel: 'section.card', text: 'What needs attention', x: 'left', y: 'top', dy: 22 },
      { sel: '.issue .action', x: 'left', y: 'middle', dx: -26 },
      { sel: '.header-tools .btn', text: 'Print', x: 'right', y: 'middle', dx: 12 },
      { sel: 'section.card', text: 'Water in', x: 'left', y: 'top', dy: 22 }
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
