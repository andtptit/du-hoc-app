import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Users, Trash2, GraduationCap } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatVND } from '../utils/format';
import { toast } from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export default function AdminRegistrationsModal({ onClose }: Props) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu đăng ký mới nhất xếp trên cùng
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((d) => data.push({ id: d.id, ...d.data() }));
        setRegistrations(data);
        setLoading(false);
      },
      (error) => {
        console.error('Fetch Registrations Error:', error);
        toast.error(`Lỗi tải danh sách: ${error.message}`, { duration: 8000 });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa bản ghi đăng ký của ${name}? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteDoc(doc(db, 'registrations', id));
      toast.success('Xóa đăng ký thành công!');
    } catch (error) {
      console.error('Xóa thất bại:', error);
      toast.error('Không thể xóa dữ liệu!');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Không rõ';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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

        <div className="flex items-center gap-3 mb-6 shrink-0 border-b border-slate-100 pb-6">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Danh Sách Học Sinh Đăng Ký</h3>
            <p className="text-sm text-slate-500">Theo dõi thông tin và chi phí ước tính của khách hàng</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-4 border border-slate-200">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500">Đang tải biểu mẫu dữ liệu...</div>
          ) : registrations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <GraduationCap className="w-16 h-16 opacity-50" />
              <p>Chưa có học sinh nào đăng ký trên hệ thống.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="text-xs uppercase bg-slate-200/60 text-slate-500 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-4 rounded-tl-xl">Thời gian</th>
                  <th className="px-4 py-4">Khách hàng</th>
                  <th className="px-4 py-4">Trường nguyện vọng</th>
                  <th className="px-4 py-4">Hồ sơ</th>
                  <th className="px-4 py-4">Chi phí dự tính</th>
                  <th className="px-4 py-4 text-center rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDate(reg.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800 text-base">{reg.name}</p>
                      <p className="text-blue-600 font-medium">{reg.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      {reg.universityName || 'Không xác định'}
                    </td>
                    <td className="px-4 py-4 text-xs space-y-1">
                      <p><span className="text-slate-400">Visa:</span> <span className="font-medium text-slate-700">{reg.visaType}</span></p>
                      <p><span className="text-slate-400">Topik:</span> <span className="font-medium text-slate-700">{reg.topikLevel}</span></p>
                      <p><span className="text-slate-400">GPA:</span> <span className="font-medium inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-sm">{reg.gpa}</span></p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-amber-600 text-lg">{formatVND(reg.costsTotal || 0)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(reg.id, reg.name)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
