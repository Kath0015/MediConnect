<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $limit = '60,1'): Response
    {
        // Parse limit string: "60,1" means 60 requests per 1 minute
        [$requests, $minutes] = explode(',', $limit);

        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts($key, (int) $requests)) {
            $retryAfter = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again in ' . $retryAfter . ' seconds.',
                'retry_after' => $retryAfter,
            ], 429);
        }

        RateLimiter::hit($key, $minutes * 60);

        $response = $next($request);

        return $response->header('X-RateLimit-Limit', $requests)
            ->header('X-RateLimit-Remaining', max(0, (int) $requests - RateLimiter::attempts($key)))
            ->header('X-RateLimit-Reset', RateLimiter::resetAfter($key));
    }

    /**
     * Resolve request signature for rate limiting
     * Uses IP address and path combination
     */
    protected function resolveRequestSignature(Request $request): string
    {
        return sha1(implode('|', [
            $request->method(),
            $request->path(),
            $request->ip(),
        ]));
    }
}
