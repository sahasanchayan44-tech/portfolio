# Sanchayan Saha — Portfolio & Cultural Archive

A premium, Swiss-minimalist portfolio and dedicated **Cultural Archive** documenting Sanchayan Saha's intellectual and creative identity: writer, reader, analyst, and cinephile.

---

## Key Modules & Features

### 1. Main Professional Portfolio
- Minimalist Swiss typography, deep Obsidian/Parchment tones, and glassmorphism.
- Sections: Hero, Selected Strengths, About, Writing Services, Selected Works, Influences, and Collaboration Contact.
- Editable via [`data/site-content.json`](./data/site-content.json).

### 2. The Cultural Archive (2D Literary & Cinema Museum)
- **The Literary Journey**:
  - Bengali Literature (heritage, novels, short stories: Tagore, Bibhutibhushan, Sarat Chandra, Manik, Ray, Shirshendu).
  - English & World Literature (Dostoevsky, Kafka, Camus, Orwell, Hemingway).
  - Philosophy & Depth Psychology (Jung, existentialism, moral dilemmas).
  - Faceted real-time search, category filters, and status filters.
  - Interactive **Book Detail Modals** with passages, archival notes, and related works.
- **A Life Through Cinema**:
  - Indian Cinema (Hindi, Bengali, independent, character-driven: *The Lunchbox*, *Maqbool*, *Ludo*, *Manjhi*, *Angrezi Medium*, *Metro... In Dino*).
  - International Cinema (*12 Angry Men*, *Dead Poets Society*, *The Social Network*, *Mank*, *Past Lives*).
  - Animation & Visual Storytelling (*Studio Ghibli*, *WALL-E*, *Kung Fu Panda*, *The Wild Robot*, *Spider-Man*).
  - Interactive **Film Detail Modals** with performances, scenes, and psychological subtext.
- **Cinema & Human Psychology**:
  - Dedicated longform essays on silence, subtext, moral conscience, and reading immersion.
- **Reading & Cinema Journals**:
  - Personal archival journals capturing reflections, passages, and scene analyses.
- **Pantheon of Directors & Performers**:
  - Naseeruddin Shah, Nawazuddin Siddiqui, Aamir Khan, Robert Downey Jr., Jake Gyllenhaal, Jim Carrey, Johnny Depp, Satyajit Ray, Hayao Miyazaki.
- **Cultural Statistics**:
  - Transparently labelled self-reported historical estimates: 400+ books (300+ Bengali, 100+ English, 30+ e-books), >1,000 films over ~8 years (500+ Indian cinema).

### 3. The Interactive 3D World (Eight Locations)
Built with Three.js, featuring smooth camera transitions, raycast hover effects, and interactive object inspection:
1. **The Grand Atrium** (The Intellectual Nexus)
2. **The Observatory** (Scientific Rigor & Analysis)
3. **The Writer's Studio** (Editorial Craft & Prose Architecture)
4. **The Systems Lab** (Technical & Code Fluency)
5. **The Strategy Chamber** (Argumentation & Dialectic Reasoning)
6. **The Gallery of Thinkers** (Foundational Influences)
7. **The Collaboration Pavilion** (Dialogue & Future Partnerships)
8. **THE CULTURAL ARCHIVE** (The Master Module: Interconnected Grand Library & Atmospheric Cinema Room)
   - **The Library Environment**: Towering minimalist bookshelves with glowing spines, floating interactive books, reading tables, and archive terminal.
   - **The Cinema Environment**: Private screening room, cinematic projection surface with gentle light spill, velvet seating, floating film posters, and cinema terminal.

---

## Running Locally

Because the application loads structured JSON content (`data/site-content.json` and `content/archive-manifest.json`), serve the folder over any local HTTP server:

```bash
cd /home/sanchayan/portfolio
python3 -m http.server 4173
```

Then open `http://localhost:4173` in your browser.

---

## Content Management Architecture

Structured static content is organized without any database dependency:

```
content/
├── literature/
│   ├── bengali/          # Bengali novels, heritage, and short stories
│   ├── english/          # English and international literature
│   ├── philosophy/       # Ethics, existentialism, and philosophical fiction
│   └── psychology/       # Human behaviour, identity, and depth psychology
├── cinema/
│   ├── indian/           # Indian cinema across genres and languages
│   ├── international/    # Global character studies and classics
│   ├── animation/        # Studio Ghibli, Pixar, and visual storytelling
│   ├── documentaries/    # Non-fiction and factual cinema
│   ├── directors/        # Filmmaker craft profiles
│   └── actors/           # Admired performers and character studies
├── reading-journal/      # Reading reflections and memorable passages
├── cinema-journal/       # Film reflections, scenes, and performances
├── archive-manifest.json # Consolidated master manifest
└── HOW_TO_ADD_CONTENT.md # Step-by-step contribution guide
```

To add books, films, or journal entries, refer to [`content/HOW_TO_ADD_CONTENT.md`](./content/HOW_TO_ADD_CONTENT.md).

---

## File Structure

- [`index.html`](./index.html): Main page shell, templates, and 2D/3D containers
- [`styles.css`](./styles.css): Swiss typography, glassmorphism, editorial book/poster cards, and 3D HUD
- [`script.js`](./script.js): Main coordinator, profile hydration, and module bootstrapper
- [`cultural-archive.js`](./cultural-archive.js): 2D Cultural Archive controller, search, filters, and detail modals
- [`world-3d.js`](./world-3d.js): Three.js 3D world engine with 8 locations and interactive raycasting
- [`data/site-content.json`](./data/site-content.json): Main professional profile data
- [`content/archive-manifest.json`](./content/archive-manifest.json): Consolidated Cultural Archive data
- [`assets/vendor/three.min.js`](./assets/vendor/three.min.js): Offline local Three.js bundle (with CDN fallback)
