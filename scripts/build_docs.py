#!/usr/bin/env python3
"""Build the multi-page documentation (docs/*.html) from docs_src/.

Each page is one content fragment in ``docs_src/<slug>.html`` wrapped by
``docs_src/_layout.html``. The page list below defines the sidebar groups and
tutorial order. Run from the repository root:

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
    ("evaluation", "", "Other evaluation methods", "Other evaluation methods", False),
    ("installation", "Section 2", "Installation", "Installation", False),
    ("quickstart", "Section 3", "Quickstart", "Quickstart", False),
    ("concepts", "Section 4", "Core concepts", "Core concepts", False),
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
    current_group = "concepts" if current.startswith("concept-") else current
    groups = [("Background", [("index", "Overview"), (None, "Articulated objects"),
               ("concepts", "Core concepts"), ("evaluation", "Other evaluation methods")]),
              ("Code", [("installation", "Installation"), ("quickstart", "Quickstart"),
               ("api", "API reference"), ("cli", "Command-line usage")])]
    lines = []
    for label, items in groups:
        lines.append(f'<div class="nav-group"><h2 class="nav-group-title">{label}</h2>')
        for slug, text in items:
            if slug is None:
                # The future webbook has no URL or content yet.
                lines.append(f'<span class="nav-placeholder" aria-disabled="true">{text}</span>')
            else:
                active = ' class="active" aria-current="page"' if slug == current_group else ''
                lines.append(f'<a{active} href="{slug}.html">{text}</a>')
        lines.append('</div>')
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


def core_lesson(anchor: str, explanation: str, guide: str) -> str:
    """Keep reading and interactive content visible together."""
    return (
        f'<div class="cc-lesson" data-cc-lesson="{anchor}">\n'
        f'<div class="cc-lesson-panel" id="{anchor}-explanation">{explanation}</div>\n'
        f'<div class="cc-lesson-panel cc-example" id="{anchor}-demo">{guide}</div>\n'
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
            content = core_lesson(anchor, content, core_partial(f"guide-{guides[anchor]}"))
        sections.append(
            f'<section id="{anchor}" class="cc-section" data-cc-section aria-labelledby="{anchor}-title">\n'
            f'<h2 id="{anchor}-title"><span class="cc-section-number">{number}</span>{title}</h2>\n'
            f'{content}\n'
            '<a class="cc-back-map" href="index.html#concept-map">← Concept map in the Overview</a>\n</section>'
        )
    return "\n\n".join(sections)


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
    # Navigation lives in the two persistent sidebar groups.
    return ""


def header_html(slug: str, eyebrow: str, title: str) -> str:
    return f'<h1 class="page-title">{title}</h1>'


def main() -> None:
    layout = (SRC / "_layout.html").read_text(encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    for i, (slug, eyebrow, title, _label, _sub) in enumerate(PAGES):
        fragment = (SRC / f"{FRAGMENT.get(slug, slug)}.html").read_text(encoding="utf-8")
        if slug == "index":
            fragment = fragment.replace("{{core_map}}", core_partial("map"))
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
        if slug in {"index", "concepts", "evaluation"}:
            page_class = {"index": "overview-page", "concepts": "core-concepts-page", "evaluation": "evaluation-page"}[slug]
            page = (page.replace('<body>', f'<body class="aa-learning-page {page_class}">')
                    .replace('</head>', learning_assets(slug == "index") + '</head>')
                    .replace('{{page_contents}}', ''))
        else:
            page = page.replace('{{page_contents}}', '')
        version = hashlib.sha256((ROOT / 'static/css/docs-refinement.css').read_bytes()).hexdigest()[:10]
        page = page.replace('</head>', f'<link rel="stylesheet" href="../static/css/docs-refinement.css?v={version}">\n</head>')
        # Explanatory questions are paragraphs, not collapsed disclosures.
        page = re.sub(r'<details([^>]*)>', lambda m: '<section' + re.sub(r'\s+open(?:="[^"]*")?', '', m[1]) + '>', page)
        page = re.sub(r'<summary>(.*?)</summary>', r'<h4>\1</h4>', page, flags=re.S)
        page = page.replace('</details>', '</section>')
        (OUT / f"{slug}.html").write_text(page, encoding="utf-8")
        print(f"wrote docs/{slug}.html")


if __name__ == "__main__":
    main()
