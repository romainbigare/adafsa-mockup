/* A very small element builder.
 *
 * Twenty-two pages of tables and figures is a lot of markup, and building it by
 * concatenating strings invites both quoting bugs and injected text. `h` takes
 * values as values: anything that ends up as text goes through textContent, so
 * an owner's name can contain whatever it contains. */

export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value;
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'html') node.innerHTML = value; // only ever given literals from this codebase
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }

  append(node, children);
  return node;
}

export function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const frag = (...children) => append(document.createDocumentFragment(), children);

/* Anchors that route within the app. Written as real links so every view can be
 * bookmarked, shared and opened in a new tab — the production app could do none
 * of those things, and it came up in the audit. */
export const link = (href, props, ...children) => h('a', { href, ...props }, ...children);

export function on(node, event, selector, handler) {
  node.addEventListener(event, (e) => {
    const match = e.target.closest(selector);
    if (match && node.contains(match)) handler(e, match);
  });
}
