const API_URL = '/books';

const form = document.getElementById('bookForm');
const booksContainer = document.getElementById('books');
const categoryFilter = document.getElementById('categoryFilter');
const formError = document.getElementById('formError');

let books = [];

// ---------- Fetch ----------
const loadBooks = async () => {
  const res = await fetch(API_URL);
  books = await res.json();
  updateCategoryOptions();
  renderBooks();
};

// ---------- Render (filter with array methods + arrow functions) ----------
const renderBooks = () => {
  const selected = categoryFilter.value;

  const filtered = books.filter(
    (book) => selected === 'all' || book.category === selected
  );

  if (filtered.length === 0) {
    booksContainer.innerHTML = '<p class="text-muted">No books found.</p>';
    return;
  }

  booksContainer.innerHTML = filtered
    .map(
      (book) => `
      <div class="col-12 col-sm-6">
        <div class="card book-card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
            <p class="card-text mb-1">
              <span class="badge bg-secondary">${book.category}</span>
            </p>
            <p class="card-text"><small>Year: ${book.year}</small></p>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${book.id}">
              Remove
            </button>
          </div>
        </div>
      </div>`
    )
    .join('');
};

// ---------- Category dropdown built with map ----------
const updateCategoryOptions = () => {
  const current = categoryFilter.value;
  const categories = [...new Set(books.map((book) => book.category))];

  categoryFilter.innerHTML =
    '<option value="all">All Categories</option>' +
    categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('');

  categoryFilter.value = categories.includes(current) ? current : 'all';
};

// ---------- Add book ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const category = document.getElementById('category').value.trim();
  const year = document.getElementById('year').value.trim();

  // Validation: no empty fields
  if (!title || !author || !category || !year) {
    formError.textContent = 'All fields are required.';
    return;
  }
  formError.textContent = '';

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, category, year }),
  });

  if (res.ok) {
    const newBook = await res.json();
    books.push(newBook);
    updateCategoryOptions();
    renderBooks();
    form.reset();
  } else {
    const err = await res.json();
    formError.textContent = err.error;
  }
});

// ---------- Remove book (event delegation) ----------
booksContainer.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('delete-btn')) return;

  const id = Number(e.target.dataset.id);
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

  if (res.ok) {
    books = books.filter((book) => book.id !== id);
    updateCategoryOptions();
    renderBooks();
  }
});

// ---------- Filter ----------
categoryFilter.addEventListener('change', renderBooks);

// ---------- Init ----------
loadBooks();