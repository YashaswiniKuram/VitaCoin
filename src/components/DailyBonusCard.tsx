import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Flame, Sparkles, Zap } from "lucide-react";

type DailyBonusCardProps = {
  onClaim: () => void;
  canClaim: boolean;
  loading: boolean;
  streak?: number;
};

export function DailyBonusCard({ onClaim, canClaim, loading, streak = 0 }: DailyBonusCardProps) {
  const bonusAmount = 100 + (streak * 5);
  
  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating Elements */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
      </div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="relative">
            <Gift className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
          Daily Bonus
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Come back every day to claim your reward.
          {streak > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Flame className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm font-semibold text-accent">
                {streak} day streak! 🔥
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold font-headline text-foreground/90 mb-1">
            {bonusAmount} Coins
          </div>
          {streak > 0 && (
            <div className="text-xs text-muted-foreground">
              +{streak * 5} bonus from streak
            </div>
          )}
        </div>
        
        <Button
          onClick={onClaim}
          disabled={!canClaim || loading}
          className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
            canClaim 
              ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 animate-glow' 
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Claiming...
            </div>
          ) : canClaim ? (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Claim {bonusAmount} Coins
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Claimed Today
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
