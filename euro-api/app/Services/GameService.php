<?php

namespace App\Services;

use App\Models\Cluster;
use App\Models\GameAnswer;
use App\Models\GameSession;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class GameService
{
    public function getClustersWithProgress(User $user): array
    {
        $session = $user->activeGameSession() ?? $user->completedGameSession();
        $clusters = Cluster::orderBy('sort_order')->get();
        $completedClusterIds = $this->getCompletedClusterIds($session);
        $highestCompletedOrder = $clusters
            ->whereIn('id', $completedClusterIds)
            ->max('sort_order') ?? 0;

        return $clusters->map(function (Cluster $cluster) use ($session, $completedClusterIds, $highestCompletedOrder) {
            $status = 'locked';
            $score = null;

            if (in_array($cluster->id, $completedClusterIds, true)) {
                $status = 'completed';
                $score = $this->getClusterScore($session, $cluster->id);
            } elseif ($session && $session->status !== 'completed' && (int) $session->current_cluster_id === (int) $cluster->id) {
                $status = 'in_progress';
            } elseif ($cluster->sort_order === 1 || $cluster->sort_order <= $highestCompletedOrder + 1) {
                $status = 'available';
            }

            return [
                'id' => $cluster->id,
                'name' => preg_replace('/^Cluster\s+/i', 'Level ', $cluster->name),
                'description' => $cluster->description,
                'sort_order' => $cluster->sort_order,
                'status' => $status,
                'score' => $score,
            ];
        })->values()->all();
    }

    public function startSession(User $user, int $clusterId): GameSession
    {
        $activeSession = $user->activeGameSession();

        if ($activeSession) {
            // Entre clusters: reanudar en el siguiente cluster seleccionado
            if (
                $activeSession->current_question_id === null
                && in_array($activeSession->status, ['in_progress', 'paused'], true)
            ) {
                $clusterData = collect($this->getClustersWithProgress($user))->firstWhere('id', $clusterId);
                if (! $clusterData || ! in_array($clusterData['status'], ['available', 'in_progress'], true)) {
                    throw new InvalidArgumentException('This level is not available.');
                }
                $firstQuestion = Question::where('cluster_id', $clusterId)->orderBy('id_question')->firstOrFail();
                $activeSession->status = 'in_progress';
                $activeSession->current_cluster_id = $clusterId;
                $activeSession->current_question_id = $firstQuestion->id_question;
                $activeSession->save();
                return $activeSession;
            }
            throw new InvalidArgumentException('You already have an active quiz session.');
        }

        if ($user->completedGameSession()) {
            throw new InvalidArgumentException('You must restart the quiz before starting again.');
        }

        $cluster = Cluster::findOrFail($clusterId);
        $clusters = $this->getClustersWithProgress($user);
        $clusterData = collect($clusters)->firstWhere('id', $clusterId);

        if (! $clusterData || ! in_array($clusterData['status'], ['available', 'in_progress'], true)) {
            throw new InvalidArgumentException('This level is not available.');
        }

        $firstQuestion = Question::where('cluster_id', $clusterId)->orderBy('id_question')->firstOrFail();

        return GameSession::create([
            'user_id' => $user->id,
            'status' => 'in_progress',
            'current_cluster_id' => $clusterId,
            'current_question_id' => $firstQuestion->id_question,
            'total_score' => 0,
            'started_at' => now(),
        ]);
    }

    public function getCurrentState(User $user): array
    {
        $session = $user->activeGameSession();

        if (! $session) {
            return ['session' => null];
        }

        // Reanudar partida pausada automáticamente
        if ($session->status === 'paused') {
            $session->status = 'in_progress';
            $session->save();
        }

        $question = $session->currentQuestion;
        if (! $question) {
            return ['session' => $this->formatSession($session), 'question' => null, 'timeline' => []];
        }

        return [
            'session' => $this->formatSession($session),
            'cluster' => $this->formatCluster($session->currentCluster),
            'question' => $this->formatQuestion($question),
            'timeline' => $this->buildTimeline($session),
            'is_last_question_in_cluster' => $this->isLastQuestionInCluster($question),
        ];
    }

    public function submitAnswer(User $user, int $questionId, int $selectedAnswer): array
    {
        $session = $user->activeGameSession();

        if (! $session || $session->status === 'paused') {
            throw new InvalidArgumentException('There is no active quiz session.');
        }

        $question = Question::findOrFail($questionId);

        if ((int) $session->current_question_id !== (int) $questionId) {
            throw new InvalidArgumentException('This is not the current question.');
        }

        if (GameAnswer::where('session_id', $session->id)->where('question_id', $questionId)->exists()) {
            throw new InvalidArgumentException('This question has already been answered.');
        }

        $isCorrect = (int) $question->answerOK === $selectedAnswer;
        $pointsEarned = $isCorrect ? (int) $question->points : 0;

        GameAnswer::create([
            'session_id' => $session->id,
            'question_id' => $questionId,
            'selected_answer' => $selectedAnswer,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'answered_at' => now(),
        ]);

        $session->total_score += $pointsEarned;
        $session->save();

        $nextQuestion = Question::where('cluster_id', $question->cluster_id)
            ->where('id_question', '>', $question->id_question)
            ->orderBy('id_question')
            ->first();

        return [
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'explanation' => $question->explanation,
            'total_score' => $session->total_score,
            'is_last_in_cluster' => $nextQuestion === null,
            'cluster_completed' => $nextQuestion === null,
        ];
    }

    public function advanceQuestion(User $user): array
    {
        $session = $user->activeGameSession();

        if (! $session) {
            throw new InvalidArgumentException('There is no active quiz session.');
        }

        $currentQuestion = $session->currentQuestion;

        if (! $currentQuestion) {
            throw new InvalidArgumentException('There is no current question.');
        }

        if (! GameAnswer::where('session_id', $session->id)->where('question_id', $currentQuestion->id_question)->exists()) {
            throw new InvalidArgumentException('You must answer the current question first.');
        }

        $nextQuestion = Question::where('cluster_id', $currentQuestion->cluster_id)
            ->where('id_question', '>', $currentQuestion->id_question)
            ->orderBy('id_question')
            ->first();

        if ($nextQuestion) {
            $session->current_question_id = $nextQuestion->id_question;
            $session->save();

            return [
                'action' => 'next_question',
                'session' => $this->formatSession($session),
                'question' => $this->formatQuestion($nextQuestion),
                'timeline' => $this->buildTimeline($session),
            ];
        }

        // Cluster completado
        $clusterScore = $this->getClusterScore($session, (int) $currentQuestion->cluster_id);
        $isLastCluster = (int) $currentQuestion->cluster_id === (int) Cluster::max('sort_order');

        if ($isLastCluster) {
            $session->status = 'completed';
            $session->current_question_id = null;
            $session->completed_at = now();
            $session->save();

            $this->updateBestScore($user, (int) $session->total_score);

            return [
                'action' => 'game_completed',
                'cluster_score' => $clusterScore,
                'total_score' => $session->total_score,
                'ranking' => $this->getUserRanking($user),
            ];
        }

        $session->current_question_id = null;
        $session->save();

        return [
            'action' => 'cluster_completed',
            'cluster_id' => (int) $currentQuestion->cluster_id,
            'cluster_score' => $clusterScore,
            'total_score' => $session->total_score,
        ];
    }

    public function pauseSession(User $user): void
    {
        $session = $user->activeGameSession();

        if (! $session || $session->status !== 'in_progress') {
            throw new InvalidArgumentException('There is no quiz in progress to pause.');
        }

        $session->status = 'paused';
        $session->save();
    }

    public function restartGame(User $user): GameSession
    {
        $completed = $user->completedGameSession();

        if (! $completed) {
            throw new InvalidArgumentException('You can only restart after completing the quiz.');
        }

        $this->deleteUserGameHistory($user);

        $firstCluster = Cluster::orderBy('sort_order')->firstOrFail();
        return $this->startSession($user, $firstCluster->id);
    }

    /** Borra sesión y respuestas sin iniciar partida nueva. */
    public function abandonProgress(User $user): void
    {
        $this->deleteUserGameHistory($user);
    }

    public function getRanking(User $user): array
    {
        return $this->getUserRanking($user);
    }

    private function deleteUserGameHistory(User $user): void
    {
        DB::transaction(function () use ($user) {
            $sessionIds = GameSession::where('user_id', $user->id)->pluck('id');
            GameAnswer::whereIn('session_id', $sessionIds)->delete();
            GameSession::where('user_id', $user->id)->delete();
        });
    }

    private function getUserRanking(User $user): array
    {
        $leader = User::where('best_score', '>', 0)
            ->orderByDesc('best_score')
            ->orderBy('best_score_at')
            ->first();

        $rankedUsers = User::where('best_score', '>', 0)
            ->orderByDesc('best_score')
            ->orderBy('best_score_at')
            ->get(['id']);

        $userPosition = null;
        foreach ($rankedUsers as $index => $row) {
            if ((int) $row->id === (int) $user->id) {
                $userPosition = $index + 1;
                break;
            }
        }

        $lastCompleted = $user->completedGameSession();
        $displayScore = $lastCompleted ? (int) $lastCompleted->total_score : 0;
        $completedPlayers = $rankedUsers->count();
        $leaderScore = $leader ? (int) $leader->best_score : 0;

        return [
            'position' => $userPosition,
            'total_score' => $displayScore,
            'leader_score' => $leaderScore,
            'completed_players' => $completedPlayers,
        ];
    }

    private function updateBestScore(User $user, int $score): void
    {
        if ($score > (int) $user->best_score) {
            $user->best_score = $score;
            $user->best_score_at = now();
            $user->save();
        }
    }

    private function getCompletedClusterIds(?GameSession $session): array
    {
        if (! $session) {
            return [];
        }

        $answeredQuestionIds = GameAnswer::where('session_id', $session->id)->pluck('question_id');
        $clusters = Question::whereIn('id_question', $answeredQuestionIds)->pluck('cluster_id')->unique();

        $completed = [];
        foreach ($clusters as $clusterId) {
            $total = Question::where('cluster_id', $clusterId)->count();
            $answered = Question::where('cluster_id', $clusterId)
                ->whereIn('id_question', $answeredQuestionIds)
                ->count();
            if ($answered >= $total && $total > 0) {
                $completed[] = (int) $clusterId;
            }
        }

        return $completed;
    }

    private function getClusterScore(?GameSession $session, int $clusterId): int
    {
        if (! $session) {
            return 0;
        }

        $questionIds = Question::where('cluster_id', $clusterId)->pluck('id_question');

        return (int) GameAnswer::where('session_id', $session->id)
            ->whereIn('question_id', $questionIds)
            ->sum('points_earned');
    }

    private function buildTimeline(GameSession $session): array
    {
        // Camino global: todas las preguntas del juego ordenadas por cluster
        $questions = Question::query()
            ->join('clusters', 'questions.cluster_id', '=', 'clusters.id')
            ->orderBy('clusters.sort_order')
            ->orderBy('questions.id_question')
            ->select('questions.*')
            ->get();

        $answers = GameAnswer::where('session_id', $session->id)
            ->get()
            ->keyBy('question_id');

        return $questions->map(function (Question $q) use ($session, $answers) {
            $answer = $answers->get($q->id_question);
            $status = 'pending';

            if ((int) $session->current_question_id === (int) $q->id_question && ! $answer) {
                $status = 'current';
            } elseif ($answer) {
                $status = $answer->is_correct ? 'correct' : 'incorrect';
            }

            return [
                'question_id' => $q->id_question,
                'status' => $status,
            ];
        })->values()->all();
    }

    private function isLastQuestionInCluster(Question $question): bool
    {
        return ! Question::where('cluster_id', $question->cluster_id)
            ->where('id_question', '>', $question->id_question)
            ->exists();
    }

    private function formatCluster(?Cluster $cluster): ?array
    {
        if (! $cluster) {
            return null;
        }

        return [
            'id' => $cluster->id,
            'name' => preg_replace('/^Cluster\s+/i', 'Level ', $cluster->name),
            'description' => $cluster->description,
        ];
    }

    private function formatSession(GameSession $session): array
    {
        return [
            'id' => $session->id,
            'status' => $session->status,
            'current_cluster_id' => $session->current_cluster_id,
            'current_question_id' => $session->current_question_id,
            'total_score' => $session->total_score,
        ];
    }

    private function formatQuestion(Question $question): array
    {
        return [
            'id_question' => $question->id_question,
            'cluster_id' => $question->cluster_id,
            'question' => $question->question,
            'answers' => $question->getAnswersForClient(),
            'points' => $question->points,
        ];
    }
}
