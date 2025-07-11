import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, BarChart3, BookOpen, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">AI Tutor</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <Button 
                  variant={location === '/' ? 'default' : 'ghost'}
                  className="text-slate-600 hover:text-primary"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/progress">
                <Button 
                  variant={location === '/progress' ? 'default' : 'ghost'}
                  className="text-slate-600 hover:text-primary"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Progress
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button 
                  variant={location === '/quizzes' ? 'default' : 'ghost'}
                  className="text-slate-600 hover:text-primary"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Quizzes
                </Button>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-slate-200">
                      <User className="w-4 h-4 text-slate-600" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-700 font-medium hidden sm:block">
                    {user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
