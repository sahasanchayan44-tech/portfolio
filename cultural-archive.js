/**
 * The Cultural Archive: Literature, Cinema, Reading and Human Experience
 * Master Module JavaScript Controller
 * Sanchayan Saha Portfolio
 */

export class CulturalArchive {
  constructor(options = {}) {
    this.manifestUrl = options.manifestUrl || "./content/archive-manifest.json";
    this.container = options.container || document.querySelector("#cultural-archive-root");
    this.data = null;
    this.activeTab = "literature";
    this.literatureFilter = "all";
    this.literatureStatus = "all";
    this.cinemaFilter = "all";
    this.cinemaStatus = "all";
    this.searchQuery = "";
    this.sortBy = "default";
    this.modalEl = null;
    this.onItemSelect = options.onItemSelect || null;
  }

  async init() {
    try {
      const res = await fetch(this.manifestUrl);
      if (!res.ok) throw new Error("Could not load archive manifest");
      this.data = await res.json();
      this.setupModal();
      this.render();
      this.bindEvents();
      return this.data;
    } catch (err) {
      console.warn("Using fallback cultural archive data:", err);
      // If fetch fails in file:// mode, provide inline fallback data
      return null;
    }
  }

  setupModal() {
    let modal = document.querySelector("#archive-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "archive-detail-modal";
      modal.className = "archive-modal glass";
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML = `
        <div class="archive-modal-backdrop"></div>
        <div class="archive-modal-dialog premium-panel">
          <button class="archive-modal-close" aria-label="Close modal">&times;</button>
          <div class="archive-modal-content"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector(".archive-modal-close").addEventListener("click", () => this.closeModal());
      modal.querySelector(".archive-modal-backdrop").addEventListener("click", () => this.closeModal());
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
          this.closeModal();
        }
      });
    }
    this.modalEl = modal;
  }

  openBookModal(book) {
    if (!this.modalEl) this.setupModal();
    const content = this.modalEl.querySelector(".archive-modal-content");
    const statusLabel = book.status === "read" ? "Completed Reading" : (book.status === "currently-reading" ? "Currently Reading" : "Want to Read");
    const passagesHtml = book.memorablePassages && book.memorablePassages.length
      ? `
        <div class="modal-section">
          <h4>Memorable Passage</h4>
          <blockquote class="modal-quote">"${book.memorablePassages.join('"<br/>"')}"</blockquote>
        </div>
      `
      : "";

    const relatedHtml = book.relatedBooks && book.relatedBooks.length
      ? `
        <div class="modal-section">
          <h4>Related Works in Archive</h4>
          <div class="related-pills">
            ${book.relatedBooks.map(relId => {
              const rel = (this.data?.books || []).find(b => b.id === relId);
              return rel ? `<span class="badge related-pill" data-open-book="${rel.id}">${rel.title}</span>` : "";
            }).join("")}
          </div>
        </div>
      `
      : "";

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-badge-row">
          <span class="badge status-pill">${statusLabel}</span>
          <span class="badge language-pill">${book.originalLanguage}</span>
          <span class="badge category-pill">${book.category.toUpperCase()}</span>
          ${book.isFavourite ? `<span class="badge favourite-pill">★ Core Archive</span>` : ""}
        </div>
        <h2 class="modal-title">${book.title}</h2>
        <p class="modal-subtitle">By <strong>${book.author}</strong></p>
      </div>

      <div class="modal-body">
        <div class="modal-genres">
          ${book.genre.map(g => `<span class="skill-pill">${g}</span>`).join(" ")}
        </div>

        ${book.notes ? `
          <div class="modal-section">
            <h4>Archival Notes & Interpretation</h4>
            <p class="modal-prose">${book.notes}</p>
          </div>
        ` : ""}

        ${passagesHtml}

        ${book.personalReview ? `
          <div class="modal-section">
            <h4>Personal Reflection</h4>
            <p class="modal-prose">${book.personalReview}</p>
          </div>
        ` : ""}

        ${book.personalRating ? `
          <div class="modal-section meta-row">
            <span class="meta-label">Personal Rating:</span>
            <span class="meta-value">${"★".repeat(book.personalRating)}${"☆".repeat(5 - book.personalRating)}</span>
          </div>
        ` : ""}

        ${book.readingDate ? `
          <div class="modal-section meta-row">
            <span class="meta-label">Reading Date:</span>
            <span class="meta-value">${book.readingDate}</span>
          </div>
        ` : ""}

        ${relatedHtml}

        <div class="modal-footer">
          <p class="disclaimer-note">Catalogued within Sanchayan Saha's Personal Cultural Archive. No review or rating is generated without personal submission.</p>
        </div>
      </div>
    `;

    // Bind related book pill clicks
    content.querySelectorAll("[data-open-book]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetBook = (this.data?.books || []).find(b => b.id === btn.dataset.openBook);
        if (targetBook) this.openBookModal(targetBook);
      });
    });

    this.modalEl.classList.add("is-open");
    this.modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  openFilmModal(film) {
    if (!this.modalEl) this.setupModal();
    const content = this.modalEl.querySelector(".archive-modal-content");
    const statusLabel = film.viewingStatus === "watched" ? "Watched" : (film.viewingStatus === "rewatched" ? "Rewatched Multiple Times" : "In Watchlist");

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-badge-row">
          <span class="badge status-pill">${statusLabel}</span>
          ${film.releaseYear ? `<span class="badge year-pill">${film.releaseYear}</span>` : ""}
          ${film.country ? `<span class="badge country-pill">${film.country}</span>` : ""}
          ${film.language ? `<span class="badge language-pill">${film.language}</span>` : ""}
          ${film.isFavourite ? `<span class="badge favourite-pill">★ Core Archive</span>` : ""}
        </div>
        <h2 class="modal-title">${film.title}</h2>
        ${film.director ? `<p class="modal-subtitle">Directed by <strong>${film.director}</strong></p>` : ""}
      </div>

      <div class="modal-body">
        <div class="modal-genres">
          ${film.genre.map(g => `<span class="skill-pill">${g}</span>`).join(" ")}
        </div>

        ${film.themes && film.themes.length ? `
          <div class="modal-section">
            <h4>Core Psychological & Human Themes</h4>
            <div class="theme-tags">
              ${film.themes.map(t => `<span class="badge theme-pill">${t}</span>`).join(" ")}
            </div>
          </div>
        ` : ""}

        ${film.favouritePerformance ? `
          <div class="modal-section">
            <h4>Notable Performance</h4>
            <p class="modal-highlight">${film.favouritePerformance}</p>
          </div>
        ` : ""}

        ${film.favouriteScene ? `
          <div class="modal-section">
            <h4>Memorable Scene or Sequence</h4>
            <p class="modal-prose">${film.favouriteScene}</p>
          </div>
        ` : ""}

        ${film.personalReflections ? `
          <div class="modal-section">
            <h4>Personal Reflection & Subtext</h4>
            <p class="modal-prose">${film.personalReflections}</p>
          </div>
        ` : ""}

        ${film.review ? `
          <div class="modal-section">
            <h4>Review</h4>
            <p class="modal-prose">${film.review}</p>
          </div>
        ` : ""}

        ${film.personalRating ? `
          <div class="modal-section meta-row">
            <span class="meta-label">Personal Rating:</span>
            <span class="meta-value">${"★".repeat(film.personalRating)}${"☆".repeat(5 - film.personalRating)}</span>
          </div>
        ` : ""}

        ${film.dateWatched ? `
          <div class="modal-section meta-row">
            <span class="meta-label">Date Watched:</span>
            <span class="meta-value">${film.dateWatched}</span>
          </div>
        ` : ""}

        <div class="modal-footer">
          <p class="disclaimer-note">Part of Sanchayan Saha's Life Through Cinema archive (>1,000 films explored over ~8 years). Viewing dates and ratings are only included when supplied.</p>
        </div>
      </div>
    `;

    this.modalEl.classList.add("is-open");
    this.modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove("is-open");
      this.modalEl.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  render() {
    if (!this.container || !this.data) return;

    this.container.innerHTML = `
      <section class="cultural-archive-wrapper" id="cultural-archive">
        <!-- Archival Header & Hero -->
        <div class="archive-header-panel glass premium-panel">
          <div class="archive-kicker-row">
            <span class="eyebrow">Master Module — Extension of Intellectual Profile</span>
            <span class="badge archival-badge">Curated Archive</span>
          </div>
          <h1 class="archive-main-title">The Cultural Archive</h1>
          <p class="archive-lead">Literature, Cinema, Reading and Human Experience</p>
          <p class="archive-summary">
            A dedicated sanctuary documenting my journey through books, cinema, storytelling, philosophy, psychology, and the human condition. 
            Conceived as a literary museum, personal digital library, cinema journal, and intellectual research space.
          </p>

          <!-- Statistics Dashboard -->
          <div class="archive-stats-dashboard">
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.totalBooks}</strong>
              <span class="stat-label">Total Books Read</span>
              <p class="stat-detail">Historical estimate across Bengali and world literature</p>
            </div>
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.bengaliBooks}</strong>
              <span class="stat-label">Bengali Literature</span>
              <p class="stat-detail">Tagore, Bibhutibhushan, Sarat Chandra, Manik, Ray</p>
            </div>
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.englishBooks}</strong>
              <span class="stat-label">English & World</span>
              <p class="stat-detail">Dostoevsky, Kafka, Camus, Orwell, psychology, essays</p>
            </div>
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.ebooks}</strong>
              <span class="stat-label">E-Books</span>
              <p class="stat-detail">Digital editions & longform research</p>
            </div>
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.totalFilms}</strong>
              <span class="stat-label">Films Watched</span>
              <p class="stat-detail">Approx. viewing history over ${this.data.statistics.yearsCinemaJourney}</p>
            </div>
            <div class="stat-card">
              <strong class="stat-number">${this.data.statistics.indianFilms}</strong>
              <span class="stat-label">Indian Cinema</span>
              <p class="stat-detail">Hindi, Bengali, independent & character-driven dramas</p>
            </div>
          </div>

          <div class="archive-disclaimer-strip">
            <span class="badge subtle-badge">Methodology</span>
            <p>${this.data.statistics.disclaimer}</p>
          </div>

          <!-- Dual Philosophy Callout -->
          <div class="philosophy-grid">
            <div class="philosophy-card">
              <h3>The Reading Approach</h3>
              <p>${this.data.manifesto.readingPhilosophy}</p>
            </div>
            <div class="philosophy-card">
              <h3>The Cinema Approach</h3>
              <p>${this.data.manifesto.cinemaPhilosophy}</p>
            </div>
          </div>
        </div>

        <!-- 3D World Gateway Banner -->
        <div class="gateway-3d-banner glass premium-panel">
          <div class="gateway-3d-copy">
            <span class="eyebrow">Interactive Spatial Experience</span>
            <h2>Location 8: The Cultural Archive in 3D</h2>
            <p>
              Step into the monumental architectural twin environments of <strong>The Library</strong> and <strong>The Cinema</strong> inside the interactive 3D World. Interact directly with floating books, cinema projections, and archive terminals.
            </p>
          </div>
          <div class="gateway-3d-action">
            <a href="#3d-world" class="button button-primary" id="btn-launch-3d-from-archive">
              <span>Launch 3D Cultural Archive</span>
              <span class="arrow-indicator">→</span>
            </a>
          </div>
        </div>

        <!-- Archive Navigation Tabs -->
        <div class="archive-nav-bar glass">
          <div class="archive-tabs">
            <button class="archive-tab-btn ${this.activeTab === 'literature' ? 'active' : ''}" data-tab="literature">
              The Literary Journey
            </button>
            <button class="archive-tab-btn ${this.activeTab === 'cinema' ? 'active' : ''}" data-tab="cinema">
              A Life Through Cinema
            </button>
            <button class="archive-tab-btn ${this.activeTab === 'psychology' ? 'active' : ''}" data-tab="psychology">
              Cinema & Psychology
            </button>
            <button class="archive-tab-btn ${this.activeTab === 'journals' ? 'active' : ''}" data-tab="journals">
              Reading & Cinema Journals
            </button>
            <button class="archive-tab-btn ${this.activeTab === 'pantheon' ? 'active' : ''}" data-tab="pantheon">
              Directors & Actors
            </button>
          </div>

          <!-- Quick Search & Control Row -->
          <div class="archive-search-box">
            <input 
              type="search" 
              id="archive-search-input" 
              placeholder="Search titles, authors, directors, themes..." 
              value="${this.escapeHtml(this.searchQuery)}"
            />
          </div>
        </div>

        <!-- Main Tab Content Container -->
        <div class="archive-tab-content">
          ${this.renderActiveTabContent()}
        </div>
      </section>
    `;

    this.bindTabEvents();
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  renderActiveTabContent() {
    switch (this.activeTab) {
      case "literature":
        return this.renderLiteratureSection();
      case "cinema":
        return this.renderCinemaSection();
      case "psychology":
        return this.renderPsychologySection();
      case "journals":
        return this.renderJournalsSection();
      case "pantheon":
        return this.renderPantheonSection();
      default:
        return this.renderLiteratureSection();
    }
  }

  renderLiteratureSection() {
    let books = this.data.books || [];

    // Filter by Category
    if (this.literatureFilter !== "all") {
      books = books.filter(b => b.category === this.literatureFilter);
    }

    // Filter by Status
    if (this.literatureStatus === "favourites") {
      books = books.filter(b => b.isFavourite);
    } else if (this.literatureStatus !== "all") {
      books = books.filter(b => b.status === this.literatureStatus);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      books = books.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre && b.genre.some(g => g.toLowerCase().includes(q))) ||
        (b.notes && b.notes.toLowerCase().includes(q))
      );
    }

    return `
      <div class="tab-pane literature-pane">
        <!-- Sub-filter pills -->
        <div class="filter-controls-row">
          <div class="filter-group">
            <span class="filter-label">Collection:</span>
            <button class="filter-pill ${this.literatureFilter === 'all' ? 'active' : ''}" data-lit-cat="all">All Literature</button>
            <button class="filter-pill ${this.literatureFilter === 'bengali' ? 'active' : ''}" data-lit-cat="bengali">Bengali (300+)</button>
            <button class="filter-pill ${this.literatureFilter === 'english' ? 'active' : ''}" data-lit-cat="english">English & World (100+)</button>
            <button class="filter-pill ${this.literatureFilter === 'philosophy' ? 'active' : ''}" data-lit-cat="philosophy">Philosophy</button>
            <button class="filter-pill ${this.literatureFilter === 'psychology' ? 'active' : ''}" data-lit-cat="psychology">Psychology</button>
          </div>

          <div class="filter-group">
            <span class="filter-label">Status:</span>
            <button class="filter-pill ${this.literatureStatus === 'all' ? 'active' : ''}" data-lit-status="all">All</button>
            <button class="filter-pill ${this.literatureStatus === 'read' ? 'active' : ''}" data-lit-status="read">Read</button>
            <button class="filter-pill ${this.literatureStatus === 'favourites' ? 'active' : ''}" data-lit-status="favourites">★ Core Works</button>
          </div>
        </div>

        <!-- Section Introduction -->
        <div class="collection-intro">
          <p>
            Showing <strong>${books.length}</strong> catalogued items in this collection.
            Click any book to read detailed notes, themes, excerpts, and translation context.
          </p>
        </div>

        <!-- Books Grid -->
        <div class="books-catalogue-grid">
          ${books.length ? books.map(b => this.renderBookCard(b)).join("") : `
            <div class="empty-state glass">
              <p>No books found matching "${this.escapeHtml(this.searchQuery)}". Try another search or filter.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderBookCard(book) {
    const paletteClass = `palette-${book.coverPalette || 'slate'}`;
    return `
      <article class="book-card glass premium-panel ${paletteClass}" data-book-id="${book.id}">
        <div class="book-cover-mockup">
          <div class="book-spine"></div>
          <div class="book-face">
            <div class="book-cover-top">
              <span class="cover-lang">${book.originalLanguage}</span>
              ${book.isFavourite ? `<span class="cover-star">★</span>` : ""}
            </div>
            <h3 class="cover-title">${book.title}</h3>
            <p class="cover-author">${book.author}</p>
            <div class="book-cover-bottom">
              <span class="cover-badge">${book.category.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="book-info">
          <div class="book-meta-top">
            <span class="badge subtle-badge">${book.status === 'read' ? 'Completed' : 'Reading'}</span>
            <span class="badge subtle-badge">${book.originalLanguage}</span>
          </div>
          <h3 class="book-card-title">${book.title}</h3>
          <p class="book-card-author">By ${book.author}</p>
          <div class="book-genres">
            ${book.genre.slice(0, 2).map(g => `<span class="badge subtle-badge">${g}</span>`).join(" ")}
          </div>
          ${book.notes ? `<p class="book-preview-notes">${book.notes.slice(0, 120)}...</p>` : ""}
          <div class="book-card-action">
            <button class="card-detail-btn" data-book-id="${book.id}">Inspect Work & Notes →</button>
          </div>
        </div>
      </article>
    `;
  }

  renderCinemaSection() {
    let films = this.data.films || [];

    // Filter by Category
    if (this.cinemaFilter !== "all") {
      films = films.filter(f => f.category === this.cinemaFilter);
    }

    // Filter by Status
    if (this.cinemaStatus === "favourites") {
      films = films.filter(f => f.isFavourite);
    } else if (this.cinemaStatus !== "all") {
      films = films.filter(f => f.viewingStatus === this.cinemaStatus);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      films = films.filter(f => 
        f.title.toLowerCase().includes(q) ||
        (f.director && f.director.toLowerCase().includes(q)) ||
        (f.genre && f.genre.some(g => g.toLowerCase().includes(q))) ||
        (f.themes && f.themes.some(t => t.toLowerCase().includes(q))) ||
        (f.personalReflections && f.personalReflections.toLowerCase().includes(q))
      );
    }

    return `
      <div class="tab-pane cinema-pane">
        <!-- Sub-filter pills -->
        <div class="filter-controls-row">
          <div class="filter-group">
            <span class="filter-label">Collection:</span>
            <button class="filter-pill ${this.cinemaFilter === 'all' ? 'active' : ''}" data-cin-cat="all">All Cinema</button>
            <button class="filter-pill ${this.cinemaFilter === 'indian' ? 'active' : ''}" data-cin-cat="indian">Indian Cinema (500+)</button>
            <button class="filter-pill ${this.cinemaFilter === 'international' ? 'active' : ''}" data-cin-cat="international">International Cinema</button>
            <button class="filter-pill ${this.cinemaFilter === 'animation' ? 'active' : ''}" data-cin-cat="animation">Animation & Ghibli</button>
          </div>

          <div class="filter-group">
            <span class="filter-label">Viewing:</span>
            <button class="filter-pill ${this.cinemaStatus === 'all' ? 'active' : ''}" data-cin-status="all">All</button>
            <button class="filter-pill ${this.cinemaStatus === 'watched' ? 'active' : ''}" data-cin-status="watched">Watched</button>
            <button class="filter-pill ${this.cinemaStatus === 'favourites' ? 'active' : ''}" data-cin-status="favourites">★ Core Works</button>
          </div>
        </div>

        <!-- Section Introduction -->
        <div class="collection-intro">
          <p>
            Showing <strong>${films.length}</strong> curated film studies.
            Approached without advance plot preconceptions—emphasizing performances, human complexity, and atmospheric subtext.
          </p>
        </div>

        <!-- Films Grid -->
        <div class="films-catalogue-grid">
          ${films.length ? films.map(f => this.renderFilmCard(f)).join("") : `
            <div class="empty-state glass">
              <p>No films found matching "${this.escapeHtml(this.searchQuery)}". Try another search or filter.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderFilmCard(film) {
    const paletteClass = `poster-${film.posterPalette || 'noir'}`;
    return `
      <article class="film-card glass premium-panel ${paletteClass}" data-film-id="${film.id}">
        <div class="film-poster-mockup">
          <div class="film-letterbox-top"></div>
          <div class="film-poster-content">
            <span class="poster-cat">${film.category.toUpperCase()}</span>
            <h3 class="poster-title">${film.title}</h3>
            ${film.director ? `<p class="poster-director">${film.director}</p>` : ""}
            <div class="poster-meta">
              <span>${film.releaseYear || ''}</span>
              <span>${film.country || ''}</span>
            </div>
          </div>
          <div class="film-letterbox-bottom"></div>
        </div>

        <div class="film-info">
          <div class="film-meta-top">
            <span class="badge subtle-badge">${film.releaseYear || ''}</span>
            <span class="badge subtle-badge">${film.country || ''}</span>
            ${film.isFavourite ? `<span class="badge subtle-badge">★ Essential</span>` : ""}
          </div>
          <h3 class="film-card-title">${film.title}</h3>
          ${film.director ? `<p class="film-card-director">Dir. ${film.director}</p>` : ""}
          
          <div class="film-themes-preview">
            ${(film.themes || []).slice(0, 3).map(t => `<span class="badge theme-pill">${t}</span>`).join(" ")}
          </div>

          ${film.favouritePerformance ? `
            <p class="film-perf-highlight"><strong>Key Performance:</strong> ${film.favouritePerformance}</p>
          ` : ""}

          <div class="film-card-action">
            <button class="card-detail-btn" data-film-id="${film.id}">Inspect Film & Subtext →</button>
          </div>
        </div>
      </article>
    `;
  }

  renderPsychologySection() {
    const essays = this.data.psychologyEssays || [];
    return `
      <div class="tab-pane psychology-pane">
        <div class="collection-intro">
          <h2>Cinema, Literature and Human Psychology</h2>
          <p>
            Written reflections exploring character psychology, loneliness, emotional storytelling, moral dilemmas, identity, and the architecture of human relationships.
          </p>
        </div>

        <div class="essays-stack">
          ${essays.map(essay => `
            <article class="essay-card glass premium-panel">
              <div class="essay-header">
                <div class="essay-badges">
                  <span class="badge subtle-badge">${essay.category}</span>
                  ${essay.themes.map(t => `<span class="badge theme-pill">${t}</span>`).join(" ")}
                </div>
                <h3 class="essay-title">${essay.title}</h3>
                <p class="essay-subtitle">${essay.subtitle}</p>
              </div>
              <div class="essay-body">
                <p class="essay-prose">${essay.excerpt}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  renderJournalsSection() {
    const readingEntries = this.data.journals?.reading || [];
    const cinemaEntries = this.data.journals?.cinema || [];

    return `
      <div class="tab-pane journals-pane">
        <div class="journals-grid">
          <!-- Reading Journal -->
          <div class="journal-column">
            <div class="column-header">
              <span class="eyebrow">The Reading Journal</span>
              <h2>Literary Notes & Passages</h2>
              <p>Personal reflections on narrative architecture, translation texture, and recurring philosophical themes.</p>
            </div>
            <div class="journal-entries-list">
              ${readingEntries.map(entry => `
                <article class="journal-entry glass premium-panel">
                  <div class="entry-meta">
                    <span class="badge subtle-badge">${entry.type}</span>
                    <span class="entry-date">${entry.date}</span>
                  </div>
                  <h3 class="entry-title">${entry.title}</h3>
                  <p class="entry-author">Re: <em>${entry.author}</em></p>
                  <p class="entry-content">${entry.reflection}</p>
                </article>
              `).join("")}
            </div>
          </div>

          <!-- Cinema Journal -->
          <div class="journal-column">
            <div class="column-header">
              <span class="eyebrow">The Cinema Journal</span>
              <h2>Visual Subtext & Performances</h2>
              <p>Observations on framing, silent moments, pacing, and human vulnerability captured in moving pictures.</p>
            </div>
            <div class="journal-entries-list">
              ${cinemaEntries.map(entry => `
                <article class="journal-entry glass premium-panel">
                  <div class="entry-meta">
                    <span class="badge subtle-badge">${entry.focus}</span>
                    <span class="entry-date">${entry.date}</span>
                  </div>
                  <h3 class="entry-title">${entry.filmTitle}</h3>
                  <p class="entry-author">Dir. <em>${entry.director}</em></p>
                  <p class="entry-content">${entry.reflection}</p>
                </article>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPantheonSection() {
    const figures = this.data.performersAndDirectors || [];
    return `
      <div class="tab-pane pantheon-pane">
        <div class="collection-intro">
          <h2>Directors, Actors and Performances</h2>
          <p>
            Performers and creators who exemplify emotional honesty, moral complexity, and physical craft without manufactured spectacle.
            No automated ratings or unsolicited opinions are applied.
          </p>
        </div>

        <div class="pantheon-grid">
          ${figures.map(person => `
            <article class="pantheon-card glass premium-panel">
              <div class="pantheon-header">
                <span class="badge subtle-badge">${person.type.toUpperCase()}</span>
                <h3 class="pantheon-name">${person.name}</h3>
                <p class="pantheon-tradition">${person.primaryTradition}</p>
              </div>
              <div class="pantheon-body">
                <p class="pantheon-qualities"><strong>Admired Qualities:</strong> ${person.admiredQualities}</p>
                <div class="pantheon-works">
                  <span class="works-label">Noted Works in Journey:</span>
                  <div class="works-pills">
                    ${person.notableMentions.map(w => `<span class="badge related-pill">${w}</span>`).join(" ")}
                  </div>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Search input live filtering
    const searchInput = document.querySelector("#archive-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
        }
      });
    }

    this.bindCardClicks();
  }

  bindTabEvents() {
    // Tab switching
    document.querySelectorAll(".archive-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.dataset.tab;
        document.querySelectorAll(".archive-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
          this.bindSubFilterEvents();
        }
      });
    });

    this.bindSubFilterEvents();
    this.bindCardClicks();
  }

  bindSubFilterEvents() {
    // Literature Category filters
    document.querySelectorAll("[data-lit-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.literatureFilter = btn.dataset.litCat;
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
          this.bindSubFilterEvents();
        }
      });
    });

    // Literature Status filters
    document.querySelectorAll("[data-lit-status]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.literatureStatus = btn.dataset.litStatus;
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
          this.bindSubFilterEvents();
        }
      });
    });

    // Cinema Category filters
    document.querySelectorAll("[data-cin-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.cinemaFilter = btn.dataset.cinCat;
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
          this.bindSubFilterEvents();
        }
      });
    });

    // Cinema Status filters
    document.querySelectorAll("[data-cin-status]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.cinemaStatus = btn.dataset.cinStatus;
        const container = document.querySelector(".archive-tab-content");
        if (container) {
          container.innerHTML = this.renderActiveTabContent();
          this.bindCardClicks();
          this.bindSubFilterEvents();
        }
      });
    });
  }

  bindCardClicks() {
    // Book card clicks
    document.querySelectorAll("[data-book-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        const bookId = card.dataset.bookId;
        const book = (this.data?.books || []).find(b => b.id === bookId);
        if (book) this.openBookModal(book);
      });
    });

    // Film card clicks
    document.querySelectorAll("[data-film-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        const filmId = card.dataset.filmId;
        const film = (this.data?.films || []).find(f => f.id === filmId);
        if (film) this.openFilmModal(film);
      });
    });
  }
}
