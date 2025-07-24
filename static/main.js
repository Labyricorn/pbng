// --- DOM Elements ---
const snippetList = document.getElementById('snippet-list');
const builderList = document.getElementById('builder-list');
const builderDropzone = document.getElementById('builder-dropzone');
const previewContent = document.getElementById('preview-content');
const previewMarkdownBtn = document.getElementById('preview-markdown');
const previewJsonBtn = document.getElementById('preview-json');
const toast = document.getElementById('toast');
const snippetForm = document.getElementById('snippet-form');
const snippetTitle = document.getElementById('snippet-title');
const snippetCategory = document.getElementById('snippet-category');
const snippetTags = document.getElementById('snippet-tags');
const snippetContent = document.getElementById('snippet-content');
const snippetDescription = document.getElementById('snippet-description');

// Modal elements
const createSnippetBtn = document.getElementById('create-snippet-btn');
const createSnippetModal = document.getElementById('create-snippet-modal');
const closeSnippetModal = document.getElementById('close-snippet-modal');
const cancelSnippet = document.getElementById('cancel-snippet');

let snippets = [];
let builderSnippets = [];
let previewMode = 'markdown';

// --- Load Snippets from API ---
async function loadSnippets() {
  const res = await fetch('/api/snippets');
  snippets = await res.json();
  renderSnippetList();
}

function renderSnippetList() {
  snippetList.innerHTML = '';
  snippets.forEach(snippet => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = snippet.id;
    li.addEventListener('dragstart', handleDragStart);

    // Create content container
    const content = document.createElement('div');
    content.className = 'snippet-content';

    // Title
    const title = document.createElement('div');
    title.className = 'snippet-title';
    title.textContent = snippet.title;
    content.appendChild(title);

    // Tags
    if (snippet.tags && snippet.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'snippet-tags';
      snippet.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
      });
      content.appendChild(tagsContainer);
    }

    li.appendChild(content);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '<i class="fa fa-trash"></i>';
    delBtn.className = 'delete-btn';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      if (confirm('Delete this snippet?')) {
        await fetch(`/api/snippets/${snippet.id}`, { method: 'DELETE' });
        showToast('Snippet deleted');
        loadSnippets();
      }
    };
    li.appendChild(delBtn);
    snippetList.appendChild(li);
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

builderDropzone.addEventListener('dragover', e => {
  e.preventDefault();
  builderDropzone.classList.add('dragover');
});
builderDropzone.addEventListener('dragleave', e => {
  builderDropzone.classList.remove('dragover');
});
builderDropzone.addEventListener('drop', e => {
  e.preventDefault();
  builderDropzone.classList.remove('dragover');
  const id = e.dataTransfer.getData('text/plain');
  const snippet = snippets.find(s => s.id == id);
  if (snippet) {
    builderSnippets.push(snippet);
    renderBuilderList();
    updatePreview();
    showToast('Snippet added to builder!');
  }
});

function renderBuilderList() {
  builderList.innerHTML = '';
  builderSnippets.forEach((snippet, idx) => {
    const li = document.createElement('li');
    li.textContent = snippet.title;
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '<i class="fa fa-times"></i>';
    removeBtn.onclick = () => {
      builderSnippets.splice(idx, 1);
      renderBuilderList();
      updatePreview();
    };
    li.appendChild(removeBtn);
    builderList.appendChild(li);
  });
}

function updatePreview() {
  if (previewMode === 'markdown') {
    previewContent.className = 'markdown-preview';
    // Render each snippet in its own <div> with spacing, preserving line breaks
    previewContent.innerHTML = builderSnippets
      .map(s => `<div style="margin-bottom:1em;">${s.content.replace(/\n/g, '<br>')}</div>`)
      .join('');
  } else {
    previewContent.className = 'json-preview';
    // Render each snippet object in its own <pre> with spacing
    previewContent.innerHTML = builderSnippets
      .map(s => `<pre style="margin-bottom:1em;">${escapeHtml(JSON.stringify({ title: s.title, content: s.content }, null, 2))}</pre>`)
      .join('');
  }
}

// Helper to escape HTML for JSON preview
function escapeHtml(str) {
  return str.replace(/[&<>]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[tag]));
}

previewMarkdownBtn.onclick = () => {
  previewMode = 'markdown';
  previewMarkdownBtn.classList.add('active');
  previewJsonBtn.classList.remove('active');
  updatePreview();
};
previewJsonBtn.onclick = () => {
  previewMode = 'json';
  previewJsonBtn.classList.add('active');
  previewMarkdownBtn.classList.remove('active');
  updatePreview();
};

// --- Modal Functions ---
function openModal() {
  createSnippetModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  createSnippetModal.classList.remove('show');
  document.body.style.overflow = '';
  snippetForm.reset();
}

// --- Modal Event Listeners ---
createSnippetBtn.addEventListener('click', openModal);
closeSnippetModal.addEventListener('click', closeModal);
cancelSnippet.addEventListener('click', closeModal);

// Close modal when clicking outside
createSnippetModal.addEventListener('click', (e) => {
  if (e.target === createSnippetModal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && createSnippetModal.classList.contains('show')) {
    closeModal();
  }
});

snippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: snippetTitle.value,
    category: snippetCategory.value,
    tags: snippetTags.value.split(',').map(t => t.trim()).filter(Boolean),
    content: snippetContent.value,
    description: snippetDescription.value
  };
  const res = await fetch('/api/snippets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    showToast('Snippet created successfully!');
    closeModal();
    loadSnippets();
  } else {
    showToast('Failed to create snippet');
  }
});

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// On first load, if no snippets, create three test snippets
async function ensureTestSnippets() {
  await loadSnippets();
  if (snippets.length === 0) {
    const testSnips = [
      {
        title: 'Role: Assistant',
        category: 'Role',
        tags: ['role', 'assistant'],
        content: 'You are a helpful assistant.',
        description: 'The AI role.'
      },
      {
        title: 'Task: Summarize',
        category: 'Task',
        tags: ['task', 'summarize'],
        content: 'Summarize the following text: [text_to_summarize]',
        description: 'Summarize input.'
      },
      {
        title: 'Format: Markdown',
        category: 'Format',
        tags: ['format', 'markdown'],
        content: 'Respond in markdown format.',
        description: 'Output as markdown.'
      }
    ];
    for (const snip of testSnips) {
      await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snip)
      });
    }
    showToast('Test snippets created!');
    await loadSnippets();
  }
}

// --- Initial Load ---
ensureTestSnippets(); 