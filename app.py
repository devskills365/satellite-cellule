# app.py
from flask import Flask, request, has_request_context, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_cors import CORS
from flask_migrate import Migrate
import  os

from logging.handlers import RotatingFileHandler
import logging
from datetime import datetime
from extensions import db
from config import Config

from resources.wsf import WSFCellResource, WSFUserResource
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv




# ========================
# 1. CHARGEMENT .ENV
# ========================
load_dotenv()

# ========================
# 2. FORMAT LOGS
# ========================
class RequestFormatter(logging.Formatter):
    def format(self, record):
        if has_request_context():
            record.url = request.path
            record.method = request.method
            record.remote_addr = request.remote_addr or 'unknown'
            record.user = request.headers.get('X-User', 'anonymous')
        else:
            record.url = 'N/A'
            record.method = 'N/A'
            record.remote_addr = 'N/A'
            record.user = 'system'
        record.timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return super().format(record)

formatter = RequestFormatter(
    '[%(timestamp)s] %(levelname)-5s | %(method)-4s | %(url)-35s | IP: %(remote_addr)-15s | User: %(user)-10s | %(message)s'
)

# ========================
# 3. CONFIG LOGGING
# ========================
if not os.path.exists('logs'):
    os.makedirs('logs')

file_handler = RotatingFileHandler('logs/app.log', maxBytes=5*1024*1024, backupCount=5)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# ========================
# 4. FLASK APP
# ========================
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
app.config.from_object(Config)
app.url_map.strict_slashes = False
app.config["JWT_SECRET_KEY"] = "è_è56(-8UIDYDGARTQGDH~###"
jwt = JWTManager(app)

app.logger.handlers.clear()
app.logger.addHandler(file_handler)
app.logger.addHandler(console_handler)
app.logger.setLevel(logging.INFO)




# ========================
# 6. DB + MIGRATE + CORS
# ========================
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ========================
# 7. API ROUTES
# ========================
api = Api(app)


api.add_resource(WSFCellResource,           '/api/wsf/cells', '/api/wsf/cells/<string:cell_id>')
api.add_resource(WSFUserResource,           '/api/wsf/servants', '/api/wsf/servants/<string:user_id>')


from deep_translator import GoogleTranslator

def traduire_dictionnaire_auto(data_dict, target_lang='fr'):
    """
    Traduit automatiquement les valeurs textuelles d'un dictionnaire.
    Si target_lang est 'fr', on renvoie les données natives sans consommer d'API.
    """
    if target_lang == 'fr':
        return data_dict  # Vos données sont déjà en français natif
        
    # Initialisation du traducteur de Français à Anglais
    translator = GoogleTranslator(source='fr', target='en')
    
    translated_dict = {}
    for key, value in data_dict.items():
        # On ne traduit que les chaînes de caractères (le texte)
        # On évite de traduire les clés techniques ou les valeurs numériques
        if isinstance(value, str) and key not in ['id', '_id', 'lat', 'lng', 'geom', 'email', 'url']:
            try:
                # Traduction automatique à la volée
                translated_dict[key] = translator.translate(value)
            except Exception as e:
                # En cas d'erreur réseau de l'API de traduction, on garde la valeur d'origine
                print(f"Erreur de traduction pour la clé {key}: {e}")
                translated_dict[key] = value
        else:
            # On conserve les nombres, listes ou ID intacts
            translated_dict[key] = value
            
    return translated_dict


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)