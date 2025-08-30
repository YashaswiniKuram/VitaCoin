"use client";

import { useState, useEffect} from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getQuizQuestions } from '@/lib/firebase';
import { QuizCategory, QuizQuestion } from '@/lib/types';

type QuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (score: number) => void;
  category: QuizCategory;
};

export function QuizModal({ isOpen, onClose, onQuizComplete, category }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const fetchedQuestions = await getQuizQuestions(category);
          setQuestions(fetchedQuestions);
          setCurrentQuestionIndex(0);
          setScore(0);
          setSelectedAnswer(null);
          setIsFinished(false);
        } catch (error) {
          console.error('Failed to load questions:', error);
          // Handle error - maybe show an error message to the user
        } finally {
          setLoading(false);
        }
      }
    };

    loadQuestions();
  }, [isOpen, category]);

  const handleAnswerSelect = (option: number) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  const finalScore = questions.length > 0 && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? score + 1 : score;
  
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Loading Quiz...</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p>Preparing your quiz questions...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{category.charAt(0).toUpperCase() + category.slice(1)} Quiz</DialogTitle>
          {!isFinished && <DialogDescription>Answer {questions.length} questions to earn coins.</DialogDescription>}
        </DialogHeader>
        
        {isFinished ? (
          <div className="py-4 text-center">
            <h2 className="text-2xl font-bold font-headline">Quiz Complete!</h2>
            <p className="text-lg mt-2">You scored {finalScore} out of 5.</p>
            <p className="text-muted-foreground">You've earned {finalScore * 5} coins!</p>
          </div>
        ) : (
          <div className="py-4">
            <Progress value={progress} className="mb-4" />
            <h3 className="text-lg font-semibold mb-4">{currentQuestion?.question}</h3>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={option}
                  variant={selectedAnswer === index ? 'default' : 'outline'}
                  onClick={() => handleAnswerSelect(index)}
                  className="h-16 text-lg"
                >
                  <span>{option}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {isFinished ? (
            <Button onClick={() => onQuizComplete(finalScore)} className="w-full">
              Claim Reward & Close
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full">
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
