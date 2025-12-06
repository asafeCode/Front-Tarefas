import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Edit, Trash2, Plus, Minus, Info, Calendar, Target, TrendingUp, Tag, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { taskAPI } from '../../services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';

export const TaskCard = ({ task, onEdit, onDelete, onIncrement, onDecrement }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [fullTaskData, setFullTaskData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Função auxiliar para buscar valor em múltiplas variações de nomes
  const getField = (obj, variations, defaultValue = '') => {
    if (!obj) return defaultValue;
    
    for (const variation of variations) {
      const value = obj[variation];
      // Aceitar qualquer valor exceto undefined e null (incluindo strings vazias para mostrar)
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return defaultValue;
  };

  // Dados básicos da tarefa (do card)
  const taskData = {
    title: task.title || "Sem título",
    description: task.description || "",
    weeklyGoal: Number(task.weeklyGoal) || 0,
    progress: Number(task.progress) || 0,
    category: task.category || "",
    startDate: task.startDate || "",
    weekOfMonth: Number(task.weekOfMonth) || 0,
    isCompleted: Boolean(task.isCompleted)
  };

  // Buscar detalhes completos da tarefa quando o diálogo abrir
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!isDetailsOpen) {
        setFullTaskData(null);
        return;
      }

      const taskId = task.id || task.Id;
      if (!taskId) {
        console.warn('Task ID não encontrado para buscar detalhes');
        return;
      }

      setLoadingDetails(true);
      try {
        const response = await taskAPI.getById(taskId);
        const fullData = response.data;
        console.log('Full task details from API:', fullData);
        
        // Processar os dados completos com a mesma lógica
        const processedFullData = {
          title: fullData.title || "Sem título",
          description: fullData.description || "",
          weeklyGoal: Number(fullData.weeklyGoal) || 0,
          progress: Number(fullData.progress) || 0,
          category: fullData.category || "",
          startDate: fullData.startDate || "",
          weekOfMonth: Number(fullData.weekOfMonth) || 0,
          isCompleted: Boolean(fullData.isCompleted)
        };
        
        console.log('Processed full task data:', processedFullData);
        setFullTaskData(processedFullData);
      } catch (error) {
        console.error('Erro ao buscar detalhes da tarefa:', error);
        // Se falhar, usar os dados básicos que já temos
        setFullTaskData(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchTaskDetails();
  }, [isDetailsOpen, task]);

  // Usar dados completos se disponíveis, senão usar dados básicos
  const displayData = fullTaskData || taskData;

  // Calcular se está completo baseado no progresso ou no campo isCompleted
  const isCompleted = displayData.isCompleted || (displayData.weeklyGoal > 0 && displayData.progress >= displayData.weeklyGoal);
  const progressPercentage = displayData.weeklyGoal > 0 ? (displayData.progress / displayData.weeklyGoal) * 100 : 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    try {
      let date;
      
      // Se for uma string no formato YYYY-MM-DD (DateOnly do C#)
      if (typeof dateString === 'string') {
        // Tenta diferentes formatos
        if (dateString.includes('-')) {
          const parts = dateString.split('-');
          if (parts.length === 3) {
            const [year, month, day] = parts;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            date = new Date(dateString);
          }
        } else if (dateString.includes('/')) {
          // Formato DD/MM/YYYY
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            date = new Date(dateString);
          }
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return dateString; // Retornar o valor original se não for uma data válida
      }
      
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return dateString || 'Não definida';
    }
  };

  return (
    <>
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover-lift transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 line-clamp-1">{taskData.title}</h3>
            {taskData.category && (
              <Badge variant="outline" className="text-xs">
                {taskData.category}
              </Badge>
            )}
          </div>
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Info className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold flex items-center gap-2">
                  <Info className="w-6 h-6 text-primary" />
                  {displayData.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Detalhes completos da tarefa
                </DialogDescription>
              </DialogHeader>
              
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Carregando detalhes...</span>
                </div>
              ) : (
              <div className="space-y-6 py-4">
                {/* 1. Title */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Título
                      </label>
                      <p className="mt-1 text-base font-semibold">{displayData.title}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Description */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                        Descrição
                      </label>
                      {displayData.description && displayData.description.trim() !== '' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayData.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Sem descrição</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid para campos numéricos e outros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 3. WeeklyGoal */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Meta Semanal
                        </label>
                        <p className="mt-1 text-2xl font-bold text-primary">{displayData.weeklyGoal}</p>
                        <p className="text-xs text-muted-foreground">unidades por semana</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Progress */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Progresso
                        </label>
                        <p className="mt-1 text-2xl font-bold text-primary">{displayData.progress}</p>
                        <p className="text-xs text-muted-foreground">de {displayData.weeklyGoal} unidades</p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Category */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Categoria
                        </label>
                        <div className="mt-1">
                          {displayData.category ? (
                            <Badge variant="outline" className="text-sm">{displayData.category}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Não definida</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. StartDate */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Data de Início
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {displayData.startDate && displayData.startDate.trim() !== '' ? (
                            formatDate(displayData.startDate)
                          ) : (
                            <span className="text-muted-foreground italic">Não definida</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 7. WeekOfMonth */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Semana do Mês
                        </label>
                        <p className="mt-1 text-2xl font-bold text-primary">
                          {displayData.weekOfMonth || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 8. IsCompleted */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {displayData.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Status de Conclusão
                        </label>
                        <div className="mt-1">
                          {displayData.isCompleted ? (
                            <Badge className="bg-success text-success-foreground">
                              Concluída 🎯
                            </Badge>
                          ) : (
                            <Badge variant="outline">Em andamento</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progresso Visual (informação adicional) */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Progresso Visual
                    </label>
                    <span className="text-sm font-bold">
                      {displayData.progress}/{displayData.weeklyGoal} ({progressPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nota da Tarefa</span>
                    <span className="text-2xl font-bold text-gradient-primary">
                      {displayData.weeklyGoal > 0 ? ((displayData.progress / displayData.weeklyGoal) * 10).toFixed(1) : '0.0'}/10
                    </span>
                  </div>
                </div>
              </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onEdit(displayData);
                  }}
                  className="flex-1 sm:flex-initial"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-initial"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A tarefa será permanentemente excluída.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setIsDetailsOpen(false);
                          onDelete(task.id || task.Id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      {/* Description */}
      {taskData.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {taskData.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progresso</span>
          <span className="text-sm font-bold">
            {taskData.progress}/{taskData.weeklyGoal}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">Nota da Tarefa</span>
        <span className="text-xl font-bold text-gradient-primary">
          {taskData.weeklyGoal > 0 ? ((taskData.progress / taskData.weeklyGoal) * 10).toFixed(1) : '0.0'}/10
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onDecrement(task.id || task.Id)}
          variant="outline"
          size="sm"
          disabled={taskData.progress === 0}
          className="flex-1"
        >
          <Minus className="w-4 h-4 mr-1" />
          Diminuir
        </Button>
        <Button
          onClick={() => onIncrement(task.id || task.Id)}
          variant="default"
          size="sm"
          disabled={isCompleted}
          className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          Aumentar
        </Button>
      </div>

      {isCompleted && (
        <div className="mt-3 text-center">
          <Badge className="bg-success text-success-foreground">
            Meta Atingida! 🎯
          </Badge>
        </div>
      )}
    </div>
    </>
  );
};