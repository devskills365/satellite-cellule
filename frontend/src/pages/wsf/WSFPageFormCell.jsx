import { useState, useCallback } from "react";
import { wsfService } from "../../api/axiosConfig";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSatellite = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

// ─── Constantes ───────────────────────────────────────────────────────────────
const ROLES = [
  { label: "Leader",         value: "leader" },
  { label: "Leader Adjoint", value: "leader_adjoint" },
  { label: "Secrétaire",     value: "secretaire" },
  { label: "Hôte",           value: "hote" },
];

const STATUTS = [
  { value: "active",     label: "Active"     },
  { value: "en_attente", label: "En attente" },
  { value: "fermee",     label: "Fermée"     },
];

// ─── Sous-composant : bloc responsable ───────────────────────────────────────
function ResponsableBlock({ index, data, onChange, onRemove, showRemove }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Responsable {index + 1}
        </span>
        {showRemove && (
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full border border-gray-200 bg-transparent flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all text-base leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Nom complet */}
      <div className="flex flex-col gap-1 mb-3">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Nom complet *
        </label>
        <input
          type="text"
          placeholder="Prénom NOM"
          value={data.nom_complet}
          onChange={(e) => onChange("nom_complet", e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
        />
      </div>

      {/* Téléphone + Rôle */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Téléphone *
          </label>
          <input
            type="tel"
            placeholder="+225 07 00 00 00 00"
            value={data.telephone}
            onChange={(e) => onChange("telephone", e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Rôle *
          </label>
          <select
            value={data.role}
            onChange={(e) => onChange("role", e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function WSFPageFormCell() {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState({ show: false, msg: "", isError: false });

  const [cell, setCell] = useState({
    nom_cellule:          "",
    quartier:             "",
    type:                 "cellule",   // ← NOUVEAU
    description_position: "",          // ← NOUVEAU
    latitude:             "",
    longitude:            "",
    statut:               "active",
  });
  const [cellErrors, setCellErrors] = useState({});
  const [gpsLabel, setGpsLabel]     = useState("Cliquez pour détecter");

  const [responsables, setResponsables] = useState([
    { nom_complet: "", telephone: "", role: ROLES[0].value },
  ]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  // ── GPS ───────────────────────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsLabel("Non disponible"); return; }
    setGpsLabel("Détection en cours...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(8);
        const lon = pos.coords.longitude.toFixed(8);
        setCell((c) => ({ ...c, latitude: lat, longitude: lon }));
        setGpsLabel(`${lat}, ${lon}`);
      },
      () => setGpsLabel("Position non disponible")
    );
  }, []);

  // ── Validation étape 1 ────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errors = {};
    if (!cell.nom_cellule.trim()) errors.nom_cellule = "Le nom est obligatoire";
    if (!cell.latitude || isNaN(parseFloat(cell.latitude))) errors.latitude = "Latitude invalide";
    if (!cell.longitude || isNaN(parseFloat(cell.longitude))) errors.longitude = "Longitude invalide";
    setCellErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Responsables ──────────────────────────────────────────────────────────
  const addResponsable    = () => setResponsables((p) => [...p, { nom_complet: "", telephone: "", role: ROLES[0].value }]);
  const updateResponsable = (i, field, val) => setResponsables((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeResponsable = (i) => setResponsables((p) => p.filter((_, idx) => idx !== i));

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!responsables.every((r) => r.nom_complet.trim() && r.telephone.trim())) {
      showToast("Veuillez remplir tous les champs des responsables.", true);
      return;
    }
    setLoading(true);
    try {
      const createdCell = await wsfService.createCell({
        nom_cellule:          cell.nom_cellule.trim(),
        quartier:             cell.quartier.trim(),
        type:                 cell.type,
        description_position: cell.description_position.trim() || null,
        latitude:             parseFloat(cell.latitude),
        longitude:            parseFloat(cell.longitude),
        statut:               cell.statut,
      });
      for (const resp of responsables) {
        await wsfService.createServant({
          nom_complet: resp.nom_complet.trim(),
          telephone:   resp.telephone.trim(),
          role:        resp.role,
          cell_id:     createdCell.id,
        });
      }
      setStep(3);
      showToast("Enregistré avec succès !");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg) showToast(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setCell({ nom_cellule: "", quartier: "", type: "cellule", description_position: "", latitude: "", longitude: "", statut: "active" });
    setCellErrors({});
    setGpsLabel("Cliquez pour détecter");
    setResponsables([{ nom_complet: "", telephone: "", role: ROLES[0].value }]);
  };

  const isSatellite = cell.type === "satellite";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* En-tête */}
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">
          Nouveau point WSF
        </h1>
        <p className="text-sm text-gray-500 mb-7">
          Enregistrez une cellule ou un satellite et ses responsables.
        </p>

        {/* ── Stepper ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-7">
          {[
            { n: 1, label: "Point" },
            { n: 2, label: "Responsables" },
            { n: 3, label: "Confirmation" },
          ].map(({ n, label }, i, arr) => (
            <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step > n
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : step === n
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                  {step > n ? <IconCheck /> : n}
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* ── ÉTAPE 1 ───────────────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            {/* Card infos générales */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">

              {/* Section header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <IconHome />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Informations du point</p>
                  <p className="text-xs text-gray-400">Données d'identification</p>
                </div>
              </div>

              {/* ── Toggle type Cellule / Satellite ──────────────────────────── */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Type de point *
                </label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                  <button
                    onClick={() => setCell((c) => ({ ...c, type: "cellule" }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      !isSatellite
                        ? "bg-brand-winnersRed text-white shadow-sm shadow-red-200"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <IconHome /> Cellule
                  </button>
                  <button
                    onClick={() => setCell((c) => ({ ...c, type: "satellite" }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isSatellite
                        ? "bg-[#1A5276] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <IconSatellite /> Satellite
                  </button>
                </div>
              </div>

              {/* Nom */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nom {isSatellite ? "du satellite" : "de la cellule"} *
                </label>
                <input
                  type="text"
                  placeholder={isSatellite ? "Ex: Satellite Yopougon Est" : "Ex: Cellule Cocody Centre"}
                  value={cell.nom_cellule}
                  onChange={(e) => setCell((c) => ({ ...c, nom_cellule: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition border ${
                    cellErrors.nom_cellule ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {cellErrors.nom_cellule && (
                  <span className="text-[11px] text-red-500">{cellErrors.nom_cellule}</span>
                )}
              </div>

              {/* Quartier */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Quartier
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cocody Angré, Yopougon Selmer..."
                  value={cell.quartier}
                  onChange={(e) => setCell((c) => ({ ...c, quartier: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* ── Description de position ─────────────────────────────────── */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Description de la position
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Palmeraie, Centre Marie Rose Gureau porte 22"
                  value={cell.description_position}
                  onChange={(e) => setCell((c) => ({ ...c, description_position: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
                <span className="text-[11px] text-gray-400">
                  Cette description s'affichera sur la carte dans l'application.
                </span>
              </div>

              {/* Statut */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Statut
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STATUTS.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => setCell((c) => ({ ...c, statut: st.value }))}
                      className={`px-4 py-1.5 text-sm rounded-full border transition-all ${
                        cell.statut === st.value
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card géolocalisation */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <IconPin />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Géolocalisation</p>
                  <p className="text-xs text-gray-400">Coordonnées GPS du point</p>
                </div>
              </div>

              {/* Zone GPS cliquable */}
              <div
                onClick={handleGPS}
                className="relative border border-dashed border-gray-300 rounded-xl bg-gray-50 h-32 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all mb-4 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "linear-gradient(#1a1a18 1px, transparent 1px), linear-gradient(90deg, #1a1a18 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="text-blue-500 z-10"><IconPin /></div>
                <span className="text-sm text-gray-500 font-medium z-10">Utiliser ma position actuelle</span>
                <span className="text-[11px] text-gray-400 font-mono z-10">{gpsLabel}</span>
              </div>

              {/* Lat / Lng */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Latitude *
                  </label>
                  <input
                    type="number" placeholder="5.35999517" step="0.00000001"
                    value={cell.latitude}
                    onChange={(e) => setCell((c) => ({ ...c, latitude: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition border ${
                      cellErrors.latitude ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {cellErrors.latitude && <span className="text-[11px] text-red-500">{cellErrors.latitude}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Longitude *
                  </label>
                  <input
                    type="number" placeholder="-4.00825630" step="0.00000001"
                    value={cell.longitude}
                    onChange={(e) => setCell((c) => ({ ...c, longitude: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition border ${
                      cellErrors.longitude ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {cellErrors.longitude && <span className="text-[11px] text-red-500">{cellErrors.longitude}</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition shadow-sm"
              >
                Suivant →
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 2 : Responsables ────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <IconUsers />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Responsables</p>
                  <p className="text-xs text-gray-400">
                    Membres dirigeants {isSatellite ? "du satellite" : "de la cellule"}
                  </p>
                </div>
              </div>

              {responsables.map((resp, i) => (
                <ResponsableBlock
                  key={i} index={i} data={resp}
                  showRemove={responsables.length > 1}
                  onChange={(field, val) => updateResponsable(i, field, val)}
                  onRemove={() => removeResponsable(i)}
                />
              ))}

              <button
                onClick={addResponsable}
                className="w-full py-2.5 text-sm border border-dashed border-gray-300 rounded-xl text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-700 transition mt-1"
              >
                <IconPlus /> Ajouter un responsable
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition"
              >
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl transition shadow-sm ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-700"
                }`}
              >
                {loading ? "Enregistrement..." : `Enregistrer le ${cell.type}`}
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 3 : Confirmation ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">
              {isSatellite ? "Satellite enregistré !" : "Cellule enregistrée !"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              <strong className="text-gray-800">{cell.nom_cellule}</strong> et ses{" "}
              {responsables.length} responsable(s) ont été créés avec succès.
            </p>

            {/* Résumé description */}
            {cell.description_position && (
              <div className={`rounded-xl px-4 py-3 mb-5 text-left border-l-4 ${
                isSatellite ? "bg-blue-50 border-[#1A5276]" : "bg-red-50 border-brand-winnersRed"
              }`}>
                <p className="text-xs text-gray-600">📍 {cell.description_position}</p>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition shadow-sm"
            >
              + Nouveau point
            </button>
          </div>
        )}

      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 z-50 whitespace-nowrap ${
        toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      } ${
        toast.isError
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}>
        {toast.msg}
      </div>
    </div>
  );
}