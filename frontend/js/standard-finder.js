// Wires screens/msme-dashboard.html's "Standard Finder" to
// GET {API_BASE}/standards/?keyword=&category=  (see backend/app/api/routes/standards.py)
//
// NOTE: the BOM file upload is intentionally NOT sent anywhere -- the
// backend has no endpoint that parses a bill-of-materials file. The
// dropzone just shows the selected filename for now; search below uses
// Product Name + Category only. See bom-note in the HTML.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#standard-finder-form');
  const nameInput = document.querySelector('#product-name-input');
  const categorySelect = document.querySelector('#product-category-select');
  const submitBtn = document.querySelector('#find-standards-btn');
  const countLabel = document.querySelector('#results-count-label');
  const resultsList = document.querySelector('#results-list');
  if (!form || !resultsList) return; // not this page

  // ---- BOM dropzone: file picker + filename display only ----
  const dropzone = document.querySelector('#bom-dropzone');
  const fileInput = document.querySelector('#bom-file-input');
  const bomIcon = document.querySelector('#bom-icon');
  const bomLabel = document.querySelector('#bom-label');
  const bomSublabel = document.querySelector('#bom-sublabel');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      bomIcon.textContent = 'description';
      bomLabel.textContent = file.name;
      bomSublabel.textContent = `${(file.size / 1024).toFixed(0)} KB selected`;
    });
  }

  // ---- Find Standards -> GET /standards/ ----
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });

  async function runSearch() {
    const keyword = nameInput.value.trim();
    const category = categorySelect.value;

    if (!keyword && !category) {
      countLabel.textContent = 'Enter a product name or pick a category';
      return;
    }

    submitBtn.disabled = true;
    countLabel.textContent = 'Searching…';
    resultsList.innerHTML = `
      <div class="flex items-center gap-3 text-on-surface-variant py-8">
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        <span>Searching standards…</span>
      </div>`;

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    params.set('limit', '10');

    try {
      const results = await manakaiFetch(`/standards/?${params.toString()}`);
      renderResults(results);
    } catch (err) {
      countLabel.textContent = '';
      resultsList.innerHTML = `<p class="font-body-md text-body-md text-alert-red">Couldn't search standards: ${escapeHtml(err.message)}</p>`;
    } finally {
      submitBtn.disabled = false;
    }
  }

  function renderResults(results) {
    countLabel.textContent = results.length
      ? `${results.length} Match${results.length === 1 ? '' : 'es'} Found`
      : 'No Matches Found';

    resultsList.innerHTML = results.length
      ? results.map(renderCard).join('')
      : `<p class="font-body-md text-body-md text-on-surface-variant">No standards matched. Try a broader product name or a different category.</p>`;
  }

  function renderCard(standard) {
    const keywordsLine = (standard.keywords || []).slice(0, 4);
    const tagsHtml = keywordsLine.length
      ? `<div class="mt-3 flex flex-wrap gap-2">${keywordsLine.map((k) => `
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-highest rounded text-sm text-on-surface-variant border border-outline-variant">
            <span class="material-symbols-outlined text-[14px]">tag</span> ${escapeHtml(k)}
          </span>`).join('')}</div>`
      : '';

    return `
      <div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-bis-gold"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="bg-primary-container text-on-primary-container px-3 py-1 rounded-md font-code-sm text-code-sm font-bold border border-outline-variant">${escapeHtml(standard.standard_number)}</span>
          <a href="standards-detail.html?id=${encodeURIComponent(standard.id)}" class="text-secondary hover:text-primary font-label-md text-label-md flex items-center gap-1">
            View Source <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
        <h4 class="font-body-lg text-body-lg text-on-surface font-semibold mb-2">${escapeHtml(standard.title)}</h4>
        <div class="bg-surface-container-low p-4 rounded-lg mt-4 border border-outline-variant">
          <h5 class="font-label-md text-label-md text-primary mb-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">lightbulb</span> Category
          </h5>
          <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(standard.category || 'Uncategorized')}</p>
          ${tagsHtml}
        </div>
      </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
});