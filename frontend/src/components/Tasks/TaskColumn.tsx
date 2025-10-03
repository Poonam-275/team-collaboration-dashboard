import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Paper, Typography, Box } from '@mui/material';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  color,
}) => {
  return (
    <Paper
      sx={{
        minWidth: 300,
        backgroundColor: color,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        {title} ({tasks.length})
      </Typography>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flexGrow: 1,
              minHeight: 200,
              backgroundColor: snapshot.isDraggingOver ? '#e0e0e0' : 'transparent',
              borderRadius: 1,
              p: 1,
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};
