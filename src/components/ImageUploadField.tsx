import React, { useState, useEffect } from 'react';
import { useStorage } from '../hooks/useStorage';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label: string;
  aspectRatio?: 'video' | 'square';
}

export default function ImageUploadField({ value, onChange, folder, label, aspectRatio = 'video' }: Props) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'gallery'>('url');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const { uploadImage, fetchGalleryImages, isUploading, uploadProgress } = useStorage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }

    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error('Lỗi tải ảnh');
    }
  };

  const loadGallery = async () => {
    if (galleryImages.length > 0) return; // Prevent re-fetching if already loaded
    setIsLoadingGallery(true);
    const urls = await fetchGalleryImages(folder);
    setGalleryImages(urls);
    setIsLoadingGallery(false);
  };

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadGallery();
    }
  }, [activeTab]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'url' ? 'bg-white text-[#0f3493] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LinkIcon className="w-4 h-4" /> Dán Link
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-white text-[#0f3493] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <UploadCloud className="w-4 h-4" /> Tải Lên
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-white text-[#0f3493] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ImageIcon className="w-4 h-4" /> Kho Ảnh
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        {activeTab === 'url' && (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-[14px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors p-6 flex flex-col items-center justify-center text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0f3493] animate-spin" />
                <div className="text-sm font-bold text-slate-600">Đang tải lên... {Math.round(uploadProgress)}%</div>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0f3493]" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0f3493] mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Kéo thả hoặc click để chọn file từ máy</p>
                <p className="text-[12px] font-medium text-slate-400">Hỗ trợ PNG, JPG, WEBP (Tối đa 5MB)</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="h-64 overflow-y-auto pr-2 rounded-lg custom-scrollbar">
            {isLoadingGallery ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm font-bold">Đang tải kho ảnh...</span>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-[13px] font-medium">Kho ảnh trống</span>
              </div>
            ) : (
              <div className={`grid gap-3 ${aspectRatio === 'square' ? 'grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {galleryImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => onChange(url)}
                    className={`relative group rounded-lg overflow-hidden border-2 ${value === url ? 'border-[#0f3493] ring-2 ring-[#0f3493]/20' : 'border-transparent'} hover:border-[#0f3493]/50 transition-all bg-slate-100 flex items-center justify-center`}
                  >
                    <img 
                      src={url} 
                      alt="" 
                      className={`w-full object-cover ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'}`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[11px] font-black px-3 py-1 bg-black/60 rounded-full uppercase tracking-wider backdrop-blur-sm">CHỌN ẢNH NÀY</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {value && (
        <div className="mt-4">
          <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Hiển thị hiện tại</p>
          <div className={`relative rounded-2xl border border-slate-200 overflow-hidden bg-white ${aspectRatio === 'square' ? 'w-32 h-32' : 'w-full max-w-sm aspect-video'}`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
