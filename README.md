# Sanchayan Saha Portfolio

A premium single-page portfolio built as a lightweight static site with all main editable copy stored in JSON.

## Run locally

Because the site loads content from `data/site-content.json`, serve the folder over a local HTTP server instead of opening `index.html` directly.

```bash
cd /home/sanchayan/portfolio
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Edit content

Update profile, hero copy, proof points, services, sample works, influences, and contact info in [data/site-content.json](/home/sanchayan/portfolio/data/site-content.json).

Main editable sections:

- `profile`: name, title, profile highlights
- `photo`: placeholder image path, alt text, and replacement note
- `hero`: lead, summary, CTA labels, stats, and badges
- `positioning`: short self-positioning lines and quote
- `proof`: selected strengths strip
- `about`: heading, intro, body, and quote lines
- `services`: writing categories and service bullets
- `works`: sample or placeholder writing cards
- `influences`: grouped book and influence categories
- `contact`: heading, blurb, email, and availability note

## Change the photo

The current placeholder image lives at [assets/profile-placeholder.svg](/home/sanchayan/portfolio/assets/profile-placeholder.svg).

To replace it:

1. Add your preferred image file to `/home/sanchayan/portfolio/assets/`
2. Update `photo.src` in [data/site-content.json](/home/sanchayan/portfolio/data/site-content.json)

## File structure

- [index.html](/home/sanchayan/portfolio/index.html): page shell and section template
- [styles.css](/home/sanchayan/portfolio/styles.css): glassmorphism theme, layout, components, and motion
- [script.js](/home/sanchayan/portfolio/script.js): JSON loading and UI rendering
- [data/site-content.json](/home/sanchayan/portfolio/data/site-content.json): editable portfolio content
- [assets/profile-placeholder.svg](/home/sanchayan/portfolio/assets/profile-placeholder.svg): placeholder portrait

## Notes

- No build step is required.
- No photo generation or external content fetching is used.
- If you change the JSON schema, update both [script.js](/home/sanchayan/portfolio/script.js) and this README.
