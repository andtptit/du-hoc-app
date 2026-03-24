import { motion, AnimatePresence } from 'motion/react';
import { X, GraduationCap, Edit2, Trash2, Plus, Building2, Upload, Download } from 'lucide-react';
import { University } from '../types';
import { deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse';
import React, { useState, useRef } from 'react';
import UniversityFormModal from './UniversityFormModal';
import { extractTuitionMin } from '../utils/extract';

interface Props {
  universities: University[];
  onClose: () => void;
}

export default function AdminUniversitiesModal({ universities, onClose }: Props) {
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<University[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        applicationFee: '(Nhập số VND nếu muốn đổi, không thì bỏ trống)', enrollmentFee: '(Nhập số VND nếu muốn đổi, không thì bỏ trống)'
      },
      {
        id: '(Bỏ trống)', name: 'Đại học Mẫu Demo', nameKr: 'Sample University', visaTop: 1,
        region: 'Seoul', address: '123 Seoul\nHàn Quốc', rank: 'Top 1', 
        majors: 'Kinh Tế\nTruyền thông', admissionRequirements: 'Tốt nghiệp THPT\nGPA > 6.5', 
        tuitionD4: 'Khoảng 1.500.000 KRW/kỳ', tuitionD2_1: 'Từ 1.800.000 KRW/kỳ', tuitionD2_2: '2.000.000 KRW/kỳ', tuitionD2_3: '3.000.000 KRW/kỳ', 
        scholarship: '30%\n50%', dormitory: 'Hệ tiếng: 500.000 KRW; Hệ Đại học: 700.000 KRW', jobOpportunities: 'Tốt\nLàm thêm 20h/tuần', 
        calcTuitionD4: '', calcTuitionD2_1: '', calcTuitionD2_2: '', calcTuitionD2_3: '', 
        image: '', logoUrl: '', minGpaD4: 6.5, minGpaD2: 7.0,
        applicationFee: '', enrollmentFee: ''
      }
    ];
    
    // Sử dụng \uFEFF BOM để Excel mở tiếng Việt không bị lỗi font UTF-8
    const csvString = Papa.unparse(sampleData);
    const blob = new Blob(["\uFEFF", csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "DuHoc_MauUploadTruong.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast.loading("Đang đọc file Excel/CSV...", { id: 'import' });
    setPreviewFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''), // Loại bỏ BOM nếu có
      complete: (results) => {
        try {
          const parsedUnis: University[] = [];
          for (const row of results.data as any[]) {
            if (row.name?.includes('BẮT BUỘC ĐIỀN') || row.name === 'Đại học Mẫu Demo') continue; // Bỏ qua 2 dòng mẫu đầu tiên
            if (!row.name || !row.nameKr) continue; // Bỏ qua nếu dòng hỏng
            
            let docId = row.id;
            if (!docId) {
              docId = row.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
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
              applicationFee: Number(row.applicationFee) || 0,
              enrollmentFee: Number(row.enrollmentFee) || 2000000,
            };
            parsedUnis.push(uniData);
          }
          setPreviewData(parsedUnis);
          toast.success(`Đã đọc xong file, sẵn sàng import ${parsedUnis.length} trường!`, { id: 'import' });
        } catch (error: any) {
          console.error("Parse Error:", error);
          toast.error("Lỗi khi đọc file: " + error.message, { id: 'import' });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error("File CSV bị hỏng: " + error.message, { id: 'import' });
        setIsImporting(false);
      }
    });
  };

  const handleConfirmImport = async () => {
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
        if (count >= 490) break; // Limit của writeBatch
      }
      await batch.commit();
      toast.success(`Nhập hàng loạt thành công ${count} trường!`, { id: 'import' });
      setPreviewData(null);
      setPreviewFileName('');
    } catch (error: any) {
      console.error("Batch Import Error:", error);
      toast.error("Lỗi khi import: " + error.message, { id: 'import' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] shadow-2xl relative flex flex-col"
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
              <p className="text-sm text-slate-500">Hệ thống Thêm, Sửa, Xóa thông tin các trường và học phí</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shrink-0"
              title="Tải File CSV mẫu để nhập liệu"
            >
              <Download className="w-5 h-5" /> Mẫu
            </button>
            <button
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 shrink-0 disabled:opacity-50"
              title="Tải lên dữ liệu hàng loạt từ CSV"
            >
              <Upload className="w-5 h-5" /> Import
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

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
          <div className="mb-6 shrink-0 bg-blue-50/50 border border-blue-200 p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-inner">
            <div className="space-y-1">
              <h4 className="text-blue-800 font-black tracking-tight text-lg">XÁC NHẬN IMPORT</h4>
              <p className="text-blue-600/80 text-sm font-medium">
                File gốc: <strong className="text-blue-700">{previewFileName}</strong> • Chuẩn bị đăng tải hộp dữ liệu <strong className="text-blue-700">{previewData.length} trường</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                disabled={isImporting}
                onClick={() => {
                  setPreviewData(null);
                  setPreviewFileName('');
                }}
                className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200 shadow-sm transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isImporting}
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Đồng ý Import ngay
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
                  <th className="px-4 py-4 rounded-tl-xl">ID</th>
                  <th className="px-4 py-4">Tên trường</th>
                  <th className="px-4 py-4">Tên Hàn / Rank</th>
                  <th className="px-4 py-4 text-center">Hệ ưu tiên</th>
                  <th className="px-4 py-4 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {universities.map((uni) => (
                  <tr key={uni.id} className="hover:bg-white transition-colors group">
                    <td className="px-4 py-4 font-mono text-xs text-slate-400">{uni.id}</td>
                    <td className="px-4 py-4 font-bold text-slate-800 text-base">{uni.name}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-600">{uni.nameKr}</p>
                      <p className="text-xs text-purple-600 ">{uni.rank}</p>
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
      </AnimatePresence>
    </div>
  );
}
