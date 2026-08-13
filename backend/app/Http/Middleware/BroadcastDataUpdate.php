<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BroadcastDataUpdate
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!in_array($request->method(), ['GET', 'OPTIONS', 'HEAD']) && $response->isSuccessful()) {
            try {
                broadcast(new \App\Events\DataUpdated('all'));
            } catch (\Exception $e) {
                // Ignore broadcast errors so it doesn't fail the request
            }
        }

        return $response;
    }
}
