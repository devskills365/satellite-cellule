# models/wsf.py
from datetime import datetime
import uuid
from extensions import db
from sqlalchemy.dialects.mysql import VARCHAR

def generate_uuid():
    return str(uuid.uuid4())

class WSFCell(db.Model):
    __tablename__ = 'wsf_cells'

    # UUID pour la sécurité des IDs dans l'URL
    id = db.Column(VARCHAR(36), primary_key=True, default=generate_uuid)
    nom_cellule = db.Column(db.String(100), nullable=False)
    quartier    = db.Column(db.String(150))

    # ── NOUVEAU : type de point (cellule ou satellite) ────────────────────────
    type = db.Column(
        db.Enum('cellule', 'satellite'),
        nullable=False,
        default='cellule'
    )

    # ── NOUVEAU : description textuelle de la position ────────────────────────
    # Ex : "Palmeraie, Centre Marie Rose Gureau porte 22"
    description_position = db.Column(db.String(300), nullable=True)

    # Géolocalisation précise
    latitude  = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)

    statut     = db.Column(db.Enum('active', 'en_attente', 'fermee'), default='en_attente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relation : Une cellule a plusieurs responsables (Leader, Secrétaire, etc.)
    responsables = db.relationship(
        'WSFUser',
        backref='cellule',
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id":                   self.id,
            "nom":                  self.nom_cellule,
            "quartier":             self.quartier,
            "type":                 self.type,                  # ← NOUVEAU
            "description_position": self.description_position,  # ← NOUVEAU
            "lat":                  float(self.latitude),
            "lng":                  float(self.longitude),
            "statut":               self.statut,
            "responsables":         [r.to_dict() for r in self.responsables],
        }


class WSFUser(db.Model):
    __tablename__ = 'wsf_users'

    id          = db.Column(VARCHAR(36), primary_key=True, default=generate_uuid)
    nom_complet = db.Column(db.String(150), nullable=False)
    telephone   = db.Column(db.String(20), unique=True, nullable=False)

    # Rôles spécifiques WSF
    role = db.Column(
        db.Enum('leader', 'leader_adjoint', 'secretaire', 'hote'),
        nullable=False
    )

    # Clé étrangère vers la cellule
    cell_id    = db.Column(VARCHAR(36), db.ForeignKey('wsf_cells.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":          self.id,
            "nom_complet": self.nom_complet,
            "telephone":   self.telephone,
            "role":        self.role,
        }