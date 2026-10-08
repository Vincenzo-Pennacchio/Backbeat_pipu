// Mini-markdown condiviso tra app e generatore PDF: **grassetto**, _corsivo_, ___ = spazio da completare.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function fmt(s = '') {
  return esc(s)
    .replace(/_{2,}/g, '<span class="blank"></span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(«“'/])_(.+?)_(?=$|[\s).,:;!?»”'/])/g, '$1<em>$2</em>');
}
