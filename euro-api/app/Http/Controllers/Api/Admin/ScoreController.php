<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\GameSessionsExport;
use App\Http\Controllers\Controller;
use App\Models\GameSession;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ScoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $params = $this->validatedListParams($request);
        $query = $this->buildCompletedSessionsQuery($params);

        $paginator = $query->paginate($params['per_page'])->withQueryString();

        $paginator->getCollection()->transform(fn (GameSession $session) => $this->formatSession($session));

        return response()->json($paginator);
    }

    public function export(Request $request): JsonResponse|BinaryFileResponse
    {
        $params = $this->validatedListParams($request);
        $query = $this->buildCompletedSessionsQuery($params);
        $maxRows = config('admin.export_max_rows', 10000);
        $total = (clone $query)->count();

        if ($total > $maxRows) {
            return response()->json([
                'message' => "{$total} matching sessions found. Export limit is {$maxRows}. Please narrow your filters.",
            ], 422);
        }

        $filename = 'sessions-'.now()->format('Y-m-d_H-i').'.xlsx';

        return Excel::download(new GameSessionsExport($query), $filename);
    }

    /** @return array{search: ?string, sort: string, order: string, per_page: int} */
    private function validatedListParams(Request $request): array
    {
        $data = $request->validate([
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|in:email,username,total_score,completed_at',
            'order' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:10|max:100',
        ]);

        return [
            'search' => isset($data['search']) && $data['search'] !== '' ? $data['search'] : null,
            'sort' => $data['sort'] ?? 'completed_at',
            'order' => $data['order'] ?? 'desc',
            'per_page' => (int) ($data['per_page'] ?? config('admin.default_per_page', 25)),
        ];
    }

    /** @param array{search: ?string, sort: string, order: string, per_page: int} $params */
    private function buildCompletedSessionsQuery(array $params): Builder
    {
        $query = GameSession::query()
            ->select('game_sessions.*')
            ->join('users', 'users.id', '=', 'game_sessions.user_id')
            ->where('game_sessions.status', 'completed')
            ->with('user:id,username,email,department_id');

        if ($params['search'] !== null) {
            $term = $params['search'];
            $query->where(function ($q) use ($term) {
                $q->where('users.email', 'like', '%'.$term.'%')
                    ->orWhere('users.username', 'like', '%'.$term.'%');
            });
        }

        $sortMap = [
            'email' => 'users.email',
            'username' => 'users.username',
            'total_score' => 'game_sessions.total_score',
            'completed_at' => 'game_sessions.completed_at',
        ];

        $sortColumn = $sortMap[$params['sort']] ?? 'game_sessions.completed_at';
        $order = $params['order'] === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortColumn, $order);

        if ($sortColumn !== 'game_sessions.completed_at') {
            $query->orderBy('game_sessions.completed_at', 'desc');
        }

        return $query;
    }

    /** @return array<string, mixed> */
    private function formatSession(GameSession $session): array
    {
        return [
            'id' => $session->id,
            'username' => $session->user?->username,
            'email' => $session->user?->email,
            'department_id' => $session->user?->department_id,
            'total_score' => $session->total_score,
            'started_at' => $session->started_at?->toIso8601String(),
            'completed_at' => $session->completed_at?->toIso8601String(),
        ];
    }
}
