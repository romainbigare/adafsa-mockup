/* Support — one page, reached from one entry in the navigation.
 *
 * In the platform this replaces, more than half the menu was support and
 * settings. It is one link now, and what it holds is the two things a
 * government user actually needs: how to reach a person, and what to send them.
 *
 * Every contact detail here is a placeholder and the page says so once, at the
 * top of the card. A mockup that quietly shows an invented telephone number is
 * a mockup somebody eventually dials. */

import { h } from '../app/dom.js';
import { icon } from '../app/icons.js';
import { section, callout } from '../components/section.js';

const DESK = {
  phone: '+971 2 555 0000',
  whatsapp: '+971 50 555 0000',
  email: 'support@wafra.example'
};

/* A contact is a button with the detail written under it, so a reader can dial
 * it from a printed page as easily as click it on screen. */
const contact = (glyph, label, detail, href, { primary = false } = {}) =>
  h('div', { class: 'contact' },
    h('a', { class: ['btn', primary ? 'btn-primary' : null], href, target: '_blank', rel: 'noopener' },
      icon(glyph, { size: 15 }), h('span', { text: label })),
    h('span', { class: 'contact-detail', text: detail }));

export function render() {
  const hours = [
    ['Sunday to Thursday', '7:30 – 15:30 Gulf Standard Time'],
    ['Urgent, outside those hours', 'WhatsApp the desk — someone is on call'],
    ['Anything else', 'Answered the next working day']
  ];

  return {
    showRegion: false,
    content: [
      section('Talk to the platform team', {
        icon: 'support',
        note: 'Placeholder details for the mockup — the real desk is set up before handover.'
      },
        h('p', { class: 'section-intro' },
          'Ask about any figure, any farm and any report. Nobody here needs to know how the analysis works to ask what a number means.'),
        h('div', { class: 'contact-row' },
          contact('phone', 'Call the desk', DESK.phone, `tel:${DESK.phone.replace(/\s/g, '')}`, { primary: true }),
          contact('chat', 'WhatsApp', DESK.whatsapp, `https://wa.me/${DESK.whatsapp.replace(/\D/g, '')}`),
          contact('mail', 'Email', DESK.email, `mailto:${DESK.email}`))),

      section('When someone answers', { icon: 'clock', half: true },
        h('dl', { class: 'readout' }, ...hours.map(([term, value]) =>
          h('div', { class: 'line' }, h('dt', { text: term }), h('dd', { text: value }))))),

      /* The one piece of advice that saves the most time on both sides: the
       * address bar already says which farm, which province and which filter,
       * so a question never has to be reconstructed from a description. */
      section('Send us what you are looking at', { icon: 'search', half: true },
        h('p', { class: 'section-intro' },
          'Every page has its own link, and the link carries the province, the crops you ticked and the farm you opened. Copy it into your message and we see exactly your screen.'),
        h('div', { class: 'contact-row' },
          h('button', {
            class: 'btn',
            onclick: (event) => {
              navigator.clipboard?.writeText(location.href);
              const label = event.currentTarget.querySelector('span');
              const was = label.textContent;
              label.textContent = 'Link copied';
              setTimeout(() => { label.textContent = was; }, 1600);
            }
          }, icon('copy', { size: 15 }), h('span', { text: 'Copy this page’s link' })))),

      section('Training and reports', { icon: 'book', half: true },
        h('p', { class: 'section-intro' },
          'A half-day session for a new team, a walk through one module, or a report cut the way a particular directorate wants it.'),
        h('div', { class: 'contact-row' },
          contact('mail', 'Request a session', DESK.email, `mailto:${DESK.email}?subject=Training%20request`),
          contact('mail', 'Request a report', DESK.email, `mailto:${DESK.email}?subject=Report%20request`))),

      section('Who builds this', { icon: 'info', half: true },
        h('img', { class: 'brand-mark', src: 'assets/brand/wafra-logo.png', alt: 'Wafra Greentech', width: '150' }),
        h('p', { class: 'section-intro' },
          'Wafra Greentech builds and runs the platform for ADAFSA. The analysis behind it — plot boundaries, crop and land-use classification, tree detection and the scored indices — is produced with Map My Crop.')),

      section('About this version', { icon: 'info' },
        callout('info', 'This is a design mockup. Farm outlines, crop parcels and land types come from the survey. Scores, counts, forecasts and every contact detail on this page are made up for the demo.'))
    ]
  };
}
