# 🔬 نظام عيادة ومختبرات المنار الطبية (Al-Manar Medical Lab LIMS & Clinic Pro)

<div align="center">

```text
 _________________________________________________________________________
|                                                                         |
|   🏥 AL-MANAR MEDICAL LAB & CLINICAL INFORMATION MANAGEMENT SYSTEM     |
|              نظام إدارة العيادة ومختبرات المنار الطبية                   |
|_________________________________________________________________________|
```

[![Build Android APK](https://github.com/YaqoobAlGhaithi/MedicalLabApp/actions/workflows/android-build.yml/badge.svg)](https://github.com/YaqoobAlGhaithi/MedicalLabApp/actions/workflows/android-build.yml)
[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20APK-emerald.svg)](capacitor.config.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](tsconfig.json)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)](src/index.css)
[![License](https://img.shields.io/badge/license-Proprietary-slate.svg)](#-الترخيص-والملكية)

</div>

---

## 📖 نبذة عن النظام

نظام إلكتروني متكامل واحترافي لإدارة العيادات والمختبرات الطبية، مبني باستخدام أحدث تقنيات الويب الهجينة (**React 19, TypeScript, Tailwind CSS, Vite, Capacitor**).

يهدف النظام إلى أتمتة ورقمنة سير العمل الطبي بالكامل:
- تسجيل بيانات المرضى والمراجعين بدقة.
- إصدار وإدارة الفواتير والتحاليل المخبرية.
- إدخال ومراجعة النتائج الطبية مع التنبيه الآلي للقيم الحرجة (**Abnormal Flagging**).
- توليد وطباعة تقارير مخبرية رسمية ومعتمدة تدعم التصدير الفوري إلى **PDF**.
- العمل في بيئات دون اتصال دائم بالإنترنت (**Offline-First**) مع دعم كامل لأجهزة الهواتف الذكية بنظام **أندرويد (APK)** عبر شريط تنقل سفلي وقائمة جانبية منزلقة.

---

## 📚 التوثيق الشامل للمشروع (Full Documentation)

للحصول على التوثيق الفني الكامل الموجه لفريق التطوير والهندسة البرمجية، يرجى مراجعة ملفات مجلد **[`/docs`](./docs)**:

| الوثيقة | الرابط المباشر | الوصف والمحتوى |
|---|---|---|
| **نظرة عامة عن المشروع** | [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) | الغرض من النظام، المشاكل التي يحلها، الميزات الحالية، الجمهور المستهدف وحالات الاستخدام. |
| **هيكلية المجلدات والملفات** | [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | مخطط شجري كامل وتفصيل لكل مجلد ومكون وشاشة في الكود المصدري. |
| **التقنيات والمكتبات** | [TECHNICAL_STACK.md](./docs/TECHNICAL_STACK.md) | جدول بجميع الحزم والتبعيات المسجلة بإصداراتها وأدوارها البرمجية. |
| **نموذج وقاعدة البيانات** | [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | الكيانات، الجداول، العلاقات، منطق كشف الحالات الحرجة، والتخزين المحلي. |
| **مرجع واجهات التطبيق** | [API_REFERENCE.md](./docs/API_REFERENCE.md) | دوال Context API، تصدير واستيراد النسخ الاحتياطية، ونقاط النهاية المقترحة. |
| **دليل البناء وتطبيق الأندرويد** | [BUILD_AND_DEPLOY.md](./docs/BUILD_AND_DEPLOY.md) | تفاصيل مسار GitHub Actions، وكيفية بناء واستخراج ملف APK محلياً وعبر السحابة. |
| **دليل المطورين والبدء السريع** | [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | المتطلبات الأساسية، أوامر التشغيل، إرشادات كتابة الكود وإضافة شاشات وفحوصات جديدة. |

---

## ⚡ التشغيل السريع محلياً (Quick Start)

### المتطلبات المسبقة:
- [Node.js](https://nodejs.org/) (إصدار `18` أو `20` LTS)
- مدير الحزم `npm`

### خطوات التثبيت والتشغيل:
```bash
# 1. استنساخ المستودع
git clone <repository-url>
cd MedicalLabApp

# 2. تثبيت الحزم والمكتبات
npm install

# 3. تشغيل خادم التطوير
npm run dev
```
افتح المتصفح على الرابط: `http://localhost:3000` (أو الرابط المعروض في الطرفية).

---

## 📱 بناء تطبيق الأندرويد (Android APK)

المشروع مهيأ ومربوط مسبقاً مع منصة **Capacitor** ومسار عمل **GitHub Actions**:

### 1. عبر GitHub Actions (بدون الحاجة لبرامج على جهازك):
1. قم بدفع التعديلات إلى فرع `main`.
2. اذهب إلى تبويب **Actions** في GitHub وافتح أحدث تشغيل لـ **Build Android APK**.
3. قم بتنزيل ملف **`AlManar-Lab-App-APK`** من قسم **Artifacts** وتثبيته على الهاتف مباشرة.

### 2. البناء اليدوي محلياً:
```bash
# بناء كود الويب
npm run build

# مزامنة ملفات أندرويد
npx cap sync android

# بناء ملف الـ APK عبر Gradle
cd android
./gradlew assembleDebug
```
*يتم إنتاج ملف الـ APK في المسار:*  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 الأمان وحماية البيانات

- **وضع الاستقبال الآمن (Privacy Mode):** إخفاء مؤشرات الإيرادات والأرقام المالية الحساسة بنقرة واحدة عند تواجد المراجعين بالاستقبال.
- **النسخ الاحتياطي الذاتي (JSON Backup):** تصدير واسترجاع كامل قاعدة بيانات المرضى والفحوصات في أي وقت دون وسيط خارجي.
- **التخزين المحلي المشفر:** يتم تخزين السجلات محلياً لضمان سرية بيانات المرضى وحمايتها.

---

## 📄 الترخيص والملكية (License)

جميع الحقوق البرمجية والتصميمية محفوظة لـ **عيادة ومختبرات المنار الطبية**.  
هذا النظام مخصص للاستخدام الداخلي للمركز الطبي ولا يجوز إعادة نشره أو توزيعه دون إذن رسمي مسبق.
