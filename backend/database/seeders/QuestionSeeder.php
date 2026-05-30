<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // Cluster 1
            [1, 'In which year did euro banknotes and coins enter circulation?', ['1999', '2002', '2005', '2010'], 2, 'The euro cash was introduced on 1 January 2002.', 200],
            [1, 'Which treaty paved the way for Economic and Monetary Union?', ['Treaty of Rome', 'Maastricht Treaty', 'Lisbon Treaty', 'Nice Treaty'], 2, 'The Maastricht Treaty (1992) set the framework for the euro.', 150],
            [1, 'How many EU member states adopted the euro initially in 1999?', ['11', '15', '19', '27'], 1, 'Eleven countries joined the euro area in 1999.', 150],
            [1, 'What was the main goal of creating a single currency?', ['Tourism', 'Monetary stability and integration', 'Military union', 'Space exploration'], 2, 'A single currency supports economic integration and stability.', 200],
            // Cluster 2
            [2, 'Where is the headquarters of the European Central Bank?', ['Brussels', 'Frankfurt', 'Paris', 'Berlin'], 2, 'The ECB is located in Frankfurt am Main, Germany.', 200],
            [2, 'What is the primary objective of the ECB?', ['Price stability', 'Full employment only', 'Trade surplus', 'Tax collection'], 1, 'The ECB\'s main mandate is to maintain price stability in the euro area.', 200],
            [2, 'Who leads the Governing Council meetings as ECB President?', ['The ECB President', 'The EU Commission President', 'The German Chancellor', 'The Eurogroup chair'], 1, 'The President chairs the Governing Council.', 150],
            [2, 'Which instrument does the ECB use to steer short-term interest rates?', ['Main refinancing operations', 'VAT rates', 'Corporate tax', 'Customs duties'], 1, 'Main refinancing operations are a key monetary policy tool.', 150],
            // Cluster 3
            [3, 'All euro banknotes share designs across the euro area except for which element?', ['Colour', 'Architectural motifs', 'National side of coins', 'ECB signature'], 3, 'Coins have a common European side and a national side.', 150],
            [3, 'Which material are euro coins primarily made of?', ['Gold', 'Metal alloys', 'Plastic', 'Wood'], 2, 'Euro coins use various metal alloys depending on denomination.', 150],
            [3, 'What helps protect euro banknotes against counterfeiting?', ['Holograms and watermarks', 'Perfume', 'Magnetic paint only', 'Paper clips'], 1, 'Security features include holograms, watermarks and more.', 200],
            [3, 'Which denomination is the highest euro banknote currently in circulation?', ['100', '200', '500', '1000'], 2, 'The €500 note is no longer issued but may still circulate in some cases; €200 is among the highest commonly used.', 200],
            // Cluster 4
            [4, 'How many countries use the euro as their currency today (approx.)?', ['10', '15', '20', '30'], 3, 'Around twenty EU countries belong to the euro area.', 150],
            [4, 'Which institution represents euro area finance ministers?', ['Eurogroup', 'NATO', 'UN Security Council', 'World Bank'], 1, 'The Eurogroup coordinates economic policy among euro members.', 150],
            [4, 'What does a common currency reduce between member states?', ['Language barriers only', 'Transaction costs and exchange rate risk', 'Population growth', 'Border controls'], 2, 'A shared currency lowers conversion costs and FX risk in trade.', 200],
            [4, 'Which body supervises significant banks in the euro area alongside the ECB?', ['Single Supervisory Mechanism', 'FIFA', 'WHO', 'IMF Board'], 1, 'The SSM is part of the European banking union framework.', 200],
        ];

        foreach ($questions as [$clusterId, $text, $answers, $correct, $explanation, $points]) {
            Question::updateOrCreate(
                ['cluster_id' => $clusterId, 'question' => $text],
                [
                    'answer1' => $answers[0],
                    'answer2' => $answers[1],
                    'answer3' => $answers[2],
                    'answer4' => $answers[3],
                    'answerOK' => $correct,
                    'explanation' => $explanation,
                    'points' => $points,
                ]
            );
        }
    }
}
