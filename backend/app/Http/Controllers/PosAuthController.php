<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PosProfile;
use App\Models\OtpTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PosAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'shop_name' => 'required|string',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => 'pos_' . $validated['phone'] . '@misternetwork.local',
            'password' => Hash::make($validated['password']),
            'role' => 'pos',
        ]);

        $otpCode = (string) rand(100000, 999999);

        PosProfile::create([
            'user_id' => $user->id,
            'shop_name' => $validated['shop_name'],
            'address' => $validated['address'],
            'status' => 'pending',
            'otp_code' => $otpCode,
        ]);

        OtpTask::create([
            'phone_number' => $validated['phone'],
            'otp_code' => $otpCode,
            'custom_message' => "رمز التحقق لبرنامج نقاط البيع كارد بوكس هو: {$otpCode}"
        ]);

        return response()->json([
            'status' => true,
            'message' => 'تم إرسال رمز التحقق OTP إلى هاتفك',
            'test_otp_code' => $otpCode,
            'user' => $user
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp_code' => 'required|string'
        ]);

        $user = User::where('phone', $validated['phone'])->where('role', 'pos')->first();
        if (!$user) return response()->json(['error' => 'حساب غير موجود'], 404);

        $profile = PosProfile::where('user_id', $user->id)->first();
        if (!$profile || $profile->otp_code !== $validated['otp_code']) {
            return response()->json(['error' => 'رمز التحقق غير صحيح'], 400);
        }

        $profile->status = 'active';
        $profile->otp_code = null;
        $profile->save();

        $token = $user->createToken('pos-token')->plainTextToken;
        
        return response()->json([
            'status' => true,
            'message' => 'تم التحقق وتفعيل الحساب بنجاح',
            'token' => $token,
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $validated['phone'])->where('role', 'pos')->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['status' => false, 'message' => 'بيانات الدخول غير صحيحة'], 401);
        }

        $token = $user->createToken('pos-token')->plainTextToken;
        
        return response()->json([
            'status' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $user = User::where('phone', $request->phone)->where('role', 'pos')->first();
        if (!$user) return response()->json(['status' => false, 'message' => 'الحساب غير موجود'], 404);
        
        $otp = (string) rand(100000, 999999);
        $profile = $user->posProfile;
        
        if (!$profile) {
            $profile = PosProfile::create([
                'user_id' => $user->id,
                'shop_name' => 'نقطة بيع',
                'status' => 'active'
            ]);
        }
        
        $profile->otp_code = $otp;
        $profile->save();
        
        $user->otp_code = $otp;
        $user->save();
        
        OtpTask::create([
            'phone_number' => $request->phone,
            'otp_code' => $otp,
            'custom_message' => "رمز استعادة كلمة المرور لبرنامج نقاط البيع كارد بوكس هو: {$otp}"
        ]);
        
        return response()->json(['status' => true, 'message' => 'تم إرسال رمز استعادة كلمة المرور', 'test_otp_code' => $otp]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'phone' => 'required|string', 
            'otp_code' => 'required|string', 
            'new_password' => 'required|string|min:6'
        ]);
        
        $user = User::where('phone', $request->phone)->where('role', 'pos')->first();
        if (!$user) return response()->json(['status' => false, 'message' => 'الحساب غير موجود'], 404);
        
        $profile = $user->posProfile;
        $isValid = false;
        
        if ($profile && $profile->otp_code === $request->otp_code) {
            $isValid = true;
        } elseif ($user->otp_code === $request->otp_code) {
            $isValid = true;
        }
        
        if (!$isValid) {
            return response()->json(['status' => false, 'message' => 'كود التحقق غير صحيح'], 400);
        }
        
        $user->password = Hash::make($request->new_password);
        $user->save();
        
        if ($profile) {
            $profile->otp_code = null;
            $profile->save();
        }
        
        return response()->json(['status' => true, 'message' => 'تم إعادة تعيين كلمة المرور بنجاح']);
    }

    public function changePassword(Request $request)
    {
        $request->validate(['current_password' => 'required', 'new_password' => 'required|min:6']);
        $user = $request->user();
        
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['status' => false, 'message' => 'كلمة المرور الحالية غير صحيحة'], 400);
        }
        
        $user->password = Hash::make($request->new_password);
        $user->save();
        
        return response()->json(['status' => true, 'message' => 'تم تغيير كلمة المرور بنجاح']);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user()->load('posProfile');
        return response()->json([
            'name' => $user->name,
            'phone' => $user->phone,
            'shop_name' => $user->posProfile->shop_name ?? '',
            'address' => $user->posProfile->address ?? '',
            'commercial_reg' => $user->posProfile->commercial_reg ?? ''
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'nullable|string',
            'shop_name' => 'nullable|string',
            'address' => 'nullable|string',
            'commercial_reg' => 'nullable|string'
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
            $user->save();
        }

        if ($user->posProfile) {
            $user->posProfile->update($request->only(['shop_name', 'address', 'commercial_reg']));
        }
        
        return response()->json(['message' => 'تم تحديث الملف الشخصي بنجاح']);
    }
}
