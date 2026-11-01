# How to Add Books, Films, and Journal Entries

The Cultural Archive is designed to be easily updated by editing JSON or Markdown files without needing any database or backend server.

---

## 1. Adding a Book

In `content/literature/<category>/<book-slug>.json` (or by appending to `content/archive-manifest.json`):

```json
{
  "id": "book-slug",
  "title": "Title of the Book",
  "author": "Author Name",
  "originalLanguage": "Bengali", 
  "category": "bengali", 
  "genre": ["Literary Fiction", "Classic"],
  "status": "read", 
  "readingDate": null, 
  "personalRating": null, 
  "personalReview": null, 
  "notes": "Personal thoughts on themes, prose, or characters.",
  "memorablePassages": [
    "A memorable quote or passage from the book."
  ],
  "coverPalette": "deep-indigo", 
  "relatedBooks": ["another-book-id"],
  "isFavourite": true
}
```

*Valid categories:* `bengali`, `english`, `philosophy`, `psychology`
*Valid statuses:* `read`, `currently-reading`, `want-to-read`

---

## 2. Adding a Film

In `content/cinema/<category>/<film-slug>.json`:

```json
{
  "id": "film-slug",
  "title": "Title of the Film",
  "director": "Director Name",
  "releaseYear": 2023,
  "country": "India",
  "language": "Hindi",
  "category": "indian",
  "genre": ["Psychological Drama", "Character Study"],
  "viewingStatus": "watched",
  "dateWatched": null,
  "personalRating": null,
  "review": null,
  "favouriteScene": "Optional scene description",
  "favouritePerformance": "Actor Name",
  "themes": ["Loneliness", "Human Connection", "Identity"],
  "personalReflections": "Personal notes on how the film resonated.",
  "posterPalette": "warm-amber",
  "isFavourite": true
}
```

*Valid categories:* `indian`, `international`, `animation`, `documentaries`
*Valid statuses:* `watched`, `rewatched`, `watchlist`

---

## 3. Adding a Journal Entry

In `content/reading-journal/` or `content/cinema-journal/`:

```json
{
  "id": "journal-entry-1",
  "type": "reading",
  "itemTitle": "Pather Panchali",
  "authorOrDirector": "Bibhutibhushan Bandyopadhyay",
  "date": "2026-10",
  "heading": "On Rural Wonder and the Geometry of Loss",
  "content": "Reflections on narrative rhythm, childhood observation, and emotional texture...",
  "tags": ["Bengali Heritage", "Realism", "Nostalgia"]
}
```

---

## 4. Updating Historical Statistics

Statistics are defined in `content/archive-manifest.json` under `"statistics"`.
Update the numbers directly as your reading and viewing journeys continue.
All numbers will automatically display the transparent `Self-Reported Historical Estimate` tag.
