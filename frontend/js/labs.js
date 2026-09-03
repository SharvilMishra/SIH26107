// Wires screens/laboratory-finder.html to  GET {API_BASE}/labs/?product=&lat=&lng=&radius_km=
// (see backend/app/api/routes/labs.py)
document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.querySelector('#lab-list-container');
  const productInput = document.querySelector('#lab-product-input');
  const searchBtn = document.querySelector('#lab-search-btn');
  const locationBtn = document.querySelector('#lab-location-btn');
  const statusLabel = document.querySelector('#lab-status-label');
  if (!listContainer || !productInput) return; // not this page

  let coords = null; // { lat, lng } once the user opts in via the location button

  searchBtn?.addEventListener('click', () => runSearch());
  productInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); runSearch(); }
  });

  locationBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      statusLabel.textContent = 'Geolocation is not supported by this browser.';
      return;
    }
    statusLabel.textContent = 'Getting your location…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        runSearch();
      },
      (err) => {
        statusLabel.textContent = `Couldn't get your location: ${err.message}`;
      }
    );
  });

  runSearch(); // initial load, no filters

  async function runSearch() {
    statusLabel.textContent = 'Loading labs…';
    listContainer.innerHTML = '';

    const params = new URLSearchParams();
    const product = productInput.value.trim();
    if (product) params.set('product', product);
    if (coords) {
      params.set('lat', String(coords.lat));
      params.set('lng', String(coords.lng));
    }
    params.set('limit', '20');

    try {
      const labs = await manakaiFetch(`/labs/?${params.toString()}`);
      renderLabs(labs);
    } catch (err) {
      statusLabel.textContent = '';
      listContainer.innerHTML = `<p class="font-body-md text-body-md text-alert-red">Couldn't load labs: ${escapeHtml(err.message)}</p>`;
    }
  }

  function renderLabs(labs) {
    statusLabel.textContent = labs.length
      ? `Showing ${labs.length} lab${labs.length === 1 ? '' : 's'}${coords ? ' near you' : ''}`
      : 'No labs matched your search.';
    listContainer.innerHTML = labs.map(renderCard).join('');
  }

  function renderCard(lab) {
    const scopeLine = (lab.recognized_for || []).join(', ') || 'Not specified';
    const distanceBadge = lab.distance_km != null
      ? `<span class="bg-success-green/10 text-success-green px-2 py-1 rounded-md font-label-md text-[12px] flex items-center gap-1">
           <span class="material-symbols-outlined text-[14px]">near_me</span> ${lab.distance_km.toFixed(1)} km
         </span>`
      : '';
    const contactBtn = lab.contact
      ? `<a href="tel:${escapeAttr(lab.contact)}" class="h-[40px] px-4 border border-border-subtle rounded-lg font-label-md text-label-md text-text-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center">
           <span class="material-symbols-outlined">call</span>
         </a>`
      : '';
    return `
      <div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-label-md text-label-md text-text-primary mb-1">${escapeHtml(lab.name)}</h3>
            <p class="font-body-md text-body-md text-text-secondary text-sm">${escapeHtml(lab.address || 'Address not available')}</p>
          </div>
          ${distanceBadge}
        </div>
        <div class="mb-4">
          <p class="font-label-md text-[12px] text-outline mb-1">Recognized For</p>
          <p class="font-body-md text-[14px] text-text-primary">${escapeHtml(scopeLine)}</p>
        </div>
        <div class="flex gap-3 mt-4 pt-4 border-t border-border-subtle">
          ${contactBtn}
        </div>
      </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  function escapeAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }
});
