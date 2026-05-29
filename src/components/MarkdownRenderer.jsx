import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeGlossary from "../lib/rehypeGlossary.js";
import GlossaryTooltip from "./GlossaryTooltip.jsx";

// Renders lesson markdown with GFM tables, syntax-highlighted code, and
// glossary tooltips. rehypeGlossary wraps specialized terms in
// <span class="np-term" data-term-id>; the span renderer below swaps those for
// an interactive GlossaryTooltip while leaving all other spans untouched.
//
// Order matters: rehypeHighlight first (it owns code blocks), then
// rehypeGlossary (which skips code), so we never tooltip inside code samples.
const components = {
  span(props) {
    const { node, children, ...rest } = props;
    const cls = node?.properties?.className;
    const isTerm = Array.isArray(cls) ? cls.includes("np-term") : cls === "np-term";
    if (isTerm && node?.properties?.dataTermId) {
      return <GlossaryTooltip id={node.properties.dataTermId}>{children}</GlossaryTooltip>;
    }
    return <span {...rest}>{children}</span>;
  },
};

export default function MarkdownRenderer({ children }) {
  return (
    <div className="np-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeGlossary]}
        components={components}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
