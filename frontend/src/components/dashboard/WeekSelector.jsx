import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export const WeekSelector = ({ selectedWeek, onWeekChange, currentWeek }) => {
  const weeks = [1, 2, 3, 4, 5];
  const now = new Date();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {now.getFullYear()}
        </h2>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {weeks.map((week) => {
          const isSelected = week === selectedWeek;
          const isCurrent = week === currentWeek;
          
          return (
            <Button
              key={week}
              onClick={() => onWeekChange(week)}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "relative font-semibold transition-all",
                isSelected && "bg-gradient-primary text-primary-foreground border-0 shadow-md",
                !isSelected && "hover:bg-muted"
              )}
            >
              Semana {week}
              {isCurrent && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-background"></span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};