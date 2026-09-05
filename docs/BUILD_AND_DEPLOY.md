# 🚀 دليل البناء والنشر وتطبيقات الأندرويد (Build & Deployment Guide)

> **الوثائق المرتبطة:** [الهيكل البرمجي](./PROJECT_STRUCTURE.md) | [التقنيات المستخدمة](./TECHNICAL_STACK.md) | [دليل المطورين](./DEVELOPMENT_GUIDE.md)

---

## 📌 1. النظرة العامة على بيئات النشر الحالية

يدعم النظام بيئتين أساسيتين للتشغيل والنشر:
1. **بيئة الويب (Web SPA):** تطبيق ويب من صفحة واحدة، يتم بناؤه وتجميعه في مجلد `/dist`، ويمكن استضافته على أي خادم ويب (Cloud Run, Vercel, Netlify, Nginx, Apache).
2. **بيئة الأندرويد الأصلية (Capacitor Android APK):** تطبيق هاتف يتم تغليفه عبر محرك Capacitor ومجمع عبر Gradle إلى ملف `app-debug.apk` قابل للتثبيت المباشر على جميع هواتف وأجهزة أندرويد اللوحية.

---

## 🤖 2. البناء التلقائي عبر GitHub Actions (CI/CD Pipeline)

يحتوي المشروع على ملف أتمتة مخصص للبناء المستمر في مسار:
`/.github/workflows/android-build.yml`

### أ. مسببات التشغيل (Workflow Triggers):
- **عند الدفع (Push):** يعمل تلقائياً عند دفع كود جديد إلى الفرع الرئيسي (`main` أو `master`).
- **التشغيل اليدوي (Manual Workflow Dispatch):** يمكن تشغيل عملية البناء يدوياً في أي وقت من خلال تبويب **Actions** في واجهة GitHub بنقرة زر واحدة.

### ب. تفصيل خطوات ملف `android-build.yml`:

```yaml
name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-android:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      # 1. استنساخ الكود المصدري
      - name: Checkout Source Code
        uses: actions/checkout@v4

      # 2. إعداد بيئة Node.js (الإصدار 20) مع تفعيل التخزين المؤقت للمكتبات
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # 3. تثبيت اعتماديات المشروع
      - name: Install NPM Dependencies
        run: npm ci || npm install

      # 4. بناء كود الويب وإنتاج مجلد /dist
      - name: Build Web App
        run: npm run build

      # 5. تهيئة ومزامنة حزمة Capacitor لمنصة أندرويد
      - name: Initialize & Sync Capacitor Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          else
            npx cap sync android
          fi

      # 6. إعداد بيئة Java OpenJDK 17 (Zulu Distribution)
      - name: Setup Java JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      # 7. تجميع وبناء ملف APK باستخدام Gradle Wrapper
      - name: Build Android APK (Debug)
        working-directory: ./android
        run: |
          chmod +x ./gradlew
          ./gradlew assembleDebug

      # 8. رفع ملف الـ APK الناتج كعنصر قابل للتنزيل (Artifact)
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AlManar-Lab-App-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 7
```

### ج. كيفية تنزيل ملف الـ APK من GitHub Actions:
1. افتح مستودع المشروع على GitHub.
2. اذهب إلى تبويب **Actions** في الشريط العلوي.
3. اضغط على أحدث تشغيل مكتمل باللون الأخضر (**Build Android APK**).
4. انزل إلى أسفل الصفحة لقسم **Artifacts**.
5. اضغط على **`AlManar-Lab-App-APK`** لتحميل ملف الـ APK وتثبيته مباشرة على هواتف الأندرويد.

---

## 🛠️ 3. كيفية بناء تطبيق الأندرويد محلياً (Local Android Build)

إذا كنت ترغب ببناء التطبيق على جهاز الكمبيوتر الخاص بك:

### المتطلبات المسبقة:
- تثبيت [Node.js](https://nodejs.org/) (إصدار 18 أو 20).
- تثبيت [Java Development Kit (JDK 17)](https://adoptium.net/).
- تثبيت [Android Studio](https://developer.android.com/studio) مع Android SDK (Platform 33/34).

### خطوات البناء:

1. **بناء كود الويب المترجم:**
   ```bash
   npm run build
   ```

2. **إضافة منصة أندرويد ومزامنتها:**
   ```bash
   # إذا كان مجلد android غير موجود:
   npx cap add android

   # إذا كان موجوداً مسبقاً وتريد تحديث التغييرات:
   npx cap sync android
   ```

3. **التجميع المباشر عبر سطر الأوامر (Gradle):**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   *ستجد ملف الـ APK الناتج في المسار:*
   `android/app/build/outputs/apk/debug/app-debug.apk`

4. **أو فتح المشروع في Android Studio:**
   ```bash
   npx cap open android
   ```
   ومن القائمة العلوية: `Build` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`.

---

## 🌐 4. بناء ونشر نسخة الويب (Web Production Deployment)

### 1. أمر البناء للإنتاج:
```bash
npm run build
```
ينتج عن ذلك مجلد `/dist` يحتوي على ملفات ثابتة محسنة (HTML/CSS/JS).

### 2. النشر على المنصات السحابية:

#### أ. النشر على Vercel أو Netlify:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Single Page App Rewrite Rule:** إعادة توجيه كافة المسارات إلى `index.html`.

#### ب. النشر على سيرفرات Nginx / Apache:
قم بنسخ محتويات مجلد `dist` إلى مسار الخادم (مثل `/var/www/html` أو `public_html`).  
وفي حال سيرفر Nginx، تأكد من إعداد التوجيه لتجنب أخطاء 404:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
