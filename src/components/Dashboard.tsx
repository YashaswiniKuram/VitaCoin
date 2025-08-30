"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserData, Transaction, QuizCategory } from '@/lib/types';
import {
  getUserData,
  getLeaderboard,
  getTransactions,
  claimDailyBonus as claimBonusAction,
  checkLeaderboardChanges,
} from '@/lib/firebase';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { DailyBonusCard } from '@/components/DailyBonusCard';
import { Leaderboard } from '@/components/Leaderboard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { QuizCategoryCards } from '@/components/QuizCategoryCards';
import { BadgeStore } from '@/components/BadgeStore';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CoinAnalytics } from '@/components/CoinAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const data = await getUserData(user.uid);
        setUserData(data);
        const leaders = await getLeaderboard(1000); // Get more users for accurate ranking
        setLeaderboard(leaders);
        
        // Calculate user's rank
        if (data) {
          const userWithRank = leaders.findIndex(u => u.uid === user.uid);
          setUserRank(userWithRank !== -1 ? userWithRank + 1 : null);
        }
        const userTransactions = await getTransactions(user.uid);
        setTransactions(userTransactions);
        
        // Check for leaderboard changes
        await checkLeaderboardChanges();
      };
      fetchData();
    }
  }, [user]);

  const canClaimBonus = () => {
    if (!userData?.lastBonusClaimed) return true;
    const lastClaimDate = userData.lastBonusClaimed.toDate();
    const today = new Date();
    return lastClaimDate.toDateString() !== today.toDateString();
  };

  const handleClaimBonus = async () => {
    if (!user || !canClaimBonus()) return;
    setClaimLoading(true);
    try {
      await claimBonusAction(user.uid);
      const updatedUserData = await getUserData(user.uid);
      const updatedTransactions = await getTransactions(user.uid);
      setUserData(updatedUserData);
      setTransactions(updatedTransactions);
      toast({
        title: "Daily Bonus Claimed!",
        description: "You've received 100 coins.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim daily bonus. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleQuizComplete = async (category: QuizCategory, score: number, coinsEarned: number) => {
    if (!user) return;
    
    try {
      const updatedUserData = await getUserData(user.uid);
      const updatedTransactions = await getTransactions(user.uid);
      const updatedLeaderboard = await getLeaderboard();
      
      setUserData(updatedUserData);
      setTransactions(updatedTransactions);
      setLeaderboard(updatedLeaderboard);
      
      toast({
        title: "Quiz Complete!",
        description: `You scored ${score}% and earned ${coinsEarned} coins!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update data. Please refresh the page.",
        variant: 'destructive',
      });
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex flex-col space-y-6 items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-3 text-center">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Header user={userData} />
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold font-headline text-foreground/90 mb-2">
            Welcome back, {userData.displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to earn more coins and climb the leaderboard?
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Badges
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8 mt-8">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <BalanceCard balance={userData.coins} rank={userRank} />
              <DailyBonusCard 
                onClaim={handleClaimBonus} 
                canClaim={canClaimBonus()} 
                loading={claimLoading}
                streak={userData.loginStreak}
              />
            </div>
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Leaderboard users={leaderboard} currentUserId={user?.uid} />
              <TransactionHistory transactions={transactions} />
            </div>
          </TabsContent>
          
          <TabsContent value="quizzes" className="space-y-8 mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline text-foreground/90 mb-2">
                Test Your Knowledge 🧠
              </h2>
              <p className="text-muted-foreground">
                Choose a category and start earning coins with every quiz!
              </p>
            </div>
            <QuizCategoryCards 
              onQuizComplete={handleQuizComplete}
              userStreaks={userData.quizStreaks || {
                math: 0,
                aptitude: 0,
                grammar: 0,
                programming: 0
              }}
              lastQuizDates={userData.lastQuizDates ? {
                math: userData.lastQuizDates.math?.toDate() || null,
                aptitude: userData.lastQuizDates.aptitude?.toDate() || null,
                grammar: userData.lastQuizDates.grammar?.toDate() || null,
                programming: userData.lastQuizDates.programming?.toDate() || null
              } : {
                math: null,
                aptitude: null,
                grammar: null,
                programming: null
              }}
            />
          </TabsContent>
          
          <TabsContent value="badges" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline text-foreground/90 mb-2">
                Collect Badges 🏆
              </h2>
              <p className="text-muted-foreground">
                Unlock achievements and show off your progress!
              </p>
            </div>
            <BadgeStore />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline text-foreground/90 mb-2">
                Your Progress 📊
              </h2>
              <p className="text-muted-foreground">
                Track your coin earnings and quiz performance over time.
              </p>
            </div>
            <CoinAnalytics />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline text-foreground/90 mb-2">
                Stay Updated 🔔
              </h2>
              <p className="text-muted-foreground">
                Never miss important updates and achievements.
              </p>
            </div>
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
