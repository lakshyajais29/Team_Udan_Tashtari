import { useEffect, useState } from 'react';
import { TEAM } from '../data/team.js';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function TeamSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % TEAM.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % TEAM.length);
  const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex === 0 ? TEAM.length - 1 : prevIndex - 1));

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-[#021018] group" aria-label="Team Slideshow">
      {/* Slider Container */}
      <div 
        className="flex w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {TEAM.map((m) => (
          <div key={m.id} className="relative w-full h-full flex-shrink-0">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={m.image} 
                alt={m.name} 
                className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-[10s] group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021018] via-[#021018]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#021018]/90 via-[#021018]/40 to-transparent" />
            </div>

            {/* Content Inner */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24">
              <div className="max-w-4xl fade-up">
                <p className="eyebrow text-cyan-300 mb-4 tracking-widest">{m.role.toUpperCase()}</p>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-none mb-6" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
                  {m.name}
                </h2>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
                  {m.bio}
                </p>
                <div className="flex flex-wrap gap-2 mt-8">
                  {m.domains.map((d) => (
                    <span key={d} className="px-4 py-1.5 border border-cyan/30 text-cyan-300 bg-cyan/5 rounded-full text-sm font-mono backdrop-blur-sm">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-16 flex gap-4 z-10">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
          aria-label="Previous slide"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
          aria-label="Next slide"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-16 flex gap-3 z-10">
        {TEAM.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              currentIndex === i ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
