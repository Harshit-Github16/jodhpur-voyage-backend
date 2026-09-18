import sanitize from 'sanitize-html';

const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 's', 'u',
    'code', 'hr', 'br', 'div', 'table', 'thead', 'caption',
    'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    span: ['style', 'class'],
    div: ['style', 'class'],
    p: ['style', 'class'],
    h1: ['style', 'class'],
    h2: ['style', 'class'],
    h3: ['style', 'class'],
    h4: ['style', 'class'],
    h5: ['style', 'class'],
    h6: ['style', 'class'],
    table: ['style', 'class', 'border', 'cellpadding', 'cellspacing'],
    td: ['style', 'class', 'colspan', 'rowspan'],
    th: ['style', 'class', 'colspan', 'rowspan']
  },
  allowedStyles: {
    '*': {
      // Match HEX and RGB colors
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?(\.\d+)?)\s*\)$/i, /^[a-z]+$/i],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?(\.\d+)?)\s*\)$/i, /^[a-z]+$/i],
      'text-align': [/^(left|right|center|justify)$/i],
      'font-size': [/^\d+(?:px|em|rem|%)$/i],
      'font-weight': [/^(bold|normal|bolder|lighter|[1-9]00)$/i]
    }
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data']
  }
};

export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitize(html, SANITIZE_OPTIONS);
};

export default sanitizeHtml;
