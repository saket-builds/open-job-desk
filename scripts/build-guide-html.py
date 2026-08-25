from pathlib import Path
import html
import re

md = Path(r"C:\Users\admin\.cursor\open-job-desk\docs\AFFINE-PAGE-GUIDE.md").read_text(
    encoding="utf-8"
)


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def inline(s: str) -> str:
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    return s


blocks: list[str] = []
lines = md.splitlines()
i = 0
in_code = False
code_buf: list[str] = []
table_buf: list[str] = []


def flush_table() -> None:
    global table_buf
    if not table_buf:
        return
    rows: list[list[str]] = []
    for row in table_buf:
        if re.match(r"^\|?\s*-+", row):
            continue
        cells = [c.strip() for c in row.strip().strip("|").split("|")]
        rows.append(cells)
    table_buf = []
    if not rows:
        return
    head, *body = rows
    out = [
        "<table><thead><tr>"
        + "".join(f"<th>{inline(c)}</th>" for c in head)
        + "</tr></thead><tbody>"
    ]
    for r in body:
        out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
    out.append("</tbody></table>")
    blocks.append("\n".join(out))


while i < len(lines):
    line = lines[i]
    if line.startswith("```"):
        if in_code:
            blocks.append("<pre><code>" + esc("\n".join(code_buf)) + "</code></pre>")
            code_buf = []
            in_code = False
        else:
            flush_table()
            in_code = True
        i += 1
        continue
    if in_code:
        code_buf.append(line)
        i += 1
        continue
    if line.startswith("|"):
        table_buf.append(line)
        i += 1
        continue
    flush_table()
    if line.startswith("# "):
        blocks.append(f"<h1>{inline(line[2:])}</h1>")
    elif line.startswith("## "):
        blocks.append(f"<h2>{inline(line[3:])}</h2>")
    elif line.startswith("### "):
        blocks.append(f"<h3>{inline(line[4:])}</h3>")
    elif line.startswith("> "):
        q = [line[2:]]
        i += 1
        while i < len(lines) and lines[i].startswith("> "):
            q.append(lines[i][2:])
            i += 1
        blocks.append(
            '<div class="callout">' + "<br/>".join(inline(x) for x in q) + "</div>"
        )
        continue
    elif re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line):
        m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line)
        assert m
        alt, src = m.group(1), m.group(2)
        blocks.append(f'<img src="{esc(src)}" alt="{esc(alt)}" />')
    elif line.startswith("- "):
        items = [line[2:]]
        i += 1
        while i < len(lines) and lines[i].startswith("- "):
            items.append(lines[i][2:])
            i += 1
        blocks.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>")
        continue
    elif re.match(r"^\d+\. ", line):
        items = [re.sub(r"^\d+\. ", "", line)]
        i += 1
        while i < len(lines) and re.match(r"^\d+\. ", lines[i]):
            items.append(re.sub(r"^\d+\. ", "", lines[i]))
            i += 1
        blocks.append("<ol>" + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ol>")
        continue
    elif line.strip() == "---":
        blocks.append("<hr/>")
    elif line.strip() == "":
        pass
    else:
        para = [line]
        i += 1
        while (
            i < len(lines)
            and lines[i].strip()
            and not lines[i].startswith(("#", ">", "-", "|", "```", "!["))
            and not re.match(r"^\d+\. ", lines[i])
            and lines[i].strip() != "---"
        ):
            para.append(lines[i])
            i += 1
        text = " ".join(para)
        cls = ' class="lead"' if len(blocks) == 1 else ""
        blocks.append(f"<p{cls}>{inline(text)}</p>")
        continue
    i += 1

flush_table()
body = "\n    ".join(blocks)

html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Job Desk — Simple Guide</title>
  <meta name="description" content="Personal job desk for any sector: find roles, approve, fill Greenhouse yourself — never auto-submit." />
  <style>
    :root {{
      --bg: #0f1115;
      --card: #171a21;
      --text: #e8eaed;
      --muted: #9aa3b2;
      --accent: #5b8cff;
      --border: #2a3140;
      --warn: #3a2f12;
      --warn-border: #8a6a1f;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1a2740, transparent), var(--bg);
      color: var(--text);
      line-height: 1.6;
    }}
    .wrap {{ max-width: 820px; margin: 0 auto; padding: 48px 20px 80px; }}
    h1 {{ font-size: 2.2rem; line-height: 1.2; margin: 0 0 12px; }}
    h2 {{ margin-top: 2.2rem; font-size: 1.35rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }}
    h3 {{ margin-top: 1.4rem; font-size: 1.1rem; }}
    p, li {{ color: #d5dae3; }}
    a {{ color: var(--accent); }}
    .lead {{ font-size: 1.1rem; color: var(--muted); }}
    .callout {{
      background: var(--warn);
      border: 1px solid var(--warn-border);
      border-radius: 12px;
      padding: 14px 16px;
      margin: 18px 0;
    }}
    pre, code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      background: #0b0d12;
    }}
    pre {{ padding: 14px; overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }}
    code {{ padding: 2px 6px; border-radius: 6px; }}
    pre code {{ padding: 0; background: transparent; }}
    img {{
      max-width: 100%;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin: 12px 0;
      display: block;
    }}
    table {{ width: 100%; border-collapse: collapse; margin: 12px 0; }}
    th, td {{ border: 1px solid var(--border); padding: 10px; text-align: left; vertical-align: top; }}
    th {{ background: #12151c; }}
    hr {{ border: 0; border-top: 1px solid var(--border); margin: 2rem 0; }}
    .footer {{ margin-top: 48px; color: var(--muted); font-size: 0.95rem; }}
  </style>
</head>
<body>
  <main class="wrap">
    {body}
    <p class="footer">Public guide for <a href="https://github.com/saket-builds/open-job-desk">saket-builds/open-job-desk</a> · Hosted on Contabo · Editable twin lives in AFFiNE Page mode.</p>
  </main>
</body>
</html>
"""

out_dir = Path(r"C:\Users\admin\.cursor\Affine - Notion Alternative\extracted")
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "job-desk-guide.html").write_text(html_doc, encoding="utf-8")
(out_dir / "Job-Desk-Simple-Guide.md").write_text(md, encoding="utf-8")
print("ok", len(html_doc))
