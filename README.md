# Prompt Builder NG

A modern web application for visual AI prompt engineering with drag-and-drop functionality, snippet management, and prompt composition tools.

## Features

### 🧩 Snippet Management
- **Visual snippet library** with search and categorization
- **Drag & drop** or **click-to-add** snippets to prompt builder
- **Full CRUD operations** - Create, edit, view, and delete snippets
- **Field placeholders** - Use `[field_name]` for dynamic content
- **Organized categories** and tagging system

### 🔧 Prompt Builder
- **Visual prompt composition** with drag-and-drop interface
- **Live preview** in Markdown or JSON format
- **Dynamic field editing** - Click field buttons to set values
- **Clear builder** functionality for quick resets
- **Copy to clipboard** for easy prompt sharing

### 💾 Prompt Management
- **Save composed prompts** with custom titles
- **Browse saved prompts** in a large modal interface
- **Load prompts** back into builder for editing
- **Delete unwanted prompts** with confirmation
- **Preview prompt content** before loading

### 🎨 User Interface
- **Dark/Light mode toggle** with persistent preferences
- **Responsive design** that works on all screen sizes
- **Clean modal interfaces** for focused interactions
- **Toast notifications** for user feedback
- **Professional gradient design** with smooth animations

### 🔧 Technical Features
- **SQLite database** for data persistence
- **RESTful API** with full CRUD operations
- **Field value processing** and content generation
- **Error handling** with graceful fallbacks
- **Network accessibility** options for team sharing

## Getting Started

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Labyricorn/pbng
   cd pbng-cursor-v1-0
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   pbng_env\Scripts\activate
   
   # macOS/Linux
   source pbng_env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   ```
   http://localhost:5000/static/index.html
   ```

### Network Access
By default, the app only runs on localhost. To make it accessible from other devices on your network:

1. Edit `app.py` and change:
   ```python
   app.run(debug=True)
   ```
   to:
   ```python
   app.run(host='0.0.0.0', debug=True)
   ```

2. Access from other devices at:
   ```
   http://[your-computer-ip]:5000/static/index.html
   ```

## Usage Guide

### Creating Snippets
1. Click the **"Add New Snippet"** button in the snippet library
2. Fill in the form with title, category, content, and optional description
3. Use `[field_name]` syntax for dynamic placeholders
4. Click **"Add Snippet"** to save

### Building Prompts
1. **Drag snippets** from the library to the builder area, or
2. **Click the arrow button** (→) next to any snippet to add it
3. **Edit field values** by clicking the `[field]` buttons
4. **Preview** your prompt in real-time in Markdown or JSON format
5. **Save** your completed prompt with a custom title

### Managing Content
- **View snippet details** by clicking the menu button (☰)
- **Edit or delete snippets** from the details modal
- **Browse saved prompts** using the "Browse Prompts" button
- **Load saved prompts** back into the builder for modification
- **Toggle dark/light mode** using the theme button in the header

## API Endpoints

### Snippets
- `GET /api/snippets` - List all snippets
- `POST /api/snippets` - Create new snippet
- `PUT /api/snippets/<id>` - Update snippet
- `DELETE /api/snippets/<id>` - Delete snippet

### Prompts
- `GET /api/prompts` - List all saved prompts
- `POST /api/prompts` - Save new prompt
- `PUT /api/prompts/<id>` - Update prompt
- `DELETE /api/prompts/<id>` - Delete prompt

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: CSS Grid/Flexbox with CSS Variables
- **Icons**: Font Awesome 6
- **Features**: Drag & Drop API, Local Storage, Fetch API

## Project Structure

```
pbng-cursor-v1-0/
├── app.py              # Flask application and configuration
├── models.py           # Database models (Snippet, Prompt)
├── routes.py           # API endpoints and business logic
├── requirements.txt    # Python dependencies
├── static/
│   ├── index.html     # Main application interface
│   ├── main.js        # Frontend JavaScript logic
│   └── styles.css     # Application styling and themes
├── instance/
│   └── db.sqlite3     # SQLite database file
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).# pbng
