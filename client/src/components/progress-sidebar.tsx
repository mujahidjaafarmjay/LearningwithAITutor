import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

export function ProgressSidebar() {
  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getProgress,
  });

  const recentTopics = progress.slice(0, 3);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-secondary';
    if (progress >= 60) return 'bg-accent';
    return 'bg-primary';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{item.topic}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.progress}%
                  </Badge>
                </div>
                <Progress 
                  value={item.progress} 
                  className={`h-2 ${getProgressColor(item.progress)}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTopics.map((topic) => (
              <div key={topic.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-3 ${getProgressColor(topic.progress)}`}></div>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{topic.topic}</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Last studied: {new Date(topic.lastStudied).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
