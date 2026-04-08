<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a new client user account.
     *
     * @param \App\Http\Requests\Auth\RegisterUserRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(RegisterUserRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => strtolower($request->validated('email')),
            'phone' => $request->validated('phone'),
            'role' => 'client',
            'password' => $request->validated('password'),
        ]);

        $token = Auth::guard('api')->login($user);

        if (!is_string($token) || $token === '') {
            throw ValidationException::withMessages([
                'email' => ['Unable to issue authentication token.'],
            ]);
        }

        return response()->json([
            'data' => $this->tokenPayload($token, $user, $request),
        ], 201);
    }

    /**
     * Authenticate a user with email and password.
     *
     * @param \App\Http\Requests\Auth\LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = [
            'email' => strtolower($request->validated('email')),
            'password' => $request->validated('password'),
        ];

        $token = Auth::guard('api')->attempt($credentials);

        if (!is_string($token) || $token === '') {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::guard('api')->user();

        return response()->json([
            'data' => $this->tokenPayload($token, $user, $request),
        ]);
    }

    /**
     * Return the current session authentication state.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function session(Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (JWTException) {
            $user = null;
        }

        if (!$user instanceof User) {
            return response()->json([
                'data' => [
                    'authenticated' => false,
                    'user' => null,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'authenticated' => true,
                'user' => (new UserResource($user))->resolve($request),
            ],
        ]);
    }

    /**
     * Log out the authenticated user.
     *
     * @return \Illuminate\Http\Response
     */
    public function logout(): \Illuminate\Http\Response
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->noContent();
    }

    /**
     * Refresh the current JWT token.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        /** @var string $token */
        $token = Auth::guard('api')->refresh();

        /** @var \App\Models\User $user */
        $user = $request->user('api');

        return response()->json([
            'data' => $this->tokenPayload($token, $user, $request),
        ]);
    }

    /**
     * Build a normalized JWT auth payload.
     *
     * @param string $token
     * @param \App\Models\User $user
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    private function tokenPayload(string $token, User $user, Request $request): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user' => (new UserResource($user))->resolve($request),
        ];
    }
}
