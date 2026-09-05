import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Save, Sparkles, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TEST_DEFINITIONS, evaluateAbnormal } from '../../data/referenceRanges';
import { LabReport, Sex, TestResultItem } from '../../types';
import { Header } from '../common/Header';

export const AddInvoiceScreen: React.FC = () => {
  const { doctors, addReport, viewReportForPrint, setActiveScreen } = useApp();
  
  // Steps: 1 -> Patient info, 2 -> Sections selection, 3 -> Results entry
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(28);
  const [patientSex, setPatientSex] = useState<Sex>('M');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'د. محمد السعيد');
  const [labNumber, setLabNumber] = useState(`LAB-000${Math.floor(540 + Math.random() * 80)}`);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  // Step 2 State (Sections toggled)
  const [selectedSections, setSelectedSections] = useState({
    hematology: true,
    biochemical: true,
    serological: true,
  });

  // Step 3 State (Results values)
  // hematology left
  const [hemLeftValues, setHemLeftValues] = useState<Record<string, string>>({
    hb: '14.2', pcv: '44', wbc: '7.5', neutrophil: '55', lymphocyte: '35', monocyte: '6', eosinophil: '3', basophil: '1', esr: '12'
  });
  // hematology right
  const [hemRightValues, setHemRightValues] = useState<Record<string, string>>({
    rbc: '4.8', mcv: '86', mchc: '33', mch: '29.5', retics: '1.2', bleeding_time: '3.15', clotting_time: '5.40', platelets: '240'
  });
  // biochemical
  const [bioValues, setBioValues] = useState<Record<string, string>>({
    fbsugar: '95', hrsugar: '-', hba1c: '5.2', creat: '0.9', urea: '28', amylase: '82', ua: '5.4', bilt: '0.6', bild: '0.2', bilindirect: '0.4', got: '24', gpt: '22', alkph: '88', albumin: '4.2', ca: '9.4', k: '4.1', na: '140', trig: '130', chol: '175'
  });
  // serological
  const [seroValues, setSeroValues] = useState<Record<string, string>>({
    widal_t: 'Negative', brucella_a: 'Negative',
    s_typhi_o: 'Negative', brucella_m: 'Negative',
    s_typhi_h: 'Negative', tox_igg: 'Negative',
    s_typhi_a: 'Negative', tox_igm: 'Negative',
    s_typhi_b: 'Negative', tb_ab: 'Negative',
    troponin: 'Negative', hcv: 'Non-Reactive',
    aso: 'Negative', hbsag: 'Non-Reactive',
    crp: 'Negative', hiv: 'Non-Reactive',
    rf: 'Negative', hpylor: 'Negative',
    pregnancy: 'Negative', hav: 'Negative'
  });

  const [notes, setNotes] = useState('عينة طبيعية وتم فحصها بنجاح بأحدث الأجهزة.');

  const handleNextStep = () => {
    if (step === 1) {
      if (!patientName.trim()) {
        alert('يرجى إدخال اسم المريض');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSections.hematology && !selectedSections.biochemical && !selectedSections.serological) {
        alert('يرجى اختيار قسم واحد على الأقل من التحاليل الطبية');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((step - 1) as any);
  };

  const handleQuickNormalPreset = () => {
    if (patientSex === 'F') {
      setHemLeftValues(prev => ({ ...prev, hb: '13.5', pcv: '40', wbc: '6.5' }));
      setHemRightValues(prev => ({ ...prev, rbc: '4.3' }));
    } else {
      setHemLeftValues(prev => ({ ...prev, hb: '15.2', pcv: '46', wbc: '7.0' }));
      setHemRightValues(prev => ({ ...prev, rbc: '5.0' }));
    }
    alert('تم تحميل القيم الطبيعية السليمة تلقائياً بناءً على جنس المريض');
  };

  const handleSaveReport = () => {
    // Build test result items
    const buildItems = (valuesMap: Record<string, string>, category: string): TestResultItem[] => {
      const defs = TEST_DEFINITIONS.filter(t => t.category === category);
      return defs.map(def => {
        const val = valuesMap[def.id] || '-';
        const isAbn = evaluateAbnormal(def.id, val, patientSex);
        return {
          testId: def.id,
          testName: def.name,
          result: val,
          unit: def.unit,
          normalRange: def.normalRangeText,
          isAbnormal: isAbn
        };
      });
    };

    const newReport: LabReport = {
      id: 'rep_' + Date.now(),
      labNumber: labNumber.trim() || `LAB-000${Math.floor(100 + Math.random() * 900)}`,
      patientName: patientName.trim(),
      patientAge: Number(patientAge) || 28,
      patientSex,
      doctorName,
      reportDate,
      status: 'completed',
      hematologyLeft: selectedSections.hematology ? buildItems(hemLeftValues, 'hematology_left') : [],
      hematologyRight: selectedSections.hematology ? buildItems(hemRightValues, 'hematology_right') : [],
      biochemical: selectedSections.biochemical ? buildItems(bioValues, 'biochemical') : [],
      serological: selectedSections.serological ? seroValues : {},
      notes
    };

    addReport(newReport);
    viewReportForPrint(newReport);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none dir-rtl" dir="rtl">
      <Header title="إضافة فاتورة / تقرير جديد" showBack onBack={() => setActiveScreen('dashboard')} />

      {/* STEP INDICATORS */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 shrink-0 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0b3b8c] font-extrabold' : 'text-slate-400 font-medium'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-[#0b3b8c] text-white ring-4 ring-blue-100' : step > 1 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-xs md:text-sm">بيانات المريض</span>
          </div>

          <div className={`flex-1 h-1 mx-3 rounded-full ${step >= 2 ? 'bg-[#0b3b8c]' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0b3b8c] font-extrabold' : 'text-slate-400 font-medium'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-[#0b3b8c] text-white ring-4 ring-blue-100' : step > 2 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="text-xs md:text-sm">نتائج الفحوصات</span>
          </div>

          <div className={`flex-1 h-1 mx-3 rounded-full ${step >= 3 ? 'bg-[#0b3b8c]' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#0b3b8c] font-extrabold' : 'text-slate-400 font-medium'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-[#0b3b8c] text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600'}`}>
              3
            </div>
            <span className="text-xs md:text-sm">مراجعة وحفظ</span>
          </div>
        </div>
      </div>

      {/* FORM CANVAS */}
      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full overflow-y-auto pb-28 md:pb-8">
        
        {/* ===================== STEP 1: PATIENT DATA ===================== */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 animate-fade-in space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">بيانات الفاتورة والمريض</h2>
                <p className="text-xs text-slate-400">الخطوة الأولى: تحديد هوية المريض والطبيب المعالج</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-800 bg-blue-50 p-1.5 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">اسم المريض الكامل <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="أدخل اسم المريض الثلاثي (مثال: أحمد محمد علي)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">العمر (بالسنوات)</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none transition-all"
                  min={1} max={110}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الجنس (Sex)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPatientSex('M')}
                    className={`py-3 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${patientSex === 'M' ? 'bg-[#0b3b8c] text-white border-[#0b3b8c] shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    ♂ ذكر (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientSex('F')}
                    className={`py-3 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${patientSex === 'F' ? 'bg-[#0b3b8c] text-white border-[#0b3b8c] shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    ♀ أنثى (Female)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الطبيب المحول (Doctor)</label>
                <div className="relative">
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 appearance-none focus:bg-white focus:border-blue-600 outline-none"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} {d.specialty ? `(${d.specialty})` : ''}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الرقم المخبري (Lab. No.)</label>
                <input
                  type="text"
                  value={labNumber}
                  onChange={(e) => setLabNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">تاريخ الفحص</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-[#0b3b8c] hover:bg-[#002e5b] active:scale-95 text-white font-bold rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
              >
                التالي: اختيار الأقسام <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== STEP 2: SELECT SECTIONS ===================== */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 animate-fade-in space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">اختيار أقسام الفحوصات المطلوبة</h2>
              <p className="text-xs text-slate-400">الخطوة الثانية: قم بتحديد نوع التحاليل المدرجة في هذه الفاتورة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hematology Card */}
              <div
                onClick={() => setSelectedSections(p => ({ ...p, hematology: !p.hematology }))}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedSections.hematology ? 'border-[#0b3b8c] bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">🩸</span>
                    {selectedSections.hematology && <CheckCircle2 className="w-6 h-6 text-[#0b3b8c]" />}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Hematology (CBC)</h3>
                  <p className="text-xs text-slate-500 mt-1">أمراض الدم وصورة الدم الكاملة (Hb, RBC, WBC, Platelets, ESR)</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-700">
                  {selectedSections.hematology ? '✓ متضمن في التقرير' : '+ اضغط للإضافة'}
                </div>
              </div>

              {/* Biochemical Card */}
              <div
                onClick={() => setSelectedSections(p => ({ ...p, biochemical: !p.biochemical }))}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedSections.biochemical ? 'border-[#0b3b8c] bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">🧪</span>
                    {selectedSections.biochemical && <CheckCircle2 className="w-6 h-6 text-[#0b3b8c]" />}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Biochemical</h3>
                  <p className="text-xs text-slate-500 mt-1">الكيمياء الحيوية والسكر ووظائف الكلى والكبد والأملاح والدھون</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-700">
                  {selectedSections.biochemical ? '✓ متضمن في التقرير' : '+ اضغط للإضافة'}
                </div>
              </div>

              {/* Serological Card */}
              <div
                onClick={() => setSelectedSections(p => ({ ...p, serological: !p.serological }))}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedSections.serological ? 'border-[#0b3b8c] bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">🔬</span>
                    {selectedSections.serological && <CheckCircle2 className="w-6 h-6 text-[#0b3b8c]" />}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Serological</h3>
                  <p className="text-xs text-slate-500 mt-1">الأمصال والفيروسات والتيفوئيد والبروسيلا وفحص الحمل</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-700">
                  {selectedSections.serological ? '✓ متضمن في التقرير' : '+ اضغط للإضافة'}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" /> السابق
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-[#0b3b8c] hover:bg-[#002e5b] text-white font-bold rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
              >
                التالي: إدخال النتائج <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================== STEP 3: RESULTS INPUT ===================== */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 animate-fade-in space-y-8">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">إدخال نتائج الفحوصات المخبرية</h2>
                <p className="text-xs text-slate-400">الخطوة الثالثة: أدخل القيم الرقمية أو النصية (سيتم تمييز القيم غير الطبيعية تلقائياً باللون الأحمر)</p>
              </div>

              <button
                type="button"
                onClick={handleQuickNormalPreset}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-600" /> تعبئة بقيم نموذجية سريعة
              </button>
            </div>

            {/* HEMATOLOGY SECTION */}
            {selectedSections.hematology && (
              <div className="space-y-4">
                <div className="bg-[#0b3b8c] text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-between">
                  <span>HEMATOLOGY SECTION</span>
                  <span className="text-xs font-normal opacity-80">صورة الدم الكاملة</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                        <tr>
                          <th className="p-2.5">Test</th>
                          <th className="p-2.5 w-28 text-center">Result</th>
                          <th className="p-2.5">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {TEST_DEFINITIONS.filter(t => t.category === 'hematology_left').map(def => {
                          const val = hemLeftValues[def.id] || '';
                          const isAbn = evaluateAbnormal(def.id, val, patientSex);
                          return (
                            <tr key={def.id} className={isAbn ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                              <td className="p-2.5 font-bold text-slate-800">{def.name}</td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => setHemLeftValues(p => ({ ...p, [def.id]: e.target.value }))}
                                  className={`w-full px-2 py-1.5 rounded-lg text-center font-bold text-sm outline-none border transition-all ${isAbn ? 'bg-red-100 border-red-400 text-red-700 font-black ring-2 ring-red-200' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'}`}
                                  placeholder="-"
                                />
                              </td>
                              <td className="p-2.5 text-slate-400 font-mono text-[11px]">{def.unit}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Column Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                        <tr>
                          <th className="p-2.5">Test</th>
                          <th className="p-2.5 w-28 text-center">Result</th>
                          <th className="p-2.5">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {TEST_DEFINITIONS.filter(t => t.category === 'hematology_right').map(def => {
                          const val = hemRightValues[def.id] || '';
                          const isAbn = evaluateAbnormal(def.id, val, patientSex);
                          return (
                            <tr key={def.id} className={isAbn ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                              <td className="p-2.5 font-bold text-slate-800">{def.name}</td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => setHemRightValues(p => ({ ...p, [def.id]: e.target.value }))}
                                  className={`w-full px-2 py-1.5 rounded-lg text-center font-bold text-sm outline-none border transition-all ${isAbn ? 'bg-red-100 border-red-400 text-red-700 font-black ring-2 ring-red-200' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'}`}
                                  placeholder="-"
                                />
                              </td>
                              <td className="p-2.5 text-slate-400 font-mono text-[11px]">{def.unit}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* BIOCHEMICAL SECTION */}
            {selectedSections.biochemical && (
              <div className="space-y-4">
                <div className="bg-[#0b3b8c] text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-between">
                  <span>BIOCHEMICAL SECTION</span>
                  <span className="text-xs font-normal opacity-80">الكيمياء الحيوية والسكر</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                      <tr>
                        <th className="p-2.5 w-1/3">Test Name</th>
                        <th className="p-2.5 w-36 text-center">Result</th>
                        <th className="p-2.5">Normal Reference Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TEST_DEFINITIONS.filter(t => t.category === 'biochemical').map(def => {
                        const val = bioValues[def.id] || '';
                        const isAbn = evaluateAbnormal(def.id, val, patientSex);
                        return (
                          <tr key={def.id} className={isAbn ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                            <td className="p-2.5 font-bold text-slate-800">{def.name}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setBioValues(p => ({ ...p, [def.id]: e.target.value }))}
                                className={`w-full px-2 py-1.5 rounded-lg text-center font-bold text-sm outline-none border transition-all ${isAbn ? 'bg-red-100 border-red-400 text-red-700 font-black ring-2 ring-red-200' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'}`}
                                placeholder="-"
                              />
                            </td>
                            <td className="p-2.5 text-slate-400 text-[11px] whitespace-pre-line">{def.normalRangeText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEROLOGICAL SECTION */}
            {selectedSections.serological && (
              <div className="space-y-4">
                <div className="bg-[#0b3b8c] text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-between">
                  <span>SEROLOGICAL SECTION</span>
                  <span className="text-xs font-normal opacity-80">الفيروسات والمناعة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEST_DEFINITIONS.filter(t => t.category === 'serological').map(def => {
                    const val = seroValues[def.id] || 'Negative';
                    const isAbn = evaluateAbnormal(def.id, val, patientSex);
                    return (
                      <div key={def.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${isAbn ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-bold text-slate-800 text-xs w-28 shrink-0">{def.name}</span>
                        <select
                          value={val}
                          onChange={(e) => setSeroValues(p => ({ ...p, [def.id]: e.target.value }))}
                          className={`flex-1 px-3 py-1.5 rounded-lg font-bold text-xs outline-none border ${isAbn ? 'bg-red-100 text-red-700 border-red-400' : 'bg-white text-slate-800 border-slate-300'}`}
                        >
                          <option value="Negative">Negative (سلبي)</option>
                          <option value="Positive">Positive (إيجابي)</option>
                          <option value="Non-Reactive">Non-Reactive</option>
                          <option value="Reactive">Reactive</option>
                          <option value="Normal">Normal</option>
                          <option value="1/80">1/80</option>
                          <option value="1/160">1/160</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">ملاحظات التقرير المخبري (تظهر في التقرير عند الحاجة)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" /> السابق
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center gap-2 text-base"
              >
                <Save className="w-5 h-5" /> حفظ واعتماد التقرير النهائي
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
