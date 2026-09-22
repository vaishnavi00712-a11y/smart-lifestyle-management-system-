import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, HeartPulse, Target, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Organize Your Day',
    subtitle: 'Plan your routine and stay on top of your priorities with smart scheduling and daily agendas.',
    badge: 'Structure & Focus',
    icon: Calendar,
    accentColor: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    bgGradient: 'from-sky-500/10 via-indigo-500/5 to-transparent',
  },
  {
    id: 2,
    title: 'Build Better Habits',
    subtitle: 'Track daily habits, build unbroken streaks, and monitor your consistency over weeks and months.',
    badge: 'Consistency Engine',
    icon: Sparkles,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
  },
  {
    id: 3,
    title: 'Track Your Wellness',
    subtitle: 'Monitor water, sleep, nutrition, and physical activity to maintain optimal physical and mental energy.',
    badge: 'Holistic Health',
    icon: HeartPulse,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
  },
  {
    id: 4,
    title: 'Improve Your Productivity',
    subtitle: 'Use tasks, organized daily routines, and structured goals to stay productive and distraction-free.',
    badge: 'Focused Productivity',
    icon: Target,
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    bgGradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
  },
  {
    id: 5,
    title: 'Understand Your Progress',
    subtitle: 'View meaningful charts, dynamic 100-point lifestyle score, and data-driven lifestyle analytics.',
    badge: 'Data-Driven Insights',
    icon: BarChart3,
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
  },
];

const SLIDE_DURATION_MS = 6000;

export const LandingCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  };

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    resetTimer();
  };

  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          setCurrentIndex(prev => (prev + 1) % slides.length);
          return 0;
        }
        return old + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused]);

  const curr = slides[currentIndex];
  const IconComponent = curr.icon;

  return (
    <div
      id="landing-carousel"
      className="relative w-full max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Lifestyle Feature Carousel"
    >
      {/* Top Slide Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Slide Content */}
      <div className={`p-8 sm:p-12 relative bg-gradient-to-br ${curr.bgGradient} transition-colors duration-700 min-h-[360px] flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${curr.accentColor}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {curr.badge}
            </span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              0{currentIndex + 1} / 0{slides.length}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {curr.title}
          </h3>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {curr.subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-sm shadow-md transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
            >
              Demo Sign In
            </Link>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5 mr-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-slate-900 dark:bg-white'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevSlide}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
