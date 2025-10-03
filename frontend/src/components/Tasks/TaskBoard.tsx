import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Box, Paper, Typography } from '@mui/material';
import { useTasks, useUpdateTask } from '../../services/taskService';
import { TaskColumn } from './TaskColumn';
import { Task, TaskStatus } from '../../types';

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: '#f0f0f0' },
  { status: 'in_progress', title: 'In Progress', color: '#e3f2fd' },
  { status: 'review', title: 'Review', color: '#fff3e0' },
  { status: 'done', title: 'Done', color: '#e8f5e8' },
];

export const TaskBoard: React.FC = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (isLoading) {
    return <Typography>Loading tasks...</Typography>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', py: 2 }}>
        {columns.map((column) => {
          const columnTasks = tasks.filter((task: Task) => task.status === column.status);
          
          return (
            <TaskColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={columnTasks}
              color={column.color}
            />
          );
        })}
      </Box>
    </DragDropContext>
  );
};
