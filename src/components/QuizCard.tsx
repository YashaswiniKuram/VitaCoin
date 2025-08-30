import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Clock, Coins } from "lucide-react";

type QuizCardProps = {
  onPlay: () => void;
};

export function QuizCard({ onPlay }: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Daily Quiz
        </CardTitle>
        <CardDescription>Test your knowledge and earn coins!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time Limit:</span>
            </div>
            <div className="font-medium">1-2 min</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Reward:</span>
            </div>
            <div className="font-medium">5 coins/answer</div>
          </div>
        </div>
        <Button onClick={onPlay} className="w-full">Start Quiz</Button>
      </CardContent>
    </Card>
  );
}
