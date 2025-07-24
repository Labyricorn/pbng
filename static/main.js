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
  editSnippetCategory.value = snippet.category;
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
createSnippetBtn.addEventListener('click', openModal);
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
  const data = {
    item: snippetItem.value,
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

// Edit form submission
editSnippetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditingSnippet) return;
  
  const data = {
    item: editSnippetItem.value,
    category: editSnippetCategory.value,
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