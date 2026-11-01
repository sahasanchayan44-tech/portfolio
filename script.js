import { CulturalArchive } from "./cultural-archive.js";
import { World3D } from "./world-3d.js";

const app = document.querySelector("#app");
const template = document.querySelector("#portfolio-template");

const dataPath = "./data/site-content.json";

const createMetric = ({ value, label, detail }) => {
  const metric = document.createElement("article");
  metric.className = "metric";

  const valueEl = document.createElement("strong");
  valueEl.textContent = value;

  const labelEl = document.createElement("span");
  labelEl.textContent = label;

  metric.append(valueEl, labelEl);

  if (detail) {
    const detailEl = document.createElement("p");
    detailEl.textContent = detail;
    metric.appendChild(detailEl);
  }

  return metric;
};

const createBadge = (text, className = "badge") => {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  return badge;
};

const createProfileLine = ({ label, value }) => {
  const line = document.createElement("div");
  line.className = "profile-line";

  const labelEl = document.createElement("strong");
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.textContent = value;

  line.append(labelEl, valueEl);
  return line;
};

const createProofCard = ({ value, label, detail }) => {
  const card = document.createElement("article");
  card.className = "proof-card";

  const valueEl = document.createElement("strong");
  valueEl.textContent = value;

  const labelEl = document.createElement("h3");
  labelEl.textContent = label;

  const detailEl = document.createElement("p");
  detailEl.textContent = detail;

  card.append(valueEl, labelEl, detailEl);
  return card;
};

const createQuoteLine = (text) => {
  const quote = document.createElement("p");
  quote.className = "quote-line";
  quote.textContent = text;
  return quote;
};

const createServiceCard = ({ title, description, items }) => {
  const card = document.createElement("article");
  card.className = "service-card glass premium-panel";

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;

  const descriptionEl = document.createElement("p");
  descriptionEl.className = "service-description";
  descriptionEl.textContent = description;

  const itemsWrap = document.createElement("div");
  itemsWrap.className = "tag-list";
  items.forEach((item) => itemsWrap.appendChild(createBadge(item, "skill-pill")));

  card.append(titleEl, descriptionEl, itemsWrap);
  return card;
};

const createWorkCard = ({ status, title, format, summary, excerpt, tags }) => {
  const card = document.createElement("article");
  card.className = "work-card glass premium-panel";

  const meta = document.createElement("div");
  meta.className = "work-meta";
  meta.append(createBadge(status, "status-pill"), createBadge(format, "format-pill"));

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;

  const summaryEl = document.createElement("p");
  summaryEl.className = "work-summary";
  summaryEl.textContent = summary;

  const excerptEl = document.createElement("p");
  excerptEl.className = "work-excerpt";
  excerptEl.textContent = excerpt;

  const tagsWrap = document.createElement("div");
  tagsWrap.className = "tag-list";
  tags.forEach((tag) => tagsWrap.appendChild(createBadge(tag, "badge subtle-badge")));

  card.append(meta, titleEl, summaryEl, excerptEl, tagsWrap);
  return card;
};

const createInfluenceGroup = ({ title, description, items }) => {
  const group = document.createElement("article");
  group.className = "influence-group glass premium-panel";

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;

  const descriptionEl = document.createElement("p");
  descriptionEl.className = "influence-description";
  descriptionEl.textContent = description;

  const itemsWrap = document.createElement("div");
  itemsWrap.className = "influence-list";
  items.forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "influence-item";

    const name = document.createElement("strong");
    name.textContent = item.name;

    const note = document.createElement("span");
    note.textContent = item.note;

    entry.append(name, note);
    itemsWrap.appendChild(entry);
  });

  group.append(titleEl, descriptionEl, itemsWrap);
  return group;
};

const setText = (fragment, selector, value) => {
  const node = fragment.querySelector(selector);
  node.textContent = value;
};

const hydrate = (content) => {
  const fragment = template.content.cloneNode(true);

  setText(fragment, '[data-field="heroEyebrow"]', content.hero.eyebrow);
  setText(fragment, '[data-field="heroLead"]', content.hero.lead);
  setText(fragment, '[data-field="name"]', content.profile.name);
  setText(fragment, '[data-field="title"]', content.profile.title);
  setText(fragment, '[data-field="heroSummary"]', content.hero.summary);
  setText(fragment, '[data-field="photoLabel"]', content.photo.label);
  setText(fragment, '[data-field="photoNote"]', content.photo.note);
  setText(fragment, '[data-field="positioningQuote"]', content.positioning.quote);
  setText(fragment, '[data-field="proofTitle"]', content.proof.title);
  setText(fragment, '[data-field="aboutHeading"]', content.about.heading);
  setText(fragment, '[data-field="aboutIntro"]', content.about.intro);
  setText(fragment, '[data-field="aboutBody"]', content.about.body);
  setText(fragment, '[data-field="servicesHeading"]', content.services.heading);
  setText(fragment, '[data-field="servicesIntro"]', content.services.intro);
  setText(fragment, '[data-field="worksHeading"]', content.works.heading);
  setText(fragment, '[data-field="worksIntro"]', content.works.intro);
  setText(fragment, '[data-field="influencesHeading"]', content.influences.heading);
  setText(fragment, '[data-field="influencesIntro"]', content.influences.intro);
  setText(fragment, '[data-field="booksStatement"]', content.influences.statement);
  setText(fragment, '[data-field="contactHeading"]', content.contact.heading);
  setText(fragment, '[data-field="contactBlurb"]', content.contact.blurb);
  setText(fragment, '[data-field="contactMeta"]', content.contact.meta);
  setText(fragment, '[data-field="secondaryCta"]', content.hero.secondaryCta);

  const emailLink = `mailto:${content.contact.email}`;
  const heroEmail = fragment.querySelector('[data-field="emailLink"]');
  heroEmail.href = emailLink;
  heroEmail.textContent = content.hero.primaryCta;

  const secondaryEmail = fragment.querySelector('[data-field="emailLinkSecondary"]');
  secondaryEmail.href = emailLink;
  secondaryEmail.textContent = content.contact.email;

  const photo = fragment.querySelector('[data-field="photo"]');
  photo.src = content.photo.src;
  photo.alt = content.photo.alt;

  const positioningWrap = fragment.querySelector('[data-list="positioningLines"]');
  content.positioning.lines.forEach((line) => {
    positioningWrap.appendChild(createBadge(line, "positioning-pill"));
  });

  const statsWrap = fragment.querySelector('[data-list="heroStats"]');
  content.hero.stats.forEach((item) => statsWrap.appendChild(createMetric(item)));

  const badgeWrap = fragment.querySelector('[data-list="heroBadges"]');
  content.hero.badges.forEach((item) => badgeWrap.appendChild(createBadge(item)));

  const proofWrap = fragment.querySelector('[data-list="proofItems"]');
  content.proof.items.forEach((item) => proofWrap.appendChild(createProofCard(item)));

  const profileWrap = fragment.querySelector('[data-list="profileHighlights"]');
  content.profile.highlights.forEach((item) => profileWrap.appendChild(createProfileLine(item)));

  const quotesWrap = fragment.querySelector('[data-list="quoteLines"]');
  content.about.quoteLines.forEach((line) => quotesWrap.appendChild(createQuoteLine(line)));

  const servicesWrap = fragment.querySelector('[data-list="serviceCategories"]');
  content.services.categories.forEach((item) => servicesWrap.appendChild(createServiceCard(item)));

  const worksWrap = fragment.querySelector('[data-list="works"]');
  content.works.items.forEach((item) => worksWrap.appendChild(createWorkCard(item)));

  const influencesWrap = fragment.querySelector('[data-list="influenceGroups"]');
  content.influences.groups.forEach((group) =>
    influencesWrap.appendChild(createInfluenceGroup(group)),
  );

  // Cultural Archive Teaser hydration
  if (content.culturalArchiveTeaser) {
    setText(fragment, '[data-field="teaserEyebrow"]', content.culturalArchiveTeaser.eyebrow);
    setText(fragment, '[data-field="teaserHeading"]', content.culturalArchiveTeaser.heading);
    setText(fragment, '[data-field="teaserIntro"]', content.culturalArchiveTeaser.intro);

    const teaserStatsWrap = fragment.querySelector('[data-list="teaserStats"]');
    if (teaserStatsWrap && content.culturalArchiveTeaser.stats) {
      content.culturalArchiveTeaser.stats.forEach((item) =>
        teaserStatsWrap.appendChild(createMetric(item)),
      );
    }
  }

  app.appendChild(fragment);

  // Initialize Cultural Archive Module & 3D World
  const archiveContainer = document.querySelector("#cultural-archive-root");
  if (archiveContainer) {
    const culturalArchive = new CulturalArchive({
      manifestUrl: "./content/archive-manifest.json",
      container: archiveContainer
    });

    culturalArchive.init().then((archiveData) => {
      const worldContainer = document.querySelector("#world-3d-root");
      if (worldContainer) {
        const world3D = new World3D({
          container: worldContainer,
          archiveController: culturalArchive,
          books: archiveData ? archiveData.books : [],
          films: archiveData ? archiveData.films : []
        });
        world3D.init();
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
};

const renderError = () => {
  app.innerHTML = `
    <section class="section">
      <div class="glass contact-panel premium-panel">
        <div>
          <p class="eyebrow">Content error</p>
          <h2>The portfolio data could not be loaded.</h2>
          <p class="contact-copy">Start a local server and confirm that <code>data/site-content.json</code> exists.</p>
        </div>
      </div>
    </section>
  `;
};

fetch(dataPath)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load content");
    }
    return response.json();
  })
  .then(hydrate)
  .catch(renderError);
