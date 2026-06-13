# resources/wsf.py
from flask_restful import Resource, request, abort
from flask import current_app
from extensions import db
from models.wsf import WSFCell, WSFUser
from sqlalchemy.exc import IntegrityError
from math import radians, sin, cos, sqrt, atan2
from decimal import Decimal


# ─── Utilitaire GPS ───────────────────────────────────────────────────────────

def haversine(lat1, lon1, lat2, lon2):
    """Distance en kilomètres entre deux points GPS."""
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        R = 6371.0
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c
    except Exception:
        return None


def clean_decimals(d):
    """Convertit toutes les valeurs Decimal d'un dict en float."""
    return {k: (float(v) if isinstance(v, Decimal) else v) for k, v in d.items()}


# ─── Types valides ────────────────────────────────────────────────────────────
TYPES_VALIDES = {'cellule', 'satellite'}


# ─── Ressource Cellules ───────────────────────────────────────────────────────

class WSFCellResource(Resource):

    # ── GET : liste ou détail ──────────────────────────────────────────────────
    def get(self, cell_id=None):

        # ── Détail d'une cellule spécifique ───────────────────────────────────
        if cell_id:
            cell = WSFCell.query.get_or_404(cell_id)
            return clean_decimals(cell.to_dict()), 200

        # ── Paramètres de la requête ──────────────────────────────────────────
        user_lat  = request.args.get('lat',  type=float)
        user_lon  = request.args.get('lon',  type=float)
        type_filtre = request.args.get('type', type=str)  # ← NOUVEAU : 'cellule' | 'satellite'

        current_app.logger.info(f"GPS Request: lat={user_lat}, lon={user_lon}, type={type_filtre}")

        # ── Validation du filtre type ─────────────────────────────────────────
        if type_filtre and type_filtre not in TYPES_VALIDES:
            abort(400, message=f"Type invalide. Valeurs acceptées : {', '.join(TYPES_VALIDES)}")

        # ── Construction de la requête de base ────────────────────────────────
        query = WSFCell.query.filter_by(statut='active')

        # Filtre par type si fourni
        if type_filtre:
            query = query.filter_by(type=type_filtre)

        cells = query.all()

        # ── Mode géolocalisé : retourne les 5 points les plus proches ─────────
        if user_lat is not None and user_lon is not None:
            results = []
            for cell in cells:
                c_lat = float(getattr(cell, 'latitude',  None) or 0)
                c_lon = float(getattr(cell, 'longitude', None) or 0)
                if not c_lat and not c_lon:
                    continue
                dist = haversine(user_lat, user_lon, c_lat, c_lon)
                if dist is not None:
                    cell_dict = clean_decimals(cell.to_dict())
                    cell_dict['distance_km'] = round(dist, 2)
                    results.append(cell_dict)

            results.sort(key=lambda x: x['distance_km'])
            return results[:5], 200

        # ── Mode normal : tous les points actifs (filtrés par type si fourni) ─
        return [clean_decimals(cell.to_dict()) for cell in cells], 200

    # ── POST : créer une cellule ou un satellite ───────────────────────────────
    def post(self):
        data = request.get_json() or {}

        required = {'nom_cellule', 'latitude', 'longitude'}
        missing = required - set(data.keys())
        if missing:
            abort(400, message=f"Champs obligatoires manquants : {', '.join(missing)}")

        # Validation latitude / longitude
        try:
            lat = float(data['latitude'])
            lon = float(data['longitude'])
        except (ValueError, TypeError):
            abort(400, message="latitude et longitude doivent être des nombres valides.")

        # Validation type
        type_value = data.get('type', 'cellule').strip().lower()
        if type_value not in TYPES_VALIDES:
            abort(400, message=f"Type invalide. Valeurs acceptées : {', '.join(TYPES_VALIDES)}")

        try:
            new_cell = WSFCell(
                nom_cellule          = data['nom_cellule'].strip(),
                quartier             = data.get('quartier', '').strip() or None,
                type                 = type_value,                                      # ← NOUVEAU
                description_position = data.get('description_position', '').strip() or None,  # ← NOUVEAU
                latitude             = lat,
                longitude            = lon,
                statut               = data.get('statut', 'en_attente'),
            )
            db.session.add(new_cell)
            db.session.commit()
            return clean_decimals(new_cell.to_dict()), 201

        except IntegrityError:
            db.session.rollback()
            abort(409, message="Un point identique existe déjà.")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur création cellule/satellite: {e}")
            abort(500, message="Erreur serveur interne.")

    # ── PUT : mettre à jour une cellule ou un satellite ───────────────────────
    def put(self, cell_id):
        cell = WSFCell.query.get_or_404(cell_id)
        data = request.get_json() or {}

        if 'nom_cellule' in data:
            cell.nom_cellule = data['nom_cellule'].strip()
        if 'quartier' in data:
            cell.quartier = data['quartier'].strip() or None
        if 'latitude' in data:
            cell.latitude = float(data['latitude'])
        if 'longitude' in data:
            cell.longitude = float(data['longitude'])
        if 'statut' in data:
            cell.statut = data['statut']

        # ── NOUVEAU : mise à jour type ────────────────────────────────────────
        if 'type' in data:
            type_value = data['type'].strip().lower()
            if type_value not in TYPES_VALIDES:
                abort(400, message=f"Type invalide. Valeurs acceptées : {', '.join(TYPES_VALIDES)}")
            cell.type = type_value

        # ── NOUVEAU : mise à jour description_position ────────────────────────
        if 'description_position' in data:
            cell.description_position = data['description_position'].strip() or None

        try:
            db.session.commit()
            return clean_decimals(cell.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur update cellule/satellite: {e}")
            abort(500, message="Erreur serveur interne.")

    # ── DELETE : supprimer une cellule ou un satellite ────────────────────────
    def delete(self, cell_id):
        cell = WSFCell.query.get_or_404(cell_id)
        try:
            db.session.delete(cell)
            db.session.commit()
            return {"message": "Point supprimé."}, 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur suppression: {e}")
            abort(500, message="Erreur serveur interne.")


# ─── Ressource Servants (WSFUser) ─────────────────────────────────────────────

# Rôles valides selon le modèle WSFUser (Enum SQL)
ROLES_VALIDES = {'leader', 'leader_adjoint', 'secretaire', 'hote'}

class WSFUserResource(Resource):

    # ── GET : liste ou détail ──────────────────────────────────────────────────
    def get(self, user_id=None):
        if user_id:
            user = WSFUser.query.get_or_404(user_id)
            return user.to_dict(), 200
        users = WSFUser.query.all()
        return [u.to_dict() for u in users], 200

    # ── POST : créer un servant ────────────────────────────────────────────────
    def post(self):
        data = request.get_json() or {}

        required = {'nom_complet', 'telephone', 'role', 'cell_id'}
        missing = required - set(data.keys())
        if missing:
            abort(400, message=f"Champs obligatoires manquants : {', '.join(missing)}")

        # Validation du rôle contre l'Enum du modèle
        role_data = data.get('role')
        if isinstance(role_data, dict):
            role = role_data.get('value') or role_data.get('label')
        elif isinstance(role_data, str):
            role = role_data
        else:
            role = ""

        role = role.strip().lower()
        if role not in ROLES_VALIDES:
            abort(400, message=f"Rôle invalide. Valeurs acceptées : {', '.join(ROLES_VALIDES)}")

        if WSFUser.query.filter_by(telephone=data['telephone'].strip()).first():
            abort(409, message="Ce numéro de téléphone est déjà utilisé.")

        # Vérifier que la cellule/satellite existe
        if not WSFCell.query.get(data['cell_id']):
            abort(404, message=f"Cellule/Satellite introuvable : {data['cell_id']}")

        try:
            new_user = WSFUser(
                nom_complet = data['nom_complet'].strip(),
                telephone   = data['telephone'].strip(),
                role        = role,
                cell_id     = data['cell_id'],
            )
            db.session.add(new_user)
            db.session.commit()
            return new_user.to_dict(), 201

        except IntegrityError:
            db.session.rollback()
            abort(409, message="Erreur de contrainte base de données.")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur création servant: {e}")
            abort(500, message="Erreur serveur interne.")

    # ── PUT : mettre à jour un servant ────────────────────────────────────────
    def put(self, user_id):
        user = WSFUser.query.get_or_404(user_id)
        data = request.get_json() or {}

        if 'nom_complet' in data:
            user.nom_complet = data['nom_complet'].strip()
        if 'telephone' in data:
            user.telephone = data['telephone'].strip()
        if 'role' in data:
            role = data['role'].strip().lower()
            if role not in ROLES_VALIDES:
                abort(400, message=f"Rôle invalide. Valeurs acceptées : {', '.join(ROLES_VALIDES)}")
            user.role = role
        if 'cell_id' in data:
            if not WSFCell.query.get(data['cell_id']):
                abort(404, message=f"Cellule/Satellite introuvable : {data['cell_id']}")
            user.cell_id = data['cell_id']

        try:
            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur update servant: {e}")
            abort(500, message="Erreur serveur interne.")

    # ── DELETE : supprimer un servant ─────────────────────────────────────────
    def delete(self, user_id):
        user = WSFUser.query.get_or_404(user_id)
        try:
            db.session.delete(user)
            db.session.commit()
            return {"message": "Servant supprimé."}, 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Erreur suppression servant: {e}")
            abort(500, message="Erreur serveur interne.")