import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Images, UploadCloud, Copy, Trash2, RefreshCw, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { toast } from 'react-hot-toast';

type Folder = 'wallpapers' | 'logos';

interface Props {
  onClose: () => void;
}

export default function AdminMediaModal({ onClose }: Props) {
  const [activeFolder, setActiveFolder] = useState<Folder>('wallpapers');
  const [wallpapers, setWallpapers] = useState<string[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImages, fetchGalleryImages, deleteImage, isUploading, uploadCount, uploadProgress } = useStorage();

  const currentImages = activeFolder === 'wallpapers' ? wallpapers : logos;
  const setCurrentImages = activeFolder === 'wallpapers' ? setWallpapers : setLogos;

  const loadGallery = useCallback(async (folder: Folder, force = false) => {
    const already = folder === 'wallpapers' ? wallpapers : logos;
    if (already.length > 0 && !force) return;
    setIsLoadingGallery(true);
    const urls = await fetchGalleryImages(folder);
    if (folder === 'wallpapers') setWallpapers(urls);
    else setLogos(urls);
    setIsLoadingGallery(false);
  }, [wallpapers, logos, fetchGalleryImages]);

  useEffect(() => {
    loadGallery(activeFolder);
  }, [activeFolder]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    // Validate size
    const oversized = files.filter((f: File) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`${oversized.length} file vượt quá 5MB và sẽ bị bỏ qua.`);
    }
    const validFiles = files.filter((f: File) => f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    toast.loading(`Đang tải lên ${validFiles.length} ảnh...`, { id: 'bulk-upload' });
    const newUrls = await uploadImages(validFiles, activeFolder);
    if (newUrls.length > 0) {
      setCurrentImages(prev => [...prev, ...newUrls]);
      toast.success(`Tải lên thành công ${newUrls.length}/${validFiles.length} ảnh!`, { id: 'bulk-upload' });
    } else {
      toast.error('Không có ảnh nào được tải lên thành công.', { id: 'bulk-upload' });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      toast.success('Đã copy link ảnh!');
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleDelete = async (url: string) => {
    if (!window.confirm('Xóa ảnh này khỏi Firebase Storage? Các trường đang dùng ảnh này sẽ bị mất hình.')) return;
    setDeletingUrl(url);
    try {
      await deleteImage(url);
      setCurrentImages(prev => prev.filter(u => u !== url));
      toast.success('Đã xóa ảnh thành công!');
    } catch {
      toast.error('Lỗi khi xóa ảnh. Kiểm tra quyền Firebase Storage.');
    } finally {
      setDeletingUrl(null);
    }
  };

  const isSquare = activeFolder === 'logos';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl relative flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Images className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Kho Media</h3>
              <p className="text-indigo-200 text-xs font-medium mt-0.5">Quản lý ảnh nền & logo trường hàng loạt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-100 shrink-0 flex-wrap">
          {/* Folder Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['wallpapers', 'logos'] as Folder[]).map(f => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeFolder === f ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f === 'wallpapers' ? '🖼️ Wallpapers' : '🪪 Logos'}
                {(f === 'wallpapers' ? wallpapers : logos).length > 0 && (
                  <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeFolder === f ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                    {(f === 'wallpapers' ? wallpapers : logos).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => loadGallery(activeFolder, true)}
              disabled={isLoadingGallery}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-50"
              title="Tải lại kho ảnh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingGallery ? 'animate-spin' : ''}`} />
            </button>

            {/* Upload Button */}
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadCount.done}/{uploadCount.total} ảnh...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Tải lên hàng loạt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden shrink-0"
            >
              <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-4">
                <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                  {uploadCount.done}/{uploadCount.total} ảnh ({Math.round(uploadProgress)}%)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {isLoadingGallery ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm font-bold">Đang tải kho ảnh...</p>
            </div>
          ) : currentImages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-500">Kho ảnh trống</p>
                <p className="text-sm text-slate-400 mt-1">Nhấn "Tải lên hàng loạt" để bắt đầu</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 ${isSquare ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
              {currentImages.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`overflow-hidden bg-slate-100 ${isSquare ? 'aspect-square' : 'aspect-video'}`}>
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(url)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all font-bold ${copiedUrl === url ? 'bg-green-500 text-white' : 'bg-white text-slate-700 hover:bg-indigo-500 hover:text-white'}`}
                      title="Copy link"
                    >
                      {copiedUrl === url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(url)}
                      disabled={deletingUrl === url}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      title="Xóa ảnh"
                    >
                      {deletingUrl === url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white text-center shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            💡 Hover vào ảnh để copy link hoặc xóa. Sau khi copy, dán vào ô ảnh nền / logo khi thêm trường.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
