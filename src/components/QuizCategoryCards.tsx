"use client";

import { useState } from 'react';
import { QuizCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Brain, BookOpen, Code, Clock, Coins, Sparkles, Trophy, Target } from 'lucide-react';
import { EnhancedQuizModal } from './EnhancedQuizModal';

const categoryData = {
  math: {
    icon: Calculator,
    title: 'Mathematics',
    description: 'Test your mathematical skills with algebra, geometry, and arithmetic problems.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    difficulty: 'medium',
    gradient: 'from-blue-400 to-blue-600',
    timeLimit: 60 // 1 minute for medium
  },
  aptitude: {
    icon: Brain,
    title: 'Aptitude',
    description: 'Challenge your logical reasoning and problem-solving abilities.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    difficulty: 'hard',
    gradient: 'from-purple-400 to-purple-600',
    timeLimit: 120 // 2 minutes for hard
  },
  grammar: {
    icon: BookOpen,
    title: 'Grammar',
    description: 'Improve your language skills with grammar and vocabulary questions.',
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    difficulty: 'easy',
    gradient: 'from-green-400 to-green-600',
    timeLimit: 60 // 1 minute for easy
  },
  programming: {
    icon: Code,
    title: 'Programming',
    description: 'Test your coding knowledge across various programming languages.',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    difficulty: 'hard',
    gradient: 'from-orange-400 to-orange-600',
    timeLimit: 120 // 2 minutes for hard
  }
};

interface QuizCategoryCardsProps {
  onQuizComplete: (category: QuizCategory, score: number, coinsEarned: number) => void;
  userStreaks?: Record<QuizCategory, number>;
  lastQuizDates?: Record<QuizCategory, Date | null>;
}

export function QuizCategoryCards({ onQuizComplete, userStreaks, lastQuizDates }: QuizCategoryCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);

  const canTakeQuiz = (category: QuizCategory) => {
    const lastDate = lastQuizDates?.[category];
    if (!lastDate) return true;
    
    const today = new Date().toDateString();
    return lastDate.toDateString() !== today;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const formatTimeLimit = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(categoryData).map(([key, data]) => {
          const category = key as QuizCategory;
          const IconComponent = data.icon;
          const streak = userStreaks?.[category] || 0;
          const canTake = canTakeQuiz(category);
          
          return (
            <Card 
              key={category} 
              className={`group relative overflow-hidden border-0 bg-gradient-to-br ${data.bgColor} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => canTake && setSelectedCategory(category)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Top Border */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${data.color}`} />
              
              {/* Floating Elements */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${data.gradient} shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <Badge className={`${getDifficultyColor(data.difficulty)} border font-semibold shadow-sm`}>
                    {formatDifficulty(data.difficulty)}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-foreground/90 mb-2">{data.title}</CardTitle>
                <CardDescription className="text-sm text-foreground/70 leading-relaxed">
                  {data.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-white/30">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground/80">Up to 25 coins</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-white/30">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-foreground/80">{formatTimeLimit(data.timeLimit)}</span>
                  </div>
                </div>
                
                {streak > 0 && (
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 font-semibold">
                      🔥 {streak} day streak
                    </Badge>
                  </div>
                )}
                
                <Button
                  onClick={() => setSelectedCategory(category)}
                  disabled={!canTake}
                  className={`w-full h-11 font-semibold transition-all duration-200 ${
                    canTake 
                      ? `bg-gradient-to-r ${data.gradient} hover:shadow-lg hover:shadow-${data.color.split('-')[1]}/25 text-white` 
                      : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {canTake ? (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Take Quiz
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Completed Today
                    </div>
                  )}
                </Button>
              </CardContent>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <EnhancedQuizModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory}
          onQuizComplete={(category, score, coinsEarned) => {
            onQuizComplete(category, score, coinsEarned);
            setSelectedCategory(null);
          }}
        />
      )}
    </>
  );
}
