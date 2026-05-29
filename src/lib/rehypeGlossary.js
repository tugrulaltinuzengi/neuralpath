// rehype plugin: wrap the FIRST occurrence of each glossary term in the rendered
// lesson with a <span class="np-term" data-term-id="…"> so MarkdownRenderer can
// attach the GlossaryTooltip popup.
//
// Design notes:
//  - Only the first mention of a given concept is linkified, so a lesson isn't
//    drowned in dotted underlines.
//  - Code (`code`/`pre`) and existing links (`a`) are skipped — we don't want
//    tooltips inside code samples or arXiv links.
//  - Longest aliases match first (the regex is built from GLOSSARY_TERMS, which is
//    pre-sorted longest-first), so "matrix multiplication" wins over "matrix".

import { GLOSSARY, GLOSSARY_TERMS } from "../curriculum/glossary.js";

const SKIP_TAGS = new Set(["code", "pre", "a", "script", "style"]);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// One combined, case-insensitive regex. We use look-arounds for letters/digits
// only (not symbols), so hyphenated/slashed terms like "t-SNE" or "L1/L2" match.
const PATTERN = new RegExp(
  "(?<![\\p{L}\\p{N}])(?:" +
    GLOSSARY_TERMS.map(escapeRegExp).join("|") +
    ")(?![\\p{L}\\p{N}])",
  "giu"
);

export default function rehypeGlossary() {
  return (tree) => {
    const seen = new Set(); // entry ids already linkified in this document

    const walk = (node) => {
      if (!node.children) return;
      const out = [];
      for (const child of node.children) {
        if (child.type === "element") {
          const tag = (child.tagName || "").toLowerCase();
          if (!SKIP_TAGS.has(tag)) walk(child);
          out.push(child);
        } else if (child.type === "text") {
          out.push(...linkifyText(child.value, seen));
        } else {
          out.push(child);
        }
      }
      node.children = out;
    };

    walk(tree);
  };
}

// Split a text string into a mix of text nodes and term <span> element nodes.
function linkifyText(text, seen) {
  PATTERN.lastIndex = 0;
  const nodes = [];
  let last = 0;
  let m;
  while ((m = PATTERN.exec(text)) !== null) {
    const matched = m[0];
    const entry = GLOSSARY.get(matched.toLowerCase());
    if (!entry || seen.has(entry.id)) continue; // unknown or already shown — leave as-is
    seen.add(entry.id);

    if (m.index > last) nodes.push({ type: "text", value: text.slice(last, m.index) });
    nodes.push({
      type: "element",
      tagName: "span",
      properties: { className: ["np-term"], dataTermId: entry.id },
      children: [{ type: "text", value: matched }],
    });
    last = m.index + matched.length;
  }
  if (nodes.length === 0) return [{ type: "text", value: text }];
  if (last < text.length) nodes.push({ type: "text", value: text.slice(last) });
  return nodes;
}
