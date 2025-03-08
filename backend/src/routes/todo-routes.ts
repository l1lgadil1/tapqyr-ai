import { Router } from 'express';
import { TodoController } from '../controllers/todo-controller';

const todoRouter = Router();
const todoController = new TodoController();

// Get all todos
todoRouter.get('/', todoController.getAllTodos);

// Get a todo by ID
todoRouter.get('/:id', todoController.getTodoById);

// Create a new todo
todoRouter.post('/', todoController.createTodo);

// Update an existing todo
todoRouter.put('/:id', todoController.updateTodo);

// Delete a todo
todoRouter.delete('/:id', todoController.deleteTodo);

// Toggle todo completion status
todoRouter.patch('/:id/toggle', todoController.toggleTodoCompletion);

// Generate AI todos
todoRouter.post('/ai/generate', todoController.generateAITodos);

export default todoRouter; 