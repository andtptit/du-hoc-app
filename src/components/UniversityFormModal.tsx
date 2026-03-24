import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, FileText, CheckCircle, GraduationCap } from 'lucide-react';
import { University } from '../types';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { extractNumbers } from '../utils/extract';
import ImageUploadField from './ImageUploadField';

const SmartTags = ({ text, onSelect }: { text: string | undefined, onSelect: (val: number) => void }) => {
  if (!text) return null;
  const nums = extractNumbers(text);
  if (nums.length === 0) return null;
  
  if (nums.length === 1) {
    return (
      <button 
        type="button"
        onClick={() => onSelect(nums[0])}
        className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors w-fit"
      >
        👇 Gán số: {nums[0].toLocaleString('vi-VN')}
      </button>
    );
  }
  
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <button 
        type="button"
        onClick={() => onSelect(nums[0])}
        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors w-fit"
      >
        👇 Gán Min: {nums[0].toLocaleString('vi-VN')}
      </button>
      <button 
        type="button"
        onClick={() => onSelect(nums[nums.length - 1])}
        className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md hover:bg-rose-100 transition-colors w-fit"
      >
        👇 Gán Max: {nums[nums.length - 1].toLocaleString('vi-VN')}
      </button>
    </div>
  );
};

interface Props {
  initialData: University | null;
  onClose: () => void;
}

const emptyUni: University = {
  id: '',
  name: '',
  nameKr: '',
  visaTop: 1,
  address: '',
  rank: '',
  majors: '',
  admissionRequirements: '',
  tuitionD4: '0 KRW',
  tuitionD2_1: '0 KRW',
  tuitionD2_2: '0 KRW',
  tuitionD2_3: '0 KRW',
  scholarship: '',
  dormitory: '',
  jobOpportunities: '',
  calcTuitionD4: 0,
  calcTuitionD2_1: 0,
  calcTuitionD2_2: 0,
  calcTuitionD2_3: 0,
  image: '',
  logoUrl: '',
  minGpaD4: 6.0,
  minGpaD2: 6.5,
  applicationFee: 0,
  enrollmentFee: 2000000,
};

export default function UniversityFormModal({ initialData, onClose }: Props) {
  const [tab, setTab] = useState<'basic' | 'reqs' | 'financial'>('basic');
  const [formData, setFormData] = useState<University>(initialData || { ...emptyUni });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof University, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.nameKr || !formData.visaTop) {
      toast.error('Thiếu các trường thông tin cơ bản thiết yếu!');
      return;
    }
    
    // Tự sinh ID nếu là tạo mới
    let finalId = formData.id;
    if (!initialData && !finalId) {
      finalId = formData.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      if (!finalId) finalId = `uni-${Date.now()}`;
      setFormData(prev => ({...prev, id: finalId}));
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'universities', finalId || formData.id), {
        ...formData,
        id: finalId || formData.id // Đảm bảo ghi đúng id vào document
      });
      toast.success(initialData ? 'Cập nhật thành công!' : 'Tạo trường mới thành công!');
      onClose();
    } catch (e: any) {
      console.error('Lưu trường lỗi:', e);
      toast.error('Ghi dữ liệu thất bại: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-0 max-w-4xl w-full max-h-[95vh] shadow-2xl relative flex flex-col overflow-hidden"
      >
        <div className="bg-purple-600 text-white p-6 pr-16 flex items-center gap-4">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="p-3 bg-white/20 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{initialData ? 'Sửa thông tin: ' + initialData.name : 'Khai Báo Trường Mới'}</h3>
            <p className="text-purple-200 text-sm">Điền đầy đủ và kiểm tra kỹ thông tin học phí</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button onClick={() => setTab('basic')} className={`px-6 py-4 font-bold border-b-2 transition-colors ${tab === 'basic' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>1. Cơ Bản</button>
          <button onClick={() => setTab('reqs')} className={`px-6 py-4 font-bold border-b-2 transition-colors ${tab === 'reqs' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>2. Xét Tuyển & Khác</button>
          <button onClick={() => setTab('financial')} className={`px-6 py-4 font-bold border-b-2 transition-colors ${tab === 'financial' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>3. Học Phí (Tính Toán)</button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-auto p-6 bg-white space-y-6">
          {tab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên Tiếng Việt *</label>
                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-3 border rounded-xl border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Đại học Quốc gia Seoul" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên Hàn / Tiếng Anh *</label>
                <input type="text" value={formData.nameKr} onChange={e => handleChange('nameKr', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Seoul National University" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Khu Vực (Region)</label>
                <input type="text" value={formData.region || ''} onChange={e => handleChange('region', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Ví dụ: Seoul, Busan..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ID Nội bộ (Bỏ trống tự sinh)</label>
                <input type="text" disabled={!!initialData} value={formData.id} onChange={e => handleChange('id', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-100 placeholder:text-slate-400" placeholder="seoul-national-uni" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hệ VISA TOP *</label>
                <select value={formData.visaTop} onChange={e => handleChange('visaTop', Number(e.target.value))} className="w-full p-3 border rounded-xl">
                  <option value={1}>TOP 1</option>
                  <option value={2}>TOP 2</option>
                  <option value={3}>TOP 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Xếp Hạng (Rank)</label>
                <input type="text" value={formData.rank} onChange={e => handleChange('rank', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Top 1 Hàn Quốc, ĐHQG" />
              </div>
              <div className="col-span-2">
                <ImageUploadField
                  label="Ảnh Wallpaper (URL)"
                  value={formData.image || ''}
                  onChange={(url) => handleChange('image', url)}
                  folder="wallpapers"
                  aspectRatio="video"
                />
              </div>
              <div className="col-span-2">
                <ImageUploadField
                  label="Ảnh LOGO Trường (URL)"
                  value={formData.logoUrl || ''}
                  onChange={(url) => handleChange('logoUrl', url)}
                  folder="logos"
                  aspectRatio="square"
                />
              </div>
            </div>
          )}

          {tab === 'reqs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Địa Chỉ</label>
                <textarea rows={2} value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngành Nổi Bật</label>
                <textarea rows={2} value={formData.majors} onChange={e => handleChange('majors', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Kinh tế, Kỹ thuật, Y tế..." />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Điều Kiện Tuyển Sinh</label>
                <textarea rows={3} value={formData.admissionRequirements} onChange={e => handleChange('admissionRequirements', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Cơ Hội Việc Làm</label>
                <textarea rows={2} value={formData.jobOpportunities} onChange={e => handleChange('jobOpportunities', e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">GPA Cần Có D4</label>
                <input type="number" step="0.1" value={formData.minGpaD4} onChange={e => handleChange('minGpaD4', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">GPA Cần Có D2</label>
                <input type="number" step="0.1" value={formData.minGpaD2} onChange={e => handleChange('minGpaD2', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
          )}

          {tab === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-1">Mục VĂN BẢN (Hiển thị)</h4>
                <p className="text-xs text-blue-600 mb-4">Các dòng này chỉ dùng để hiển thị text trên giao diện. (Ví dụ: "1,500,000 KRW/kỳ")</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Text Học phí D4</label>
                    <input type="text" value={formData.tuitionD4} onChange={e => handleChange('tuitionD4', e.target.value)} className="w-full p-3 border rounded-xl" />
                    <SmartTags text={formData.tuitionD4} onSelect={(val) => handleChange('calcTuitionD4', val)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Text Học phí D2-1</label>
                      <input type="text" value={formData.tuitionD2_1} onChange={e => handleChange('tuitionD2_1', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Cao Đẳng" />
                      <SmartTags text={formData.tuitionD2_1} onSelect={(val) => handleChange('calcTuitionD2_1', val)} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Text Học phí D2-2</label>
                      <input type="text" value={formData.tuitionD2_2} onChange={e => handleChange('tuitionD2_2', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Đại Học" />
                      <SmartTags text={formData.tuitionD2_2} onSelect={(val) => handleChange('calcTuitionD2_2', val)} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Text Học phí D2-3</label>
                      <input type="text" value={formData.tuitionD2_3} onChange={e => handleChange('tuitionD2_3', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Thạc Sĩ" />
                      <SmartTags text={formData.tuitionD2_3} onSelect={(val) => handleChange('calcTuitionD2_3', val)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Text KTX</label>
                    <input type="text" value={formData.dormitory} onChange={e => handleChange('dormitory', e.target.value)} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Text Học bổng</label>
                    <input type="text" value={formData.scholarship} onChange={e => handleChange('scholarship', e.target.value)} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-1">Mục MÁY TÍNH (SỐ Nguyên Won)</h4>
                <p className="text-xs text-amber-600 mb-4">Các ô này DÙNG ĐỂ TÍNH TOÁN RA TIỀN VIỆT CHUẨN. Bạn phải nhập số tiền gốc KRW.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tính Học Phí Học Tiếng KRW (1 Kỳ)</label>
                    <input type="number" value={formData.calcTuitionD4} onChange={e => handleChange('calcTuitionD4', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tính Học Phí Cao Đẳng D2-1 KRW (1 Kỳ)</label>
                    <input type="number" value={formData.calcTuitionD2_1} onChange={e => handleChange('calcTuitionD2_1', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tính Học Phí ĐH D2-2 KRW (1 Kỳ)</label>
                    <input type="number" value={formData.calcTuitionD2_2} onChange={e => handleChange('calcTuitionD2_2', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tính Học Phí Thạc Sĩ D2-3 KRW (1 Kỳ)</label>
                    <input type="number" value={formData.calcTuitionD2_3} onChange={e => handleChange('calcTuitionD2_3', Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div className="flex gap-4 border-t border-amber-200/50 pt-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Phí Apply (VND)</label>
                      <input type="number" value={formData.applicationFee} onChange={e => handleChange('applicationFee', Number(e.target.value))} className="w-full p-3 border rounded-xl" placeholder="0" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Phí Nhập Học (VND)</label>
                      <input type="number" value={formData.enrollmentFee} onChange={e => handleChange('enrollmentFee', Number(e.target.value))} className="w-full p-3 border rounded-xl" placeholder="2000000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">
            Hủy Bỏ
          </button>
          <button 
            disabled={loading}
            onClick={handleSave} 
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-70"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save className="w-5 h-5" />}
            Lưu Thông Tin Trường
          </button>
        </div>
      </motion.div>
    </div>
  );
}
