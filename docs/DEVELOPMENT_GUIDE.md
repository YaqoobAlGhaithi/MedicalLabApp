# 💻 دليل المطورين وإعداد بيئة العمل (Development Guide)

> **الوثائق المرتبطة:** [نظرة عامة](./PROJECT_OVERVIEW.md) | [الهيكل البرمجي](./PROJECT_STRUCTURE.md) | [التقنيات المستخدمة](./TECHNICAL_STACK.md) | [دليل البناء والنشر](./BUILD_AND_DEPLOY.md)

---

## 📋 1. المتطلبات المسبقة (Prerequisites)

قبل البدء في تشغيل وتطوير المشروع محلياً، تأكد من تنصيب الأدوات التالية على حاسوبك:

1. **[Node.js](https://nodejs.org/):** الإصدار `20.x` أو `18.x` (LTS مُوصى به بشدة).
2. **مدير الحزم:** `npm` (يأتي مدمجاً مع Node.js) أو `pnpm` أو `yarn`.
3. **[Git](https://git-scm.com/):** لإدارة الإصدارات والتحكم بالكود.
4. **محرر الأكواد:** يُفضل [VS Code](https://code.visualstudio.com/) مع الإضافات التالية:
   - *Tailwind CSS IntelliSense*
   - *ESLint*
   - *TypeScript Vue Plugin / TS Language Server*
5. **(اختياري لتطوير الأندرويد):** [Android Studio](https://developer.android.com/studio) مع JDK 17.

---

## ⚡ 2. خطوات تشغيل المشروع محلياً (Quick Start)

### الخطوة 1: استنساخ المستودع (Clone Repository)
```bash
git clone <repository-url>
cd almanar-medical-lims
```

### الخطوة 2: تثبيت حزم التبعيات (Install Dependencies)
```bash
npm install
```

### الخطوة 3: تشغيل خادم التطوير السريع (Start Dev Server)
```bash
npm run dev
```
- سيعمل خادم Vite فوراً على المنفذ الافتراضي `3000` أو `5173`.
- افتح الرابط المعروض في المتصفح (مثال: `http://localhost:3000`).

---

## 🔍 3. الأوامر البرمجية المتاحة (Available Scripts)

| الأمر | الوظيفة والشرح |
|---|---|
| `npm run dev` | تشغيل بيئة التطوير المحلية وتحديث الواجهات فورياً عند حفظ الملفات. |
| `npm run build` | بناء وتحسين كامل الكود للإنتاج وتوليد ملفات `/dist`. |
| `npm run lint` | فحص الكود البرمجي عبر `tsc --noEmit` للتحقق من خلو الأنواع من الأخطاء. |
| `npm run preview` | معاينة مخرجات مجلد الإنتاج `dist` محلياً قبل النشر. |
| `npm run clean` | تنظيف وحذف مجلدات البناء السابقة وملفات التجميع المؤقتة. |
| `npx cap sync` | مزامنة كود الويب بعد بنائه مع مجلد الأندرويد `android/`. |

---

## 📐 4. إرشادات معمارية للمطورين الجدد (Developer Best Practices)

### أ. التوجيه وإضافة شاشات جديدة (Adding a New Screen):
1. قم بإنشاء ملف المكون في المسار:
   `src/components/screens/NewFeatureScreen.tsx`
2. أضف المعرف الخاص بالشاشة في نوع `ActiveScreen` داخل `src/types/index.ts`:
   ```typescript
   export type ActiveScreen =
     | 'splash'
     | 'login'
     | 'dashboard'
     | 'new_feature' // المعرف الجديد
     ... ;
   ```
3. أضف شرط التوجيه داخل المكون `ScreenRouter` في `src/App.tsx`.
4. أضف خيار القائمة في `Sidebar.tsx` و `MobileSidebarDrawer.tsx` و `MobileBottomNav.tsx` حسب ملاءمته للشاشات.

### ب. إضافة فحوصات طبية جديدة إلى النظام (Adding New Lab Tests):
- لا تقم بتضمين الفحوصات الطبية كأكواد ثابتة في واجهات العرض.
- توجه إلى `src/data/referenceRanges.ts` وأضف كائن الفحص في التصنيف المناسب:
  ```typescript
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    category: 'serological',
    unit: 'mg/L',
    normalRangeText: '< 6.0 mg/L',
    max: 6.0
  }
  ```
  سيقوم النظام تلقائياً بالتعرف على الفحص وحساب حالات التنبيه الحرجة فوراً.

### ج. الالتزام باللغة العربية وتوجيه RTL:
- واجهة التطبيق تعتمد على التوجيه العربي الأصيل `dir="rtl"`.
- استخدم فئات Tailwind المناسبة لليمين واليسار (مثلاً: `space-x-reverse`, `right-0`, `text-right`, `border-r-4`).
- تأكد من ملاءمة أرقام الهواتف والرموز الإنجليزية عبر فئة `dir="ltr"` أو `font-mono` لمنع تشوه الترتيب.

### د. ملاءمة شاشات الهواتف وحماية الهوامش (Android Mobile Friendly):
- احرص على ترك حاشية سفلية آمنة `pb-28 md:pb-8` في أي صفحة جديدة لمنع تغطية المحتوى بواسطة شريط التنقل السفلي (`MobileBottomNav`).
- تأكد أن جميع أزرار اللمس الرئيسية تزيد مساحتها عن `44px` إلى `48px` لتسهيل استخدام التطبيق على شاشات الهواتف الذكية.

### هـ. قواعد جودة TypeScript:
- يُمنع تماماً استخدام `any`؛ استخدم الواجهات المعرفة في `src/types/index.ts`.
- قبل كل عملية دمج أو Commit، تأكد من تشغيل:
  ```bash
  npm run lint
  npm run build
  ```
  لضمان نجاح عملية البناء التلقائي في GitHub Actions دون أي إخفاق.
