export interface ClusterInfo {
    id: number;
    name: string;
    description: string;
}

export interface User {
    id: number;
    username: string;
    department_id?: number;
    email: string;
    email_verified_at?: string | null;
}

export interface GameSession {
    id: number;
    status: 'in_progress' | 'paused' | 'completed';
    current_cluster_id: number | null;
    current_question_id: number | null;
    total_score: number;
}

export interface ClusterItem {
    id: number;
    name: string;
    description: string;
    sort_order: number;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    score: number | null;
}

export interface QuestionAnswer {
    index: number;
    text: string;
}

export interface QuestionData {
    id_question: number;
    cluster_id: number;
    question: string;
    answers: QuestionAnswer[];
    points: number;
}

export interface TimelineItem {
    question_id: number;
    status: 'pending' | 'current' | 'correct' | 'incorrect';
}

export interface AnswerResult {
    is_correct: boolean;
    points_earned: number;
    explanation: string;
    total_score: number;
    is_last_in_cluster: boolean;
    cluster_completed: boolean;
}

export interface RankingData {
    position: number | null;
    total_score: number;
    leader_score: number;
    completed_players: number;
}
