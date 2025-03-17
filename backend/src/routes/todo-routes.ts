import { Router } from 'express';
import { TodoController } from '../controllers/todo-controller';

const todoRouter = Router();
const todoController = new TodoController();

// Get all todos
todoRouter.get('/', todoController.getAllTodos);

// Get today's todos
todoRouter.get('/today', todoController.getTodayTodos);

// Get upcoming todos
todoRouter.get('/upcoming', todoController.getUpcomingTodos);

// Get dashboard stats
todoRouter.get('/dashboard', todoController.getDashboardStats);

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

// Generate todos from prompt
todoRouter.post('/generate', todoController.generateTodos);

export default todoRouter; 