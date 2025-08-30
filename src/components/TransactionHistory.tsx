import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/types";
import { History, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Coins, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

type TransactionHistoryProps = {
  transactions: Transaction[];
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Get current transactions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  const totalCredits = transactions
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalDebits = transactions
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Card className="group relative h-full flex flex-col overflow-hidden border-0 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="relative">
            <History className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
          Transaction History
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          A detailed log of your recent coin activity and earnings.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex-1 flex flex-col p-0">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Total Earned</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {transactions
                .filter(tx => tx.type === 'credit')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Quizzes: {transactions
                .filter(tx => tx.type === 'credit' && tx.category === 'quiz')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Bonuses: {transactions
                .filter(tx => tx.type === 'credit' && tx.category === 'bonus')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-muted-foreground">Total Spent</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              {transactions
                .filter(tx => tx.type === 'debit')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Badges: {transactions
                .filter(tx => tx.type === 'debit' && tx.category === 'badge')
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                .toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Penalties</span>
            </div>
            <div className="text-lg font-bold text-amber-600">
              {transactions
                .filter(tx => tx.type === 'debit' && tx.category === 'penalty')
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {transactions.filter(tx => tx.category === 'penalty').length} incidents
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pr-1">
          {currentTransactions.map((transaction, index) => (
              <div key={transaction.id} className="group/item">
                <div className="flex items-center gap-4 py-3 px-2 rounded-lg transition-all duration-200 hover:bg-secondary/50 group-hover/item:bg-secondary/30">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'credit' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUpCircle className="h-5 w-5" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-semibold leading-none text-foreground/90">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {formatDistanceToNow(transaction.timestamp.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className={`font-bold text-lg ${
                    transaction.type === 'credit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()}
                  </div>
                </div>
                {index < currentTransactions.length - 1 && (
                  <Separator className="mx-2 bg-border/50" />
                )}
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-1">
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
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
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
          )}
      </CardContent>
    </Card>
  );
}
