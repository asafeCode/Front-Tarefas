import React from 'react';
import { TaskCard } from './TaskCard';
import { Loader2, ListTodo } from 'lucide-react';

export const TaskList = ({ tasks, loading, onEdit, onDelete, onIncrement, onDecrement }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-12 text-center border border-border shadow-sm">
        <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Nenhuma tarefa ainda</h3>
        <p className="text-muted-foreground">
          Crie sua primeira tarefa para começar a pontuar!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id || task.Id || `task-${index}`}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ))}
    </div>
  );
};