import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { taskAPI } from '../../services/api';
import { Header } from './Header';
import { WeekSelector } from './WeekSelector';
import { PointsDisplay } from './PointsDisplay';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({ average: 0, totalPoints: 0 });

  // Pegar semana atual (1-4 ou 5)
  function getCurrentWeek() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
  }

  // Carregar tarefas
  const loadTasks = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const response = await taskAPI.getAll({
        weekOfMonth: selectedWeek,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      
      const tasksData = Array.isArray(response.data) ? response.data : [];
      setTasks(tasksData);
      calculateWeeklyStats(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas da semana
  const calculateWeeklyStats = (tasksData) => {
    if (!tasksData || tasksData.length === 0) {
      setWeeklyStats({ average: 0, totalPoints: 0 });
      return;
    }

    let totalAverage = 0;
    let validTasks = 0;

    tasksData.forEach(task => {
      if (task.weeklyGoal > 0) {
        // Calcula a média individual da tarefa (0-10)
        const taskScore = (task.progress / task.weeklyGoal) * 10;
        totalAverage += Math.min(taskScore, 10);
        validTasks++;
      }
    });

    const weeklyAverage = validTasks > 0 ? totalAverage / validTasks : 0;
    const weeklyPoints = Math.round(weeklyAverage * 10); // Converte para pontos

    setWeeklyStats({
      average: parseFloat(weeklyAverage.toFixed(1)),
      totalPoints: weeklyPoints
    });
  };

  useEffect(() => {
    loadTasks();
  }, [selectedWeek]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      toast.success('Tarefa excluída com sucesso!');
      loadTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleIncrementProgress = async (taskId) => {
    try {
      await taskAPI.incrementProgress(taskId);
      loadTasks();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Meta já atingida!');
      } else {
        toast.error('Erro ao atualizar progresso');
      }
    }
  };

  const handleDecrementProgress = async (taskId) => {
    try {
      await taskAPI.decrementProgress(taskId);
      loadTasks();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Progresso já está em zero!');
      } else {
        toast.error('Erro ao atualizar progresso');
      }
    }
  };

  const handleSaveTask = async () => {
    setIsModalOpen(false);
    await loadTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Points Display */}
        <PointsDisplay 
          weeklyAverage={weeklyStats.average}
          weeklyPoints={weeklyStats.totalPoints}
          tasksCount={tasks.length}
        />

        {/* Week Selector */}
        <WeekSelector 
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          currentWeek={getCurrentWeek()}
        />

        {/* Add Task Button */}
        <div className="mb-6">
          <Button
            onClick={handleCreateTask}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-md"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onIncrement={handleIncrementProgress}
          onDecrement={handleDecrementProgress}
        />
      </main>

      {/* Task Modal */}
      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        currentWeek={selectedWeek}
      />
    </div>
  );
};

export default Dashboard;