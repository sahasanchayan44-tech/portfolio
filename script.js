const app = document.querySelector("#app");
const template = document.querySelector("#portfolio-template");

const dataPath = "./data/site-content.json";

const createMetric = ({ value, label }) => {
  const metric = document.createElement("div");
  metric.className = "metric";
  metric.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
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
  line.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
  return line;
};

const createMiniCard = ({ title, body }) => {
  const card = document.createElement("article");
  card.className = "mini-card";
  card.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
  return card;
};

const createTimelineItem = ({ title, subtitle, body }) => {
  const item = document.createElement("article");
  item.className = "timeline-item";
  item.innerHTML = `<span>${subtitle}</span><h3>${title}</h3><p>${body}</p>`;
  return item;
};

const createInfluenceCard = ({ name, domain, impact }) => {
  const card = document.createElement("article");
  card.className = "influence-card";
  card.innerHTML = `
    <h3>${name}</h3>
    <p>${impact}</p>
    <span class="influence-meta">${domain}</span>
  `;
  return card;
};

const hydrate = (content) => {
  const fragment = template.content.cloneNode(true);

  fragment.querySelector('[data-field="eyebrow"]').textContent = content.hero.eyebrow;
  fragment.querySelector('[data-field="name"]').textContent = content.profile.name;
  fragment.querySelector('[data-field="title"]').textContent = content.profile.title;
  fragment.querySelector('[data-field="summary"]').textContent = content.hero.summary;
  fragment.querySelector('[data-field="about"]').textContent = content.about;
  fragment.querySelector('[data-field="writingPromise"]').textContent = content.writing.promise;
  fragment.querySelector('[data-field="booksStatement"]').textContent = content.influences.statement;
  fragment.querySelector('[data-field="contactBlurb"]').textContent = content.contact.blurb;
  fragment.querySelector('[data-field="contactMeta"]').textContent = content.contact.meta;

  const emailLink = `mailto:${content.contact.email}`;
  const heroEmail = fragment.querySelector('[data-field="emailLink"]');
  heroEmail.href = emailLink;
  heroEmail.textContent = `Email ${content.profile.firstName}`;

  const secondaryEmail = fragment.querySelector('[data-field="emailLinkSecondary"]');
  secondaryEmail.href = emailLink;
  secondaryEmail.textContent = content.contact.email;

  const photo = fragment.querySelector('[data-field="photo"]');
  photo.src = content.photo.src;
  photo.alt = content.photo.alt;

  const statsWrap = fragment.querySelector('[data-list="stats"]');
  content.hero.stats.forEach((item) => statsWrap.appendChild(createMetric(item)));

  const badgeWrap = fragment.querySelector('[data-list="badges"]');
  content.hero.badges.forEach((item) => badgeWrap.appendChild(createBadge(item)));

  const profileWrap = fragment.querySelector('[data-list="profileHighlights"]');
  content.profile.highlights.forEach((item) => profileWrap.appendChild(createProfileLine(item)));

  const writingWrap = fragment.querySelector('[data-list="writingCards"]');
  content.writing.cards.forEach((item) => writingWrap.appendChild(createMiniCard(item)));

  const educationWrap = fragment.querySelector('[data-list="education"]');
  educationWrap.dataset.title = "Education";
  content.background.education.forEach((item) => educationWrap.appendChild(createTimelineItem(item)));

  const achievementsWrap = fragment.querySelector('[data-list="achievements"]');
  achievementsWrap.dataset.title = "Credibility";
  content.background.achievements.forEach((item) =>
    achievementsWrap.appendChild(createTimelineItem(item)),
  );

  const influencesWrap = fragment.querySelector('[data-list="influences"]');
  content.influences.cards.forEach((item) =>
    influencesWrap.appendChild(createInfluenceCard(item)),
  );

  const skillsWrap = fragment.querySelector('[data-list="skills"]');
  content.skills.forEach((item) => skillsWrap.appendChild(createBadge(item, "skill-pill")));

  app.appendChild(fragment);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
};

const renderError = () => {
  app.innerHTML = `
    <section class="section">
      <div class="glass contact-panel">
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
