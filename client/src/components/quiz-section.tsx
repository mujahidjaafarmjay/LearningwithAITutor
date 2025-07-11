import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trophy, BookOpen, CheckCircle } from 'lucide-react';

export function QuizSection() {
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizApi.getQuizzes,
  });

  const { data: currentQuiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', selectedQuizId],
    queryFn: () => quizApi.getQuiz(selectedQuizId!),
    enabled: !!selectedQuizId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: ({ quizId, answers }: { quizId: number; answers: number[] }) =>
      quizApi.submitQuiz(quizId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowResult(true);
    },
  });

  const handleStartQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Submit quiz
      submitQuizMutation.mutate({
        quizId: selectedQuizId!,
        answers: newAnswers,
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleBackToQuizList = () => {
    setSelectedQuizId(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (isLoadingQuizzes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Loading Quizzes...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResult && submitQuizMutation.data) {
    const { score, totalQuestions } = submitQuizMutation.data;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-secondary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Score: {score}/{totalQuestions}
              </h3>
              <p className="text-slate-600">
                You scored {percentage}% on this quiz!
              </p>
            </div>
            <Button onClick={handleBackToQuizList} className="w-full">
              Back to Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentQuiz && !showResult) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentQuiz.title}</CardTitle>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-800">
              {currentQuestion.question}
            </h3>
            
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || submitQuizMutation.isPending}
              >
                {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Submit' : 'Next Question'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Practice Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => handleStartQuiz(quiz.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">{quiz.title}</h3>
                  <p className="text-sm text-slate-600">{quiz.topic}</p>
                </div>
                <Badge variant="outline">
                  {quiz.questions.length} Questions
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
