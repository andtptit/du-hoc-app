import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  bannerImages: string[];
}

export default function HeroSlider({ bannerImages }: Props) {
  const [current, setCurrent] = useState(0);
  
  // console.log("HeroSlider rendered with images:", bannerImages);

  useEffect(() => {
    if (!bannerImages || bannerImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerImages]);

  const prev = () => {
    if (!bannerImages || bannerImages.length === 0) return;
    setCurrent((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };
  const next = () => {
    if (!bannerImages || bannerImages.length === 0) return;
    setCurrent((prev) => (prev + 1) % bannerImages.length);
  };

  if (!bannerImages || bannerImages.length === 0) {
    return (
      <div className="relative w-full aspect-[21/9] md:aspect-[25/8] bg-slate-100 flex items-center justify-center text-slate-400">
        <p className="text-sm font-medium">Đang tải banner...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[25/8] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={bannerImages[current]} 
            alt="Banner" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = 'https://firebasestorage.googleapis.com/v0/b/du-hoc-test.appspot.com/o/banners%2Fkb-scholarship.png?alt=media';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </motion.div>
      </AnimatePresence>

      {bannerImages.length > 1 && (
        <>
          <button 
            onClick={prev} 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={next} 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {bannerImages.map((_, i) => (
              <button 
                key={i} 
                className={`h-2 rounded-full transition-all ${i === current ? 'w-10 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`} 
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
