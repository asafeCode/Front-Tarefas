import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../../services/api';
import { Header } from '../dashboard/Header';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadMonthlyHistory();
  }, [selectedMonth, selectedYear]);

  const loadMonthlyHistory = async () => {
    try {
      setLoading(true);
      const weeks = [1, 2, 3, 4, 5];
      const weeklyData = [];

      for (const week of weeks) {
        try {
          const response = await taskAPI.getAll({
            weekOfMonth: week,
            month: selectedMonth,
            year: selectedYear
          });

          const tasks = Array.isArray(response.data) ? response.data : [];
          const stats = calculateWeekStats(tasks);
          
          weeklyData.push({
            week,
            tasks: tasks.length,
            ...stats
          });
        } catch (error) {
          weeklyData.push({
            week,
            tasks: 0,
            average: 0,
            points: 0
          });
        }
      }

      setMonthlyData(weeklyData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekStats = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return { average: 0, points: 0 };
    }

    let totalAverage = 0;
    let validTasks = 0;

    tasks.forEach(task => {
      if (task.weeklyGoal > 0) {
        const taskScore = (task.progress / task.weeklyGoal) * 10;
        totalAverage += Math.min(taskScore, 10);
        validTasks++;
      }
    });

    const weeklyAverage = validTasks > 0 ? totalAverage / validTasks : 0;
    const weeklyPoints = Math.round(weeklyAverage * 10);

    return {
      average: parseFloat(weeklyAverage.toFixed(1)),
      points: weeklyPoints
    };
  };

  const calculateMonthlyAverage = () => {
    const validWeeks = monthlyData.filter(w => w.tasks > 0);
    if (validWeeks.length === 0) return 0;
    
    const total = validWeeks.reduce((sum, w) => sum + w.average, 0);
    return (total / validWeeks.length).toFixed(1);
  };

  const calculateMonthlyPoints = () => {
    return monthlyData.reduce((sum, w) => sum + w.points, 0);
  };

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient-primary">
            Histórico
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso ao longo do tempo
          </p>
        </div>

        {/* Monthly Summary */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-md mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold capitalize">
              {monthName} {selectedYear}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pontos do Mês</p>
              <p className="text-3xl font-bold text-gradient-primary">
                {calculateMonthlyPoints()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
              <p className="text-3xl font-bold">
                {calculateMonthlyAverage()}
                <span className="text-lg text-muted-foreground">/10</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Semanas Ativas</p>
              <p className="text-3xl font-bold">
                {monthlyData.filter(w => w.tasks > 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Desempenho Semanal
          </h3>
          
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="grid gap-3">
              {monthlyData.map((weekData) => (
                <div
                  key={weekData.week}
                  className="bg-card rounded-xl p-5 border border-border shadow-sm hover-lift cursor-pointer transition-all"
                  onClick={() => {
                    navigate('/dashboard');
                    // Note: Você precisaria passar a semana como state se quisesse selecionar automaticamente
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground font-medium">
                          Semana {weekData.week}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {weekData.tasks} {weekData.tasks === 1 ? 'tarefa' : 'tarefas'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-0.5">Pontos</p>
                        <p className="text-2xl font-bold text-gradient-primary">
                          {weekData.points}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-0.5">Média</p>
                        <p className="text-2xl font-bold">
                          {weekData.average}
                          <span className="text-sm text-muted-foreground">/10</span>
                        </p>
                      </div>

                      {weekData.average >= 8 && weekData.tasks > 0 && (
                        <Badge className="bg-success text-success-foreground">
                          Excelente!
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;