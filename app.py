import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import replicate

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data['prompt']
    aspect_ratio = data['aspectRatio']
    safety_tolerance = data['safetyTolerance']
    seed = int(data['seed'])
    width = int(data['width'])
    height = int(data['height'])

    try:
        logger.info(f"Generating image with parameters: {data}")
        
        # Convert safety_tolerance to integer using the mapping
        safety_tolerance_mapping = {
            'low': 1,
            'medium': 3,
            'high': 5
        }
        safety_tolerance = safety_tolerance_mapping.get(safety_tolerance, 3)  # Default to medium if invalid value
        
        # Add detailed logging for each parameter
        logger.debug(f'Prompt: {prompt}, type: {type(prompt)}')
        logger.debug(f'Aspect Ratio: {aspect_ratio}, type: {type(aspect_ratio)}')
        logger.debug(f'Safety Tolerance: {safety_tolerance}, type: {type(safety_tolerance)}')
        logger.debug(f'Seed: {seed}, type: {type(seed)}')
        logger.debug(f'Width: {width}, type: {type(width)}')
        logger.debug(f'Height: {height}, type: {type(height)}')
        
        output = replicate.run(
            'black-forest-labs/flux-1.1-pro',
            input={
                'prompt': prompt,
                'aspect_ratio': aspect_ratio,
                'safety_tolerance': safety_tolerance,
                'seed': seed,
                'width': width,
                'height': height
            }
        )
        
        logger.info(f"Image generated successfully: {output}")
        return jsonify({"image_url": output})
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
