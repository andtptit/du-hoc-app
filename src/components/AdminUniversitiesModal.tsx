import { motion, AnimatePresence } from 'motion/react';
import { X, GraduationCap, Edit2, Trash2, Plus, Building2, Upload, Download, RefreshCw, ChevronDown, Images } from 'lucide-react';
import { University } from '../types';
import { deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse';
import React, { useState, useRef } from 'react';
import UniversityFormModal from './UniversityFormModal';
import AdminMediaModal from './AdminMediaModal';
import { extractTuitionMin } from '../utils/extract';

interface Props {
  universities: University[];
  onClose: () => void;
}

type ImportMode = 'add' | 'update';

export default function AdminUniversitiesModal({ universities, onClose }: Props) {
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<University[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('add');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Xóa ${selectedIds.size} trường đã chọn? Thao tác này không thể hoàn tác!`)) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => batch.delete(doc(db, 'universities', id)));
      await batch.commit();
      toast.success(`Đã xóa ${selectedIds.size} trường thành công!`);
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error('Bulk Delete Error:', error);
      toast.error('Lỗi khi xóa hàng loạt: ' + error.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const isAllSelected = universities.length > 0 && selectedIds.size === universities.length;
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(universities.map(u => u.id)));
  };


  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa hoàn toàn dữ liệu của "${name}" khỏi bản đồ du học?`)) return;
    try {
      await deleteDoc(doc(db, 'universities', id));
      toast.success('Xóa trường thành công!');
    } catch (error) {
      console.error('Delete Uni Error:', error);
      toast.error('Lỗi khi xóa!');
    }
  };

  const handleEdit = (uni: University) => {
    setEditingUni(uni);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingUni(null);
    setIsFormOpen(true);
  };

  // ─── EXPORT CSV ─────────────────────────────────────────────────────────────
  const handleExportData = (topFilter: number | 'all' | 'selected') => {
    setShowExportMenu(false);
    let filtered = universities;
    if (topFilter === 'selected') {
      filtered = universities.filter(u => selectedIds.has(u.id));
    } else if (topFilter !== 'all') {
      filtered = universities.filter(u => u.visaTop === topFilter);
    }

    if (filtered.length === 0) {
      toast.error('Không có trường nào khớp với bộ lọc!');
      return;
    }

    const rows = filtered.map(u => ({
      id: u.id,
      name: u.name,
      nameKr: u.nameKr,
      visaTop: u.visaTop,
      region: u.region || '',
      address: u.address,
      rank: u.rank,
      majors: u.majors,
      admissionRequirements: u.admissionRequirements,
      tuitionD4: u.tuitionD4,
      tuitionD2_1: u.tuitionD2_1 || '',
      tuitionD2_2: u.tuitionD2_2,
      tuitionD2_3: u.tuitionD2_3,
      scholarship: u.scholarship,
      dormitory: u.dormitory,
      jobOpportunities: u.jobOpportunities,
      calcTuitionD4: u.calcTuitionD4,
      calcTuitionD2_1: u.calcTuitionD2_1 || '',
      calcTuitionD2_2: u.calcTuitionD2_2,
      calcTuitionD2_3: u.calcTuitionD2_3,
      image: u.image,
      logoUrl: u.logoUrl || '',
      minGpaD4: u.minGpaD4,
      minGpaD2: u.minGpaD2,
      applicationFee: u.applicationFee || '',
      enrollmentFee: u.enrollmentFee || '',
      admissionTime: u.admissionTime || '',
    }));

    const csvString = Papa.unparse(rows);
    const blob = new Blob(['\uFEFF', csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const suffix = topFilter === 'selected' ? 'DaChon' : (topFilter === 'all' ? 'TatCa' : `TOP${topFilter}`);
    link.setAttribute('download', `DuHoc_DuLieuTruong_${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filtered.length} trường${topFilter === 'selected' ? ' đã chọn' : (topFilter !== 'all' ? ` TOP ${topFilter}` : '')}!`);
  };

  // ─── DOWNLOAD TEMPLATE ───────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        id: '(Bỏ trống để hệ thống tự tạo)', name: 'BẮT BUỘC ĐIỀN (Dòng này sẽ bị bỏ qua khi Import)', nameKr: 'BẮT BUỘC ĐIỀN', visaTop: 'Ghi số (1, 2, 3)',
        region: 'VD: Seoul, Busan', address: 'VD: 123 Seoul (Alt+Enter xuống dòng)', rank: 'VD: Top 1',
        majors: 'Mỗi ngành xuống dòng (Alt+Enter)', admissionRequirements: 'Ví dụ: Tốt nghiệp THPT',
        tuitionD4: 'Ví dụ: 1.500.000 KRW/kỳ', tuitionD2_1: 'Ví dụ: 1.800.000 KRW/kỳ', tuitionD2_2: 'Ví dụ: 2.000.000 KRW/kỳ', tuitionD2_3: 'Ví dụ: 3.000.000 KRW/kỳ',
        scholarship: 'Mô tả học bổng tùy ý', dormitory: 'Phòng 2: 500k KRW; Phòng 4: 300k KRW', jobOpportunities: 'Làm thêm...',
        calcTuitionD4: '(Hệ thống tự động tính từ cột bên phải, vui lòng BỎ TRỐNG cột này)', calcTuitionD2_1: '(BỎ TRỐNG)', calcTuitionD2_2: '(BỎ TRỐNG)', calcTuitionD2_3: '(BỎ TRỐNG)',
        image: 'Link URL ảnh nền trường (nếu có)', logoUrl: 'Link URL logo trường (nếu có)', minGpaD4: 'Điểm số (ví dụ: 6.5)', minGpaD2: 'Điểm số (ví dụ: 7.0)',
        applicationFee: 'Định dạng: D4-1:100000 KRW;D2-2:150000 KRW (hoặc để trống)',
        enrollmentFee: 'Định dạng: D2-3:900000 KRW (hoặc để trống)',
        admissionTime: 'Ví dụ: Kỳ tháng 4: Từ 01/10 ~ 30/11',
      },
      {
        id: '(Bỏ trống)', name: 'Đại học Mẫu Demo', nameKr: 'Sample University', visaTop: 1,
        region: 'Seoul', address: '123 Seoul\nHàn Quốc', rank: 'Top 1',
        majors: 'Kinh Tế\nTruyền thông', admissionRequirements: 'Tốt nghiệp THPT\nGPA > 6.5',
        tuitionD4: 'Khoảng 1.500.000 KRW/kỳ', tuitionD2_1: 'Từ 1.800.000 KRW/kỳ', tuitionD2_2: '2.000.000 KRW/kỳ', tuitionD2_3: '3.000.000 KRW/kỳ',
        scholarship: '30%\n50%', dormitory: 'Hệ tiếng: 500.000 KRW; Hệ Đại học: 700.000 KRW', jobOpportunities: 'Tốt\nLàm thêm 20h/tuần',
        calcTuitionD4: '', calcTuitionD2_1: '', calcTuitionD2_2: '', calcTuitionD2_3: '',
        image: '', logoUrl: '', minGpaD4: 6.5, minGpaD2: 7.0,
        applicationFee: 'D4-1:100000 KRW;D2-2:150000 KRW',
        enrollmentFee: 'D2-3:900000 KRW',
        admissionTime: 'Kỳ tháng 3: 01/09 ~ 30/11; Kỳ tháng 9: 01/03 ~ 30/05',
      }
    ];

    const csvString = Papa.unparse(sampleData);
    const blob = new Blob(['\uFEFF', csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DuHoc_MauUploadTruong.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── IMPORT (ADD or UPDATE) ──────────────────────────────────────────────────
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, mode: ImportMode) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMode(mode);
    toast.loading('Đang đọc file Excel/CSV...', { id: 'import' });
    setPreviewFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      transformHeader: (header) => {
        let h = header.trim().replace(/^\uFEFF/, '').replace(/^ï»¿/, '');
        if (h.toLowerCase() === 'id') return 'id'; // Force lowercase id to match our logic
        return h;
      },
      complete: (results) => {
        try {
          const parsedUnis: University[] = [];
          for (const row of results.data as any[]) {
            if (row.name?.includes('BẮT BUỘC ĐIỀN') || row.name === 'Đại học Mẫu Demo') continue;
            
            // Ở chế độ Add, bắt buộc phải có tên trường
            if (mode === 'add' && (!row.name || !row.nameKr)) {
              continue;
            }

            let docId = row.id?.trim() || '';
            if (!docId || docId.startsWith('(')) {
              if (mode === 'update') {
                toast.error('Có một số dòng trống cột ID. Chế độ Update yêu cầu cột ID (id) bắt buộc điền!', { id: 'import' });
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
              }
              // Tự generate ID ở chế độ Add
              docId = (row.name || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
              if (!docId) docId = `uni-${Date.now()}-${Math.random()}`;
            }

            const uniData: University = {
              id: docId,
              name: row.name || '',
              nameKr: row.nameKr || '',
              visaTop: Number(row.visaTop) || 1,
              region: row.region || '',
              address: row.address || '',
              rank: row.rank || '',
              majors: row.majors || '',
              admissionRequirements: row.admissionRequirements || '',
              tuitionD4: row.tuitionD4 || '0 KRW',
              tuitionD2_1: row.tuitionD2_1 || '0 KRW',
              tuitionD2_2: row.tuitionD2_2 || '0 KRW',
              tuitionD2_3: row.tuitionD2_3 || '0 KRW',
              scholarship: row.scholarship || '',
              dormitory: row.dormitory || '',
              jobOpportunities: row.jobOpportunities || '',
              calcTuitionD4: row.calcTuitionD4 ? Number(row.calcTuitionD4) : extractTuitionMin(row.tuitionD4 || ''),
              calcTuitionD2_1: row.calcTuitionD2_1 ? Number(row.calcTuitionD2_1) : extractTuitionMin(row.tuitionD2_1 || ''),
              calcTuitionD2_2: row.calcTuitionD2_2 ? Number(row.calcTuitionD2_2) : extractTuitionMin(row.tuitionD2_2 || ''),
              calcTuitionD2_3: row.calcTuitionD2_3 ? Number(row.calcTuitionD2_3) : extractTuitionMin(row.tuitionD2_3 || ''),
              image: row.image || '',
              logoUrl: row.logoUrl || '',
              minGpaD4: Number(row.minGpaD4) || 0,
              minGpaD2: Number(row.minGpaD2) || 0,
              applicationFee: row.applicationFee || '',
              enrollmentFee: row.enrollmentFee || '',
              admissionTime: row.admissionTime || '',
            };
            parsedUnis.push(uniData);
          }
          setPreviewData(parsedUnis);
          toast.success(`Đã đọc xong ${parsedUnis.length} trường — chế độ [${mode === 'add' ? 'Thêm mới' : 'Cập nhật'}]`, { id: 'import' });
        } catch (error: any) {
          console.error('Parse Error:', error);
          toast.error('Lỗi khi đọc file: ' + error.message, { id: 'import' });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error('File CSV bị hỏng: ' + error.message, { id: 'import' });
        setIsImporting(false);
      }
    });
  };

  // ─── CONFIRM IMPORT: ADD ─────────────────────────────────────────────────────
  const handleConfirmAdd = async () => {
    if (!previewData || previewData.length === 0) return;
    setIsImporting(true);
    toast.loading(`Đang lưu ${previewData.length} trường lên hệ thống...`, { id: 'import' });
    try {
      const batch = writeBatch(db);
      let count = 0;
      for (const uni of previewData) {
        const docRef = doc(db, 'universities', uni.id);
        batch.set(docRef, uni);
        count++;
        if (count >= 490) break;
      }
      await batch.commit();
      toast.success(`Nhập hàng loạt thành công ${count} trường!`, { id: 'import' });
      setPreviewData(null);
      setPreviewFileName('');
    } catch (error: any) {
      console.error('Batch Import Error:', error);
      toast.error('Lỗi khi import: ' + error.message, { id: 'import' });
    } finally {
      setIsImporting(false);
    }
  };

  // ─── CONFIRM IMPORT: UPDATE (chỉ update field không trống) ──────────────────
  const handleConfirmUpdate = async () => {
    if (!previewData || previewData.length === 0) return;
    setIsImporting(true);
    toast.loading(`Đang cập nhật ${previewData.length} trường...`, { id: 'import' });
    try {
      let count = 0;
      for (const uni of previewData) {
        const docRef = doc(db, 'universities', uni.id);
        // Lọc bỏ các key có giá trị rỗng (không ghi đè)
        const updates: Partial<University> = {};
        (Object.keys(uni) as (keyof University)[]).forEach((key) => {
          if (key === 'id') return; // id là định danh, không update
          const val = uni[key];
          if (val === '' || val === null || val === undefined) return;
          if (typeof val === 'number' && isNaN(val)) return;
          (updates as any)[key] = val;
        });
        await updateDoc(docRef, updates as any);
        count++;
      }
      toast.success(`Cập nhật thành công ${count} trường!`, { id: 'import' });
      setPreviewData(null);
      setPreviewFileName('');
    } catch (error: any) {
      console.error('Batch Update Error:', error);
      toast.error('Lỗi khi cập nhật: ' + error.message, { id: 'import' });
    } finally {
      setIsImporting(false);
    }
  };

  const fileInputAddRef = useRef<HTMLInputElement>(null);
  const fileInputUpdateRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExportMenu(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] shadow-2xl relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-between gap-3 mb-6 shrink-0 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Quản Lý Trường Đại Học</h3>
              <p className="text-sm text-slate-500">Hệ thống Thêm, Sửa, Xóa, Import, Export thông tin trường</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-200 shrink-0"
              >
                <Trash2 className="w-5 h-5" />
                Xóa {selectedIds.size} mục
              </button>
            )}
            {/* Export Data Button */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowExportMenu(prev => !prev); }}
                className="bg-amber-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 shrink-0"
                title="Tải dữ liệu xuống"
              >
                <Download className="w-5 h-5" /> Tải về
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 min-w-[160px] z-50">
                  {[
                    ...(selectedIds.size > 0 ? [{ label: `Đã chọn (${selectedIds.size})`, value: 'selected' as const }] : []),
                    { label: 'Tất cả', value: 'all' as const }, 
                    { label: 'TOP 1', value: 1 }, 
                    { label: 'TOP 2', value: 2 }, 
                    { label: 'TOP 3', value: 3 }
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleExportData(opt.value)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template Button */}
            <button
              onClick={handleDownloadTemplate}
              className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shrink-0"
              title="Tải File CSV mẫu để nhập liệu"
            >
              <Download className="w-5 h-5" /> Mẫu
            </button>

            {/* Import Thêm mới */}
            <button
              disabled={isImporting}
              onClick={() => fileInputAddRef.current?.click()}
              className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 shrink-0 disabled:opacity-50"
              title="Import CSV để thêm trường mới"
            >
              <Upload className="w-5 h-5" /> Import
            </button>
            <input type="file" accept=".csv" ref={fileInputAddRef} onChange={(e) => handleFileUpload(e, 'add')} className="hidden" />

            {/* Import Update */}
            <button
              disabled={isImporting}
              onClick={() => fileInputUpdateRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 shrink-0 disabled:opacity-50"
              title="Import CSV để cập nhật trường (giữ nguyên ô trống)"
            >
              <RefreshCw className="w-5 h-5" /> Update
            </button>
            <input type="file" accept=".csv" ref={fileInputUpdateRef} onChange={(e) => handleFileUpload(e, 'update')} className="hidden" />

            <button
              onClick={() => setIsMediaOpen(true)}
              className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 shrink-0"
              title="Mở kho ảnh hàng loạt"
            >
              <Images className="w-5 h-5" /> Kho Media
            </button>

            <button
              disabled={isImporting}
              onClick={handleAddNew}
              className="bg-purple-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Thêm Ngay
            </button>
          </div>
        </div>

        {previewData && (
          <div className={`mb-6 shrink-0 p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-inner border ${importMode === 'update' ? 'bg-blue-50/50 border-blue-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-black tracking-tight text-lg ${importMode === 'update' ? 'text-blue-800' : 'text-emerald-800'}`}>
                  XÁC NHẬN {importMode === 'update' ? 'CẬP NHẬT' : 'IMPORT'}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${importMode === 'update' ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'}`}>
                  {importMode === 'update' ? 'Chế độ: Update (giữ nguyên ô trống)' : 'Chế độ: Thêm mới / Ghi đè'}
                </span>
              </div>
              <p className={`text-sm font-medium ${importMode === 'update' ? 'text-blue-600/80' : 'text-emerald-600/80'}`}>
                File: <strong>{previewFileName}</strong> • <strong>{previewData.length} trường</strong> sẽ được {importMode === 'update' ? 'cập nhật' : 'đăng tải'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                disabled={isImporting}
                onClick={() => { setPreviewData(null); setPreviewFileName(''); }}
                className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 shadow-sm transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isImporting}
                onClick={importMode === 'update' ? handleConfirmUpdate : handleConfirmAdd}
                className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${importMode === 'update' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
              >
                {importMode === 'update' ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {importMode === 'update' ? 'Xác nhận Cập nhật' : 'Đồng ý Import ngay'}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
          {universities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <GraduationCap className="w-16 h-16 opacity-50" />
              <p>Chưa có trường nào trên hệ thống. Hãy thêm trường đầu tiên!</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="text-xs uppercase bg-white text-slate-500 sticky top-0 shadow-sm rounded-xl">
                <tr>
                  <th className="px-4 py-4 rounded-tl-xl w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                      title="Chọn tất cả"
                    />
                  </th>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Tên trường</th>
                  <th className="px-4 py-4">Tên Hàn / Rank</th>
                  <th className="px-4 py-4 text-center">Hệ ưu tiên</th>
                  <th className="px-4 py-4 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {universities.map((uni) => (
                  <tr key={uni.id} className={`transition-colors group ${selectedIds.has(uni.id) ? 'bg-purple-50' : 'hover:bg-white'}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(uni.id)}
                        onChange={() => toggleSelect(uni.id)}
                        className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-400">{uni.id}</td>

                    <td className="px-4 py-4 font-bold text-slate-800 text-base">{uni.name}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-600">{uni.nameKr}</p>
                      <p className="text-xs text-purple-600">{uni.rank}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">VISA TOP {uni.visaTop}</span>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(uni)}
                        className="inline-flex p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(uni.id, uni.name)}
                        className="inline-flex p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa trường"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <UniversityFormModal
            initialData={editingUni}
            onClose={() => setIsFormOpen(false)}
          />
        )}
        {isMediaOpen && (
          <AdminMediaModal
            onClose={() => setIsMediaOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
