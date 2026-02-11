import os
from dotenv import load_dotenv
from app import create_app, db

# Load environment variables
load_dotenv()

# Create app
app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    """Add database and models to Flask shell"""
    return {'db': db}

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=os.getenv('FLASK_ENV') == 'development'
    )
