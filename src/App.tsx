import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Search, 
  Upload, 
  Filter, 
  Flame, 
  ArrowRight,
  BookOpen,
  Image as ImageIcon,
  Plus,
  X,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Send,
  MessageCircle,
  Download,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { MOCK_MAGAZINES, Magazine } from './data';

const FlipbookViewer = lazy(() => import('./components/FlipbookViewer'));

const Header = ({ onOpenUpload, onToggleManage, isManageMode, hasMagazines }: { 
  onOpenUpload: () => void, 
  onToggleManage: () => void,
  isManageMode: boolean,
  hasMagazines: boolean
}) => (
  <header className="w-full bg-white border-b border-gray-100 px-6 py-10" id="app-header">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex flex-col items-center md:items-start">
        <a href="/" className="group flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center transform transition-transform group-hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              {/* Back Elements - Flames */}
              <path d="M52,42 C62,20 80,28 72,50 C65,65 55,55 52,42 Z" fill="#e45e26" />
              <path d="M42,38 C48,15 62,20 58,42 C54,58 45,52 42,38 Z" fill="#f07d4b" opacity="0.9" />
              
              {/* Temple Structures - Precise layering */}
              <path d="M24,56 L34,56 L34,64 L24,64 Z" fill="#cc9933" />
              <path d="M34,48 L46,48 L46,64 L34,64 Z" fill="#c48a21" />
              <path d="M46,52 L56,52 L56,64 L46,64 Z" fill="#cc9933" />
              
              {/* Shaded Domes */}
              <path d="M22,56 Q29,38 36,56" fill="#cc9933" stroke="#8b5e00" strokeWidth="0.5" />
              <path d="M32,48 Q40,24 48,48" fill="#c48a21" stroke="#8b5e00" strokeWidth="0.5" />
              <path d="M44,52 Q50,34 58,52" fill="#cc9933" stroke="#8b5e00" strokeWidth="0.5" />
              
              {/* The Bottom "Bowl" / Curve */}
              <path d="M20,64 Q45,92 72,64 L68,60 Q45,84 24,60 Z" fill="#4a1a1a" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 leading-none">Gnan Mandir</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mt-1.5">Education & Wellness</p>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-4">
        {hasMagazines && (
          <button 
            onClick={onToggleManage}
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
              isManageMode ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            {isManageMode ? 'Done' : 'Manage'}
          </button>
        )}
        <button 
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-6 py-3 bg-[#b91c1c] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100"
        >
          <Upload size={16} />
          Add Magazine
        </button>
      </div>
    </div>
  </header>
);

const UploadModal = ({ onUpload, onClose }: { onUpload: (mag: Magazine) => void, onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || files.length === 0 || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', 'User Upload');
      
      files.forEach((file) => {
        formData.append('pages', file);
      });

      const response = await fetch('/api/magazines', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newMag: Magazine = await response.json();
      onUpload(newMag);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-gray-900">New Magazine</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isUploading}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Magazine Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#b91c1c] outline-none transition-all font-medium"
              placeholder="e.g. My Collection 2026"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Upload Pages (JPG/PNG)</label>
            <div className={`mt-1 flex justify-center px-6 pt-8 pb-10 border-2 border-gray-100 border-dashed rounded-3xl hover:border-[#b91c1c] transition-colors group bg-gray-50/50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="space-y-2 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300 group-hover:text-[#b91c1c] transition-colors" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-bold text-[#b91c1c] hover:text-red-800 focus-within:outline-none ${isUploading ? 'pointer-events-none' : ''}`}>
                    <span>Select Images</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                  </label>
                  <p className="pl-1 text-gray-400">or drop here</p>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  {files.length > 0 ? `${files.length} pages selected` : 'Minimum 1 page'}
                </p>
              </div>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isUploading}
            className="w-full py-4 bg-[#b91c1c] hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-red-50 transition-all transform active:scale-[0.98] uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : 'Create Flipbook'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load magazines from server
  useEffect(() => {
    fetch('/api/magazines')
      .then(res => res.json())
      .then(data => {
        // Merge with MOCK_MAGAZINES if needed, or just use server data
        // Let's show server ones first, then mock ones as "defaults"
        const serverIds = new Set(data.map((m: any) => m.id));
        const combined = [...data, ...MOCK_MAGAZINES.filter(m => !serverIds.has(m.id))];
        setMagazines(combined);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpload = (newMag: Magazine) => {
    setMagazines(prev => [newMag, ...prev]);
  };

  const handleDownloadPDF = async (mag: Magazine, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a notification or subtle loader if needed, but for now just go
    const btn = e.currentTarget as HTMLButtonElement;
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>`;

    try {
      if (mag.pdfUrl) {
        window.open(mag.pdfUrl, '_blank');
      } else {
        // Generate PDF from images using jsPDF
        const pdf = new jsPDF();
        
        for (let i = 0; i < mag.pages.length; i++) {
          const imgUrl = mag.pages[i];
          
          // Use a helper to load image and get dimensions
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imgUrl;
          });

          const imgWidth = 210; // A4 width in mm
          const imgHeight = (img.height * imgWidth) / img.width;
          
          if (i > 0) pdf.addPage();
          pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
        }
        
        pdf.save(`${mag.title.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('custom-')) {
      try {
        await fetch(`/api/magazines/${id}`, { method: 'DELETE' });
        setMagazines(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    } else {
      // For mock ones, just filter locally (they will return on refresh though)
      setMagazines(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <Header 
        onOpenUpload={() => setIsUploadModalOpen(true)} 
        onToggleManage={() => setIsManageMode(!isManageMode)} 
        isManageMode={isManageMode}
        hasMagazines={magazines.length > 0}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-12 border-b border-gray-100 pb-8 text-center md:text-left">
          <h2 className="text-6xl font-bold tracking-tight text-[#b91c1c]" id="main-heading">MAGAZINES</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#b91c1c] rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Archive...</p>
            </div>
          ) : magazines.map((mag, i) => (
            <motion.div 
              key={mag.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => setSelectedMagazine(mag)}
            >
              {/* Card Background (Light Gray) */}
              <div className="aspect-[3/4] bg-[#f9f9f9] rounded-[40px] p-8 mb-6 transition-all group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.06)] relative overflow-hidden flex items-center justify-center border border-gray-100">
                {isManageMode && (
                  <button 
                    onClick={(e) => handleDelete(mag.id, e)}
                    className="absolute top-4 right-4 z-10 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                {/* Magazine Cover */}
                <div className="relative w-full h-full bg-white rounded-2xl shadow-md overflow-hidden transform group-hover:scale-[1.03] transition-transform duration-500">
                  <img 
                    src={mag.coverUrl} 
                    alt={mag.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  
                  {/* Download PDF floating button */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => handleDownloadPDF(mag, e)}
                      className="group/btn flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md text-[#b91c1c] rounded-full shadow-2xl hover:bg-[#b91c1c] hover:text-white transition-all border border-white/50"
                      title="Download PDF"
                    >
                      <Download size={18} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest bg-[#b91c1c] text-white group-hover/btn:bg-white group-hover/btn:text-[#b91c1c] px-1.5 py-0.5 rounded leading-none">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-4 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#b91c1c] transition-colors uppercase tracking-tight">
                  {mag.title}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} strokeWidth={3} />
                    {mag.pages.length} Pages
                  </span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-[#b91c1c] opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Flipbook
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      {/* Empty State */}
        {magazines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No magazines found</h3>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full relative py-20 bg-white border-t border-gray-100" id="app-footer">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          {/* Footer Logo */}
          <div className="mb-12 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <path d="M52,42 C62,20 80,28 72,50 C65,65 55,55 52,42 Z" fill="#e45e26" />
                <path d="M42,38 C48,15 62,20 58,42 C54,58 45,52 42,38 Z" fill="#f07d4b" opacity="0.9" />
                <path d="M24,56 L34,56 L34,64 L24,64 Z" fill="#cc9933" />
                <path d="M34,48 L46,48 L46,64 L34,64 Z" fill="#c48a21" />
                <path d="M46,52 L56,52 L56,64 L46,64 Z" fill="#cc9933" />
                <path d="M22,56 Q29,38 36,56" fill="#cc9933" stroke="#8b5e00" strokeWidth="0.5" />
                <path d="M32,48 Q40,24 48,48" fill="#c48a21" stroke="#8b5e00" strokeWidth="0.5" />
                <path d="M44,52 Q50,34 58,52" fill="#cc9933" stroke="#8b5e00" strokeWidth="0.5" />
                <path d="M20,64 Q45,92 72,64 L68,60 Q45,84 24,60 Z" fill="#4a1a1a" />
              </svg>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-tight mb-2">Gnan Mandir</h2>
            <p className="text-[14px] uppercase tracking-[0.5em] text-gray-400 font-black">Education & Wellness</p>
          </div>
          {/* Social Icons */}
          <div className="flex flex-col items-center gap-8">
            <span className="text-gray-900 text-3xl font-black tracking-[0.2em] uppercase">Follow Us</span>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: <Facebook size={24} />, label: 'Facebook', url: 'https://www.facebook.com/GnanMandirGurukul/' },
                { icon: <Instagram size={24} />, label: 'Instagram', url: 'https://www.instagram.com/gnanmandir/' },
                { icon: <Youtube size={24} />, label: 'YouTube', url: 'https://www.youtube.com/@gnanmandirgurukul' },
                { icon: <MessageCircle size={24} strokeWidth={2.5} />, label: 'WhatsApp', url: 'https://whatsapp.com/channel/0029VajKJUiHbFVAbmn3Mt3s' },
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#b91c1c] hover:border-[#b91c1c] hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Components */}
      <AnimatePresence>
        {selectedMagazine && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Opening Flipbook...</p>
            </div>
          }>
            <FlipbookViewer 
              magazine={selectedMagazine} 
              onClose={() => setSelectedMagazine(null)} 
            />
          </Suspense>
        )}
        {isUploadModalOpen && (
          <UploadModal 
            onUpload={handleUpload} 
            onClose={() => setIsUploadModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
