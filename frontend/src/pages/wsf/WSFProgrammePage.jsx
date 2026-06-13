import React, { useMemo, useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Layers, Radio } from 'lucide-react';
import AnimatedBackground from '../../components/wsf/AnimatedBackground';

// ── Constantes ────────────────────────────────────────────────────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// ── Utilitaires de dates ──────────────────────────────────────────────────────

// Semaine d'élargissement = première semaine complète (mer-jeu-ven)
// du mois SUIVANT le mois sélectionné.
// Si le mercredi tombe le 1er du mois, la semaine est à cheval sur deux mois
// (lundi et mardi sont dans le mois précédent) → on prend la deuxième semaine.
function getElargissementWeek(year, month) {
  const nm = (month + 1) % 12;
  const ny = month === 11 ? year + 1 : year;
  const first = new Date(ny, nm, 1);
  const skip = ((3 - first.getDay()) + 7) % 7;
  // skip === 0 signifie que le 1er du mois est un mercredi → semaine à cheval
  const wedDate = skip === 0 ? 8 : 1 + skip;
  const wed = new Date(ny, nm, wedDate);
  return [
    wed,
    new Date(ny, nm, wed.getDate() + 1),
    new Date(ny, nm, wed.getDate() + 2),
  ];
}

// dayOfWeek : 0 = dimanche, 3 = mercredi, 6 = samedi
function getNextOccurrences(dayOfWeek, count = 4) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const skip = ((dayOfWeek - today.getDay()) + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() + skip);
  const dates = [start];
  while (dates.length < count) {
    const next = new Date(dates[dates.length - 1]);
    next.setDate(next.getDate() + 7);
    dates.push(next);
  }
  return dates;
}

function fmtLong(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function fmtShort(date) {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Composants partiels ───────────────────────────────────────────────────────

function TimeBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-winnersGold/20 text-brand-winnersGold whitespace-nowrap">
      <Clock size={10} />
      {label}
    </span>
  );
}

function DateRow({ date, time, highlight }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
        highlight
          ? 'bg-white/10 border-white/25'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <span className="text-white/80 text-sm capitalize leading-snug">{fmtLong(date)}</span>
      <TimeBadge label={time} />
    </div>
  );
}

function CardShell({ icon: Icon, iconColor, title, subtitle, children }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-white/10"
        style={{ background: `${iconColor}14` }}
      >
        <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${iconColor}28` }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-bold text-base leading-tight">{title}</h3>
          <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">{children}</div>
    </div>
  );
}

// ── Cartes de programmes réguliers ────────────────────────────────────────────

function CellulesCard() {
  const saturdays = useMemo(() => getNextOccurrences(6, 4), []);
  return (
    <CardShell
      icon={Layers}
      iconColor="#4a08e6"
      title="Cellules"
      subtitle="Tous les samedis de 17h00 à 18h00"
    >
      {saturdays.map((d, i) => (
        <DateRow key={i} date={d} time="17h00 – 18h00" highlight={i === 0} />
      ))}
    </CardShell>
  );
}

function SatellitesCard() {
  const wednesdays = useMemo(() => getNextOccurrences(3, 4), []);
  return (
    <CardShell
      icon={Radio}
      iconColor="#ED1C24"
      title="Satellites"
      subtitle="Tous les mercredis de 18h00 à 20h00"
    >
      {wednesdays.map((d, i) => (
        <DateRow key={i} date={d} time="18h00 – 20h00" highlight={i === 0} />
      ))}
    </CardShell>
  );
}

// ── Carte semaine d'élargissement ────────────────────────────────────────────

const DAY_LABELS = ['Mercredi', 'Jeudi', 'Vendredi'];

function ElargissementContent({ year, month }) {
  const week = useMemo(() => getElargissementWeek(year, month), [year, month]);

  const nextMonth = (month + 1) % 12;
  const nextYear  = month === 11 ? year + 1 : year;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/40 text-xs">
        Première semaine de {MONTHS_FR[nextMonth]} {nextYear}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {week.map((date, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-white/5 border border-brand-winnersGold/25"
          >
            <span className="text-brand-winnersGold font-bold text-sm">{DAY_LABELS[i]}</span>
            <span className="text-white font-bold text-base">
              {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
            </span>
            <TimeBadge label="18h00 – 20h00" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function WSFProgrammePage() {
  const now = new Date();
  const [refYear, setRefYear] = useState(now.getFullYear());
  const [refMonth, setRefMonth] = useState(now.getMonth());

  function prevMonth() {
    if (refMonth === 0) { setRefYear(y => y - 1); setRefMonth(11); }
    else setRefMonth(m => m - 1);
  }

  function nextMonth() {
    if (refMonth === 11) { setRefYear(y => y + 1); setRefMonth(0); }
    else setRefMonth(m => m + 1);
  }

  return (
    <div className="relative min-h-screen bg-brand-deep overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8 sm:px-6 lg:px-10">

        {/* En-tête */}
        <header className="text-center mb-8">
          <img
            src="/logovf.png"
            alt="Winners Chapel"
            className="h-14 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Programmes</h1>
          <p className="text-white/50 text-sm mt-1">WSF — Winners Students Fellowship</p>
        </header>

        {/* Programmes réguliers — affichage horizontal */}
        <section className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-4 mb-6">
          <CellulesCard />
          <SatellitesCard />
        </section>

        {/* Semaine d'élargissement */}
        <section className="w-full max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">

            {/* En-tête de section avec navigation mensuelle */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-brand-winnersGold/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-winnersGold/25 shrink-0">
                  <Calendar size={18} className="text-brand-winnersGold" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">
                    Semaine d'élargissement
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    Mercredi · Jeudi · Vendredi — 18h00 à 20h00
                  </p>
                </div>
              </div>

              {/* Sélecteur de mois */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-white font-semibold text-sm w-36 text-center select-none">
                  {MONTHS_FR[refMonth]} {refYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  aria-label="Mois suivant"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <ElargissementContent year={refYear} month={refMonth} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
