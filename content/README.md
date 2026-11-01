# Content Architecture & Schema Specification

This directory holds the static, human-readable content collections for **The Cultural Archive: Literature, Cinema, Reading and Human Experience**.

## Directory Structure

```
content/
├── literature/
│   ├── bengali/        # Bengali literary heritage, novels, short stories
│   ├── english/        # English fiction, world literature, classics
│   ├── philosophy/     # Philosophical inquiries, ethics, existentialism
│   └── psychology/     # Human behaviour, emotion, relationships, identity
├── cinema/
│   ├── indian/         # Hindi, Bengali, independent, and regional cinema
│   ├── international/  # Global cinema, character studies, psychological drama
│   ├── animation/      # Studio Ghibli, Pixar, visual storytelling
│   ├── documentaries/  # Factual and non-fiction cinema
│   ├── directors/      # Filmmaker profiles and artistic visions
│   └── actors/         # Admired performers, character craft
├── reading-journal/    # Personal reading notes, reflections, passages
├── cinema-journal/     # Film reflections, scenes, performances, themes
├── archive-manifest.json # Consolidated fast-loading static dataset
└── HOW_TO_ADD_CONTENT.md # Step-by-step editing guide
```

## Guiding Principles

1. **Qualitative Immersion Over Pure Metrics**: Reading and cinema are treated as intellectual foundations and emotional experiences, not speed-reading or list-ticking.
2. **Honesty & Integrity**: No ratings, dates, or reviews are fabricated. Fields not yet specified remain null or omitted.
3. **Lightweight & Static**: Pure JSON/Markdown without any database dependency.
