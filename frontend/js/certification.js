// Wires screens/certification-roadmap.html to  GET {API_BASE}/certification/{scheme}
// (see backend/app/api/routes/certification.py)
document.addEventListener('DOMContentLoaded', () => {
  const schemeSelect = document.querySelector('#scheme-select');
  const stepsContainer = document.querySelector('#roadmap-steps-container');
  const checklistContainer = document.querySelector('#documents-checklist-container');
  const feeCard = document.querySelector('#fee-structure-card');
  const feeContainer = document.querySelector('#fee-structure-container');
  const statusLabel = document.querySelector('#scheme-status-label');
  const headingEl = document.querySelector('#scheme-name-heading');
  if (!schemeSelect || !stepsContainer) return; // not this page

  schemeSelect.addEventListener('change', () => loadScheme(schemeSelect.value));
  loadScheme(schemeSelect.value);

  async function loadScheme(scheme) {
    statusLabel.textContent = 'Loading…';
    stepsContainer.innerHTML = loadingStep();
    checklistContainer.innerHTML = '<li class="font-body-md text-body-md text-on-surface-variant">Loading…</li>';
    feeCard.hidden = true;

    try {
      const data = await manakaiFetch(`/certification/${encodeURIComponent(scheme)}`);
      renderScheme(data);
    } catch (err) {
      statusLabel.textContent = '';
      stepsContainer.innerHTML = `<p class="font-body-md text-body-md text-alert-red">Couldn't load the "${escapeHtml(scheme)}" scheme: ${escapeHtml(err.message)}</p>`;
      checklistContainer.innerHTML = '';
    }
  }

  function renderScheme(scheme) {
    statusLabel.textContent = '';
    headingEl.textContent = `The Process — ${scheme.name}`;

    const steps = scheme.steps || [];
    stepsContainer.innerHTML = steps.length
      ? `<div class="absolute left-[15px] md:left-[23px] top-8 bottom-8 w-px bg-outline-variant"></div>` +
        steps.map((step, i) => renderStep(step, i === steps.length - 1)).join('')
      : `<p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(scheme.description || 'No steps published for this scheme yet.')}</p>`;

    const docs = scheme.documents_required || [];
    checklistContainer.innerHTML = docs.length
      ? docs.map((doc) => `
          <li class="flex items-start gap-3">
            <input class="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary" type="checkbox">
            <p class="font-label-md text-label-md text-on-background">${escapeHtml(doc)}</p>
          </li>`).join('')
      : '<li class="font-body-md text-body-md text-on-surface-variant">No document checklist published for this scheme yet.</li>';

    const fees = scheme.fee_structure || [];
    if (fees.length) {
      feeCard.hidden = false;
      feeContainer.innerHTML = fees.map((fee) => `
        <li class="flex justify-between items-center border-b border-surface-container-low pb-2">
          <span class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(fee.label)}</span>
          <span class="font-label-md text-label-md text-on-background font-bold">₹ ${escapeHtml(fee.amount)} / ${escapeHtml(fee.unit)}</span>
        </li>`).join('');
    }
  }

  function renderStep(step, isLast) {
    return `
      <div class="relative ${isLast ? '' : 'mb-12'}">
        <div class="absolute -left-[35px] md:-left-[43px] w-10 h-10 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10">
          <span class="font-label-md text-label-md text-primary font-bold">${escapeHtml(step.step_number)}</span>
        </div>
        <div class="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 class="font-headline-md text-headline-md text-primary mb-4">${escapeHtml(step.title)}</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">${escapeHtml(step.description)}</p>
        </div>
      </div>`;
  }

  function loadingStep() {
    return `<div class="flex items-center gap-3 text-on-surface-variant py-8">
      <span class="material-symbols-outlined animate-spin">progress_activity</span>
      <span>Loading roadmap…</span>
    </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
});
