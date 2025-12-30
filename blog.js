(async function () {
  const featuredEl = document.getElementById("blog-featured");
  const gridEl = document.getElementById("blog-grid");
  const DATA_URL = "/content/blog/posts.json";

  if (!featuredEl || !gridEl) return;

  function normalizeSlug(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\- ]/g, "")
      .replace(/\s+/g, "-");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(d) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }

  function sortByDateDesc(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

  function getSlugFromHash() {
    return (location.hash || "").replace("#", "").trim();
  }

  function featuredTemplate(p) {
    const slug = normalizeSlug(p.slug || p.title);
    const date = formatDate(p.date);
    const img = p.image || "";

    return `
      <div class="blog-post-featured-wrapper">
        <a href="/blog.html#${slug}" class="image-wrapper blog-post-featured w-inline-block">
          <img src="${img}" alt="${escapeHtml(p.title)}" class="image blog-post-featured">
          <div style="display:none" class="image-solid-cover"></div>
        </a>

        <a href="/blog.html#${slug}" class="card blog-post-featured w-inline-block">
          <div class="top-content blog-post-featured">
            <div class="badge card-blog-post-featured">${escapeHtml(p.category || "")}</div>
            <div class="card-blog-post-featured-date">${escapeHtml(date)}</div>
          </div>
          <div class="card-blog-post-featured-content">
            <h3 class="title card-blog-post-featured">${escapeHtml(p.title)}</h3>
            <p class="paragraph-12">${escapeHtml(p.excerpt || "")}</p>
          </div>
          <div class="divider blog-post-featured"></div>
          <div class="card-blog-post-featured-link">Read More&nbsp;&nbsp;&nbsp;<span class="card-blog-post-link-arrow"></span></div>
        </a>
      </div>
    `;
  }

  function cardTemplate(p) {
    const slug = normalizeSlug(p.slug || p.title);
    const date = formatDate(p.date);
    const img = p.image || "";

    return `
      <div role="listitem" class="card-blog-post-item">
        <a href="/blog.html#${slug}" class="card blog-post w-inline-block">
          <div class="image-wrapper card-blog-post">
            <img src="${img}" alt="${escapeHtml(p.title)}" class="image card-blog-post">
            <div style="display:none" class="image-solid-cover"></div>
          </div>
          <div class="card-blog-post-content">
            <div class="card-blog-post-category">${escapeHtml(p.category || "")}</div>
            <h3 class="title card-blog-post">${escapeHtml(p.title)}</h3>
            <p class="paragraph card-blog-post">${escapeHtml(p.excerpt || "")}</p>
            <div class="bottom-content card-blog-post">
              <div class="divider card-blog-post"></div>
              <div class="card-blog-post-about-wrapper">
                <div class="card-blog-post-link">Read More&nbsp;&nbsp;&nbsp;<span class="card-blog-post-link-arrow"></span></div>
                <div class="card-blog-post-date">${escapeHtml(date)}</div>
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
  }

  function postTemplate(p) {
    const date = formatDate(p.date);
    const img = p.image || "";
    const bodyHtml = window.marked ? window.marked.parse(p.body || "") : (p.body || "");

    return `
      <div class="container-default w-container">
        <a href="/blog.html" class="nav-link" style="display:inline-block;margin: 12px 0 24px;">← Back to Resource Center</a>

        <div class="card" style="padding: 32px;">
          <h1 class="title blog-hero">${escapeHtml(p.title)}</h1>
          ${date ? `<div class="card-blog-post-date" style="margin: 10px 0 18px;">${escapeHtml(date)}</div>` : ""}

          ${img ? `<img src="${img}" alt="${escapeHtml(p.title)}" style="width:100%;height:auto;margin: 10px 0 22px;border-radius: 8px;">` : ""}

          <div class="w-richtext">
            ${bodyHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderList(posts) {
    const sorted = [...posts].sort(sortByDateDesc);
    const featured = sorted[0];
    const rest = sorted.slice(1);

    featuredEl.innerHTML = featured
      ? featuredTemplate(featured)
      : `<div class="empty-state"><div>No posts yet.</div></div>`;

    gridEl.innerHTML = rest.length
      ? rest.map(cardTemplate).join("")
      : `<div class="empty-state"><div>No additional posts yet.</div></div>`;
  }

  function renderPost(posts, slug) {
    const match = posts.find((p) => normalizeSlug(p.slug || p.title) === slug);
    if (!match) {
      location.hash = "";
      renderList(posts);
      return;
    }
    featuredEl.innerHTML = "";
    gridEl.innerHTML = postTemplate(match);
  }

  let posts = [];
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    const json = await res.json();
    posts = Array.isArray(json.posts) ? json.posts : [];
  } catch (e) {
    featuredEl.innerHTML = `<div class="empty-state"><div>Could not load posts.</div></div>`;
    gridEl.innerHTML = "";
    return;
  }

  function route() {
    const slug = getSlugFromHash();
    if (slug) renderPost(posts, slug);
    else renderList(posts);
  }

  window.addEventListener("hashchange", route);
  route();
})();