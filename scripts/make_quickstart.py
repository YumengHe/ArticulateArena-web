#!/usr/bin/env python3
"""Generate docs_src/quickstart.html: an expanded quickstart.

Six visible examples cover both norms and all three scopes, reading joints
from URDF files.
The snippets are assembled here from shared pieces, so that every
combination can be executed against the sample data before it is published:

    python scripts/make_quickstart.py --verify /path/to/ArticulateMetrics

writes the fragment and, with --verify, runs all six snippets with the
placeholder URDF paths replaced by files under sample_data/. Rebuild the pages
afterwards with scripts/build_docs.py.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs_src" / "quickstart.html"

NORMS = [("alpha", "E<sub>α</sub> split norm"), ("B", "E<sub>B</sub> kinetic-energy norm")]
SCOPES = [("joint", "One joint: E"), ("phi", "Continuous joints: E<sup>ϕ</sup>"), ("tree", "Whole object: E<sup>tree</sup>")]

# ---------------------------------------------------------------- pieces

def imports(inp: str, norm: str, scope: str) -> str:
    names = ["joint_metric"]
    if inp == "hand":
        names.append("make_endpoint_pair")
    else:
        names += ["load_joint", "joint_to_endpoint_pair"]
    names.append("make_split_norm" if norm == "alpha" else "make_kinetic_energy_norm")
    if norm == "B" and inp == "hand":
        names.append("LinkInertia")
    if scope == "phi":
        names += ["compactified_joint_metric", "continuous_joint_repr", "radial_compactify"]
    if scope == "tree":
        names += ["assignment_tree_distance", "exact_tree_distance"]
    lines = []
    if scope == "phi":
        lines.append("import math")
    lines.append("import numpy as np")
    lines.append("from articulatearena import (")
    for n in sorted(set(names)):
        lines.append(f"    {n},")
    lines.append(")")
    if norm == "B" and inp == "urdf":
        lines.append("# mesh-derived inertia needs the optional extra: pip install \"articulatearena[mesh]\"")
        lines.append("from articulatearena.read.inertia_loader import load_joint_child_inertia")
    return "\n".join(lines)


def inputs(inp: str, scope: str) -> str:
    if inp == "hand":
        s = (
            "xi = np.array([0.0, 0.0, 1.0, 0.0, 0.0, 0.0])   # unit screw twist (omega; nu), a hinge about z\n"
            "gt = make_endpoint_pair(xi, 0.0, 1.0)             # joint limits [a, b] in radians\n"
            "pred = make_endpoint_pair(xi, 0.0, 1.2)           # the prediction opens 0.2 rad too far"
        )
        if scope == "tree":
            s += (
                "\n\nxi2 = np.array([0.0, 0.0, 0.0, 1.0, 0.0, 0.0])  # a drawer sliding along x (prismatic: omega = 0)\n"
                "gt2 = make_endpoint_pair(xi2, 0.0, 0.4)           # limits in meters"
            )
        return s
    s = (
        "# The loader resolves each axis into the world frame by forward kinematics.\n"
        "gt = joint_to_endpoint_pair(load_joint(\"ground_truth.urdf\", \"joint_0\"))\n"
        "pred = joint_to_endpoint_pair(load_joint(\"prediction.urdf\", \"joint_0\"))"
    )
    if scope == "tree":
        s += (
            "\n\n# Every moving joint of each object (fixed joints carry no motion and are left out).\n"
            "gt_joints = [load_joint(\"ground_truth.urdf\", n) for n in (\"joint_0\", \"joint_1\")]\n"
            "pred_joints = [load_joint(\"prediction.urdf\", n) for n in (\"joint_0\", \"joint_1\")]"
        )
    return s


def norm_block(inp: str, norm: str) -> str:
    if norm == "alpha":
        return (
            "# alpha is an inverse length that weighs translation against rotation.\n"
            "# It is injected, never hardcoded. Benchmark default: 1.0 per meter.\n"
            "norm = make_split_norm(alpha=1.0)"
        )
    if inp == "hand":
        return (
            "# (m, c, I) of the moving link, in the same frame as the twists.\n"
            "# E_B then has units of meters: the RMS displacement of the link.\n"
            "link = LinkInertia(mass=1.0, com=np.array([0.3, 0.0, 0.0]), inertia=np.diag([0.1, 0.2, 0.2]))\n"
            "norm = make_kinetic_energy_norm(link)"
        )
    return (
        "# (m, c, I) of the ground-truth child link, computed from its meshes\n"
        "# as a uniform solid. E_B then has units of meters.\n"
        "link = load_joint_child_inertia(\"ground_truth.urdf\", \"joint_0\")\n"
        "norm = make_kinetic_energy_norm(link)"
    )


def scope_block(inp: str, scope: str) -> str:
    if scope == "joint":
        return (
            "E = joint_metric(gt.u.data, gt.v.data, pred.u.data, pred.v.data, norm)\n"
            "print(E)   # 0 exactly when the two joints induce the same motion"
        )
    if scope == "phi":
        cont = (
            "u_c, v_c = continuous_joint_repr(xi, norm)       # a hinge with no limits, same axis"
            if inp == "hand"
            else "cont = load_joint(\"prediction.urdf\", \"lid\")          # a continuous joint: limits are +-inf\n"
                 "u_c, v_c = continuous_joint_repr(cont.xi_hat.data, norm)"
        )
        return (
            "kappa = math.pi   # compactification scale, benchmark default\n"
            "\n"
            "# Two bounded joints: E after mapping all four endpoints into the unit ball.\n"
            "E_phi = compactified_joint_metric(gt.u.data, gt.v.data, pred.u.data, pred.v.data, norm, kappa)\n"
            "\n"
            "# A continuous joint has no finite endpoints. It enters as its antipodal\n"
            "# boundary pair, and the bounded joint is compactified to meet it.\n"
            f"{cont}\n"
            "gt_ball = [radial_compactify(z, kappa, norm) for z in (gt.u.data, gt.v.data)]\n"
            "E_phi_c = joint_metric(*gt_ball, u_c, v_c, norm)\n"
            "print(E_phi, E_phi_c)   # both dimensionless, in [0, 2 * sqrt(2))"
        )
    # tree
    if inp == "hand":
        pairs = (
            "gt_pairs = [(gt.u.data, gt.v.data), (gt2.u.data, gt2.v.data)]\n"
            "pred_pairs = [(pred.u.data, pred.v.data)]        # the prediction missed the drawer"
        )
        edges = (
            "gt_edges = [(\"base\", \"door\", gt_pairs[0]), (\"base\", \"drawer\", gt_pairs[1])]\n"
            "pred_edges = [(\"base\", \"door\", pred_pairs[0])]"
        )
    else:
        pairs = (
            "to_pair = lambda j: (joint_to_endpoint_pair(j).u.data, joint_to_endpoint_pair(j).v.data)\n"
            "gt_pairs = [to_pair(j) for j in gt_joints]\n"
            "pred_pairs = [to_pair(j) for j in pred_joints]"
        )
        edges = (
            "# load_joint returns the joint alone, so name the links of each edge yourself\n"
            "# (the parent and child attributes of the URDF <joint> elements).\n"
            "gt_edges = [(\"base\", \"link_0\", gt_pairs[0]), (\"base\", \"link_1\", gt_pairs[1])]\n"
            "pred_edges = [(\"base\", \"link_0\", pred_pairs[0]), (\"base\", \"link_1\", pred_pairs[1])]"
        )
    return (
        "# Endpoint pairs of every moving joint, all expressed in one common frame.\n"
        f"{pairs}\n"
        "\n"
        "# Assignment relaxation: match joints by E, an unmatched joint pays E(J, J_0),\n"
        "# the cost of contracting it to the fixed joint J_0 = {0, 0}.\n"
        "D = assignment_tree_distance(gt_pairs, pred_pairs, norm)\n"
        "\n"
        "# Exact tree edit distance over (parent, child, pair) edges. `certified` is True\n"
        "# when the relaxation already found an isomorphism of the trees (the common case).\n"
        f"{edges}\n"
        "D_exact, certified = exact_tree_distance(gt_edges, pred_edges, norm)\n"
        "print(D, D_exact, certified)"
    )


def snippet(inp: str, norm: str, scope: str) -> str:
    return "\n\n".join([imports(inp, norm, scope), inputs(inp, scope), norm_block(inp, norm), scope_block(inp, scope)]) + "\n"


# ---------------------------------------------------------------- verification

def verify(repo: Path) -> None:
    sub = {
        "\"ground_truth.urdf\"": "\"sample_data/45168/mobility.urdf\"",
        "\"prediction.urdf\", \"lid\"": "\"sample_data/3380/mobility.urdf\", \"joint_0\"",
        "\"prediction.urdf\"": "\"sample_data/45168/mobility_0_limit.urdf\"",
    }
    env = dict(os.environ, PYTHONPATH=str(repo / "src"))
    failures = []
    for n, _ in NORMS:
        for s, _ in SCOPES:
            code = snippet("urdf", n, s)
            for k, v in sub.items():
                code = code.replace(k, v)
            with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as fh:
                fh.write(code)
                path = fh.name
            r = subprocess.run([sys.executable, path], cwd=repo, env=env, capture_output=True, text=True)
            tag = f"{n}-{s}"
            if r.returncode != 0:
                failures.append(tag)
                print(f"FAIL {tag}\n{r.stderr[-800:]}")
            else:
                print(f"ok   {tag}: {r.stdout.strip()}")
            os.unlink(path)
    if failures:
        sys.exit(f"{len(failures)} snippet(s) failed: {failures}")


# ---------------------------------------------------------------- fragment

def expanded_fragment() -> str:
    parts = ['<p>Each example reads joints from URDF files. Replace the two file paths and joint names with your own. For other formats, use <code>screw_twist</code> and <code>make_endpoint_pair</code>; see the <a href="api.html">API reference</a>.</p>']
    parts.append('<nav class="example-index" aria-label="Quickstart examples">')
    for n, label in NORMS:
        for scope, scope_label in SCOPES:
            parts.append(f'<a href="#example-{n}-{scope}">{label} · {scope_label}</a>')
    parts.append('</nav>')
    for n, label in NORMS:
        for scope, scope_label in SCOPES:
            key = f"{n}-{scope}"
            code = html.escape(snippet("urdf", n, scope))
            parts.append(f'<section class="qs-example" id="example-{key}"><h2>{label} · {scope_label}</h2><div class="qs-codebar"><button type="button" class="qs-copy" data-copy="code-{key}">Copy code</button></div><pre><code id="code-{key}">{code}</code></pre></section>')
    parts.append("""<script>
    document.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
          button.textContent = 'Copied';
        } catch { button.textContent = 'Select code to copy'; }
      });
    });
    </script>""")
    return "\n".join(parts) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--verify", type=Path, default=None, help="ArticulateMetrics repo root to run the snippets in")
    args = ap.parse_args()
    if args.verify:
        verify(args.verify.resolve())
    OUT.write_text(expanded_fragment(), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} with six expanded snippets")


if __name__ == "__main__":
    main()
