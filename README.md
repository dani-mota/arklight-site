# Project Arklight

Website for Project Arklight — Evolving the American Workforce for the Era of AI, Robotics, and National Security.

## Structure

```
public/
  index.html        # Homepage
  arklight.html     # Investor presentation (full deck)
  harvard.png       # Logo assets
  stanford.png
  fbi.png
  army.svg
  war.png
```

## Deploy

This is a static site. Deploy to Vercel, Netlify, or any static host.

### Vercel (recommended)
1. Connect this repo to [vercel.com](https://vercel.com)
2. Set **Output Directory** to `public`
3. Add your domain (arklight.us) in Project Settings > Domains
4. Update DNS as instructed

### Local development
```bash
cd public
npx serve .
```
