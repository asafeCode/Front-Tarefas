import React from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Edit, Trash2, Plus, Minus } from 'lucide-react';
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
import { Badge } from '../ui/badge';

export const TaskCard = ({ task, onEdit, onDelete, onIncrement, onDecrement }) => {
  const progressPercentage = (task.progress / task.weeklyGoal) * 100;
  const isCompleted = task.progress >= task.weeklyGoal;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover-lift transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{task.title}</h3>
          {task.category && (
            <Badge variant="outline" className="text-xs">
              {task.category}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
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
                  onClick={() => onDelete(task.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progresso</span>
          <span className="text-sm font-bold">
            {task.progress}/{task.weeklyGoal}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">Nota da Tarefa</span>
        <span className="text-xl font-bold text-gradient-primary">
          {((task.progress / task.weeklyGoal) * 10).toFixed(1)}/10
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onDecrement(task.id)}
          variant="outline"
          size="sm"
          disabled={task.progress === 0}
          className="flex-1"
        >
          <Minus className="w-4 h-4 mr-1" />
          Diminuir
        </Button>
        <Button
          onClick={() => onIncrement(task.id)}
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
  );
};