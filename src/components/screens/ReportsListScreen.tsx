import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Cloud, Eye, FilePlus, Loader2, Printer, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_REPORTS } from '../../data/mockData';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { LabReport } from '../../types';
import { Header } from '../common/Header';

export const ReportsListScreen: React.FC = () => {
  const { viewReportForPrint, setActiveScreen, setCurrentReport, setPrintModalOpen } = useApp();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real-time data directly from Firestore collection
  useEffect(() => {
    setLoading(true);
    setErrorMessage(null);
    const reportsCollection = collection(db, 'reports');

    const unsubscribe = onSnapshot(
      reportsCollection,
      (snapshot) => {
        const list: LabReport[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as LabReport), id: docSnap.id });
        });
        setReports(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports from Firestore:', error);
        setErrorMessage('تعذر جلب التقارير من Firestore: ' + error.message);
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'reports');
        } catch {
          // Handled and logged
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (report: LabReport) => {
    if (!confirm(`هل أنت متأكد من حذف تقرير المريض ${report.patientName} نهائياً من قاعدة بيانات Firestore؟`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reports', report.id));
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('حدث خطأ أثناء حذف التقرير من قاعدة البيانات.');
      handleFirestoreError(err, OperationType.DELETE, `reports/${report.id}`);
    }
  };

  const seedSampleReports = async () => {
    try {
      setSeeding(true);
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, 'reports', rep.id), rep);
      }
    } catch (err) {
      console.error('Failed to seed reports:', err);
      alert('تعذر حفظ البيانات الأولية في Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const filtered = query.trim()
    ? reports.filter(r =>
        r.patientName?.includes(query) ||
        r.labNumber?.toLowerCase().includes(query.toLowerCase()) ||
        r.doctorName?.includes(query)
      )
    : reports;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none dir-rtl" dir="rtl">
      <Header title="سجل التقارير الطبية (Firestore)" showBack onBack={() => setActiveScreen('dashboard')} />

      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex-1 space-y-6 pb-28 md:pb-8">
        
        {/* Search & Action Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 border flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث برقم المختبر (LAB-) أو اسم المريض أو الطبيب..."
              className="bg-transparent outline-none text-xs md:text-sm w-full font-bold text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>مباشر من Firestore: {reports.length} تقرير</span>
            </div>

            <button
              onClick={() => setActiveScreen('add_invoice')}
              className="px-4 py-2 bg-[#0b3b8c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-900 shadow-sm transition-all"
            >
              <FilePlus className="w-4 h-4" /> إضافة فاتورة
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-bold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Table List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b3b8c]" />
              <p className="text-xs font-bold">جاري تحميل التقارير الطبية مباشرة من سحابة Firestore...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0b3b8c] flex items-center justify-center">
                <Cloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">لا توجد تقارير في مجموعة Firestore الحالية</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  يمكنك البدء بإضافة تقرير جديد أو رفع التقارير النموذجية المعتمدة إلى قاعدة بيانات Firestore.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveScreen('add_invoice')}
                  className="px-4 py-2 bg-[#0b3b8c] text-white rounded-xl text-xs font-bold hover:bg-blue-900"
                >
                  إضافة تقرير جديد
                </button>
                <button
                  onClick={seedSampleReports}
                  disabled={seeding}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'جاري الرفع...' : 'رفع نماذج تقارير أولية'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b">
                  <tr>
                    <th className="p-4">الرقم المخبري والمريض</th>
                    <th className="p-4">العمر / الجنس</th>
                    <th className="p-4">الطبيب المحول</th>
                    <th className="p-4">تاريخ الفحص</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(report => (
                    <tr key={report.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-4">
                        <p className="font-extrabold text-slate-900 text-sm">{report.patientName}</p>
                        <p className="text-[11px] text-red-600 font-mono font-bold mt-0.5">{report.labNumber}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {report.patientAge} سنة / {report.patientSex === 'M' ? 'ذكر' : 'أنثى'}
                      </td>
                      <td className="p-4 text-slate-600 font-bold">{report.doctorName}</td>
                      <td className="p-4 font-mono text-slate-500">{report.reportDate}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewReportForPrint(report)}
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> عرض
                          </button>
                          <button
                            onClick={() => {
                              setCurrentReport(report);
                              setPrintModalOpen(true);
                            }}
                            className="p-1.5 bg-[#0b3b8c]/10 hover:bg-[#0b3b8c]/20 text-[#0b3b8c] rounded-lg transition-colors"
                            title="طباعة وتصدير"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="حذف التقرير"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
