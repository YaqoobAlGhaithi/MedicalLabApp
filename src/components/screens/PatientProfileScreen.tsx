import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { Calendar, Cloud, Eye, Loader2, Phone, RefreshCw, Search, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_PATIENTS, INITIAL_REPORTS } from '../../data/mockData';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { LabReport, Patient } from '../../types';
import { Header } from '../common/Header';

export const PatientProfileScreen: React.FC = () => {
  const { viewReportForPrint, setActiveScreen } = useApp();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatId, setSelectedPatId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Direct real-time queries to Firestore collections 'patients' and 'reports'
  useEffect(() => {
    setLoading(true);
    setErrorMessage(null);

    const unsubPatients = onSnapshot(
      collection(db, 'patients'),
      (snapshot) => {
        const pList: Patient[] = [];
        snapshot.forEach((docSnap) => {
          pList.push({ ...(docSnap.data() as Patient), id: docSnap.id });
        });
        setPatients(pList);
        if (pList.length > 0) {
          setSelectedPatId((prev) => (prev && pList.some(p => p.id === prev) ? prev : pList[0].id));
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching patients from Firestore:', error);
        setErrorMessage('تعذر جلب ملفات المرضى من Firestore: ' + error.message);
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'patients');
        } catch {
          // Logged
        }
      }
    );

    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        const rList: LabReport[] = [];
        snapshot.forEach((docSnap) => {
          rList.push({ ...(docSnap.data() as LabReport), id: docSnap.id });
        });
        setReports(rList);
      },
      (error) => {
        console.error('Error fetching reports from Firestore:', error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'reports');
        } catch {
          // Logged
        }
      }
    );

    return () => {
      unsubPatients();
      unsubReports();
    };
  }, []);

  const seedSamplePatients = async () => {
    try {
      setSeeding(true);
      for (const pat of INITIAL_PATIENTS) {
        await setDoc(doc(db, 'patients', pat.id), pat);
      }
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, 'reports', rep.id), rep);
      }
    } catch (err) {
      console.error('Failed to seed sample patients to Firestore:', err);
      alert('تعذر حفظ المرضى في Firestore');
    } finally {
      setSeeding(false);
    }
  };

  const filteredPatients = query.trim()
    ? patients.filter(p => p.name?.includes(query) || p.phone?.includes(query))
    : patients;

  const selectedPatient = patients.find(p => p.id === selectedPatId) || patients[0];

  const patReports = selectedPatient
    ? reports.filter(r => r.patientName?.trim() === selectedPatient.name?.trim())
    : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none dir-rtl" dir="rtl">
      <Header title="ملف وقاعدة بيانات المرضى (Firestore)" showBack onBack={() => setActiveScreen('dashboard')} />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-28 md:pb-8">
        
        {/* Patients List Column (Cols 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col max-h-[750px]">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-base">قائمة المرضى ({patients.length})</h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-emerald-200">
                <Cloud className="w-3 h-3 text-emerald-600" /> مباشر
              </span>
            </div>
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث باسم المريض أو الهاتف..."
                className="bg-transparent outline-none text-xs w-full text-slate-800 font-bold"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0b3b8c]" />
              <span className="text-xs font-bold">جاري تحميل سجلات المرضى من Firestore...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-3">
              <p>لا يوجد مرضى مسجلين في قاعدة بيانات Firestore حالياً</p>
              <button
                onClick={seedSamplePatients}
                disabled={seeding}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                <span>رفع سجلات تجريبية إلى Firestore</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPatients.map(pat => {
                const isSel = pat.id === selectedPatient?.id;
                return (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPatId(pat.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${isSel ? 'bg-[#0b3b8c] text-white border-[#0b3b8c] shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSel ? 'bg-white text-[#0b3b8c]' : 'bg-blue-100 text-[#0b3b8c]'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs md:text-sm">{pat.name}</p>
                        <p className={`text-[10px] ${isSel ? 'text-blue-200' : 'text-slate-400'}`}>
                          {pat.age} سنة • {pat.sex === 'M' ? 'ذكر' : 'أنثى'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-1 rounded-md ${isSel ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600 font-bold'}`}>
                      {pat.phone || 'بدون هاتف'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Patient History Column (Cols 8) */}
        <div className="lg:col-span-8 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-bold">
              {errorMessage}
            </div>
          )}

          {selectedPatient ? (
            <>
              {/* Patient Profile Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-blue-50 text-[#0b3b8c] flex items-center justify-center shadow-inner">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      العمر: <strong className="text-slate-800">{selectedPatient.age} سنة</strong> • الجنس: <strong className="text-slate-800">{selectedPatient.sex === 'M' ? 'ذكر' : 'أنثى'}</strong>
                    </p>
                    {selectedPatient.phone && (
                      <p className="text-xs text-blue-700 font-mono font-bold mt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {selectedPatient.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-center shrink-0">
                  <p className="text-xs text-blue-900 font-bold">إجمالي التقارير في Firestore</p>
                  <p className="text-2xl font-black text-[#0b3b8c] mt-0.5">{patReports.length}</p>
                </div>
              </div>

              {/* Reports Timeline */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200">
                <h3 className="font-black text-slate-800 text-base mb-4 flex items-center gap-2 border-b pb-3">
                  <Calendar className="w-5 h-5 text-blue-700" /> سجل التقارير الطبية للمريض
                </h3>

                {patReports.length > 0 ? (
                  <div className="space-y-3">
                    {patReports.map(rep => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-between gap-4 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-red-600 text-sm">{rep.labNumber}</span>
                            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">معتمد</span>
                          </div>
                          <p className="text-xs text-slate-600 font-bold mt-1">الطبيب: {rep.doctorName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{rep.reportDate}</p>
                        </div>

                        <button
                          onClick={() => viewReportForPrint(rep)}
                          className="px-4 py-2 bg-[#0b3b8c] hover:bg-blue-900 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Eye className="w-4 h-4 text-blue-200" /> عرض التقرير المطبوع
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                    لا توجد تقارير مخبرية مسجلة لهذا المريض في Firestore بعد
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-bold text-sm">
              يرجى اختيار مريض من القائمة الجانبية
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
