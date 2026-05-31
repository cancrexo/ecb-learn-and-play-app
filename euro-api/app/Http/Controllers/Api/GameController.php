<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class GameController extends Controller
{
    public function __construct(private GameService $gameService) {}

    public function start(Request $request): JsonResponse
    {
        $data = $request->validate(['cluster_id' => 'required|integer|exists:clusters,id']);

        try {
            $session = $this->gameService->startSession($request->user(), (int) $data['cluster_id']);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'session' => [
                'id' => $session->id,
                'status' => $session->status,
                'current_cluster_id' => $session->current_cluster_id,
                'current_question_id' => $session->current_question_id,
                'total_score' => $session->total_score,
            ],
            'state' => $this->gameService->getCurrentState($request->user()),
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        return response()->json($this->gameService->getCurrentState($request->user()));
    }

    public function answer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question_id' => 'required|integer|exists:questions,id_question',
            'selected_answer' => 'required|integer|min:1|max:4',
        ]);

        try {
            $result = $this->gameService->submitAnswer(
                $request->user(),
                (int) $data['question_id'],
                (int) $data['selected_answer']
            );
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($result);
    }

    public function advance(Request $request): JsonResponse
    {
        try {
            $result = $this->gameService->advanceQuestion($request->user());
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($result);
    }

    public function pause(Request $request): JsonResponse
    {
        try {
            $this->gameService->pauseSession($request->user());
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Game paused.']);
    }

    public function restart(Request $request): JsonResponse
    {
        try {
            $session = $this->gameService->restartGame($request->user());
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Game restarted.',
            'session' => [
                'id' => $session->id,
                'status' => $session->status,
                'current_cluster_id' => $session->current_cluster_id,
                'current_question_id' => $session->current_question_id,
                'total_score' => $session->total_score,
            ],
        ]);
    }

    public function ranking(Request $request): JsonResponse
    {
        return response()->json($this->gameService->getRanking($request->user()));
    }

    /** Reset de progreso; solo disponible en entorno local/debug. */
    public function abandon(Request $request): JsonResponse
    {
        if (! app()->environment('local') && ! config('app.debug')) {
            abort(404);
        }

        $this->gameService->abandonProgress($request->user());

        return response()->json(['message' => 'Game progress reset.']);
    }
}
