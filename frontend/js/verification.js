// Wires the manual-entry form on screens/verify.html to
// GET {API_BASE}/consumer/verify?type=&value=  (see backend/app/api/routes/consumer.py)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#verify-form');
  const typeSelect = document.querySelector('#identifier-type');
  const valueInput = document.querySelector('#identifier-value');
  const submitBtn = document.querySelector('#verify-submit');
  const panel = document.querySelector('#verify-result-panel');
  if (!form || !typeSelect || !valueInput || !panel) return; // not this page

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = valueInput.value.trim();
    if (!value) return;
    verify(typeSelect.value, value);
  });

  async function verify(type, value) {
    setLoading();
    try {
      const params = new URLSearchParams({ type, value });
      const result = await manakaiFetch(`/consumer/verify?${params.toString()}`);
      renderResult(result);
    } catch (err) {
      renderError(err.message);
    }
  }

  function setLoading() {
    submitBtn.disabled = true;
    panel.className = 'bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm relative overflow-hidden';
    panel.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center gap-3 py-10 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
        <p class="font-body-md text-body-md">Checking the BIS database…</p>
      </div>`;
  }

  function renderResult(result) {
    submitBtn.disabled = false;
    const isVerified = result.verified === true;
    const isUnverified = result.verified === false;
    const statusColor = isVerified ? 'success-green' : (result.valid_format ? 'bis-gold' : 'alert-red');
    const statusIcon = isVerified ? 'verified' : (result.valid_format ? 'help' : 'error');
    const statusLabel = isVerified
      ? 'Authentic & Verified'
      : isUnverified
        ? 'No Match Found'
        : (result.valid_format ? 'Format Valid — Not Verified' : 'Invalid Format');
    const badgeLabel = isVerified ? 'Match Found' : (isUnverified ? 'No Match' : 'Unverified');

    const detailRows = renderDetail(result.detail);

    panel.className = `bg-surface-container-lowest border border-${statusColor}/30 rounded-xl p-6 shadow-sm relative overflow-hidden`;
    panel.innerHTML = `
      <div class="flex items-start justify-between mb-6 border-b border-border-subtle pb-4">
        <div class="flex flex-col">
          <span class="text-on-surface-variant font-label-md text-label-md mb-1">Verification Status</span>
          <div class="flex items-center gap-2 text-${statusColor}">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">${statusIcon}</span>
            <span class="font-headline-md text-headline-md">${statusLabel}</span>
          </div>
        </div>
        <div class="bg-${statusColor}/10 text-${statusColor} font-code-sm text-code-sm px-3 py-1 rounded-full border border-${statusColor}/20">
          ${badgeLabel}
        </div>
      </div>
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex justify-between items-center py-2 border-b border-surface-container-low">
          <span class="text-on-surface-variant font-body-md text-body-md">Type</span>
          <span class="font-code-sm text-code-sm text-on-surface font-semibold bg-surface-container px-2 py-1 rounded uppercase">${escapeHtml(result.type)}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-surface-container-low">
          <span class="text-on-surface-variant font-body-md text-body-md">Value</span>
          <span class="font-code-sm text-code-sm text-on-surface font-semibold bg-surface-container px-2 py-1 rounded">${escapeHtml(result.value)}</span>
        </div>
        ${detailRows}
      </div>
      <div class="bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
        <div class="flex items-center gap-2 text-on-surface-variant">
          <span class="material-symbols-outlined text-sm">database</span>
          <span class="font-code-sm text-code-sm">Source: BIS backend (${escapeHtml(result.type.toUpperCase())} verifier)</span>
        </div>
        <div class="flex items-center gap-2 text-on-surface-variant">
          <span class="material-symbols-outlined text-sm">schedule</span>
          <span class="font-code-sm text-code-sm">Verified on: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>`;
  }

  function renderDetail(detail) {
    if (!detail) return '';
    if (typeof detail === 'string') {
      return `
        <div class="flex flex-col gap-1 py-2">
          <span class="text-on-surface-variant font-body-md text-body-md">Detail</span>
          <span class="font-body-md text-body-md text-on-surface">${escapeHtml(detail)}</span>
        </div>`;
    }
    // detail is an object — render each key/value as a row
    return Object.entries(detail).map(([key, val]) => `
      <div class="flex justify-between items-center py-2 border-b border-surface-container-low">
        <span class="text-on-surface-variant font-body-md text-body-md">${escapeHtml(prettyKey(key))}</span>
        <span class="font-body-md text-body-md text-on-surface text-right max-w-[60%]">${escapeHtml(String(val))}</span>
      </div>`).join('');
  }

  function renderError(message) {
    submitBtn.disabled = false;
    panel.className = 'bg-surface-container-lowest border border-alert-red/30 rounded-xl p-6 shadow-sm relative overflow-hidden';
    panel.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center gap-2 py-8">
        <span class="material-symbols-outlined text-4xl text-alert-red">error</span>
        <p class="font-headline-md text-headline-md text-alert-red">Couldn't verify that identifier</p>
        <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(message)}</p>
        <p class="font-label-md text-label-md text-on-surface-variant mt-2">Check that the backend is running and reachable at ${escapeHtml(window.MANAKAI_API_BASE || '(same origin)')}.</p>
      </div>`;
  }

  function prettyKey(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Scan & Verify (camera) -> POST /consumer/scan ----
  const scanDropzone = document.querySelector('#scan-dropzone');
  const scanFileInput = document.querySelector('#scan-file-input');
  const scanIcon = document.querySelector('#scan-icon');
  const scanLabel = document.querySelector('#scan-label');

  if (scanDropzone && scanFileInput) {
    scanDropzone.addEventListener('click', () => scanFileInput.click());
    scanFileInput.addEventListener('change', () => {
      const file = scanFileInput.files[0];
      if (file) scanAndVerify(file);
    });
  }

  async function scanAndVerify(file) {
    scanIcon.textContent = 'progress_activity';
    scanIcon.classList.add('animate-spin');
    scanLabel.textContent = 'Scanning…';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const base = window.MANAKAI_API_BASE || '';
      const res = await fetch(base + '/consumer/scan', { method: 'POST', body: formData });
      const result = await res.json();

      if (!result.ocr_available) {
        renderError(result.detail || 'Scanning is not available on this deployment yet.');
      } else if (!result.value) {
        renderError(result.detail || 'Could not find a HUID or license number in that photo. Try manual entry instead.');
      } else {
        renderResult(result);
      }
    } catch (err) {
      renderError(err.message);
    } finally {
      scanIcon.textContent = 'photo_camera';
      scanIcon.classList.remove('animate-spin');
      scanLabel.textContent = 'Tap to open camera';
      scanFileInput.value = '';
    }
  }
});