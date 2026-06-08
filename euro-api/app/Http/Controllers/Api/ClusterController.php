<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ClusterController extends Controller
{
    public function __construct(private GameService $gameService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'clusters' => $this->gameService->getClustersWithProgress($request->user()),
        ]);
    }
}
