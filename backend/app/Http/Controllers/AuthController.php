<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'network_owner',
        ]);

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    public function customerRegister(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $otpCode = (string) rand(100000, 999999);

        $user = User::create([
            'name' => 'مستخدم ' . ltrim($validated['phone'], '0+'),
            'email' => $validated['phone'] . '@customer.local',
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'otp_code' => $otpCode,
        ]);

        \App\Models\OtpTask::create([
            'phone_number' => $validated['phone'],
            'otp_code' => $otpCode,
            'custom_message' => "رمز التحقق من منصة كارد بوكس هو: {$otpCode}"
        ]);

        return response()->json([
            'message' => 'تم إنشاء حساب العميل بنجاح، يرجى إدخال رمز التحقق OTP.',
            'test_otp_code' => $otpCode,
        ], 201);
    }

    public function customerVerifyOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp_code' => 'required|string'
        ]);

        $user = User::where('phone', $validated['phone'])->where('role', 'customer')->first();

        if (!$user || $user->otp_code !== $validated['otp_code']) {
            throw ValidationException::withMessages([
                'otp_code' => ['رمز التحقق غير صحيح أو منتهي الصلاحية.']
            ]);
        }

        $user->otp_code = null; // clear OTP
        $user->phone_verified_at = now();
        $user->save();

        return response()->json([
            'message' => 'تم التحقق بنجاح',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function customerResendOtp(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $user = User::where('phone', $request->phone)->where('role', 'customer')->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['هذا الحساب غير موجود.']
            ]);
        }

        $otpCode = (string) rand(100000, 999999);
        $user->otp_code = $otpCode;
        $user->save();
        
        \App\Models\OtpTask::create([
            'phone_number' => $request->phone,
            'otp_code' => $otpCode,
            'custom_message' => "رمز التحقق من منصة كارد بوكس هو: {$otpCode}"
        ]);

        return response()->json([
            'message' => 'تم إعادة إرسال رمز التحقق بنجاح.',
            'test_otp_code' => $otpCode
        ]);
    }

    public function customerForgotPassword(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $user = User::where('phone', $request->phone)->where('role', 'customer')->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['رقم الجوال غير مسجل لدينا']
            ]);
        }

        $otp = (string) rand(100000, 999999);
        $user->otp_code = $otp;
        $user->save();

        \App\Models\OtpTask::create([
            'phone_number' => $request->phone,
            'otp_code' => $otp,
            'custom_message' => "رمز استعادة كلمة المرور من كارد بوكس هو: {$otp}"
        ]);

        return response()->json(['message' => 'تم إرسال كود الاستعادة', 'test_otp_code' => $otp]);
    }

    public function customerCheckOtp(Request $request)
    {
        $request->validate(['phone' => 'required|string', 'otp_code' => 'required|string']);

        $user = User::where('phone', $request->phone)->where('role', 'customer')->first();

        if (!$user || $user->otp_code !== $request->otp_code) {
            throw ValidationException::withMessages([
                'otp_code' => ['رمز التحقق غير صحيح']
            ]);
        }

        return response()->json(['message' => 'الرمز صحيح']);
    }

    public function customerResetPassword(Request $request)
    {
        $request->validate(['phone' => 'required|string', 'otp_code' => 'required|string', 'new_password' => 'required|string|min:6']);

        $user = User::where('phone', $request->phone)->where('role', 'customer')->first();

        if (!$user || $user->otp_code !== $request->otp_code) {
            throw ValidationException::withMessages([
                'otp_code' => ['رمز التحقق غير صحيح']
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->otp_code = null;
        $user->save();

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن.'
        ]);
    }

    public function customerLogin(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->where('role', 'customer')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['رقم الهاتف أو كلمة المرور غير صحيحة.'],
            ]);
        }

        if (is_null($user->phone_verified_at)) {
            $otpCode = (string) rand(100000, 999999);
            $user->otp_code = $otpCode;
            $user->save();
            
            \App\Models\OtpTask::create([
                'phone_number' => $request->phone,
                'otp_code' => $otpCode,
                'custom_message' => "رمز التحقق من منصة كارد بوكس هو: {$otpCode}"
            ]);
            return response()->json([
                'status' => 'unverified',
                'message' => 'حسابك غير مفعل، يرجى التحقق من الجوال',
                'test_otp_code' => $otpCode
            ], 403);
        }

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['رقم الهاتف أو كلمة المرور غير صحيحة.'],
            ]);
        }

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('networks'));
    }
}
