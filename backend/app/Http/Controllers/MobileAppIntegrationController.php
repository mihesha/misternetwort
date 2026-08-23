<?php

namespace App\Http\Controllers;

use App\Models\AppDeposit;
use App\Models\OtpTask;
use App\Models\CardSmsTask;
use Illuminate\Http\Request;

class MobileAppIntegrationController extends Controller
{
    public function storeDeposit(Request $request)
    {
        if ($request->header('X-App-Secret') !== 'mobile-app-secret-123') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validated = $request->validate([
            'reference_number' => 'required|string|unique:app_deposits,reference_number',
            'amount' => 'required|numeric|min:0',
            'wallet_name' => 'required|string'
        ]);

        $deposit = AppDeposit::create($validated);
        
        return response()->json(['message' => 'Deposit received', 'data' => $deposit], 201);
    }

    public function getOtpTasks(Request $request)
    {
        if ($request->bearerToken() !== 'mobile-app-secret-123') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $tasks = OtpTask::where('status', 'PENDING')->get()->map(function($task) {
            return [
                'id' => $task->id,
                'phoneNumber' => $task->phone_number,
                'otpCode' => $task->otp_code,
                'customMessage' => $task->custom_message
            ];
        });
        
        return response()->json($tasks);
    }

    public function updateOtpTask(Request $request)
    {
        if ($request->bearerToken() !== 'mobile-app-secret-123') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validated = $request->validate([
            'taskId' => 'required|exists:otp_tasks,id',
            'status' => 'required|in:SENT,FAILED',
            'errorMessage' => 'nullable|string'
        ]);
        
        $task = OtpTask::find($validated['taskId']);
        $task->status = $validated['status'];
        $task->error_message = $validated['errorMessage'] ?? null;
        $task->sent_at = now();
        $task->save();
        
        return response()->json(['message' => 'Task updated successfully']);
    }

    public function getCardTasks(Request $request)
    {
        if ($request->bearerToken() !== 'mobile-app-secret-123') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $tasks = CardSmsTask::where('status', 'PENDING')->get()->map(function($task) {
            return [
                'id' => $task->id,
                'phoneNumber' => $task->phone_number,
                'cardCategory' => $task->card_category,
                'cardCode' => $task->card_code,
                'customMessage' => $task->custom_message
            ];
        });
        
        return response()->json($tasks);
    }

    public function updateCardTask(Request $request)
    {
        if ($request->bearerToken() !== 'mobile-app-secret-123') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validated = $request->validate([
            'taskId' => 'required|exists:card_sms_tasks,id',
            'status' => 'required|in:SENT,FAILED',
            'errorMessage' => 'nullable|string'
        ]);
        
        $task = CardSmsTask::find($validated['taskId']);
        $task->status = $validated['status'];
        $task->error_message = $validated['errorMessage'] ?? null;
        $task->sent_at = now();
        $task->save();
        
        return response()->json(['message' => 'Task updated successfully']);
    }
}
