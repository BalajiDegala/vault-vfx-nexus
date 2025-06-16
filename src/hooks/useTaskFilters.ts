
import { useState, useMemo } from 'react';
import { Database } from '@/integrations/supabase/types';

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface UseTaskFiltersResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  filteredTasks: Task[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export const useTaskFilters = (tasks: Task[]): UseTaskFiltersResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      // Type filter
      const matchesType = typeFilter === 'all' || task.task_type === typeFilter;

      // Assignee filter
      const matchesAssignee = assigneeFilter === 'all' || 
        (assigneeFilter === 'assigned' && task.assigned_to) ||
        (assigneeFilter === 'unassigned' && !task.assigned_to);

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAssignee;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, typeFilter, assigneeFilter]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || 
           statusFilter !== 'all' || 
           priorityFilter !== 'all' || 
           typeFilter !== 'all' || 
           assigneeFilter !== 'all';
  }, [searchTerm, statusFilter, priorityFilter, typeFilter, assigneeFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setAssigneeFilter('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    assigneeFilter,
    setAssigneeFilter,
    filteredTasks,
    hasActiveFilters,
    clearFilters
  };
};
