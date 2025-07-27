
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Presentation } from '@/lib/types';
import { SlideTemplate } from '@/components/templates/SlideTemplate';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Pause, Play, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function PreviewPage() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedPresentation = localStorage.getItem('presentation');
      if (savedPresentation) {
        setPresentation(JSON.parse(savedPresentation));
      } else {
        router.replace('/create');
      }
    } catch (error) {
      console.error("Failed to load presentation from storage", error);
      router.replace('/create');
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  const paginate = useCallback((newDirection: number) => {
    if (!presentation) return;
    const newIndex = (page + newDirection + presentation.slides.length) % presentation.slides.length;
    setPage([newIndex, newDirection]);
    setCurrentIndex(newIndex);
  }, [page, presentation]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'Escape') {
        router.back();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && presentation) {
       timer = setTimeout(() => {
         paginate(1);
         if (currentIndex === presentation.slides.length - 1) {
             setIsPlaying(false); // Pause at the end
         }
       }, 5000); // Auto-advance every 5 seconds
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, paginate, presentation]);


  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-background"><Loader text="Loading Slideshow..." /></div>;
  }

  if (!presentation) {
    return null;
  }
  
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const currentSlide = presentation.slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === presentation.slides.length - 1;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute w-full h-full"
        >
          <SlideTemplate
            slide={currentSlide}
            template={presentation.template as any}
            theme={presentation.theme as any}
          />
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
       <div className="absolute top-4 right-4 z-20">
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-black/30 hover:bg-black/60 text-white hover:text-white">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Exit Slideshow (Esc)</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Exit Slideshow (Esc)</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:text-white">
                      <Home />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Back to Editor</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => paginate(-1)} disabled={isFirstSlide && !isPlaying} className="text-white hover:text-white disabled:opacity-30">
                        <ArrowLeft />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Previous Slide (Left Arrow)</p></TooltipContent>
            </Tooltip>

             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsPlaying(p => !p)} className="text-white hover:text-white">
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                 </TooltipTrigger>
                <TooltipContent><p>{isPlaying ? "Pause" : "Play"} (Spacebar)</p></TooltipContent>
            </Tooltip>
            
            <span className="text-sm font-medium text-white/90">
                {currentIndex + 1} / {presentation.slides.length}
            </span>

             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => paginate(1)} disabled={isLastSlide && !isPlaying} className="text-white hover:text-white disabled:opacity-30">
                        <ArrowRight />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Next Slide (Right Arrow)</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
