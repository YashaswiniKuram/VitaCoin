"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Sparkles } from "lucide-react";

type BalanceCardProps = {
  balance: number;
  rank?: number | null;
};

export function BalanceCard({ balance, rank }: BalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60 fps
    const totalFrames = Math.round(animationDuration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentBalance = Math.round(balance * progress);
      setDisplayBalance(currentBalance);

      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayBalance(balance);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [balance]);

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating Elements */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground/80">Your Balance</CardTitle>
        <div className="relative">
          <Coins className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping opacity-75"></div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-3xl font-bold font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {displayBalance.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground"> coins</span>
            {rank !== null && rank !== undefined && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Rank: {rank}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span>Keep up the great work!</span>
        </div>
      </CardContent>
    </Card>
  );
}
