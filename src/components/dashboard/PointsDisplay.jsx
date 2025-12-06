import React from 'react';
import { Trophy, Target, CheckCircle2 } from 'lucide-react';

export const PointsDisplay = ({ weeklyAverage, weeklyPoints, tasksCount }) => {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pontos Semanais */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-md hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Pontos da Semana</p>
            <p className="text-4xl font-bold text-gradient-primary">
              {weeklyPoints}
            </p>
          </div>
        </div>
      </div>

      {/* Média Semanal */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-md hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-secondary opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Target className="w-6 h-6 text-secondary-dark" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Média Semanal</p>
            <p className="text-4xl font-bold">
              {weeklyAverage}
              <span className="text-xl text-muted-foreground">/10</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tarefas Ativas */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-md hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Tarefas Ativas</p>
            <p className="text-4xl font-bold text-foreground">
              {tasksCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};