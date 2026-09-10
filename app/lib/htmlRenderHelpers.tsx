import React from "react";
/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  tableHeadBg: "#F5EEE7",
  noteBg: "#FCEDF2",
  noteBorder: "#F5D9E3",
};
/* ------------------------------------------------------------------ */
/*  Block renderers                                                    */
/* ------------------------------------------------------------------ */

function renderInline(spans: { text: string; bold?: boolean; italic?: boolean; code?: boolean }[]) {
  return spans.map((span, i) => {
    let el: React.ReactNode = span.text;
    if (span.bold) el = <strong key={i} style={{ color: C.headingDark }}>{el}</strong>;
    if (span.italic) el = <em key={i}>{el}</em>;
    if (span.code)
      el = (
        <code key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px]">
          {el}
        </code>
      );
    return <React.Fragment key={i}>{el}</React.Fragment>;
  });
}

function Paragraph({ content }: { content: { text: string; bold?: boolean; italic?: boolean }[] }) {
  return (
    <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
      {renderInline(content)}
    </p>
  );
}

function Heading({ level, content }: { level: number; content: { text: string; bold?: boolean }[] }) {
  const text = content.map((s) => s.text).join("");
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (level === 2) {
    return (
      <h2
        id={id}
        className="scroll-mt-[90px] mt-10 text-lg font-bold sm:text-xl"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: C.pink,
        }}
      >
        {renderInline(content)}
      </h2>
    );
  }

  return (
    <h3
      id={id}
      className="scroll-mt-[90px] mt-6 text-[15px] font-bold"
      style={{ color: C.headingDark }}
    >
      {renderInline(content)}
    </h3>
  );
}

function BulletList({ items }: { items: { content: { text: string; bold?: boolean }[] }[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
            style={{ backgroundColor: C.pink }}
          />
          <span
            className="text-[13.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            {renderInline(item.content)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }: { items: { content: { text: string; bold?: boolean }[] }[] }) {
  return (
    <ol className="mt-3 list-decimal space-y-2.5 pl-5">
      {items.map((item, i) => (
        <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: C.body }}>
          {renderInline(item.content)}
        </li>
      ))}
    </ol>
  );
}

function Quote({ content }: { content: { text: string; bold?: boolean }[] }) {
  return (
    <div
      className="mt-6 rounded-xl border p-5"
      style={{ backgroundColor: C.noteBg, borderColor: C.noteBorder }}
    >
      <p className="text-[13px] font-bold" style={{ color: C.pink }}>
        ♡ {renderInline(content)}
      </p>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table
        className="w-full min-w-[520px] border-collapse text-left"
        style={{ color: C.body }}
      >
        <thead>
          <tr style={{ backgroundColor: C.tableHeadBg }}>
            {headers.map((h) => (
              <th
                key={h}
                className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                style={{ borderColor: C.border, color: C.label }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border px-4 py-3 align-top text-[13px] leading-relaxed"
                  style={{ borderColor: C.border }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph content={block.content} />;
    case "heading":
      return <Heading level={block.level} content={block.content} />;
    case "bulletList":
      return <BulletList items={block.items} />;
    case "orderedList":
      return <OrderedList items={block.items} />;
    case "quote":
      return <Quote content={block.content} />;
    case "table":
      return <TableBlock headers={block.headers} rows={block.rows} />;
    default:
      return null;
  }
}