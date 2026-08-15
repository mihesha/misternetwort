# 📱 دليل ربط تطبيق نقاط البيع (POS API Documentation)

هذا الملف يحتوي على جميع المسارات، البيانات المطلوبة، والاستجابات الخاصة بتطبيق نقاط البيع (POS System) المخصص لبيع الكروت والشحن.

---

## 🌐 1. معلومات أساسية (Base Info)
*   **الرابط الأساسي (Base URL):** `http://95.217.43.157:8081/api`
*   **نوع البيانات (Content-Type):** `application/json` (ما عدا رفع الصور يكون `multipart/form-data`)
*   **المصادقة (Authentication):**
    جميع المسارات (باستثناء مسارات تسجيل الدخول، إنشاء الحساب، ونسيان كلمة المرور) تتطلب إرسال التوكن في الـ Header (الترويسة) كالتالي:
    `Authorization: Bearer {token}`

---

## 🔐 2. إدارة الحساب والتوثيق (Auth & Profile)

### 2.1. إنشاء حساب نقطة بيع جديد (Register)
*   **المسار:** `POST /pos/auth/register`
*   **البيانات المطلوبة (Body):**
    *   `name` (String): اسم صاحب الحساب (مثال: محمد أحمد).
    *   `phone` (String): رقم الهاتف (مهم جداً ويكون فريداً).
    *   `password` (String): كلمة المرور (أكثر من 6 أحرف).
    *   `shop_name` (String): اسم البقالة أو نقطة البيع (مثال: بقالة البركة).
    *   `address` (String - اختياري): العنوان.
*   **الاستجابة:** 
    السيرفر لن يرجع توكن، بل سيرجع حالة معلقة ويطلب إدخال كود OTP.
    *(يتم إرجاع `test_otp_code` حالياً في الـ Response لتسهيل الاختبار).*

### 2.2. تفعيل الحساب عبر رمز التحقق (Verify OTP)
*   **المسار:** `POST /pos/auth/verify-otp`
*   **البيانات المطلوبة (Body):**
    *   `phone` (String): رقم الهاتف الذي سجل به.
    *   `otp_code` (String): الكود المكون من 6 أرقام.
*   **الاستجابة:** سيرجع لك الـ `token` الذي ستستخدمه في باقي التطبيق.

### 2.3. تسجيل الدخول (Login)
*   **المسار:** `POST /pos/auth/login`
*   **البيانات المطلوبة (Body):**
    *   `phone` (String): رقم الهاتف.
    *   `password` (String): كلمة المرور.
*   **الاستجابة:** يرجع الـ `token` وبيانات الـ `user`.

### 2.4. نسيت كلمة المرور (Forgot Password)
*   **المسار:** `POST /pos/auth/forgot-password`
*   **البيانات المطلوبة:** `phone`
*   **الاستجابة:** يولد كود تحقق مؤقت (ويعيده لك في الـ Response باسم `test_otp_code` للاختبار).

### 2.5. إعادة تعيين كلمة المرور (Reset Password)
*   **المسار:** `POST /pos/auth/reset-password`
*   **البيانات المطلوبة:** `phone`, `otp_code`, `new_password`.

### 2.6. تغيير كلمة المرور من داخل التطبيق (Change Password)
*   **المسار:** `POST /pos/auth/change-password` (يحتاج Token)
*   **البيانات المطلوبة:** `current_password`, `new_password`.

### 2.7. جلب بيانات الملف الشخصي (Get Profile)
*   **المسار:** `GET /pos/profile` (يحتاج Token)
*   **الاستجابة:** ترجع `name, phone, shop_name, address, commercial_reg`.

### 2.8. تحديث الملف الشخصي (Update Profile)
*   **المسار:** `POST /pos/profile` (يحتاج Token)
*   **البيانات (اختيارية):** `name, shop_name, address, commercial_reg`.

---

## 📡 3. إدارة الشبكات (Networks)

### 3.1. عرض جميع الشبكات المتاحة (All Networks)
*   **المسار:** `GET /pos/networks`
*   **الوظيفة:** يجلب جميع الشبكات النشطة في المنظومة.

### 3.2. عرض شبكاتي الخاصة وحالتي معها (My Networks)
*   **المسار:** `GET /pos/networks/my-networks` (يحتاج Token)
*   **الوظيفة:** يجلب الشبكات التي طلب المستخدم الانضمام إليها.
*   **الحقول الهامة في الاستجابة:**
    *   `status`: (pending, active, suspended)
    *   `credit_limit`: السقف المالي الممنوح (آجل).
    *   `current_debt`: الديون (الرصيد المستخدم من السقف).
    *   `available_balance`: الرصيد الآجل المتاح للاستخدام.

### 3.3. طلب انضمام لشبكة جديدة (Join Network)
*   **المسار:** `POST /pos/networks/join` (يحتاج Token)
*   **البيانات المطلوبة:** `network_id`.

---

## 💰 4. المحفظة والتغذية (Wallet & Recharge)

### 4.1. جلب رصيد المحفظة وسجل الحركات (Wallet Balance)
*   **المسار:** `GET /pos/wallet/balance` (يحتاج Token)
*   **الاستجابة:** ترجع `balance` (الرصيد الفعلي للمحفظة)، ومصفوفة `recent_transactions` (آخر 10 حركات شحن).

### 4.2. طلب شحن المحفظة (Wallet Recharge)
*   **المسار:** `POST /pos/wallet/recharge` (يحتاج Token)
*   **طريقة العمل:** يدعم السيرفر طريقتين للشحن بناءً على البيانات المرسلة:

    *   **الطريقة 1 (آلية وفورية بالرقم المرجعي - المفضلة):**
        أرسل البيانات كـ JSON:
        *   `amount` (المبلغ)
        *   `bank_name` (اسم المحفظة)
        *   `reference_number` (الرقم المرجعي من رسالة التحويل).
        *(السيرفر سيشحن المحفظة فوراً دون انتظار موافقة إذا تطابق الرقم المرجعي والمبلغ).*

    *   **الطريقة 2 (يدوية برفع صورة إشعار):**
        أرسل البيانات كـ FormData (Multipart):
        *   `amount` (المبلغ)
        *   `bank_name` (اسم المحفظة)
        *   `receipt_image` (ملف صورة).

---

## 🛒 5. الباقات وعمليات الشراء (Packages & Purchases)

### 5.1. جلب باقات شبكة معينة (Get Network Packages)
*   **المسار:** `GET /pos/networks/{network_id}/packages` (يحتاج Token)
*   **الاستجابة:** يجلب الباقات (الكروت) الفعالة والمتوفرة في المخزون (`stock > 0`) للشبكة المحددة.

### 5.2. عملية الشراء (Purchase Voucher)
*   **المسار:** `POST /pos/vouchers/purchase` (يحتاج Token)
*   **البيانات المطلوبة:** 
    *   `network_id` (رقم الشبكة).
    *   `package_id` (رقم الباقة).
    *   `quantity` (الكمية - اختياري، افتراضي 1).
    *   `customer_phone` (اختياري).
*   **شكل الاستجابة عند النجاح (201 Created):**
    ```json
    {
      "message": "تم الشراء بنجاح",
      "vouchers": [
         {
           "voucher_code": "1122334455",
           "pin": "1234",
           "price": 1000,
           "expiry_date": "2026-09-13",
           "transaction_id": "TXN-45"
         }
      ],
      "network_name": "شبكة التميز",
      "total_deducted": 1000
    }
    ```

---

## 🖨️ 6. المبيعات والتقارير (Sales & Reports)

### 6.1. سجل الكروت المباعة (Sales History)
*   **المسار:** `GET /pos/sales/history` (يحتاج Token)
*   **فلترة اختيارية:** يمكن إضافة `?filter=today` أو `?filter=week` أو `?filter=month` إلى الرابط.
*   **الاستجابة:** قائمة بالكروت المباعة سابقاً وتتضمن تفاصيل كل كرت (مثل `voucher_code` و `pin`) في حال رغب صاحب البقالة في إعادة طباعة الكرت للعميل.
