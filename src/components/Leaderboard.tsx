import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { Crown, Medal, Trophy, TrendingUp, Coins, ChevronLeft, ChevronRight } from "lucide-react";

type LeaderboardProps = {
  users: UserData[];
  currentUserId?: string;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-accent drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-primary/70 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" />;
  return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground";
  if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-300 text-white";
  if (rank === 3) return "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white";
  if (rank <= 10) return "bg-secondary/80 text-muted-foreground";
};

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Get current leaderboard items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when users change
  useEffect(() => {
    setCurrentPage(1);
  }, [users]);
  return (
    <Card className="xl:col-span-2 group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="relative">
            <Trophy className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping opacity-75"></div>
          </div>
          Leaderboard
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          See who is at the top of their game. Keep climbing to reach the top! 🏆
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-1/4 font-semibold text-foreground/80">Rank</TableHead>
              <TableHead className="w-1/2 font-semibold text-foreground/80">Player</TableHead>
              <TableHead className="w-1/4 text-right font-semibold text-foreground/80">Coins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow 
                key={`${user.uid}-${index}`} 
                className={`transition-all duration-200 hover:bg-primary/5 ${
                  user.uid === currentUserId 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-l-primary" 
                    : ""
                }`}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentPage === 1 ? getRankBadge(index + 1) : "bg-secondary/50 text-muted-foreground"} shadow-lg`}>
                      {currentPage === 1 ? getRankIcon(index + 1) : (
                        <span className="text-sm font-bold text-muted-foreground">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-200 bg-gradient-to-br from-primary/20 to-accent/20">
                      <span className="text-foreground font-semibold text-xl select-none">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground/90 truncate">{user.displayName}</span>
                      {user.uid === currentUserId && (
                        <Badge variant="secondary" className="w-fit text-xs bg-primary/20 text-primary border-primary/30">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground/90">{user.coins.toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination and Top Score */}
        <div className="mt-4">
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-1">
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-accent" />
            <span>Top Score: {users[0]?.coins.toLocaleString() || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
