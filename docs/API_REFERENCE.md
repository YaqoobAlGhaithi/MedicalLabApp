# 🔌 مرجع واجهات برمجة التطبيقات (API Reference)

> **الوثائق المرتبطة:** [الهيكل البرمجي](./PROJECT_STRUCTURE.md) | [التقنيات المستخدمة](./TECHNICAL_STACK.md) | [نموذج البيانات](./DATABASE_SCHEMA.md)

---

## 📌 1. نظرة عامة على معمارية واجهات التطبيق الحالية

يعمل التطبيق كـ **Single Page Application (SPA)** بنظام محلي أولاً (**Local-First**)؛ وتتم العمليات حالياً عبر:
1. **واجهات سياق التطبيق الداخلي (Client Context APIs):** توفر وصولاً لكافة العمليات الأساسية (CRUD) للتقارير والمرضى.
2. **محرك تصدير واستيراد البيانات (Data Backup/Restore Engine):** معالجة ملفات النسخ الاحتياطي بصيغة JSON.
3. **محرك الطباعة وتصدير PDF (Printing & PDF Engine):** تصيير وطباعة النماذج الطبية الرسمية.
4. **جسر كاباسيتور لأندرويد (Capacitor Native Bridge):** تشغيل التطبيق والتحكم بنظام الملفات وشريط الحالة على أندرويد.
5. **نقاط النهاية لخادم خارجي (Remote REST / GraphQL APIs):** **[بحاجة للتحديث]** — سيتم تفعيلها عند ربط قاعدة بيانات سحابية مركزية للمختبر.

---

## 💻 2. واجهات سياق التطبيق المركزي (`AppContext` API)

يتم استهلاك واجهات الحالة عبر الخطاف (Hook):
```typescript
import { useApp } from '../context/AppContext';

const { reports, addReport, deleteReport, ... } = useApp();
```

### أ. إدارة التقارير الطبية (Reports API)

#### 1. `addReport(reportData: Omit<LabReport, 'id' | 'labNumber'>)`
- **الوصف:** إضافة تقرير مخبري جديد. يقوم تلقائياً بإنشاء معرّف فريد وتوليد رقم مخبري تسلسلي (`LAB-XXXXXX`).
- **المعاملات (Parameters):**
  - `reportData`: كائن يحتوي على تفاصيل المريض، اسم الطبيب، تاريخ الفحص، ومصفوفات النتائج.
- **مثال للاستخدام:**
  ```typescript
  addReport({
    patientName: "علي محمد سالم",
    patientAge: 32,
    patientSex: "M",
    doctorName: "د. محمد السعيد",
    reportDate: "2026-09-02",
    status: "completed",
    hematologyLeft: [
      { testId: "hb", testName: "Hb", result: "14.5", unit: "g/dL", normalRange: "13.0 - 18.0", isAbnormal: false }
    ],
    hematologyRight: [],
    biochemical: [],
    serological: { "widal_o": "Negative" }
  });
  ```

#### 2. `updateReport(id: string, updatedFields: Partial<LabReport>)`
- **الوصف:** تعديل نتائج أو حالة تقرير مخبري مسجل مسبقاً.
- **المعاملات:**
  - `id`: المعرف الفريد للتقرير (`string`).
  - `updatedFields`: الحقول المراد تحديثها فقط.

#### 3. `deleteReport(id: string)`
- **الوصف:** حذف تقرير محدد نهائياً من قاعدة البيانات والتخزين المحلي.

#### 4. `viewReportForPrint(report: LabReport)`
- **الوصف:** فتح نافذة المعاينة والطباعة الرسمية السريعة للتقرير المحدد.

---

### ب. إدارة المرضى (Patients API)

#### 1. `addPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient`
- **الوصف:** تسجيل مراجع جديد في قاعدة بيانات العيادة مع توليد معرّف فريد وتاريخ التسجيل الحالي.
- **المعاملات:** `name`, `age`, `sex`, `phone`.
- **المخرجات:** كائن المريض بعد الحفظ (`Patient`).

#### 2. `updatePatient(id: string, updatedFields: Partial<Patient>)`
- **الوصف:** تعديل بيانات المريض (مثل تحديث رقم الهاتف أو تصحيح العمر).

#### 3. `deletePatient(id: string)`
- **الوصف:** حذف مريض من قاعدة البيانات مع الاحتفاظ بالتقارير التاريخية المرتبطة به.

---

### ج. إعدادات النظام والنسخ الاحتياطي (System & Backup API)

#### 1. `exportBackupJson(): void`
- **الوصف:** توليد ملف JSON كامل يحتوي على كافة السجلات:
  ```json
  {
    "version": "2.4.0",
    "timestamp": "2026-09-02T12:00:00.000Z",
    "reports": [...],
    "patients": [...],
    "settings": {...}
  }
  ```
  وتنزيله تلقائياً في جهاز المستخدم باسم `almanar_lab_backup_YYYY-MM-DD.json`.

#### 2. `importBackupJson(jsonData: string): { success: boolean; message: string }`
- **الوصف:** التحقق من صحة ملف النسخ الاحتياطي واستعادة السجلات واستبدال الذاكرة المحلية بأمان.

#### 3. `updateSettings(newSettings: Partial<LabSettings>)`
- **الوصف:** حفظ التغييرات في هوية المختبر، أرقام الهواتف، والعنوان في الترويسة المطبوعة.

---

### د. واجهات التحكم بالعرض والشاشات (Navigation & UI API)

| الدالة / المتغير | النوع | الوصف |
|---|---|---|
| `activeScreen` | `ActiveScreen` | الشاشة النشطة حالياً (`dashboard`, `add_invoice`, `reports_list`, `patient_profile`, `backup_settings`, إلخ). |
| `setActiveScreen(screen)` | `(screen: ActiveScreen) => void` | التنقل إلى شاشة محددة مع إغلاق القوائم المنزلقة تلقائياً. |
| `isSidebarCollapsed` | `boolean` | حالة طي الشريط الجانبي المكتبي (مصغر 80px أم كامل 256px). |
| `toggleSidebarCollapse()` | `() => void` | التبديل بين طي وتوسيع الشريط الجانبي مع الحفظ في `localStorage`. |
| `isMobileSidebarOpen` | `boolean` | حالة فتح القائمة الجانبية المنزلقة لشاشات الأندرويد. |
| `toggleMobileSidebar()` | `() => void` | فتح أو إغلاق القائمة الجانبية للموبايل. |

---

## 🌐 3. نقاط النهاية المستقبلية للخادم السحابي (Future REST Endpoints)

> **ملاحظة:** تم تصميم النماذج البرمجية لتكون متوافقة وجاهزة للربط الفوري مع واجهات خلفية (Backend Services).
> **الحالة الحالية:** **[بحاجة للتحديث عند ربط خادم إنتاج سحابي]**

| المسار المقترح (Route) | الطريقة (Method) | الوصف |
|---|---|---|
| `/api/v1/auth/login` | `POST` | تسجيل دخول الكادر الطبي وإصدار رموز JWT. |
| `/api/v1/reports` | `GET` | استرجاع قائمة التقارير الطبية مع التصفية والترقيم (Pagination). |
| `/api/v1/reports` | `POST` | إنشاء تقرير وفاتورة جديدة وحفظها في قاعدة البيانات السحابية. |
| `/api/v1/reports/:id/pdf` | `GET` | توليد وتنزيل تقرير الـ PDF المعتمد من الخادم مباشرة. |
| `/api/v1/patients` | `GET` / `POST` | استعلام أو إنشاء سجل مريض جديد. |
| `/api/v1/sync` | `POST` | مزامنة التغييرات المسجلة محلياً في وضع عدم الاتصال (Offline Sync). |
