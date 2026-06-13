
from marshmallow import Schema, fields, validates, ValidationError, validates_schema
from datetime import datetime
import uuid
import json

#-----------------------------------------Pour SGI
from marshmallow import Schema, fields, validate, ValidationError, validates_schema




from marshmallow import Schema, fields, validate, ValidationError, validates_schema

# --- Schéma pour les Responsables (Équipe de Service) ---
class WSFUserSchema(Schema):
    id = fields.String(dump_only=True)
    nom_complet = fields.String(
        required=True, 
        validate=validate.Length(min=3, error="Le nom doit contenir au moins 3 caractères.")
    )
    telephone = fields.String(
        required=True,
        validate=[
            validate.Regexp(r'^\+?[\d\s]{8,}$', error="Format de téléphone invalide.")
        ]
    )
    role = fields.String(
        required=True, 
        validate=validate.OneOf(
            ['leader', 'leader_adjoint', 'secretaire', 'hote'],
            error="Le rôle doit être : leader, leader_adjoint, secretaire ou hote."
        )
    )
    cell_id = fields.String(required=False, allow_none=True)
    created_at = fields.DateTime(dump_only=True)


# --- Schéma pour la Cellule WSF ---
class WSFCellSchema(Schema):
    id = fields.String(dump_only=True)
    nom_cellule = fields.String(
        required=True, 
        validate=validate.Length(min=2, error="Le nom de la cellule est trop court.")
    )
    quartier = fields.String(required=True)
    
    # Validation des coordonnées géographiques
    latitude = fields.Float(
        required=True, 
        validate=validate.Range(min=-90, max=90, error="Latitude invalide.")
    )
    longitude = fields.Float(
        required=True, 
        validate=validate.Range(min=-180, max=180, error="Longitude invalide.")
    )
    
    statut = fields.String(
        dump_default='en_attente',
        validate=validate.OneOf(['active', 'en_attente', 'fermee'])
    )
    
    responsables = fields.Nested(
        WSFUserSchema, 
        many=True, 
        dump_only=True
    )
    
    created_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_coordinates(self, data, **kwargs):
        """Vérifie que les coordonnées ne sont pas à zéro (souvent signe d'une erreur GPS)"""
        if data.get('latitude') == 0 and data.get('longitude') == 0:
            raise ValidationError("Les coordonnées GPS ne peuvent pas être (0,0).", "latitude")