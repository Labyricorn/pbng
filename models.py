from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Association table for Snippet <-> Tag
snippet_tags = db.Table(
    'snippet_tags',
    db.Column('snippet_id', db.Integer, db.ForeignKey('snippets.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# Association table for Prompt <-> Snippet
prompt_snippets = db.Table(
    'prompt_snippets',
    db.Column('prompt_id', db.Integer, db.ForeignKey('prompts.id'), primary_key=True),
    db.Column('snippet_id', db.Integer, db.ForeignKey('snippets.id'), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    snippets = db.relationship('Snippet', secondary=snippet_tags, back_populates='tags')

class Snippet(db.Model):
    __tablename__ = 'snippets'
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags = db.relationship('Tag', secondary=snippet_tags, back_populates='snippets')
    prompts = db.relationship('Prompt', secondary=prompt_snippets, back_populates='snippets')

class Prompt(db.Model):
    __tablename__ = 'prompts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    snippets = db.relationship('Snippet', secondary=prompt_snippets, back_populates='prompts')
