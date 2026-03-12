# Sanchayan Saha Portfolio

A polished single-page personal portfolio built as a lightweight static site.

## Run locally

Because the site loads content from `data/site-content.json`, serve the folder over a local HTTP server instead of opening `index.html` directly.

```bash
cd /home/sanchayan/portfolio
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Edit content

Update profile and copy in [`data/site-content.json`](/home/sanchayan/portfolio/data/site-content.json).

You can edit:

- name, title, age, and hero text
- education, achievements, and writing focus
- influence cards and highlighted authors
- skills, stats, and contact details

## Change the photo

The current placeholder image lives at [`assets/profile-placeholder.svg`](/home/sanchayan/portfolio/assets/profile-placeholder.svg).

To replace it:

1. Add your preferred image file to `/home/sanchayan/portfolio/assets/`
2. Update `photo.src` in [`data/site-content.json`](/home/sanchayan/portfolio/data/site-content.json)

## File structure

- [`index.html`](/home/sanchayan/portfolio/index.html): page shell
- [`styles.css`](/home/sanchayan/portfolio/styles.css): theme, layout, animation, and component styling
- [`script.js`](/home/sanchayan/portfolio/script.js): data loading and rendering
- [`data/site-content.json`](/home/sanchayan/portfolio/data/site-content.json): editable content
- [`assets/profile-placeholder.svg`](/home/sanchayan/portfolio/assets/profile-placeholder.svg): editable image placeholder

## Notes

- No build step is required.
- No paid services or external API keys are used.
