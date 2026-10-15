import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function MathText({ text, inline = false }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={
        inline ? { p: ({ children }) => <span>{children}</span> } : undefined
      }
    >
      {String(text ?? '')}
    </ReactMarkdown>
  );
}

export default MathText;