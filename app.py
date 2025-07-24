import os
from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db

# Load environment variables from .env
load_dotenv()

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    # Use absolute path for SQLite database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'db.sqlite3')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')

    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register routes
    from routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
