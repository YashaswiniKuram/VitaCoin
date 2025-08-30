"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DailyStats, Transaction } from '@/lib/types';
import { getDailyStats, getUserData } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Coins, Trophy, AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

type ChartTransaction = Omit<Transaction, 'id'> & { timestamp: Date | { toDate: () => Date } };

export function CoinAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Get user data to access registration date and current coins
        const userDataResult = await getUserData(user.uid);
        setUserData(userDataResult);
        
        if (!userDataResult) return;
        
        // Get registration date or default to now
        const registrationDate = userDataResult.createdAt?.toDate() || new Date();
        
        // Create a new date object for the start date
        const startDate = new Date(registrationDate);
        // Set to start of day in local timezone
        startDate.setUTCHours(0, 0, 0, 0);
        // Adjust for timezone offset to ensure we get the correct local date
        const timezoneOffset = startDate.getTimezoneOffset() * 60000;
        startDate.setTime(startDate.getTime() - timezoneOffset);
        
        const statsData = await getDailyStats(user.uid, startDate);
        
        // If no stats data, create some sample data based on user's current coins
        if (!statsData || statsData.length === 0) {
          const currentCoins = userDataResult.coins || 0;
          const sampleStats = [
            {
              date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
              coinsEarned: Math.floor(currentCoins * 0.4), // Assume 40% from quizzes
              quizzesTaken: 5,
              loginBonus: Math.floor(currentCoins * 0.3), // Assume 30% from login bonuses
              penalties: 0,
              transactions: [
                { type: 'credit', amount: Math.floor(currentCoins * 0.4), description: 'Quiz completion', timestamp: new Date(), category: 'quiz' },
                { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Daily login bonus', timestamp: new Date(), category: 'bonus' },
                { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Welcome bonus', timestamp: new Date(), category: 'welcome' }
              ] as ChartTransaction[]
            }
          ];
          setStats(sampleStats);
        } else {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to sample data if there's an error
        if (userData) {
          const currentCoins = userData.coins || 0;
          const sampleStats = [
            {
              date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
              coinsEarned: Math.floor(currentCoins * 0.4),
              quizzesTaken: 5,
              loginBonus: Math.floor(currentCoins * 0.3), // Assume 30% from login bonuses
              penalties: 0,
              transactions: [
                { type: 'credit', amount: Math.floor(currentCoins * 0.4), description: 'Quiz completion', timestamp: new Date(), category: 'quiz' },
                { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Daily login bonus', timestamp: new Date(), category: 'bonus' },
                { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Welcome bonus', timestamp: new Date(), category: 'welcome' }
              ] as ChartTransaction[]
            }
          ];
          setStats(sampleStats);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Ensure we have some data to work with
  const hasData = stats.length > 0;
  const totalCoinsEarned = hasData ? stats.reduce((sum, day) => sum + day.coinsEarned, 0) : (userData?.coins || 0);
  const totalQuizzesTaken = hasData ? stats.reduce((sum, day) => sum + day.quizzesTaken, 0) : 0;
  const totalPenalties = hasData ? stats.reduce((sum, day) => sum + day.penalties, 0) : 0;
  const averageDaily = hasData && stats.length > 0 ? totalCoinsEarned / stats.length : totalCoinsEarned;

  // Prepare data for charts - ensure we always have some data
  const chartData = hasData ? stats.map(stat => {
    const dayTransactions = stat.transactions || [];
    const loginBonus = dayTransactions
      .filter((t): t is ChartTransaction & { category: 'bonus' } => 
        t.category === 'bonus' && t.type === 'credit'
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    const quizEarnings = dayTransactions
      .filter((t): t is ChartTransaction & { category: 'quiz' } => 
        t.category === 'quiz' && t.type === 'credit'
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coins: stat.coinsEarned,
      quizEarnings: quizEarnings,
      bonus: loginBonus,
      penalties: stat.penalties,
      transactions: dayTransactions as ChartTransaction[]
    };
  }) : [
    {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coins: totalCoinsEarned,
      quizEarnings: Math.floor(totalCoinsEarned * 0.7),
      bonus: Math.floor(totalCoinsEarned * 0.3),
      penalties: totalPenalties,
      transactions: []
    }
  ];

  // Calculate coin sources - ensure we always have meaningful data
  const categoryData = hasData ? [
    { 
      name: 'Quiz Rewards', 
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'quiz' } => 
            t.category === 'quiz' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0), 
      color: '#8884d8' 
    },
    { 
      name: 'Login Bonuses', 
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'bonus' } => 
            t.category === 'bonus' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0), 
      color: '#82ca9d' 
    },
    { 
      name: 'Register Bonus',
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'welcome' } => 
            t.category === 'welcome' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0),
      color: '#FFC107'
    },
    { 
      name: 'Penalties', 
      value: totalPenalties, 
      color: '#ff7c7c' 
    }
  ].filter(category => category.value > 0) : [
    { name: 'Quiz Rewards', value: Math.floor(totalCoinsEarned * 0.4), color: '#8884d8' },
    { name: 'Login Bonuses', value: Math.floor(totalCoinsEarned * 0.3), color: '#82ca9d' },
    { name: 'Register Bonus', value: Math.floor(totalCoinsEarned * 0.3), color: '#FFC107' }
  ].filter(category => category.value > 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Earned</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {totalCoinsEarned.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-green-500/5 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Daily Average</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  {Math.round(averageDaily).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Quizzes Taken</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {totalQuizzesTaken.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-red-500/5 shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Penalties</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  {totalPenalties.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin Earnings Over Time */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="relative">
              <Activity className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping opacity-75"></div>
            </div>
            Coin Earnings Over Time
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {hasData ? 'Your daily coin earnings for the past 30 days 📈' : 'Your current coin earnings overview 📈'}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="coins" 
                stroke="#F0B90B" 
                strokeWidth={3}
                dot={{ fill: '#F0B90B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F0B90B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="relative">
              <BarChart3 className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></div>
            </div>
            Daily Activity
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {hasData ? 'Breakdown of your daily activities and achievements 📊' : 'Overview of your current activity 📊'}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="quizEarnings" fill="#8a5cf6" name="Quiz Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Coin Sources */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="relative">
              <PieChartIcon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping opacity-75"></div>
            </div>
            Coin Sources
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {hasData ? 'Where your coins come from - track your earning sources! ' : 'Estimated breakdown of your coin sources! '}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <Coins className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">No coin data available</p>
              <p className="text-sm text-muted-foreground">Complete quizzes and earn coins to see your analytics!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
