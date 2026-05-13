import React, { useState, useCallback, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  TransformWrapper, 
  TransformComponent,
  ReactZoomPanPinchRef
} from 'react-zoom-pan-pinch';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Search, 
  Plus, 
  Minus, 
  LayoutGrid, 
  MoreHorizontal,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Magazine } from '../data';

interface FlipbookViewerProps {
  magazine: Magazine;
  onClose: () => void;
}

const FlipbookViewer: React.FC<FlipbookViewerProps> = ({ magazine, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const bookRef = useRef<any>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = magazine.pages.length;

  const onPage = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const handleTransform = (ref: ReactZoomPanPinchRef) => {
    setIsZoomed(ref.state.scale > 1.02);
  };

  const handleZoomStart = () => {
    setIsInteracting(true);
  };

  const handleZoomStop = () => {
    setIsInteracting(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const prevPage = () => {
    if (isZoomed) {
      transformRef.current?.resetTransform();
      setTimeout(() => bookRef.current?.pageFlip()?.flipPrev(), 100);
    } else {
      bookRef.current?.pageFlip()?.flipPrev();
    }
  };

  const nextPage = () => {
    if (isZoomed) {
      transformRef.current?.resetTransform();
      setTimeout(() => bookRef.current?.pageFlip()?.flipNext(), 100);
    } else {
      bookRef.current?.pageFlip()?.flipNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/98 flex flex-col overflow-hidden"
      id="flipbook-overlay"
    >
      {/* Absolute Close Button */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[70]">
        <button 
          onClick={onClose}
          className="p-2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl group"
          id="close-flipbook"
        >
          <X size={26} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Navigation Arrows (Fixed Position) */}
      <AnimatePresence>
        {!isZoomed && (
          <>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={prevPage}
              className="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-all z-40 border border-white/5 shadow-2xl"
              id="prev-btn-side"
            >
              <ChevronLeft size={isMobile ? 24 : 32} />
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={nextPage}
              className="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-all z-40 border border-white/5 shadow-2xl"
              id="next-btn-side"
            >
              <ChevronRight size={isMobile ? 24 : 32} />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Flipbook Container - Takes available space */}
      <div className={`flex-1 relative w-full flex items-center justify-center overflow-hidden px-4 md:px-12 pt-12 pb-4 ${isZoomed ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}>
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.8}
          maxScale={5}
          centerOnInit={true}
          limitToBounds={false}
          wheel={{ step: 0.2 }}
          pinch={{ step: 5 }}
          doubleClick={{ mode: 'toggle' }}
          panning={{ disabled: !isZoomed, velocityDisabled: false }}
          onTransformed={handleTransform}
          onZoomStart={handleZoomStart}
          onZoomStop={handleZoomStop}
          onPanningStart={handleZoomStart}
          onPanningStop={handleZoomStop}
        >
          {({ zoomIn, zoomOut, resetTransform, state }) => (
            <>
              <TransformComponent
                wrapperClassName="!w-full !h-full flex items-center justify-center"
                contentClassName="flex items-center justify-center"
              >
                {/* @ts-ignore */}
                <HTMLFlipBook
                  width={isMobile ? 280 : 420}
                  height={isMobile ? 390 : 588}
                  size="stretch"
                  minWidth={isMobile ? 240 : 300}
                  maxWidth={isMobile ? 600 : 1200}
                  minHeight={isMobile ? 340 : 400}
                  maxHeight={isMobile ? 900 : 1600}
                  drawShadow={true}
                  flippingTime={1000}
                  usePortrait={isMobile}
                  startPage={0}
                  onFlip={onPage}
                  ref={bookRef}
                  className="flipbook-canvas"
                  showCover={true}
                  style={{}}
                  swipeDistance={isZoomed || isInteracting ? 0 : 30}
                  useMouseEvents={!isZoomed && !isInteracting}
                  clickEventForward={!isZoomed && !isInteracting}
                >
                  {magazine.pages.map((page, index) => {
                    const isNear = Math.abs(index - currentPage) <= (isMobile ? 4 : 8);
                    return (
                      <div key={index} className="bg-white shadow-2xl relative overflow-hidden ring-1 ring-black/5 flex items-center justify-center">
                        {isNear ? (
                          <img 
                            src={page} 
                            alt={`${magazine.title} - Page ${index + 1}`}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-gray-100 border-t-[#b91c1c] rounded-full animate-spin" />
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4 text-[10px] text-gray-400 font-mono">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </HTMLFlipBook>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Tool Bar Area - Padded at bottom */}
      <div className="h-20 flex items-center justify-center">
        <div 
          className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-50 text-gray-600 border border-white/20"
          id="flipbook-toolbar"
        >
          <div className="flex items-center">
            <button onClick={prevPage} className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors group">
              <ChevronLeft size={isMobile ? 16 : 18} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
            </button>
            
            <div className="flex items-center gap-1 px-2 border-r border-gray-100 h-4">
              <span className="text-[10px] md:text-xs font-bold text-gray-800 tracking-tight">{currentPage + 1}</span>
              <span className="text-gray-300 text-[9px] md:text-xs">/</span>
              <span className="text-[10px] md:text-xs text-gray-400 font-medium tracking-tight">{totalPages}</span>
            </div>

            <button onClick={nextPage} className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors border-r border-gray-100 group">
              <ChevronRight size={isMobile ? 16 : 18} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 md:gap-1.5">
            <div className="flex items-center bg-gray-50 rounded-full px-1.5 py-0.5 border border-gray-100">
              <button 
                onClick={() => transformRef.current?.zoomOut()} 
                className="p-0.5 md:p-1 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-500 hover:text-[#b91c1c]"
              >
                <Minus size={isMobile ? 12 : 14} strokeWidth={3} />
              </button>
              
              <div className="w-8 md:w-12 text-center">
                <span className="text-[9px] md:text-xs font-bold text-gray-800">
                  {Math.round((transformRef.current?.state.scale || 1) * 100)}%
                </span>
              </div>

              <button 
                onClick={() => transformRef.current?.zoomIn()} 
                className="p-0.5 md:p-1 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-500 hover:text-[#b91c1c]"
              >
                <Plus size={isMobile ? 12 : 14} strokeWidth={3} />
              </button>
            </div>

            <button 
              onClick={() => transformRef.current?.resetTransform()} 
              className={`p-1 md:p-1.5 rounded-full transition-all ${isZoomed ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Reset Zoom"
            >
              <Maximize2 size={isMobile ? 16 : 18} strokeWidth={2} />
            </button>

            <button onClick={toggleFullscreen} className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 size={isMobile ? 16 : 18} strokeWidth={2} /> : <Maximize2 size={isMobile ? 16 : 18} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FlipbookViewer;
