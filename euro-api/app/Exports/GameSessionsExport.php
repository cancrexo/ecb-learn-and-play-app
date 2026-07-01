<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class GameSessionsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private Builder $query) {}

    public function query(): Builder
    {
        return $this->query;
    }

    /** @return list<string> */
    public function headings(): array
    {
        return [
            'Session ID',
            'Player',
            'Email',
            'Department',
            'Score',
            'Started at',
            'Completed at',
        ];
    }

    /** @return list<mixed> */
    public function map($session): array
    {
        return [
            $session->id,
            $session->user?->username,
            $session->user?->email,
            $session->user?->department_id,
            $session->total_score,
            $session->started_at?->format('Y-m-d H:i:s'),
            $session->completed_at?->format('Y-m-d H:i:s'),
        ];
    }
}
