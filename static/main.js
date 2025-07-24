// --- DOM Elements ---
const snippetList = document.getElementById('snippet-list');
const builderList = document.getElementById('builder-list');
const builderDropzone = document.getElementById('builder-dropzone');
const previewContent = document.getElementById('preview-content');
const previewMarkdownBtn = document.getElementById('preview-markdown');
const previewJsonBtn = document.getElementById('preview-json');
const toast = document.getElementById('toast');
const snippetForm = document.getElementById('snippet-form');
const snippetItem = document.getElementById('snippet-title');
const snippetCategory = document.getElementById('snippet-category');
const snippetTags = document.getElementById('snippet-tags');
const snippetContent = document.getElementById('snippet-content');
const snippetDescription = document.getElementById('snippet-description');
const snippetSearch = document.getElementById('snippet-search');
const snippetCategories = document.getElementById('snippet-categories');
const copyPreviewBtn = document.getElementById('copy-preview');

// Modal elements
const createSnippetBtn = document.getElementById('create-snippet-btn');
const createSnippetModal = document.getElementById('create-snippet-modal');
const closeSnippetModal = document.getElementById('close-snippet-modal');
const cancelSnippet = document.getElementById('cancel-snippet');

// Edit modal elements
const editSnippetModal = document.getElementById('edit-snippet-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal');
const cancelEdit = document.getElementById('cancel-edit');
const editSnippetForm = document.getElementById('edit-snippet-form');
const editSnippetItem = document.getElementById('edit-snippet-title');
const editSnippetCategory = document.getElementById('edit-snippet-category');
const editSnippetTags = document.getElementById('edit-snippet-tags');
const editSnippetContent = document.getElementById('edit-snippet-content');
const editSnippetDescription = document.getElementById('edit-snippet-description');
const deleteSnippetBtn = document.getElementById('delete-snippet');

// --- Prompt Save & Browse Elements ---
const savePromptBtn = document.getElementById('save-prompt');
const browsePromptsBtn = document.getElementById('browse-prompts');
const browsePromptsModal = document.getElementById('browse-prompts-modal');
const closeBrowsePromptsModal = document.getElementById('close-browse-prompts-modal');
const promptsList = document.getElementById('prompts-list');

let currentEditingSnippet = null;

let snippets = [];
let builderSnippets = [];
let previewMode = 'markdown';

// --- Load Snippets from API ---
async function loadSnippets(search = '', category = '') {
  try {
    let url = '/api/snippets';
    const params = [];
    
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    
    if (category) {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    snippets = await res.json();
    renderSnippetList();
    renderCategoryFilters();
  } catch (error) {
    console.error('Error loading snippets:', error);
    showToast('Failed to load snippets');
  }
}

function renderSnippetList() {
  snippetList.innerHTML = '';
  snippets.forEach(snippet => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = snippet.id;
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);

    // Create content container
    const content = document.createElement('div');
    content.className = 'snippet-content';

    // Item
    const item = document.createElement('div');
    item.className = 'snippet-item';
    item.textContent = snippet.item;
    content.appendChild(item);

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

    // Add button (for click-to-add functionality)
    const addBtn = document.createElement('button');
    addBtn.innerHTML = '<i class="fa fa-plus"></i>';
    addBtn.className = 'add-btn';
    addBtn.title = 'Add to builder';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      addSnippetToBuilder(snippet);
    };
    li.appendChild(addBtn);

    // Menu button (sandwich menu)
    const menuBtn = document.createElement('button');
    menuBtn.innerHTML = '<i class="fa fa-bars"></i>';
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'Edit snippet';
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      openEditModal(snippet);
    };
    li.appendChild(menuBtn);
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
    li.textContent = snippet.item;
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

// Function to add a snippet to the builder
function addSnippetToBuilder(snippet) {
  builderSnippets.push(snippet);
  renderBuilderList();
  updatePreview();
  showToast('Snippet added to builder!');
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
      .map(s => `<pre style="margin-bottom:1em;">${escapeHtml(JSON.stringify({ item: s.item, content: s.content }, null, 2))}</pre>`)
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

copyPreviewBtn.addEventListener('click', () => {
  let text = '';
  if (previewMode === 'markdown') {
    text = builderSnippets.map(s => s.content).join('\n\n');
  } else {
    text = JSON.stringify(builderSnippets.map(s => ({ item: s.item, content: s.content })), null, 2);
  }
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }, () => {
      showToast('Failed to copy');
    });
  } else {
    showToast('Nothing to copy');
  }
});

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

// --- Edit Modal Functions ---
function openEditModal(snippet) {
  currentEditingSnippet = snippet;
  editSnippetItem.value = snippet.item;
  // Populate categories and set selected
  populateCategoryDropdowns(snippet.category, true);
  editSnippetTags.value = snippet.tags ? snippet.tags.join(', ') : '';
  editSnippetContent.value = snippet.content;
  editSnippetDescription.value = snippet.description || '';
  editSnippetModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  editSnippetModal.classList.remove('show');
  document.body.style.overflow = '';
  editSnippetForm.reset();
  currentEditingSnippet = null;
}

// --- Modal Event Listeners ---
createSnippetBtn.addEventListener('click', async () => {
  await populateCategoryDropdowns();
  showOtherCategoryInput(false, ''); // Hide by default
});
closeSnippetModal.addEventListener('click', closeModal);
cancelSnippet.addEventListener('click', closeModal);

// Edit modal event listeners
closeEditModalBtn.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);

// Close modals when clicking outside
createSnippetModal.addEventListener('click', (e) => {
  if (e.target === createSnippetModal) {
    closeModal();
  }
});

editSnippetModal.addEventListener('click', (e) => {
  if (e.target === editSnippetModal) {
    closeEditModal();
  }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (createSnippetModal.classList.contains('show')) {
      closeModal();
    } else if (editSnippetModal.classList.contains('show')) {
      closeEditModal();
    }
  }
});

snippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let categoryValue = snippetCategory.value;
  if (categoryValue === '__other__') {
    const otherInput = document.getElementById('other-category');
    categoryValue = otherInput ? otherInput.value : '';
  }
  const data = {
    item: snippetItem.value,
    category: categoryValue,
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

// Edit form submission
editSnippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditingSnippet) return;
  
  let categoryValue = editSnippetCategory.value;
  if (categoryValue === '__other__') {
    const otherInput = document.getElementById('edit-other-category');
    categoryValue = otherInput ? otherInput.value : '';
  }
  const data = {
    item: editSnippetItem.value,
    category: categoryValue,
    tags: editSnippetTags.value.split(',').map(t => t.trim()).filter(Boolean),
    content: editSnippetContent.value,
    description: editSnippetDescription.value
  };
  
  const res = await fetch(`/api/snippets/${currentEditingSnippet.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (res.ok) {
    showToast('Snippet updated successfully!');
    closeEditModal();
    loadSnippets();
  } else {
    showToast('Failed to update snippet');
  }
});

// Delete button functionality
deleteSnippetBtn.addEventListener('click', async () => {
  if (!currentEditingSnippet) return;
  
  if (confirm(`Are you sure you want to delete "${currentEditingSnippet.item}"?`)) {
    const res = await fetch(`/api/snippets/${currentEditingSnippet.id}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      showToast('Snippet deleted successfully!');
      closeEditModal();
      loadSnippets();
    } else {
      showToast('Failed to delete snippet');
    }
  }
});

// --- Save Prompt Functionality ---
savePromptBtn.addEventListener('click', async () => {
  if (builderSnippets.length === 0) {
    showToast('Add snippets to builder before saving!');
    return;
  }
  const title = prompt('Enter a title for this prompt:');
  if (!title) return;
  const snippet_ids = builderSnippets.map(s => s.id);
  const content = builderSnippets.map(s => s.content).join('\n\n');
  const res = await fetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, snippet_ids })
  });
  if (res.ok) {
    showToast('Prompt saved!');
  } else {
    showToast('Failed to save prompt');
  }
});

// --- Browse Prompts Functionality ---
browsePromptsBtn.addEventListener('click', async () => {
  await loadPrompts();
  browsePromptsModal.classList.add('show');
  document.body.style.overflow = 'hidden';
});

closeBrowsePromptsModal.addEventListener('click', closeBrowseModal);

function closeBrowseModal() {
  browsePromptsModal.classList.remove('show');
  document.body.style.overflow = '';
}

// Close modal when clicking outside
browsePromptsModal.addEventListener('click', (e) => {
  if (e.target === browsePromptsModal) {
    closeBrowseModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && browsePromptsModal.classList.contains('show')) {
    closeBrowseModal();
  }
});

async function loadPrompts() {
  const res = await fetch('/api/prompts');
  if (!res.ok) {
    showToast('Failed to load prompts');
    return;
  }
  const prompts = await res.json();
  renderPromptsList(prompts);
}

function renderPromptsList(prompts) {
  promptsList.innerHTML = '';
  if (prompts.length === 0) {
    promptsList.innerHTML = '<p>No saved prompts found.</p>';
    return;
  }
  prompts.forEach(prompt => {
    const div = document.createElement('div');
    div.className = 'prompt-entry';
    const title = document.createElement('div');
    title.className = 'prompt-title';
    title.textContent = prompt.title;
    div.appendChild(title);
    const preview = document.createElement('pre');
    preview.className = 'prompt-preview';
    preview.textContent = prompt.content;
    div.appendChild(preview);
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load into Builder';
    loadBtn.onclick = () => loadPromptIntoBuilder(prompt);
    div.appendChild(loadBtn);
    promptsList.appendChild(div);
  });
}

async function loadPromptIntoBuilder(prompt) {
  // Fetch snippets by IDs to get full snippet objects
  if (!prompt.snippet_ids || prompt.snippet_ids.length === 0) {
    showToast('No snippets found for this prompt');
    return;
  }
  const res = await fetch('/api/snippets');
  if (!res.ok) {
    showToast('Failed to load snippets');
    return;
  }
  const allSnippets = await res.json();
  builderSnippets = allSnippets.filter(s => prompt.snippet_ids.includes(s.id));
  renderBuilderList();
  updatePreview();
  closeBrowseModal();
  showToast('Prompt loaded into builder!');
}

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
        item: 'Role: Assistant',
        category: 'Role',
        tags: ['role', 'assistant'],
        content: 'You are a helpful assistant.',
        description: 'The AI role.'
      },
      {
        item: 'Task: Summarize',
        category: 'Task',
        tags: ['task', 'summarize'],
        content: 'Summarize the following text: [text_to_summarize]',
        description: 'Summarize input.'
      },
      {
        item: 'Format: Markdown',
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

// --- Search and Filter Functions ---
function renderCategoryFilters() {
  // Get unique categories from snippets
  const categories = [...new Set(snippets.map(s => s.category))];
  
  // Clear existing filters
  snippetCategories.innerHTML = '';
  
  // Add "All" filter
  const allFilter = document.createElement('button');
  allFilter.textContent = 'All';
  allFilter.className = 'category-filter active';
  allFilter.onclick = () => {
    // Remove active class from all filters
    document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
    allFilter.classList.add('active');
    loadSnippets(snippetSearch.value, '');
  };
  snippetCategories.appendChild(allFilter);
  
  // Add category filters
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.className = 'category-filter';
    btn.onclick = () => {
      // Remove active class from all filters
      document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
      btn.classList.add('active');
      loadSnippets(snippetSearch.value, category);
    };
    snippetCategories.appendChild(btn);
  });
}

// Add search functionality
snippetSearch.addEventListener('input', debounce(() => {
  const searchTerm = snippetSearch.value.trim();
  const activeCategory = document.querySelector('.category-filter.active');
  const category = activeCategory && activeCategory.textContent !== 'All' ? activeCategory.textContent : '';
  loadSnippets(searchTerm, category);
}, 300));

// Debounce helper function to limit API calls during typing
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// --- Initial Load ---
// Call this function immediately since the script is loaded at the bottom of the page
ensureTestSnippets(); 

// --- Category Dropdown Logic ---
async function populateCategoryDropdowns(selectedValue = '', isEdit = false) {
  const select = isEdit ? editSnippetCategory : snippetCategory;
  select.innerHTML = '';
  try {
    const res = await fetch('/api/categories');
    let categories = [];
    if (res.ok) {
      categories = await res.json();
    }
    if (categories.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No categories yet';
      select.appendChild(opt);
    } else {
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
    }
    // Add 'Other...' option
    const otherOpt = document.createElement('option');
    otherOpt.value = '__other__';
    otherOpt.textContent = 'Other...';
    select.appendChild(otherOpt);
    // Set selected value
    if (selectedValue && categories.includes(selectedValue)) {
      select.value = selectedValue;
    } else if (selectedValue) {
      select.value = '__other__';
      showOtherCategoryInput(isEdit, selectedValue);
    } else {
      select.value = '';
      hideOtherCategoryInput(isEdit);
    }
  } catch (e) {
    select.innerHTML = '<option value="">Error loading categories</option>';
  }
}

function showOtherCategoryInput(isEdit, value = '') {
  let inputId = isEdit ? 'edit-other-category' : 'other-category';
  let select = isEdit ? editSnippetCategory : snippetCategory;
  let formGroup = select.parentElement;
  let existing = document.getElementById(inputId);
  if (!existing) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.placeholder = 'Enter new category';
    input.required = true;
    input.className = 'other-category-input';
    formGroup.appendChild(input);
    input.value = value || '';
  } else {
    existing.style.display = '';
    existing.value = value || '';
  }
}

function hideOtherCategoryInput(isEdit) {
  let inputId = isEdit ? 'edit-other-category' : 'other-category';
  let existing = document.getElementById(inputId);
  if (existing) {
    existing.style.display = 'none';
    existing.value = '';
  }
}

snippetCategory.addEventListener('change', function() {
  if (this.value === '__other__') {
    showOtherCategoryInput(false);
  } else {
    hideOtherCategoryInput(false);
  }
});
editSnippetCategory.addEventListener('change', function() {
  if (this.value === '__other__') {
    showOtherCategoryInput(true);
  } else {
    hideOtherCategoryInput(true);
  }
});

// --- Modal Open Hooks ---
createSnippetBtn.addEventListener('click', async () => {
  await populateCategoryDropdowns();
  showOtherCategoryInput(false, ''); // Hide by default
});

// --- Form Submission Adjustments ---
snippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let categoryValue = snippetCategory.value;
  if (categoryValue === '__other__') {
    const otherInput = document.getElementById('other-category');
    categoryValue = otherInput ? otherInput.value : '';
  }
  const data = {
    item: snippetItem.value,
    category: categoryValue,
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

editSnippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditingSnippet) return;
  let categoryValue = editSnippetCategory.value;
  if (categoryValue === '__other__') {
    const otherInput = document.getElementById('edit-other-category');
    categoryValue = otherInput ? otherInput.value : '';
  }
  const data = {
    item: editSnippetItem.value,
    category: categoryValue,
    tags: editSnippetTags.value.split(',').map(t => t.trim()).filter(Boolean),
    content: editSnippetContent.value,
    description: editSnippetDescription.value
  };
  
  const res = await fetch(`/api/snippets/${currentEditingSnippet.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (res.ok) {
    showToast('Snippet updated successfully!');
    closeEditModal();
    loadSnippets();
  } else {
    showToast('Failed to update snippet');
  }
}); 