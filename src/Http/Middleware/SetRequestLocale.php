<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetRequestLocale
{
    /**
     * Set the request locale from the configured supported locales.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $availableLocales = array_keys(config('laravelLocalization.supportedLocales', ['en' => [], 'uk' => []]));
        $preferredLocale = $request->getPreferredLanguage($availableLocales) ?? config('app.locale');

        App::setLocale(in_array($preferredLocale, $availableLocales, true) ? $preferredLocale : config('app.locale'));

        return $next($request);
    }
}
