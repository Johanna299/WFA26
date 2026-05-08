<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     */
    public function __construct()
    {
        // Require authentication for all methods except login.
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    /**
     * Log in a user with email and password and return a JWT token.
     */
    public function login(): JsonResponse
    {
        // Read only the credentials needed for authentication from the request.
        $credentials = request(['email', 'password']);

        // Try to authenticate the user and create a JWT token.
        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Return the generated token if authentication was successful.
        return $this->respondWithToken($token);
    }

    /**
     * Return the currently authenticated user as JSON.
     */
    public function me(): JsonResponse
    {
        // Return the user that belongs to the currently valid JWT token.
        return response()->json(auth()->user());
    }

    /**
     * Log out the currently authenticated user.
     */
    public function logout(): JsonResponse
    {
        // Invalidate the current JWT token so it can no longer be used.
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh the current JWT token.
     */
    public function refresh(): JsonResponse
    {
        // Generate and return a new token based on the current valid token.
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Return the standard token response structure.
     */
    protected function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            // The JWT that the client must store and send with protected requests.
            'access_token' => $token,
            // The token must be sent as a Bearer token in the Authorization header.
            'token_type' => 'bearer',
            // Token lifetime: here 1 hour
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }
}
