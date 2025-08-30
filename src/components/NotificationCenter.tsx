"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/lib/types';
import { getNotifications, markNotificationAsRead } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Award, TrendingUp, AlertTriangle, Calendar, Check, Sparkles, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  leaderboard: TrendingUp,
  penalty: AlertTriangle,
  achievement: Award,
  reminder: Calendar
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const notificationData = await getNotifications(user.uid);
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationAsRead(user.uid, notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="relative">
            <Bell className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Stay updated with your VitaCoin activities and achievements! 🔔
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <ScrollArea className="h-96">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notification => {
                const IconComponent = iconMap[notification.type] || Bell;
                
                return (
                  <div
                    key={notification.id}
                    className={`group/item p-4 border-0 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      notification.read 
                        ? 'bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30' 
                        : 'bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-l-primary shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        notification.type === 'achievement' ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-600' :
                        notification.type === 'leaderboard' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600' :
                        notification.type === 'penalty' ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-600' :
                        'bg-gradient-to-br from-gray-500/20 to-gray-600/20 text-gray-600'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-foreground/90">{notification.title}</h4>
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-7 px-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70 leading-relaxed">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">No notifications yet</p>
              <p className="text-sm text-muted-foreground">Complete quizzes and earn achievements to get notifications!</p>
            </div>
          )}
        </ScrollArea>
        
        {/* Quick Actions */}
        {notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total Notifications: {notifications.length}</span>
              <span className="text-accent font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up! 🎉'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
