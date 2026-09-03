document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tab]').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach(item => item.classList.remove('active')); tab.classList.add('active'); document.querySelectorAll('[data-tab-panel]').forEach(panel => panel.hidden = panel.dataset.tabPanel !== tab.dataset.tab); }));
  document.querySelectorAll('[data-range]').forEach(input => input.addEventListener('input', () => { const target = document.querySelector(input.dataset.range); if (target) target.textContent = `${input.value}%`; }));
});
