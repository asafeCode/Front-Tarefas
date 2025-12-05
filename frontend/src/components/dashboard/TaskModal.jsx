import React, { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export const TaskModal = ({ open, onClose, onSave, task, currentWeek }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weeklyGoal: 7,
    category: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        weeklyGoal: task.weeklyGoal || 7,
        category: task.category || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        weeklyGoal: 7,
        category: '',
      });
    }
  }, [task, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weeklyGoal' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (formData.weeklyGoal <= 0) {
      toast.error('A meta semanal deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const payload = {
        ...formData,
        startDate: now.toISOString().split('T')[0],
      };

      if (task?.id) {
        // Editar
        await taskAPI.update(task.id, payload);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        // Criar
        await taskAPI.create(payload);
        toast.success('Tarefa criada com sucesso!');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error(error.response?.data?.errors?.[0] || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Atualize as informações da tarefa' : `Crie uma nova tarefa para a Semana ${currentWeek}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Exercício físico"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva sua tarefa..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              name="category"
              placeholder="Ex: Saúde, Estudos, Trabalho"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyGoal">Meta Semanal *</Label>
            <Input
              id="weeklyGoal"
              name="weeklyGoal"
              type="number"
              min="1"
              placeholder="7"
              value={formData.weeklyGoal}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Quantas vezes você quer realizar esta tarefa na semana?
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              {loading ? 'Salvando...' : task ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};