import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="AddTaskModal" 
        options={{ 
          presentation: 'modal',
          title: 'Add Task'
        }} 
      />
      <Stack.Screen 
        name="TaskDetailModal" 
        options={{ 
          presentation: 'modal',
          title: 'Task Details'
        }} 
      />
    </Stack>
  );
}
