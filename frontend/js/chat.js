// Wires screens/ask-ai.html to POST {API_BASE}/chat/  (see backend/app/api/routes/chat.py)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#chat-container');
  const input = document.querySelector('#chat-input');
  const sendBtn = document.querySelector('#chat-send');
  const emptyState = document.querySelector('#chat-empty-state');
  const languageSelect = document.querySelector('#chat-language');
  if (!container || !input || !sendBtn) return; // not this page

  // Remember the chosen answer language across visits (per browser).
  const savedLanguage = localStorage.getItem('manakai_chat_language');
  if (languageSelect && savedLanguage) languageSelect.value = savedLanguage;
  languageSelect?.addEventListener('change', () => {
    localStorage.setItem('manakai_chat_language', languageSelect.value);
  });

  sendBtn.addEventListener('click', send);

  const attachBtn = document.querySelector('#chat-attach-btn');
  const fileInput = document.querySelector('#chat-file-input');
  let pendingContext = null;
  let pendingFilename = null;

  attachBtn?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    attachBtn.querySelector('span').textContent = 'progress_activity';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await manakaiFetch('/chat/upload', { method: 'POST', body: formData });
      pendingContext = result.extracted_text;
      pendingFilename = result.filename;
      input.placeholder = `Ask about ${result.filename}...`;
    } catch (err) {
      addErrorMessage(`Couldn't read that file: ${err.message}`);
    } finally {
      attachBtn.querySelector('span').textContent = 'attach_file';
      fileInput.value = '';
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  });

  async function send() {
    const query = input.value.trim();
    if (!query) return;
    emptyState?.remove();
    addUserMessage(query);
    input.value = '';
    const thinkingEl = addThinkingMessage();

    try {
      const result = await manakaiFetch('/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: languageSelect?.value || 'en', context: pendingContext }),
      });
      pendingContext = null;
      pendingFilename = null;
      input.placeholder = 'Ask about BIS standards, regulations, or compliance...';
      thinkingEl.remove();
      addAiMessage(result.answer, result.sources || []);
    } catch (err) {
      thinkingEl.remove();
      addErrorMessage(err.message);
    }
  }

  function addUserMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'flex justify-end';
    wrap.innerHTML = `
      <div class="bg-surface-container-high rounded-xl rounded-tr-none px-6 py-4 max-w-2xl border border-outline-variant">
        <p class="font-body-md text-body-md text-on-surface">${escapeHtml(text)}</p>
      </div>`;
    container.appendChild(wrap);
    scrollToBottom();
  }

  function addThinkingMessage() {
    const wrap = document.createElement('div');
    wrap.className = 'flex justify-start';
    wrap.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl rounded-tl-none p-6 max-w-3xl border border-border-subtle shadow-sm flex items-center gap-3 text-on-surface-variant">
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        <span class="font-body-md text-body-md">ManakAI is thinking…</span>
      </div>`;
    container.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function addAiMessage(answer, sources) {
    const sourcesHtml = sources.length
      ? `
        <div class="bg-surface rounded-lg p-4 border border-outline-variant space-y-2">
          <h4 class="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">Sources</h4>
          <ul class="space-y-1">
            ${sources.map((s) => `<li class="font-code-sm text-code-sm text-on-surface-variant">${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>`
      : '';
    const wrap = document.createElement('div');
    wrap.className = 'flex justify-start';
    wrap.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl rounded-tl-none p-6 max-w-3xl border border-border-subtle shadow-sm space-y-4">
        <div class="flex items-center gap-3 border-b border-border-subtle pb-4">
          <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
          </div>
          <span class="font-label-md text-label-md font-bold text-primary">ManakAI Response</span>
        </div>
        <p class="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">${escapeHtml(answer)}</p>
        ${sourcesHtml}
      </div>`;
    container.appendChild(wrap);
    scrollToBottom();
  }

  function addErrorMessage(message) {
    const wrap = document.createElement('div');
    wrap.className = 'flex justify-start';
    wrap.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl rounded-tl-none p-6 max-w-3xl border border-alert-red/30 shadow-sm">
        <p class="font-body-md text-body-md text-alert-red">Couldn't reach ManakAI: ${escapeHtml(message)}</p>
        <p class="font-label-md text-label-md text-on-surface-variant mt-2">Check that the backend is running and reachable at ${escapeHtml(window.MANAKAI_API_BASE || '(same origin)')}.</p>
      </div>`;
    container.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});