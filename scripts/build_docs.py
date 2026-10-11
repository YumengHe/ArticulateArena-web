#!/usr/bin/env python3
"""Build the multi-page documentation (docs/*.html) from docs_src/.

Each page is one content fragment in ``docs_src/<slug>.html`` wrapped by
``docs_src/_layout.html``. The page list below defines the order, the sidebar
nesting and the previous / next links. Run from the repository root:

    python scripts/build_docs.py

and commit the generated ``docs/`` folder (the site is static).
"""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs_src"
OUT = ROOT / "docs"

# (slug, eyebrow, title html, sidebar label html, is_sub)
PAGES = [
    ("index", "Section 1", "Overview", "Overview", False),
    ("installation", "Section 2", "Installation", "Installation", False),
    ("quickstart", "Section 3", "Quickstart", "Quickstart", False),
    ("concepts", "Section 4", "Core concepts, as a tutorial", "Core concepts", False),
    ("concept-twist", "4.1", "A joint is a twist", "A joint is a twist", True),
    ("concept-endpoint", "4.2", "The endpoint pair", "The endpoint pair", True),
    ("concept-quotient", "4.3", "The metric E and the ℤ₂ swap", "The metric E and the swap", True),
    ("concept-gauge", "4.4", "Wrap and gauge symmetries", "Wrap and gauge symmetries", True),
    ("concept-norms", "4.5", "Which norm: E<sub>α</sub> versus E<sub>B</sub>", "Which norm: E<sub>α</sub> vs E<sub>B</sub>", True),
    ("concept-compact", "4.6", "Continuous joints and the compactification E<sup>ϕ</sup>", "Continuous joints and E<sup>ϕ</sup>", True),
    ("concept-tree", "4.7", "Trees: E<sup>tree</sup> and the assignment relaxation", "Trees: E<sup>tree</sup> and the relaxation", True),
    ("concept-decoder", "4.8", "Reading the table headers", "Reading the table headers", True),
    ("api", "Section 5", "API reference", "API reference", False),
    ("cli", "Section 6", "Command-line usage", "Command-line usage", False),
]

# The source fragment of the overview page is docs_src/overview.html.
FRAGMENT = {"index": "overview"}


def plain(text: str) -> str:
    """Strip tags for the <title> element."""
    return html.unescape(re.sub(r"<[^>]+>", "", text))


def nav_html(current: str) -> str:
    """Top-level entries only; a concept page keeps "Core concepts" highlighted."""
    current_group = "concepts" if current.startswith("concept-") else current
    lines = []
    for slug, _eyebrow, _title, label, is_sub in PAGES:
        if is_sub:
            continue
        cls = ' class="active"' if slug == current_group else ""
        lines.append(f'      <a{cls} href="{slug}.html">{label}</a>')
    return "\n".join(lines)


def concept_list_html() -> str:
    """The list of concept pages shown on the Core concepts landing page."""
    items = [
        f'        <li><a href="{slug}.html"><span class="num">{eyebrow}</span><span class="t">{title}</span></a></li>'
        for slug, eyebrow, title, _label, is_sub in PAGES if is_sub
    ]
    return '      <ol class="concept-list">\n' + "\n".join(items) + "\n      </ol>"


def page_nav(i: int) -> str:
    prev_ = PAGES[i - 1] if i > 0 else None
    next_ = PAGES[i + 1] if i + 1 < len(PAGES) else None
    parts = ['      <nav class="page-nav">']
    if prev_:
        parts.append(
            f'        <a class="prev" href="{prev_[0]}.html"><span class="label">Previous</span>← {prev_[2]}</a>'
        )
    if next_:
        parts.append(
            f'        <a class="next" href="{next_[0]}.html"><span class="label">Next</span>{next_[2]} →</a>'
        )
    parts.append("      </nav>")
    return "\n".join(parts)


def header_html(slug: str, eyebrow: str, title: str) -> str:
    if slug == "index":
        return (
            "      <h1>Articulate Arena</h1>\n"
            '      <p class="subtitle-line">Usage documentation for <code>articulatearena</code>, the reference '
            "implementation of the quotient metric <span class=\"math\">E</span> on one-degree-of-freedom "
            "articulated joints and its object-level lifts.</p>\n"
            f'      <p class="eyebrow">{eyebrow}</p>\n'
            f'      <h1 class="page-title">{title}</h1>'
        )
    return f'      <p class="eyebrow">{eyebrow}</p>\n      <h1 class="page-title">{title}</h1>'


def main() -> None:
    layout = (SRC / "_layout.html").read_text(encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    for i, (slug, eyebrow, title, _label, _sub) in enumerate(PAGES):
        fragment = (SRC / f"{FRAGMENT.get(slug, slug)}.html").read_text(encoding="utf-8")
        content = "\n".join("      " + line if line.strip() else line for line in fragment.rstrip("\n").split("\n"))
        if slug == "concepts":
            content = content.replace("{{concept_list}}", concept_list_html())
        page = (
            layout.replace("{{title}}", plain(title))
            .replace("{{nav}}", nav_html(slug))
            .replace("{{header}}", header_html(slug, eyebrow, title))
            .replace("{{content}}", content)
            .replace("{{pagenav}}", page_nav(i))
        )
        (OUT / f"{slug}.html").write_text(page, encoding="utf-8")
        print(f"wrote docs/{slug}.html")


if __name__ == "__main__":
    main()
