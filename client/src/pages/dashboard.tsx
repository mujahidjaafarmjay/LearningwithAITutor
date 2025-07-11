import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api';
import { Navigation } from '@/components/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { QuizSection } from '@/components/quiz-section';
import { ProgressSidebar } from '@/components/progress-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Flame, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: progressApi.getStats,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProgressSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
          </div>
          
          {/* Quiz Section */}
          <div className="mt-8">
            <QuizSection />
          </div>
          
          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Topics Learned</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {isLoadingStats ? '...' : stats?.topicsLearned || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Average Score</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {isLoadingStats ? '...' : `${stats?.averageScore || 0}%`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Study Streak</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {isLoadingStats ? '...' : `${stats?.studyStreak || 0} days`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <div className="w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
