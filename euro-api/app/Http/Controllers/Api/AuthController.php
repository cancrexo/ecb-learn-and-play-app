<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private EmailVerificationService $emailVerification) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|max:64|unique:users,username',
            'department_id' => 'required|integer|in:1,2,3,4,5',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'accept_terms' => 'accepted',
        ]);

        $this->assertEmailDomainAllowed($data['email']);

        $user = User::create([
            'username' => $data['username'],
            'department_id' => $data['department_id'],
            'email' => $data['email'],
            'password' => $data['password'],
            'registered_at' => now(),
            'last_access' => now(),
        ]);

        $this->emailVerification->issueCode($user);

        return response()->json([
            'message' => 'Please verify your email address.',
            'email' => $user->email,
            'email_verification_required' => true,
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6|regex:/^\d{6}$/',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        if ($user->isEmailVerified()) {
            throw ValidationException::withMessages([
                'code' => ['Email already verified.'],
            ]);
        }

        if (! $this->emailVerification->verify($user, $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        $this->emailVerification->markVerified($user);
        $user->last_access = now();
        $user->save();

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function resendVerificationCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if ($user && ! $user->isEmailVerified()) {
            $this->emailVerification->issueCode($user);
        }

        return response()->json([
            'message' => 'If the account exists and is pending verification, a new code has been sent.',
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (! $user || ! Auth::guard('web')->attempt(['email' => $user->email, 'password' => $data['password']])) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->isEmailVerified()) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'email_verification_required' => true,
                'email' => $user->email,
                'errors' => [
                    'login' => ['Please verify your email before logging in.'],
                ],
            ], 422);
        }

        $user->last_access = now();
        $user->save();

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $session = $user->activeGameSession() ?? $user->completedGameSession();

        return response()->json([
            'user' => $this->formatUser($user),
            'game_session' => $session ? [
                'id' => $session->id,
                'status' => $session->status,
                'current_cluster_id' => $session->current_cluster_id,
                'current_question_id' => $session->current_question_id,
                'total_score' => $session->total_score,
            ] : null,
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'department_id' => $user->department_id,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
        ];
    }

    private function assertEmailDomainAllowed(string $email): void
    {
        $allowedDomain = config('app.users_domain');

        if ($allowedDomain === '' || $allowedDomain === null) {
            return;
        }

        $emailDomain = substr(strrchr($email, '@'), 1);

        if (strcasecmp($emailDomain, ltrim($allowedDomain, '@')) !== 0) {
            throw ValidationException::withMessages([
                'email' => ['The email must belong to the allowed domain.'],
            ]);
        }
    }
}
