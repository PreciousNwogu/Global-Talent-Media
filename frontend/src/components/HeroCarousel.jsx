import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// Per-slide color tints applied over the video
const THEMES = [
  { overlay: '109,40,217',   accent: 'from-pink-500 to-violet-500',   tag: 'bg-pink-500',    glow: '#c084fc' },
  { overlay: '190,18,60',    accent: 'from-orange-400 to-rose-500',   tag: 'bg-orange-500',  glow: '#fb923c' },
  { overlay: '15,118,110',   accent: 'from-cyan-400 to-teal-500',     tag: 'bg-cyan-500',    glow: '#22d3ee' },
  { overlay: '21,128,61',    accent: 'from-emerald-400 to-lime-400',  tag: 'bg-emerald-500', glow: '#34d399' },
  { overlay: '29,78,216',    accent: 'from-blue-400 to-indigo-500',   tag: 'bg-blue-500',    glow: '#818cf8' },
  { overlay: '146,64,14',    accent: 'from-yellow-400 to-amber-500',  tag: 'bg-amber-500',   glow: '#fbbf24' },
];

// Free concert/entertainment background video — swap with /videos/hero-bg.mp4 for a custom file
const BG_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-stage-lights-4000-large.mp4';

const formatEventDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

const HeroCarousel = ({ events = [] }) => {
  const slides          = events.length > 0 ? events : [null];
  const [current, setCurrent]     = useState(0);
  const [prev,    setPrev]        = useState(null);
  const [animIn,  setAnimIn]      = useState(false);
  const [paused,  setPaused]      = useState(false);
  const [muted,   setMuted]       = useState(true);
  const [vidErr,  setVidErr]      = useState(false);
  const videoRef  = useRef(null);
  const timerRef  = useRef(null);

  const goTo = useCallback((idx) => {
    setPrev(current);
    setCurrent(idx);
    setAnimIn(true);
    setTimeout(() => setAnimIn(false), 900);
  }, [current]);

  const nextSlide = useCallback(() =>
    goTo(current === slides.length - 1 ? 0 : current + 1),
  [current, slides.length, goTo]);

  const prevSlide = () =>
    goTo(current === 0 ? slides.length - 1 : current - 1);

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setTimeout(nextSlide, 6000);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, nextSlide, slides.length]);

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted((m) => !m);
  };

  const theme = THEMES[current % THEMES.length];
  const event = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: '90vh', minHeight: '560px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ─── FULL-BLEED EVENT COVER IMAGE ──────────────────────────────── */}
      {event?.cover_image ? (
        <img
          key={`bg-${current}`}
          src={event.cover_image}
          alt={event?.title ?? ''}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: 'bgZoom 8s ease-out forwards', filter: 'brightness(0.6) saturate(1.2)' }}
        />
      ) : (
        /* ─── FALLBACK: BACKGROUND VIDEO ───────────────────────────────── */
        !vidErr ? (
          <video
            ref={videoRef}
            src={BG_VIDEO}
            autoPlay loop muted playsInline
            onError={() => setVidErr(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.55) saturate(1.3)' }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-950" />
        )
      )}

      {/* ─── ANIMATED COLOR WASH (changes per slide) ──────────────────── */}
      <div
        key={`wash-${current}`}
        className="absolute inset-0 transition-all"
        style={{
          background: `radial-gradient(ellipse at 30% 50%,
            rgba(${theme.overlay},0.55) 0%,
            rgba(${theme.overlay},0.25) 50%,
            transparent 100%)`,
          animation: 'colorWash 1s ease-out forwards',
        }}
      />

      {/* ─── SCANLINE / FILM-GRAIN TEXTURE ────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.4) 0px,
            rgba(0,0,0,0.4) 1px,
            transparent 1px,
            transparent 3px
          )`,
        }}
      />

      {/* ─── VIGNETTE ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* ─── GLOW BLOB ────────────────────────────────────────────────── */}
      <div
        key={`glow-${current}`}
        className="absolute top-1/2 -translate-y-1/2 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: theme.glow,
          opacity: 0.2,
          animation: 'blobIn 1s ease-out forwards',
        }}
      />

      {/* ─── SLIDE CONTENT ────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-16">

          {/* EXIT animation for old slide */}
          {prev !== null && animIn && (
            <div
              key={`out-${prev}`}
              className="absolute max-w-3xl"
              style={{ animation: 'slideOut 0.4s ease-in forwards' }}
            />
          )}

          {/* ENTER animation for new slide */}
          <div
            key={`in-${current}`}
            className="max-w-3xl"
            style={{ animation: 'slideIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards' }}
          >
            {event ? (
              <>
                {/* Category pill */}
                <div className="mb-5">
                  <span
                    className={`inline-flex items-center gap-2 ${theme.tag} text-white text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${theme.glow}80` }}
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {event.category?.name ?? 'Featured Event'}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="font-black text-white leading-[1.05] mb-5 drop-shadow-2xl"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                    textShadow: `0 0 60px ${theme.glow}60`,
                  }}
                >
                  {event.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap gap-5 mb-5 text-white/80 text-sm font-medium">
                  {event.starts_at && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatEventDate(event.starts_at)}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </span>
                  )}
                  {event.price != null && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Number(event.price) === 0 ? 'Free Entry' : `$${Number(event.price).toFixed(2)}`}
                    </span>
                  )}
                </div>

                {/* Short description */}
                {event.short_description && (
                  <p className="text-white/65 text-lg mb-8 max-w-xl leading-relaxed line-clamp-2">
                    {event.short_description}
                  </p>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={`/events/${event.id}`}
                    className={`bg-gradient-to-r ${theme.accent} text-white px-8 py-4 rounded-xl font-extrabold text-base shadow-2xl hover:scale-105 active:scale-95 transition-transform`}
                    style={{ boxShadow: `0 8px 32px ${theme.glow}60` }}
                  >
                    Book Now →
                  </Link>
                  <Link
                    to="/events"
                    className="bg-white/10 backdrop-blur-sm border border-white/25 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-colors"
                  >
                    All Events
                  </Link>
                </div>
              </>
            ) : (
              /* Static fallback */
              <>
                <span className={`inline-flex items-center gap-2 ${theme.tag} text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6`}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live Events
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-6" style={{ textShadow: `0 0 60px ${theme.glow}60` }}>
                  Experience<br />Entertainment<br />Reimagined
                </h1>
                <p className="text-white/65 text-lg mb-8 max-w-xl">
                  Music, comedy, fashion, wellness and more — all in one place.
                </p>
                <Link to="/events" className={`bg-gradient-to-r ${theme.accent} text-white px-8 py-4 rounded-xl font-extrabold text-base shadow-2xl hover:scale-105 transition-transform inline-block`}>
                  Browse All Events
                </Link>
              </>
            )}
          </div>
        </div>
      </div>



      {/* ─── PROGRESS BAR ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div
          key={`bar-${current}`}
          className="h-full"
          style={{
            background: `linear-gradient(to right, ${theme.glow}, white)`,
            animation: paused ? 'none' : 'progressBar 6s linear forwards',
          }}
        />
      </div>

      {/* ─── SLIDE COUNTER ────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 z-20 text-white/50 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

      {/* ─── MUTE TOGGLE (only when video is playing) ─────────────────── */}
      {!vidErr && !event?.cover_image && (
        <button
          onClick={toggleMute}
          className="absolute top-6 left-6 z-20 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-colors flex items-center justify-center backdrop-blur-sm"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}

      {/* ─── PREV / NEXT ──────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-colors flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-colors flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* ─── DOT NAV ──────────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-400 rounded-full ${
                i === current ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/35 hover:bg-white/65'
              }`}
            />
          ))}
        </div>
      )}

      {/* ─── BOTTOM FADE ──────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

      {/* ─── KEYFRAMES ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes colorWash {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blobIn {
          from { opacity: 0; transform: translateY(-50%) scale(0.6); }
          to   { opacity: 0.2; transform: translateY(-50%) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-48px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(48px) scale(0.97); }
        }
        @keyframes bgZoom {
          from { transform: scale(1.08); }
          to   { transform: scale(1);    }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
