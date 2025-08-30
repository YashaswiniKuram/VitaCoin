"use client";

import { useState, useEffect } from 'react';
import { QuizQuestion, QuizCategory } from '@/lib/types';
import { getQuizQuestions, submitQuizResult } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Calculator, BookOpen, Code, Clock, Award } from 'lucide-react';

const categoryIcons = {
  math: Calculator,
  aptitude: Brain,
  grammar: BookOpen,
  programming: Code
};

const categoryColors = {
  math: 'bg-blue-500',
  aptitude: 'bg-purple-500',
  grammar: 'bg-green-500',
  programming: 'bg-orange-500'
};

interface EnhancedQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: QuizCategory;
  onQuizComplete: (category: QuizCategory, score: number, coinsEarned: number) => void;
}

export function EnhancedQuizModal({ isOpen, onClose, category, onQuizComplete }: EnhancedQuizModalProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; coinsEarned: number; correctAnswers: number } | null>(null);

  const IconComponent = categoryIcons[category];

  useEffect(() => {
    if (isOpen && !quizStarted) {
      loadQuestions();
    }
  }, [isOpen, category, quizStarted]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizCompleted]);

  const getTimeLimit = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    return difficulty === 'hard' ? 120 : 60; // 2 minutes for hard, 1 minute for easy/medium
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const questionsData = await getQuizQuestions(category);
      setQuestions(questionsData);
      setSelectedAnswers(new Array(questionsData.length).fill(-1));
      setCurrentQuestion(0);
      
      // Set time based on question difficulty (use first question's difficulty as reference)
      const timeLimit = questionsData.length > 0 
        ? getTimeLimit(questionsData[0].difficulty)
        : 60; // Default to 1 minute if no questions
      setTimeLeft(timeLimit);
      
      setQuizCompleted(false);
      setResults(null);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    // Reset timer based on first question's difficulty when starting the quiz
    if (questions.length > 0) {
      const timeLimit = getTimeLimit(questions[0].difficulty);
      setTimeLeft(timeLimit);
    }
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!questions.length || !user) return;
    
    setLoading(true);
    try {
      const result = await submitQuizResult(user.uid, category, questions, selectedAnswers);
      setResults(result);
      setQuizCompleted(true);
      onQuizComplete(category, result.score, result.coinsEarned);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    // Reset to default time (will be updated when questions load)
    setTimeLeft(60);
    setResults(null);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredQuestions = selectedAnswers.filter(answer => answer !== -1).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="h-6 w-6" />
            {category.charAt(0).toUpperCase() + category.slice(1)} Quiz
          </DialogTitle>
          <DialogDescription>
            Test your knowledge and earn coins!
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!quizStarted && !loading && questions.length > 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full ${categoryColors[category]} flex items-center justify-center mb-4`}>
                <IconComponent className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{category.charAt(0).toUpperCase() + category.slice(1)} Quiz</h3>
              <p className="text-muted-foreground mb-4">
                Answer {questions.length} questions to earn up to {questions.length * 5} coins!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">
                  {questions[0]?.difficulty === 'hard' ? '2 Minutes' : '1 Minute'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {questions[0]?.difficulty === 'hard' ? 'Hard difficulty' : 'Easy/Medium difficulty'}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="font-semibold">5 Coins</div>
                <div className="text-sm text-muted-foreground">Per Correct Answer</div>
              </div>
            </div>

            <Button onClick={handleStartQuiz} className="w-full" size="lg">
              Start Quiz
            </Button>
          </div>
        )}

        {quizStarted && !quizCompleted && questions.length > 0 && (
          <div className="space-y-6 py-4">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
                <Badge variant="secondary">
                  {answeredQuestions}/{questions.length} Answered
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <Progress value={progress} className="w-full" />

            {/* Current Question */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {questions[currentQuestion]?.question}
                </h3>
                
                <div className="space-y-3">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="mr-3 font-semibold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestion] === -1}
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {quizCompleted && results && (
          <div className="space-y-6 py-4 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full ${categoryColors[category]} flex items-center justify-center mb-4`}>
              <Award className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <p className="text-muted-foreground">Great job on completing the {category} quiz!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{results.score}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-500">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{results.coinsEarned}</div>
                <div className="text-sm text-muted-foreground">Coins Earned</div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
