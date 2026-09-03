// Wires screens/standards-search.html to  GET {API_BASE}/standards/?keyword=&category=
// and screens/standards-detail.html to    GET {API_BASE}/standards/{id}
// (see backend/app/api/routes/standards.py)

document.addEventListener('DOMContentLoaded', () => {
  initSearchPage();
  initDetailPage();
});

// ---------------------------------------------------------------------
// standards-search.html
// ---------------------------------------------------------------------
function initSearchPage() {
  const grid = document.querySelector('#results-grid');
  const countLabel = document.querySelector('#results-count-label');
  const input = document.querySelector('#standards-search-input');
  const searchBtn = document.querySelector('#standards-search-btn');
  if (!grid || !input) return; // not this page

  const categoryCheckboxes = document.querySelectorAll('.category-filter-checkbox');
  categoryCheckboxes.forEach((box) => {
    box.addEventListener('change', () => {
      if (box.checked) {
        categoryCheckboxes.forEach((other) => { if (other !== box) other.checked = false; });
      }
      runSearch();
    });
  });

  document.querySelectorAll('.quick-tag').forEach((tag) => {
    tag.addEventListener('click', () => {
      input.value = tag.dataset.keyword || '';
      runSearch();
    });
  });

  searchBtn?.addEventListener('click', runSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); runSearch(); }
  });

  runSearch(); // initial load

  async function runSearch() {
    const keyword = input.value.trim();
    const activeCategory = Array.from(categoryCheckboxes).find((b) => b.checked)?.dataset.category;
    countLabel.textContent = 'Loading standards…';
    grid.innerHTML = '';

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (activeCategory) params.set('category', activeCategory);
    params.set('limit', '20');

    try {
      const results = await manakaiFetch(`/standards/?${params.toString()}`);
      renderResults(results);
    } catch (err) {
      countLabel.textContent = '';
      grid.innerHTML = `<p class="col-span-full font-body-md text-body-md text-alert-red">Couldn't load standards: ${escapeHtml(err.message)}</p>`;
    }
  }

  function renderResults(results) {
    countLabel.textContent = results.length
      ? `Showing ${results.length} standard${results.length === 1 ? '' : 's'}`
      : 'No standards matched your search.';
    grid.innerHTML = results.map(renderCard).join('');
  }

  function renderCard(standard) {
    const mandatoryBadge = ''; // backend has no mandatory/voluntary field yet
    const keywordsLine = (standard.keywords || []).slice(0, 4).join(', ');
    return `
      <div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-bis-gold"></div>
        <div class="flex justify-between items-start gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-headline-md text-headline-md text-primary font-bold">${escapeHtml(standard.standard_number)}</h4>
              ${mandatoryBadge}
            </div>
            <p class="font-label-md text-label-md text-on-surface-variant">${escapeHtml(standard.category || keywordsLine || 'Uncategorized')}</p>
          </div>
        </div>
        <p class="font-body-md text-body-md text-on-surface line-clamp-2 mt-2 flex-1">${escapeHtml(standard.title)}</p>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-surface-variant">
          <span class="font-code-sm text-code-sm text-outline">${escapeHtml(standard.id)}</span>
          <a href="standards-detail.html?id=${encodeURIComponent(standard.id)}" class="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">View Details</a>
        </div>
      </div>`;
  }
}

// ---------------------------------------------------------------------
// standards-detail.html
// ---------------------------------------------------------------------
function initDetailPage() {
  const panelContent = document.querySelector('#live-standard-content');
  if (!panelContent) return; // not this page

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return; // leave the default placeholder message in place

  const titleEl = document.querySelector('#standard-title');
  const subtitleEl = document.querySelector('#standard-subtitle');

  panelContent.innerHTML = `
    <div class="flex items-center gap-3 text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin">progress_activity</span>
      <span>Loading standard ${escapeHtml(id)}…</span>
    </div>`;

  manakaiFetch(`/standards/${encodeURIComponent(id)}`)
    .then((standard) => {
      if (titleEl) titleEl.textContent = standard.standard_number;
      if (subtitleEl) subtitleEl.textContent = standard.title;
      panelContent.innerHTML = renderStandard(standard);
    })
    .catch((err) => {
      panelContent.innerHTML = `
        <p class="text-alert-red">Couldn't load standard "${escapeHtml(id)}": ${escapeHtml(err.message)}</p>`;
    });

  function renderStandard(standard) {
    const clauses = standard.clauses || [];
    const schemes = standard.schemes || [];
    const clausesHtml = clauses.length
      ? `<ul class="space-y-3">${clauses.map((c) => `
          <li class="p-3 bg-surface-container-low rounded border border-border-subtle">
            <span class="font-label-md text-label-md text-primary font-bold block mb-1">Clause ${escapeHtml(c.clause_number)}${c.page_number ? ` &middot; p.${c.page_number}` : ''}</span>
            <span class="font-body-md text-body-md text-on-surface">${escapeHtml(c.text)}</span>
          </li>`).join('')}</ul>`
      : `<p>No clauses indexed for this standard yet.</p>`;

    const schemesHtml = schemes.length
      ? `<div class="flex flex-wrap gap-2 mt-4">${schemes.map((s) => `
          <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md">${escapeHtml(s.name)}</span>`).join('')}</div>`
      : '';

    const pdfLink = standard.source_pdf_url
      ? `<a href="${escapeAttr(standard.source_pdf_url)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-secondary font-label-md text-label-md mt-4">
           <span class="material-symbols-outlined text-sm">picture_as_pdf</span> Source PDF
         </a>`
      : '';

    return `
      <p class="mb-2"><span class="font-bold text-on-surface">Category:</span> ${escapeHtml(standard.category || '—')}</p>
      <h4 class="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mt-4 mb-2">Clauses</h4>
      ${clausesHtml}
      <h4 class="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mt-6 mb-2">Linked Certification Schemes</h4>
      ${schemesHtml || '<p>No linked schemes.</p>'}
      ${pdfLink}`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}
