<?php

namespace App\Exports;

use App\Models\GameSession;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class GameSessionsExport implements FromQuery, ShouldAutoSize, WithEvents, WithHeadings, WithMapping
{
    public function __construct(private Builder $query) {}

    public function query(): Builder
    {
        return $this->query;
    }

    /** @return list<string> */
    public function headings(): array
    {
        $questionHeadings = [];
        for ($i = 1; $i <= GameSession::TOTAL_QUESTIONS; $i++) {
            $questionHeadings[] = 'Q'.$i;
        }

        return array_merge([
            'Session ID',
            'Player',
            'Email',
            'Department',
            'Score',
        ], $questionHeadings, [
            'Started at',
            'Completed at',
        ]);
    }

    /** @return list<mixed> */
    public function map($session): array
    {
        $flags = $session->answerFlagsByOrder();
        $questionValues = array_map(
            fn (?int $flag) => $flag === null ? '-' : $flag,
            $flags
        );

        return array_merge([
            $session->id,
            $session->user?->username,
            $session->user?->email,
            $session->user?->department_id,
            $session->total_score,
        ], $questionValues, [
            $session->started_at?->format('Y-m-d H:i:s'),
            $session->completed_at?->format('Y-m-d H:i:s'),
        ]);
    }

    /** @return array<class-string, callable> */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestColumn = $sheet->getHighestColumn();
                $headerRange = 'A1:'.$highestColumn.'1';

                // Congelar fila de cabecera
                $sheet->freezePane('A2');

                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1C1C1C'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(22);
            },
        ];
    }
}
