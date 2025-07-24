import json
import re
from flask import Blueprint, request, jsonify
from models import Snippet, Prompt, Tag, db

api_bp = Blueprint('api', __name__)

# --- Snippet Management ---
@api_bp.route('/snippets', methods=['GET'])
def list_snippets():
    category = request.args.get('category')
    search = request.args.get('search')
    query = Snippet.query
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Snippet.item.ilike(f'%{search}%') | Snippet.description.ilike(f'%{search}%'))
    snippets = query.order_by(Snippet.created_at.desc()).all()
    return jsonify([{
        'id': s.id,
        'item': s.item,
        'description': s.description,
        'content': s.content,
        'category': s.category,
        'tags': [tag.name for tag in s.tags],
        'created_at': s.created_at.isoformat(),
        'updated_at': s.updated_at.isoformat()
    } for s in snippets])

@api_bp.route('/snippets', methods=['POST'])
def create_snippet():
    data = request.get_json()
    tag_names = data.get('tags', [])
    tags = []
    for name in tag_names:
        tag = Tag.query.filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
        tags.append(tag)
    snippet = Snippet(
        item=data.get('item'),
        description=data.get('description'),
        content=data.get('content'),
        category=data.get('category'),
        tags=tags
    )
    db.session.add(snippet)
    db.session.commit()
    return jsonify({'id': snippet.id}), 201

@api_bp.route('/snippets/<int:id>', methods=['PUT'])
def update_snippet(id):
    snippet = Snippet.query.get_or_404(id)
    data = request.get_json()
    snippet.item = data.get('item', snippet.item)
    snippet.description = data.get('description', snippet.description)
    snippet.content = data.get('content', snippet.content)
    snippet.category = data.get('category', snippet.category)
    tag_names = data.get('tags', [tag.name for tag in snippet.tags])
    tags = []
    for name in tag_names:
        tag = Tag.query.filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
        tags.append(tag)
    snippet.tags = tags
    db.session.commit()
    return jsonify({'success': True})

@api_bp.route('/snippets/<int:id>', methods=['DELETE'])
def delete_snippet(id):
    snippet = Snippet.query.get_or_404(id)
    db.session.delete(snippet)
    db.session.commit()
    return jsonify({'success': True})

@api_bp.route('/snippets/<int:id>/form-fields', methods=['GET'])
def extract_form_fields(id):
    snippet = Snippet.query.get_or_404(id)
    # Find all [field_name] in content
    fields = re.findall(r'\[([a-zA-Z0-9_]+)\]', snippet.content)
    return jsonify({'fields': fields})

# --- Prompt Management ---
@api_bp.route('/prompts', methods=['GET'])
def list_prompts():
    prompts = Prompt.query.order_by(Prompt.created_at.desc()).all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'content': p.content,
        'snippet_ids': [s.id for s in p.snippets],
        'created_at': p.created_at.isoformat(),
        'updated_at': p.updated_at.isoformat()
    } for p in prompts])

@api_bp.route('/prompts', methods=['POST'])
def create_prompt():
    data = request.get_json()
    snippet_ids = data.get('snippet_ids', [])
    snippets = Snippet.query.filter(Snippet.id.in_(snippet_ids)).all() if snippet_ids else []
    prompt = Prompt(
        title=data.get('title'),
        content=data.get('content'),
        snippets=snippets
    )
    db.session.add(prompt)
    db.session.commit()
    return jsonify({'id': prompt.id}), 201

@api_bp.route('/prompts/<int:id>', methods=['PUT'])
def update_prompt(id):
    prompt = Prompt.query.get_or_404(id)
    data = request.get_json()
    prompt.title = data.get('title', prompt.title)
    prompt.content = data.get('content', prompt.content)
    snippet_ids = data.get('snippet_ids', [s.id for s in prompt.snippets])
    prompt.snippets = Snippet.query.filter(Snippet.id.in_(snippet_ids)).all() if snippet_ids else []
    db.session.commit()
    return jsonify({'success': True})

@api_bp.route('/prompts/<int:id>', methods=['DELETE'])
def delete_prompt(id):
    prompt = Prompt.query.get_or_404(id)
    db.session.delete(prompt)
    db.session.commit()
    return jsonify({'success': True})

@api_bp.route('/export/<int:id>', methods=['GET'])
def export_prompt(id):
    prompt = Prompt.query.get_or_404(id)
    export_format = request.args.get('format', 'markdown')
    if export_format == 'json':
        return jsonify({
            'id': prompt.id,
            'title': prompt.title,
            'content': prompt.content,
            'snippet_ids': [s.id for s in prompt.snippets],
            'created_at': prompt.created_at.isoformat(),
            'updated_at': prompt.updated_at.isoformat()
        })
    # Default: markdown
    return prompt.content, 200, {'Content-Type': 'text/markdown; charset=utf-8'}

# --- Utility ---
@api_bp.route('/process-form-fields', methods=['POST'])
def process_form_fields():
    data = request.get_json()
    content = data.get('content', '')
    values = data.get('values', {})
    # Replace [field_name] with values[field_name]
    def replacer(match):
        key = match.group(1)
        return str(values.get(key, f'[{key}]'))
    processed = re.sub(r'\[([a-zA-Z0-9_]+)\]', replacer, content)
    return jsonify({'processed': processed})
