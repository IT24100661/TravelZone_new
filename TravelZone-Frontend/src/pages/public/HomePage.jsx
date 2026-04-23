// HomePage.jsx — 3D glossy liquid buttons
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import hero1 from "../../assets/images/hero-1.jpg";
import hero2 from "../../assets/images/hero-2.jpg";
import hero3 from "../../assets/images/hero-3.jpg";
import hero4 from "../../assets/images/hero-4.jpg";
import hero5 from "../../assets/images/hero-5.jpg";

const SLIDES = [
  { src: hero1, label: "Misty Tea Plantations",  sub: "Hill Country, Sri Lanka"      },
  { src: hero2, label: "Ancient Sigiriya",        sub: "UNESCO World Heritage Site"   },
  { src: hero3, label: "Luxury Retreats",         sub: "Beachfront Resorts & Villas"  },
  { src: hero4, label: "Cultural Experiences",    sub: "Guided Heritage Tours"        },
  { src: hero5, label: "Cultural Experiences",    sub: "Guided Heritage Tours"        },
  
];

function FloatingOrb({ size, color, delay, duration, x, y }) {
  return (
    <div
      className="absolute rounded-full opacity-20 blur-xl pointer-events-none"
      style={{
        width: size, height: size,
        background: color, left: x, top: y,
        animation: `floatOrb ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [current]);

  return (
    <>
      {SLIDES.map((slide, i) => {
        const isActive = i === current;
        const isPrev   = i === prev;
        if (!isActive && !isPrev) return null;
        return (
          <div
            key={i}
            onTransitionEnd={isPrev ? () => setPrev(null) : undefined}
            className="absolute inset-0"
            style={{
              backgroundImage:    `url(${slide.src})`,
              backgroundSize:     "cover",
              backgroundPosition: "center",
              opacity:    isActive ? 1 : 0,
              transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
              zIndex:     isActive ? 1 : 0,
            }}
          />
        );
      })}

      {/* Caption */}
      <div className="absolute bottom-14 left-8 z-30 pointer-events-none">
        <p className="text-white/90 text-sm font-semibold tracking-wide leading-tight">
          {SLIDES[current].label}
        </p>
        <p className="text-white/50 text-xs mt-0.5">{SLIDES[current].sub}</p>
      </div>

      {/* Dot indicators */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30"
        role="tablist"
        aria-label="Slideshow navigation"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            onClick={() => { setPrev(current); setCurrent(i); }}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === current ? "28px" : "8px",
              height:     "8px",
              background: i === current ? "#f97316" : "rgba(255,255,255,0.4)",
              border:     "none",
              cursor:     "pointer",
              padding:    0,
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        aria-label="Previous slide"
        onClick={() => {
          const p = (current - 1 + SLIDES.length) % SLIDES.length;
          setPrev(current); setCurrent(p);
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full
                   bg-white/10 hover:bg-white/25 border border-white/20 text-white text-lg
                   flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={() => { setPrev(current); setCurrent((current + 1) % SLIDES.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full
                   bg-white/10 hover:bg-white/25 border border-white/20 text-white text-lg
                   flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        ›
      </button>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center">

      <style>{`
        @keyframes floatOrb {
          from { transform: translateY(0px)   translateX(0px)  scale(1);   }
          to   { transform: translateY(-40px) translateX(20px) scale(1.1); }
        }
      `}</style>

      {/* Layer 0 — slideshow */}
      <HeroSlideshow />

      {/* Layer 1 — ambient orbs */}
      <FloatingOrb size="500px" color="#f97316" delay={0} duration={8}  x="-10%" y="-15%" />
      <FloatingOrb size="400px" color="#6366f1" delay={2} duration={10} x="60%"  y="50%"  />
      <FloatingOrb size="350px" color="#8b5cf6" delay={4} duration={7}  x="20%"  y="70%"  />
      <FloatingOrb size="250px" color="#0ea5e9" delay={1} duration={9}  x="80%"  y="-10%" />

      {/* Layer 2 — dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.82) 100%)",
        }}
      />

      {/* Layer 3 — content */}
      <div className="relative z-20 text-center px-6 max-w-2xl w-full">

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                        text-white text-sm px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Platform is live — Start exploring
        </div>

        {/* Headline */}
        <h1 className="text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Travel<span className="text-orange-400">Zone</span>
        </h1>
        <p className="text-slate-300 text-xl mb-12 font-light">
          Book tour guides and hotels for your perfect journey across Sri Lanka.
        </p>

        {/* ── 3D Glossy Buttons ── */}
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/login" className="btn-3d btn-3d-primary">
            <span>Login</span>
          </Link>
          <Link to="/register" className="btn-3d btn-3d-ghost">
            <span>Create Account</span>
          </Link>
        </div>

        {/* Feature tags */}
        <div className="mt-16 flex justify-center gap-4 flex-wrap">
          {["Tour Guides", "Hotel Bookings", "Instant Confirmation", "Secure Payments"].map((tag) => (
            <span key={tag}
              className="px-4 py-1.5 bg-white/5 text-slate-300 text-sm rounded-full border border-white/10">
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}