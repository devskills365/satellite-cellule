// src/pages/wsf/WSFLocatorPage.jsx
import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, LocateFixed, Home, Radio, Clock } from 'lucide-react';
import { wsfService } from '../../api/axiosConfig';
import AnimatedBackground from '../../components/wsf/AnimatedBackground';
import { toast } from 'react-hot-toast';

// ── Calcul semaine d'élargissement ────────────────────────────────────────────

// Première semaine complète (mer-jeu-ven) du mois suivant le mois de référence.
// Si le mercredi est le 1er du mois → semaine à cheval → on prend la deuxième.
function getElargissementWeek(year, month) {
  const nm = (month + 1) % 12;
  const ny = month === 11 ? year + 1 : year;
  const first = new Date(ny, nm, 1);
  const skip = ((3 - first.getDay()) + 7) % 7;
  const wedDate = skip === 0 ? 8 : 1 + skip;
  const wed = new Date(ny, nm, wedDate);
  return [
    wed,
    new Date(ny, nm, wed.getDate() + 1),
    new Date(ny, nm, wed.getDate() + 2),
  ];
}

function fmtDay(date) {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ── Bandeaux d'horaire ────────────────────────────────────────────────────────

function ScheduleBanner({ isSatellite }) {
  const now = new Date();
  const [, jeudi, vendredi] = useMemo(
    () => getElargissementWeek(now.getFullYear(), now.getMonth()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!isSatellite) {
    return (
      <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Home size={14} className="text-brand-winnersRed shrink-0" />
          <span className="text-gray-800 text-xs font-bold">Tous les samedis</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-winnersRed/15 text-brand-winnersRed whitespace-nowrap">
          <Clock size={10} /> 17h00 – 18h00
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-5">
      {/* Mercredi régulier */}
      <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-brand-winnersNavy shrink-0" />
          <span className="text-gray-800 text-xs font-bold">Tous les mercredis</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-winnersNavy/10 text-brand-winnersNavy whitespace-nowrap">
          <Clock size={10} /> 18h00 – 20h00
        </span>
      </div>

      {/* Élargissement */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider mb-2">
          Semaine d'élargissement spirituel
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-800 text-xs font-semibold capitalize">
              Jeudi {fmtDay(jeudi)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 whitespace-nowrap">
              <Clock size={10} /> 18h00 – 20h00
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-800 text-xs font-semibold capitalize">
              Vendredi {fmtDay(vendredi)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 whitespace-nowrap">
              <Clock size={10} /> 18h00 – 20h00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

const WSFLocatorPage = () => {
  const [cells, setCells]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [activeType, setActiveType]     = useState('cellule');

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("Votre navigateur ne supporte pas la géolocalisation.");
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setCells([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
        try {
          const response = await wsfService.getAllCells({
            lat: parseFloat(latitude),
            lon: parseFloat(longitude),
            type: activeType,
          });
          const data = response.closest_cells || response;
          setCells(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Erreur API:", err);
          toast.error("Impossible de récupérer les données.");
        } finally {
          setLoading(false);
        }
      },
      (error) => { setLoading(false); handleGPSError(error); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleGPSError = (error) => {
    const messages = {
      [error.PERMISSION_DENIED]:    "Accès refusé. Veuillez autoriser la localisation.",
      [error.POSITION_UNAVAILABLE]: "Signal GPS introuvable.",
      [error.TIMEOUT]:              "La demande a expiré.",
    };
    toast.error(messages[error.code] || "Une erreur GPS est survenue.");
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setCells([]);
    setHasSearched(false);
  };

  const isSatellite = activeType === 'satellite';
  const typeLabel   = isSatellite ? 'satellite'  : 'cellule';
  const typeLabelP  = isSatellite ? 'satellites' : 'cellules';

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-brand-winnersNavy">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-[1]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="max-w-md mx-auto p-6 pt-20 pb-24 w-full">

          {/* ── Titre ──────────────────────────────────────────────────────── */}
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-brand-winnersGold font-bold text-xs uppercase tracking-[0.4em] drop-shadow-lg">
              Répertoire Officiel
            </h2>
            <h1 className="text-white text-4xl font-black tracking-tighter drop-shadow-2xl leading-none">
              WINNERS CHAPEL <br />
              <span className="text-brand-winnersRed text-3xl">AKOUEDO-GOSHEN</span>
            </h1>
          </div>

          {/* ── Toggle Cellule / Satellite ─────────────────────────────────── */}
          <div className="flex bg-white/10 rounded-3xl p-1.5 mb-6 border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => handleTypeChange('cellule')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeType === 'cellule'
                  ? 'bg-brand-winnersRed text-white shadow-lg shadow-red-900/40'
                  : 'text-white/40'
              }`}
            >
              <Home size={15} />
              Cellules
            </button>
            <button
              onClick={() => handleTypeChange('satellite')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeType === 'satellite'
                  ? 'bg-brand-winnersNavy text-white shadow-lg border border-white/20'
                  : 'text-white/40'
              }`}
            >
              <Radio size={15} />
              Satellites
            </button>
          </div>

          {/* ── Horaires (visibles dès le basculement) ─────────────────────── */}
          <ScheduleBanner isSatellite={isSatellite} />

          {/* ── Bouton géolocalisation ─────────────────────────────────────── */}
          <button
            onClick={handleGeolocate}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-4 py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-white ${
              isSatellite ? 'bg-[#1A5276]' : 'bg-brand-winnersRed'
            } ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? <LocateFixed size={24} className="animate-spin" /> : <MapPin size={24} />}
            {loading ? `Recherche des ${typeLabelP}...` : `Trouver un ${typeLabel} proche`}
          </button>

          {/* ── Résultats ───────────────────────────────────────────────────── */}
          <div className="space-y-5 mt-10">

            {hasSearched && !loading && cells.length > 0 && (
              <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest opacity-80">
                  {typeLabelP.charAt(0).toUpperCase() + typeLabelP.slice(1)} à proximité
                </h3>
                <span className="bg-brand-winnersGold text-brand-winnersNavy text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cells.length}
                </span>
              </div>
            )}

            {hasSearched && !loading && cells.length === 0 && (
              <p className="text-white/50 text-center text-sm py-8">
                Aucun {typeLabel} trouvé à proximité.
              </p>
            )}

            {!loading && cells.map(cell => {
              const lat         = cell.lat      || cell.latitude;
              const lng         = cell.lng      || cell.longitude;
              const nom         = cell.nom      || cell.nom_cellule;
              const quartier    = cell.quartier || "Quartier non spécifié";
              const description = cell.description_position || null;
              const leader      = cell.responsables?.find(r => r.role === 'leader')
                               || cell.responsables?.[0];
              const tel         = leader?.telephone;
              const distance    = cell.distance_km;

              return (
                <div
                  key={cell.id}
                  className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-14 h-14 bg-brand-winnersNavy/5 rounded-2xl flex items-center justify-center text-brand-winnersNavy shrink-0">
                      {isSatellite ? <Radio size={28} /> : <Home size={28} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-brand-winnersNavy font-black text-xl leading-tight tracking-tighter uppercase truncate">
                        {nom}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={12} className={isSatellite ? 'text-[#1A5276] shrink-0' : 'text-brand-winnersRed shrink-0'} />
                        <p className={`text-[10px] font-black uppercase tracking-wider truncate ${isSatellite ? 'text-[#1A5276]' : 'text-brand-winnersRed'}`}>
                          {quartier}
                        </p>
                      </div>
                    </div>
                    {distance !== undefined && (
                      <div className="flex flex-col items-center justify-center bg-brand-winnersNavy rounded-2xl px-3 py-2 shrink-0">
                        <span className="text-brand-winnersGold font-black text-base leading-none">
                          {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
                        </span>
                        <span className="text-white/60 text-[9px] uppercase tracking-wider mt-0.5">de vous</span>
                      </div>
                    )}
                  </div>

                  {description && (
                    <div className={`rounded-2xl px-4 py-3 mb-4 border-l-4 ${isSatellite ? 'bg-blue-50 border-[#1A5276]' : 'bg-red-50 border-brand-winnersRed'}`}>
                      <p className="text-brand-winnersNavy text-xs font-semibold leading-relaxed">
                        📍 {description}
                      </p>
                    </div>
                  )}

                  {leader && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-brand-winnersNavy flex items-center justify-center text-sm shrink-0">👤</div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Leader</p>
                        <p className="text-brand-winnersNavy text-sm font-black">{leader.nom_complet}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={tel ? `tel:${tel}` : '#'}
                      onClick={!tel ? (e) => { e.preventDefault(); toast.error("Numéro indisponible."); } : undefined}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-2xl text-[10px] font-black uppercase transition-colors hover:bg-gray-200"
                    >
                      <Phone size={14} /> Appeler
                    </a>
                    <button
                      onClick={() => {
                        if (lat && lng && userPosition) {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${lat},${lng}&travelmode=driving`,
                            '_blank'
                          );
                        } else {
                          toast.error("Coordonnées indisponibles.");
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-brand-winnersNavy text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-900/20"
                    >
                      <Navigation size={14} className="fill-white" /> Itinéraire
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="mt-auto w-full p-8 text-center">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em]">
            Jesus is Lord - AKOUEDO-Goshen @2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WSFLocatorPage;
