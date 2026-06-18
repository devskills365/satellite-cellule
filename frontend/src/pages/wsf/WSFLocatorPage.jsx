// src/pages/wsf/WSFLocatorPage.jsx
import React, { useState, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  LocateFixed,
  Home,
  Radio,
  Clock,
  Globe,
} from "lucide-react";
import { wsfService } from "../../api/axiosConfig";
import AnimatedBackground from "../../components/wsf/AnimatedBackground";
import { toast } from "react-hot-toast";
import { AutoTranslate} from "../../components/translator"

// ── Traductions ──────────────────────────────────────────────────────────────

const translations = {
  fr: {
    title: "Répertoire Officiel",
    churchName: "WINNERS' CHAPEL INTERNATIONAL",
    location: "AKOUEDO-GOSHEN",
    // 1. Labels pour les boutons (sans article, première lettre majuscule)
    cellLabel: "Cellules de maison",
    satelliteLabel: "Centres satellites",

    // 2. Variables pour les phrases dynamiques (avec article)
    cells: "une cellule ",
    satellites: "un satellite ",

    // 3. Modèles de phrases
    findNearby: "Trouver {type} à proximité",
    searching: "Recherche {type} en cours...",
    noneFound: "Aucun(e) {type} trouvé(e) à proximité.",
    leader: "Leader",
    call: "Appeler",
    route: "Itinéraire",
    numberUnavailable: "Numéro indisponible.",
    coordinatesUnavailable: "Coordonnées indisponibles.",
    geolocationNotSupported:
      "Votre navigateur ne supporte pas la géolocalisation.",
    unableToFetch: "Impossible de récupérer les données.",
    permissionDenied: "Accès refusé. Veuillez autoriser la localisation.",
    gpsUnavailable: "Signal GPS introuvable.",
    timeout: "La demande a expiré.",
    gpsError: "Une erreur GPS est survenue.",
    allSaturdays: "Tous les samedis",
    allWednesdays: "Tous les mercredis",
    spiritualWeek: "Semaine d'élargissement spirituel",
    thursday: "Jeudi",
    friday: "Vendredi",
    fromYou: "de vous",
    footer: "Jesus is Lord - AKOUEDO-Goshen @2026",
    language: "Langue",
    french: "Français",
    english: "English",
    descriptions: {
      "Au sein du Foyer des jeunes de Adjahui":
        "Au sein du Foyer des jeunes de Adjahui",
      "Dans le centre Marie Rose Guiraud": "Dans le centre Marie Rose Guiraud",
      "Au sein de la cantine de l'école primaire publique D'ANAN":
        "Au sein de la cantine de l'école primaire publique D'ANAN",
      "Au sein du foyer des jeunes d'Adjahui":
        "Au sein du foyer des jeunes d'Adjahui",
      "Au sein de Wellbeing Resort, à côté du groupe scolaire les scarabées":
        "Au sein de Wellbeing Resort, à côté du groupe scolaire les scarabées",
      "Au sein du Collège Jean Paul Sartre":
        "Au sein du Collège Jean Paul Sartre",
      "Abatta village au sein de l'école privée Kimyl School":
        "Abatta village au sein de l'école privée Kimyl School",
      "Au sein du restaurant Canaan Repas non loin de la policlinique GMP":
        "Au sein du restaurant Canaan Repas non loin de la policlinique GMP",
      "Au sein du collège privé Mère Elisa d'Akouédo":
        "Au sein du collège privé Mère Elisa d'Akouédo",
      "Au sein de l'ancienne Chefferie d'Anoumanbo":
        "Au sein de l'ancienne Chefferie d'Anoumanbo",
      "au sein du centre pilote de port bouet":
        "au sein du centre pilote de port bouet",
      "Au bas de l'immeuble de l'ancien Red Bar":
        "Au bas de l'immeuble de l'ancien Red Bar",
    },
  },
  en: {
    title: "Official Directory",
    churchName: "WINNERS' CHAPEL INTERNATIONAL",
    location: "AKOUEDO-GOSHEN",
    // 1. Labels pour les boutons (sans article, première lettre majuscule)
    cellLabel: "Home Cells",
    satelliteLabel: "Satellite centers",

    // 2. Variables pour les phrases dynamiques (avec article)
    cells: "cell ",
    satellites: "satellite ",

    // 3. Modèles de phrases
    findNearby: "Find a {type} nearby",
    searching: "Searching for {type}...",
    nearby: "{type} nearby",
    noneFound: "No {type} found nearby.",
    leader: "Leader",
    call: "Call",
    route: "Route",
    numberUnavailable: "Number unavailable.",
    coordinatesUnavailable: "Coordinates unavailable.",
    geolocationNotSupported: "Your browser does not support geolocation.",
    unableToFetch: "Unable to fetch data.",
    permissionDenied: "Access denied. Please allow location access.",
    gpsUnavailable: "GPS signal not found.",
    timeout: "Request timed out.",
    gpsError: "A GPS error occurred.",
    allSaturdays: "Every Saturday",
    allWednesdays: "Every Wednesday",
    spiritualWeek: "Spiritual Enlargement Week",
    thursday: "Thursday",
    friday: "Friday",
    fromYou: "from you",
    footer: "Jesus is Lord - AKOUEDO-Goshen @2026",
    language: "Language",
    french: "Français",
    english: "English",
    descriptions: {
      "Au sein du Foyer des jeunes de Adjahui": "At the Adjahui Youth Center",
      "Dans le centre Marie Rose Guiraud": "In the Marie Rose Guiraud center",
      "Au sein de la cantine de l'école primaire publique D'ANAN":
        "At the D'ANAN public primary school cafeteria",
      "Au sein du foyer des jeunes d'Adjahui": "At the Adjahui youth center",
      "Au sein de Wellbeing Resort, à côté du groupe scolaire les scarabées":
        "At Wellbeing Resort, next to the Scarabées school group",
      "Au sein du Collège Jean Paul Sartre": "At the Jean Paul Sartre College",
      "Abatta village au sein de l'école privée Kimyl School":
        "Abatta village at Kimyl School private school",
      "Au sein du restaurant Canaan Repas non loin de la policlinique GMP":
        "At Canaan Repas restaurant, near the GMP polyclinic",
      "Au sein du collège privé Mère Elisa d'Akouédo":
        "At Mère Elisa private college in Akouédo",
      "Au sein de l'ancienne Chefferie d'Anoumanbo":
        "At the former Anoumanbo Chiefdom",
      "au sein du centre pilote de port bouet":
        "at the Port Bouet pilot center",
      "Au bas de l'immeuble de l'ancien Red Bar":
        "At the bottom of the old Red Bar building",
    },
  },
};

// ── Utilitaires ──────────────────────────────────────────────────────────────

function translateDescription(description, lang) {
  if (!description) return null;
  if (lang === "fr") return description;
  return translations[lang].descriptions[description] || description;
}

function formatPhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+225")) return cleaned;
  if (cleaned.startsWith("225")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+225" + cleaned.substring(1);
  if (cleaned.length === 10 && /^[0-9]{10}$/.test(cleaned))
    return "+225" + cleaned;
  return cleaned;
}

function getElargissementWeek(year, month) {
  const nm = (month + 1) % 12;
  const ny = month === 11 ? year + 1 : year;
  const first = new Date(ny, nm, 1);
  const skip = (3 - first.getDay() + 7) % 7 + 1;
  const wedDate = skip === 0 ? 8 : 1;
  const wed = new Date(ny, nm, wedDate);
  return [
    wed,
    new Date(ny, nm, wed.getDate() + 1),
    new Date(ny, nm, wed.getDate() + 2),
  ];
}

function fmtDay(date, lang = "fr") {
  const options = { day: "2-digit", month: "short" };
  return date.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", options);
}

function fmtDayName(date, lang = "fr") {
  return date.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
  });
}

// ── Composant AutoTranslate ───────────────────────────────────────────────────

function AutoTranslate({ text, targetLang }) {
  const translated = translateDescription(text, targetLang);
  return <>{translated || text}</>;
}

// ── Bandeau horaire ───────────────────────────────────────────────────────────

function ScheduleBanner({ isSatellite, lang }) {
  const now = new Date();
  const [, jeudi, vendredi] = useMemo(
    () => getElargissementWeek(now.getFullYear(), now.getMonth()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const t = translations[lang];

  if (!isSatellite) {
    return (
      <div className="flex items-center justify-between gap-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 mb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Home size={13} className="text-brand-winnersRed shrink-0" />
          <span className="text-gray-800 text-[11px] font-bold">
            {t.allSaturdays}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-brand-winnersRed/12 text-brand-winnersRed whitespace-nowrap">
          <Clock size={9} /> 17h00 – 18h00
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between gap-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio size={13} className="text-brand-winnersRed shrink-0" />
          <span className="text-gray-800 text-[11px] font-bold">
            {t.allWednesdays}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-brand-winnersRed/12 text-brand-winnersRed whitespace-nowrap">
          <Clock size={9} /> 18h00 – 20h00
        </span>
      </div>

      <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 shadow-sm">
        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-2">
          {t.spiritualWeek}
        </p>
        <div className="flex flex-col gap-1.5">
          {[jeudi, vendredi].map((day) => (
            <div
              key={day.getTime()}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-gray-800 text-[11px] font-semibold capitalize">
                {fmtDayName(day, lang)} {fmtDay(day, lang)}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 whitespace-nowrap">
                <Clock size={9} /> 18h00 – 20h00
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Carte de résultat ─────────────────────────────────────────────────────────

function CellCard({ cell, isSatellite, userPosition, lang, t }) {
  const lat = cell.lat || cell.latitude;
  const lng = cell.lng || cell.longitude;
  const nom = cell.nom || cell.nom_cellule;
  const quartier = cell.quartier || "Quartier non spécifié";
  const description = cell.description_position || null;
  const translatedDescription = description
    ? translateDescription(description, lang)
    : null;
  const leader =
    cell.responsables?.find((r) => r.role === "leader") ||
    cell.responsables?.[0];
  const rawTel = leader?.telephone || null;
  const tel = rawTel ? formatPhoneNumber(rawTel) : null;
  const distance = cell.distance_km;

  // URL de l'avatar par défaut
  const defaultAvatar = "https://img.icons8.com/fluency/96/user-male-circle.png";
  const leaderAvatar = leader?.photo || leader?.avatar || defaultAvatar;

  const accentRed = "text-brand-winnersRed";
  const accent = "text-brand-winnersRed";
  const descBg = isSatellite ? "bg-red-50" : "bg-red-50";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-white/80 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-winnersRed/10 flex items-center justify-center text-brand-winnersRed shrink-0">
          {isSatellite ? <Radio size={17} /> : <Home size={17} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-brand-winnersNavy font-black text-sm leading-tight tracking-tight uppercase truncate">
            {nom}
          </h4>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} className="text-brand-winnersRed shrink-0" />
            <p className="text-[9px] font-black uppercase tracking-wider truncate text-brand-winnersRed">
              {quartier}
            </p>
          </div>
        </div>
        {distance !== undefined && (
          <div className="bg-brand-winnersNavy rounded-xl px-2.5 py-2 text-center shrink-0">
            <span className="text-white font-black text-sm leading-none block">
              {distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(1)} km`}
            </span>
            <span className="text-white/50 text-[7px] uppercase tracking-wide block mt-0.5">
              {t.fromYou}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="bg-red-50 rounded-lg px-3 py-2 mb-3">
          <p className="text-brand-winnersNavy text-[10px] font-semibold leading-relaxed">
            <AutoTranslate text={description} targetLang={lang} />
          </p>
        </div>
      )}

      {/* Leader */}
      {leader?.nom_complet && (
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-3">
          <div className="w-7 h-7 rounded-full bg-brand-winnersRed flex items-center justify-center text-xs shrink-0 select-none overflow-hidden">
            {leaderAvatar ? (
              <img 
                src={leaderAvatar} 
                alt={leader.nom_complet}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
              />
            ) : (
              <span className="text-white font-bold text-[10px]">
                {leader.nom_complet.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">
              {t.leader}
            </p>
            <p className="text-brand-winnersNavy text-[11px] font-black truncate">
              {leader.nom_complet}
            </p>
            {tel && (
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                {tel}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={tel ? `tel:${tel}` : "#"}
          onClick={
            !tel
              ? (e) => {
                  e.preventDefault();
                  toast.error(t.numberUnavailable);
                }
              : undefined
          }
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wide transition-colors ${
            tel
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-gray-100/60 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Phone size={11} /> {t.call}
        </a>
        <button
          onClick={() => {
            if (lat && lng && userPosition) {
              window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${lat},${lng}&travelmode=driving`,
                "_blank",
              );
            } else {
              toast.error(t.coordinatesUnavailable);
            }
          }}
          className="flex items-center justify-center gap-1.5 bg-brand-winnersRed text-white py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          <Navigation size={11} className="fill-white" /> {t.route}
        </button>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

const WSFLocatorPage = () => {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [activeType, setActiveType] = useState("cellule");
  const [lang, setLang] = useState(
    () => localStorage.getItem("wsf-language") || "fr",
  );

  const t = translations[lang];

  const toggleLanguage = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    setLang(newLang);
    localStorage.setItem("wsf-language", newLang);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error(t.geolocationNotSupported);
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
          toast.error(t.unableToFetch);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        handleGPSError(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const handleGPSError = (error) => {
    const messages = {
      [error.PERMISSION_DENIED]: t.permissionDenied,
      [error.POSITION_UNAVAILABLE]: t.gpsUnavailable,
      [error.TIMEOUT]: t.timeout,
    };
    toast.error(messages[error.code] || t.gpsError);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setCells([]);
    setHasSearched(false);
  };

  const isSatellite = activeType === "satellite";
  const typeLabel = isSatellite
    ? t.satellites.slice(0, -1).toLowerCase()
    : t.cells.slice(0, -1).toLowerCase();
  const typeLabelP = isSatellite
    ? t.satellites.toLowerCase()
    : t.cells.toLowerCase();
  const accentColor = isSatellite ? "bg-brand-winnersRed" : "bg-brand-winnersRed";

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-brand-winnersNavy">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-[1]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="w-full max-w-lg mx-auto px-4 pt-14 pb-20">
          {/* Bouton langue */}
          <div className="flex justify-end mb-5">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-white/75 hover:bg-white/18 transition-all duration-200"
            >
              <Globe size={12} className="text-brand-winnersGold" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {lang === "fr" ? "EN" : "FR"}
              </span>
            </button>
          </div>

          {/* Titre */}
          <div className="text-center mb-7">
            <p className="text-brand-winnersGold text-[9px] font-black uppercase tracking-[0.35em] mb-2 drop-shadow">
              {t.title}
            </p>
            <h1 className="text-white text-2xl font-black tracking-tight leading-snug drop-shadow-xl">
              {t.churchName}
            </h1>
            <p className="text-brand-winnersRed text-lg font-black tracking-tight mt-0.5">
              {t.location}
            </p>
          </div>

          {/* Toggle Cellule / Satellite */}
          <div className="flex bg-white/8 rounded-2xl p-1 mb-5 border border-white/8 backdrop-blur-sm max-w-xs mx-auto">
            <button
              onClick={() => handleTypeChange("cellule")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-250 ${
                activeType === "cellule"
                  ? "bg-brand-winnersRed text-white shadow-md shadow-red-900/30"
                  : "text-white/35 hover:text-white/55"
              }`}
            >
              <Home size={12} /> {t.cellLabel}
            </button>
            <button
              onClick={() => handleTypeChange("satellite")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-250 ${
                activeType === "satellite"
                  ? "bg-brand-winnersRed text-white shadow-md shadow-red-900/30"
                  : "text-white/35 hover:text-white/55"
              }`}
            >
              <Radio size={12} /> {t.satelliteLabel}
            </button>
          </div>

          {/* Horaires */}
          <ScheduleBanner isSatellite={isSatellite} lang={lang} />

          {/* Bouton géolocalisation */}
          <button
            onClick={handleGeolocate}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all active:scale-[0.98] shadow-lg mb-7 ${accentColor} ${
              loading ? "opacity-65 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? (
              <LocateFixed size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            {loading
              ? t.searching.replace("{type}", typeLabelP)
              : t.findNearby.replace("{type}", typeLabel)}
          </button>

          {/* Résultats */}
          {hasSearched && !loading && cells.length > 0 && (
            <div className="flex items-center justify-between px-0.5 mb-3">
              <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">
                {t.nearby ? 
                  t.nearby.replace(
                    "{type}",
                    typeLabelP.charAt(0).toUpperCase() + typeLabelP.slice(1),
                  ) : 
                  `${typeLabelP.charAt(0).toUpperCase() + typeLabelP.slice(1)} à proximité`
                }
              </span>
              <span className="bg-brand-winnersGold text-brand-winnersNavy text-[9px] font-black px-2.5 py-0.5 rounded-full">
                {cells.length}
              </span>
            </div>
          )}

          {hasSearched && !loading && cells.length === 0 && (
            <p className="text-white/40 text-center text-xs py-10">
              {t.noneFound.replace("{type}", typeLabel)}
            </p>
          )}

          <div className="space-y-3">
            {!loading &&
              cells.map((cell) => (
                <CellCard
                  key={cell.id}
                  cell={cell}
                  isSatellite={isSatellite}
                  userPosition={userPosition}
                  lang={lang}
                  t={t}
                />
              ))}
          </div>
        </main>

        <footer className="mt-auto w-full py-5 text-center">
          <p className="text-[7px] text-white/25 font-bold uppercase tracking-[0.35em]">
            {t.footer}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WSFLocatorPage;