# Project Arklight

The live site is published at [arklight.us](https://www.arklight.us).

## Structure

```
public/                  Current site. Vercel deploys this directory.
archive/legacy-site/     Previous marketing site, kept for reference.
api/                     Data room functions. Not part of the public marketing site.
```

## Local preview

```bash
python3 -m http.server 8770 --bind 127.0.0.1 --directory public
```
