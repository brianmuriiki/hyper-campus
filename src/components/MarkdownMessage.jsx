import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownMessage({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mt-4 mb-2 font-display text-lg font-semibold first:mt-0" {...props} />,
          h2: (props) => <h2 className="mt-4 mb-2 font-display text-base font-semibold first:mt-0" {...props} />,
          h3: (props) => <h3 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0" {...props} />,
          p: (props) => <p className="mb-2.5 text-sm leading-relaxed last:mb-0" {...props} />,
          strong: (props) => <strong className="font-semibold text-ink" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          ul: (props) => <ul className="mb-2.5 ml-5 list-disc space-y-1 text-sm last:mb-0" {...props} />,
          ol: (props) => <ol className="mb-2.5 ml-5 list-decimal space-y-1 text-sm last:mb-0" {...props} />,
          li: (props) => <li className="leading-relaxed" {...props} />,
          blockquote: (props) => (
            <blockquote className="mb-2.5 border-l-2 border-highlighter bg-highlighter-soft/40 py-1.5 pl-3 text-sm last:mb-0" {...props} />
          ),
          code: ({ inline, ...props }) =>
            inline ? (
              <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs" {...props} />
            ) : (
              <code className="block overflow-x-auto rounded-md bg-paper p-3 font-mono text-xs leading-relaxed" {...props} />
            ),
          pre: (props) => <pre className="mb-2.5 last:mb-0" {...props} />,
          hr: () => <hr className="my-3 border-line" />,
          a: (props) => <a className="text-ink underline decoration-highlighter decoration-2 underline-offset-2" target="_blank" rel="noreferrer" {...props} />,
          table: (props) => (
            <div className="mb-2.5 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: (props) => <thead {...props} />,
          th: (props) => <th className="border-b border-line px-2.5 py-1.5 text-left text-xs font-semibold text-ink-soft" {...props} />,
          td: (props) => <td className="border-b border-line px-2.5 py-1.5 align-top" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}