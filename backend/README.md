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
*تم تصميم وتطوير هذه المعمارية لتكون قادرة على معالجة آلاف العمليات المتزامنة في الثانية الواحدة بأعلى كفاءة ممكنة.*
