# ArticulateArena-web
## Documentation pages

The documentation under `docs/` is generated. Edit the fragments in `docs_src/` (one file per page, `_layout.html` is the shared frame), then rebuild and commit the output:

```bash
python scripts/build_docs.py
```

`docs.html` only redirects old links to the new pages.
