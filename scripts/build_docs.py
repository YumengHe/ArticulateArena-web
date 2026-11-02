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
import hashlib
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
    """In-page links on the continuous Core Concepts tutorial."""
    items = [
        f'        <li><a href="#{slug.removeprefix("concept-")}"><span class="num">{eyebrow}</span><span class="t">{title}</span></a></li>'
        for slug, eyebrow, title, _label, is_sub in PAGES if is_sub
    ]
    return '      <ol class="concept-list">\n' + "\n".join(items) + "\n      </ol>"


def core_partial(name: str) -> str:
    return (SRC / "core" / f"{name}.html").read_text(encoding="utf-8").rstrip()


def core_lesson_tabs(anchor: str, title: str, explanation: str, guide: str) -> str:
    """Keep the original reading path visible, with an optional interactive view."""
    label = html.escape(plain(title), quote=True)
    return (
        f'<div class="cc-lesson" data-cc-lesson="{anchor}">\n'
        f'<div class="cc-lesson-tabs" role="tablist" aria-label="{label}: choose a view" hidden>\n'
        f'<button type="button" role="tab" id="{anchor}-explanation-tab" aria-controls="{anchor}-explanation" aria-selected="true" tabindex="0" data-cc-view="explanation">Read</button>\n'
        f'<button type="button" role="tab" id="{anchor}-demo-tab" aria-controls="{anchor}-demo" aria-selected="false" tabindex="-1" data-cc-view="demo">Explore</button>\n'
        '</div>\n'
        f'<div class="cc-lesson-panel" id="{anchor}-explanation" role="tabpanel" aria-labelledby="{anchor}-explanation-tab" tabindex="0">\n{explanation}\n</div>\n'
        f'<div class="cc-lesson-panel" id="{anchor}-demo" role="tabpanel" aria-labelledby="{anchor}-demo-tab" tabindex="0">\n{guide}\n</div>\n'
        '</div>'
    )


def core_sections() -> str:
    """Reuse the original lessons verbatim; keep their standalone pages intact."""
    guides = {"twist": "movement", "quotient": "matching", "norms": "norms", "tree": "tree"}
    sections = []
    for slug, number, title, _label, is_sub in PAGES:
        if not is_sub:
            continue
        anchor = slug.removeprefix("concept-")
        original = (SRC / f"{slug}.html").read_text(encoding="utf-8").rstrip()
        content = f'<div class="cc-original">\n{original}\n</div>'
        if anchor in guides:
            content = core_lesson_tabs(anchor, title, content, core_partial(f"guide-{guides[anchor]}"))
        sections.append(
            f'<section id="{anchor}" class="cc-section" data-cc-section aria-labelledby="{anchor}-title">\n'
            f'<h2 id="{anchor}-title"><span class="cc-section-number">{number}</span>{title}</h2>\n'
            f'{content}\n'
            '<a class="cc-back-map" href="index.html#concept-map">← Concept map in the Overview</a>\n</section>'
        )
    return "\n\n".join(sections)


def core_contents() -> str:
    links = ['<a href="#notation">4.0 · Notation</a>']
    links.extend(
        f'<a href="#{slug.removeprefix("concept-")}">{number} · {label}</a>'
        for slug, number, _title, label, is_sub in PAGES if is_sub
    )
    return '\n'.join(links)


def overview_contents() -> str:
    return '\n'.join([
        '<a href="#articulated-object">What is an articulated object?</a>',
        '<a href="#concept-map">The concept map</a>',
        '<a href="#metric-summary">The metric behind the map</a>',
    ])


def learning_assets(include_map: bool) -> str:
    """Version the shared assets so moved guides cannot use an old cached style."""
    names = ["core-concepts", "core-guides"] + (["core-map"] if include_map else [])
    tags = []
    for extension in ["css", "js"]:
        for name in names:
            asset = f"static/{extension}/{name}.{extension}"
            version = hashlib.sha256((ROOT / asset).read_bytes()).hexdigest()[:10]
            url = f"../{asset}?v={version}"
            tags.append(f'  <link rel="stylesheet" href="{url}">' if extension == "css"
                        else f'  <script src="{url}" defer></script>')
    return '\n'.join(tags) + '\n'


def page_nav(i: int) -> str:
    prev_ = PAGES[i - 1] if i > 0 else None
    next_ = PAGES[i + 1] if i + 1 < len(PAGES) else None
    if PAGES[i][0] == "concepts":
        next_ = next(page for page in PAGES if page[0] == "api")
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
        if slug == "index":
            fragment = (fragment.replace("{{core_intro}}", core_lesson_tabs(
                            "articulated-object", "What is an articulated object?",
                            core_partial("intro"), core_partial("guide-cabinet")))
                        .replace("{{core_map}}", core_partial("map")))
        elif slug == "concepts":
            fragment = fragment.replace("{{concept_sections}}", core_sections())
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
        if slug in {"index", "concepts"}:
            page_class = "overview-page" if slug == "index" else "core-concepts-page"
            contents = overview_contents() if slug == "index" else core_contents()
            page = (page.replace('<body>', f'<body class="aa-learning-page {page_class}">')
                    .replace('</head>', learning_assets(slug == "index") + '</head>')
                    .replace('    <a class="backlink"',
                             '    <nav class="cc-sidebar-toc" aria-label="On this page">\n'
                             '      <p class="toc-label">On this page</p>\n' + contents + '\n    </nav>\n\n'
                             '    <a class="backlink"'))
        (OUT / f"{slug}.html").write_text(page, encoding="utf-8")
        print(f"wrote docs/{slug}.html")


if __name__ == "__main__":
    main()
