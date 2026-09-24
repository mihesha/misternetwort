<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
</p>

# 🚀 CardBox Backend API

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)

**CardBox API** هو الخادم الخلفي (Backend) الاحترافي لإدارة منصة متكاملة لبيع وتوزيع كروت الشبكات، يدعم العملاء النهائيين، نقاط البيع (POS)، وأصحاب الشبكات، بالإضافة إلى لوحة تحكم إدارية شاملة.

تمت إعادة هيكلة هذا النظام بالكامل وفق **أعلى المعايير العالمية (Clean Architecture & SOLID)** لضمان السرعة الفائقة، الأمان العالي، وقابلية التوسع المستقبلية.

---

## 🏗️ المعمارية (Architecture)

النظام مبني على معمارية **(Service-Oriented Architecture - SOA)**، حيث تم فصل المنطق التجاري المعقد (Business Logic) عن المتحكمات (Controllers) ووضعه في طبقة خدمات (Services) مخصصة.

### 🌟 أبرز مميزات المعمارية:
1. **Zero N+1 Queries:** استخدام تقنية `Eager Loading` لجميع الاستعلامات لتسريع استجابة قاعدة البيانات.
2. **Database Transactions:** جميع العمليات المالية محمية بـ `DB::beginTransaction` لضمان سلامة الأموال والبيانات (مبدأ الكل أو اللاشيء).
3. **Route Caching Ready:** تم تطهير ملف `routes/api.php` من أي دوال مجهولة (Closures)، مما يجعله جاهزاً للتكييش السريع.
4. **Decoupled Controllers:** تم تقسيم المتحكمات الضخمة إلى متحكمات صغيرة تعتمد على مبدأ المسؤولية الواحدة (Single Responsibility Principle).

---

## 📂 الهيكلية وخريطة الملفات (Directory Structure)

```text
app/
├── Http/
│   ├── Controllers/          # طبقة الاستقبال والتوجيه (Controllers)
│   │   ├── Admin/            # متحكمات لوحة الإدارة المفككة (AdminCardManagement, AdminNetwork...)
│   │   ├── Auth/             # متحكمات المصادقة للعملاء وأصحاب الشبكات
│   │   ├── Pos/              # متحكمات خاصة بنقاط البيع
│   │   └── CardController.php# إدارة بيع الكروت
│   └── Middleware/           # طبقة الحماية والتأكد من الصلاحيات (Admin, POS, Customer)
│
├── Services/                 # طبقة العمليات المعقدة (Business Logic) - قلب النظام
│   ├── CustomerPurchaseService.php # معالجة شراء الكروت للعملاء (رصيد، عمولة، خصم من المخزون)
│   ├── PosPurchaseService.php      # معالجة شراء الكروت لنقاط البيع بالآجل أو الكاش
│   ├── PosReportingService.php     # إصدار التقارير المالية والإحصائيات المعقدة
│   └── WalletRechargeService.php   # المعالجة الآلية واليدوية لشحن المحافظ الديناميكية (جوالي، ون كاش...)
│
├── Models/                   # طبقة قاعدة البيانات والعلاقات (Eloquent ORM)
│   ├── User.php
│   ├── Network.php
│   ├── Card.php
│   ├── Transaction.php
│   └── ...
```

---

## ⚙️ طبقة الخدمات (Services Layer)

للحفاظ على نظافة المتحكمات، يمتلك النظام الخدمات التالية:

*   **`CustomerPurchaseService`**: خدمة محمية تقوم بفحص الأرصدة، خصم الكروت المباعة من المخزون، تسجيل العمولات (ديناميكياً)، وإضافة قيود العمليات (Transactions).
*   **`WalletRechargeService`**: خدمة تتعرف تلقائياً على نصوص الإيداعات لتحديد نوع المحفظة (جيب، جوالي، سبأ كاش، ون كاش...) وشحن رصيد العميل بشكل آلي 100%.

---

## 🔒 الأمان والمصادقة (Security & Authentication)

*   **Laravel Sanctum:** مستخدم لإصدار وحماية الـ (Tokens) لجميع أنواع المستخدمين (عميل، نقطة بيع، آدمن، صاحب شبكة).
*   **OTP Verification:** مصادقة ثنائية تعتمد على أرقام الجوال للعملاء ونقاط البيع.
*   **Role-Based Access Control (RBAC):** توجيه وحماية المسارات بناءً على دور المستخدم (`role`).

---

## 🚀 التثبيت والتشغيل (Installation)

1. **استنساخ المستودع وتثبيت الاعتماديات:**
   ```bash
   git clone <repo-url>
   cd backend
   composer install
   ```

2. **إعداد بيئة العمل:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *قم بتعديل بيانات قاعدة البيانات في ملف `.env`.*

3. **تشغيل قواعد البيانات:**
   ```bash
   php artisan migrate --seed
   ```

4. **تحسين الأداء للمرحلة الإنتاجية (Production):**
   ```bash
   php artisan route:cache
   php artisan config:cache
   php artisan view:cache
   ```

5. **تشغيل الخادم المحلي:**
   ```bash
   php artisan serve
   ```

---

## 🛡️ معايير الكود (Code Standards)
تم كتابة هذا الكود وتنسيقه ليكون:
*   **SOLID Compliant**: الكود يحترم مبادئ التصميم النظيف.
*   **DRY (Don't Repeat Yourself)**: لا يوجد تكرار للأكواد؛ تم استخدام الخدمات (Services) لتوحيد العمليات.
*   **Secure**: محمي ضد هجمات SQL Injection و CSRF و XSS بفضل حماية Laravel المدمجة وطريقة استخدام الـ ORM.

---

## 👨‍💻 نظام الوكلاء ومهندسي الشبكات (Agents & Engineers System)

تم تصميم وبناء نظام متكامل لإدارة "مهندسي الشبكات والوكلاء" المستقلين الذين يقومون بربط شبكات جديدة بالمنصة ومتابعة أدائها للحصول على عمولات مستمرة.

### 1. دورة حياة الوكيل (Agent Lifecycle):
*   **تقديم الطلب (Application):** يقوم المهندس بتقديم طلب الانضمام عبر واجهة (Frontend)، يتم تخزينه كـ `NetworkApplication` في قاعدة البيانات بانتظار مراجعة الإدارة. ويتضمن الطلب بيانات دقيقة مثل (المحافظة، المدينة، ورقم محفظة "جيب" لاستلام العمولات).
*   **مراجعة الإدارة (Approval):** عند اعتماد الطلب من قبل الإدارة، يتم تحويل الطلب لإنشاء مستخدم جديد (`User`) بصلاحية `role = 'agent'` ويتم إنشاء وتخصيص عمولة افتراضية له (مثلاً 5%).
*   **تسجيل الدخول وإدارة الشبكات:** يحصل الوكيل على لوحة تحكم خاصة به لمتابعة الشبكات المرتبطة به، وحجم المبيعات لكل شبكة.

### 2. النظام المالي للوكلاء (Financial & Commission Logic):
*   **الأرصدة (Wallet Balance):** يمتلك كل وكيل محفظة إلكترونية مسجلة في حقل `wallet_balance` ضمن جدول الـ `users`.
*   **العمولات (Commissions):** يتم احتساب وإضافة عمولة الوكيل بشكل تلقائي كقيود في جدول `AgentTransaction` بنوع `commission` عند تحقيق الشبكات المرتبطة به لمبيعات، مما يؤدي لزيادة رصيد محفظته.
*   **طلبات السحب (Withdrawals):** 
    *   يمكن للوكيل طلب سحب أرباحه عبر واجهة مخصصة.
    *   عند الطلب، يقوم متحكم `AdminWithdrawalController` بخصم المبلغ فوراً من محفظة الوكيل لحماية الرصيد، وينشئ سجلاً في جدول `Withdrawals` بحالة `pending`.
    *   تقوم الإدارة بمراجعة طلب السحب من لوحة الإدارة. إذا اعتُمد كـ `completed`، يتم تحويل المبلغ فعلياً؛ وإذا تم رفضه `rejected`، يتم إرجاع المبلغ تلقائياً لمحفظة الوكيل.

### 3. مسارات الـ (API) الخاصة بالوكلاء:
*   `GET /api/agent/stats`: جلب إحصائيات عامة (إجمالي الشبكات، الرصيد المتاح، والأرباح الكلية).
*   `GET /api/agent/networks`: قائمة بالشبكات المرتبطة بالوكيل مع تفاصيل مبيعات كل منها وحالتها.
*   `GET /api/agent/transactions`: كشف حساب مفصل بعمليات إضافة العمولات وخصم السحوبات.
*   `GET /api/agent/withdrawals` & `POST /api/agent/withdrawals`: عرض وتقديم طلبات سحب الأرباح.

---
*تم تصميم وتطوير هذه المعمارية لتكون قادرة على معالجة آلاف العمليات المتزامنة في الثانية الواحدة بأعلى كفاءة ممكنة.*

---

## 🔄 التحديثات والإصلاحات الأخيرة (Recent Updates & Fixes)

تم تطبيق مجموعة من التحسينات الأمنية والمنطقية الهامة على تدفق العمليات المالية (الوكلاء والسحوبات):

1. **إصلاح جلب طلبات السحب للوكلاء (`AgentController@getWithdrawals`)**:
   - تمت إضافة الدالة المفقودة `getWithdrawals` في `AgentController` والتي تقوم بطلب السحوبات الخاصة بالوكيل وإرجاعها بشكل منسق للواجهة الأمامية (Frontend) ليتم عرضها في جدول السحوبات بنجاح بدون أخطاء `500 Internal Server Error`.

2. **خصم الرصيد الفوري عند طلب السحب (`AdminWithdrawalController@storeWithdrawal`)**:
   - تم تعديل المنطق ليقوم النظام بخصم المبلغ المطلوب سحبه بشكل **فوري ومباشر** من رصيد الوكيل المتاح (`wallet_balance`) بمجرد إنشاء طلب السحب (عندما تكون الحالة `pending`).
   - هذا التحديث يمنع ثغرة الـ Double-Spending حيث كان بإمكان الوكيل تقديم طلبات سحب متعددة تتجاوز رصيده الفعلي قبل أن يقوم المدير باعتماد الطلب الأول.

3. **معالجة رفض طلبات السحب (`AdminWithdrawalController@updateWithdrawalStatus`)**:
   - تم تعديل دالة تحديث حالة طلب السحب لتشمل خيار الرفض (`rejected`).
   - في حال قام المدير برفض طلب السحب، يقوم النظام **باسترجاع المبلغ المخصوم** تلقائياً وإضافته مرة أخرى إلى رصيد الوكيل (`wallet_balance += amount`).
   - تم إزالة كود الخصم المكرر في حالة "الاكتمال" (`completed`) نظراً لأن المبلغ تم خصمه مسبقاً عند تقديم الطلب.
