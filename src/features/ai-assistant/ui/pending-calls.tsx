'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '../../../shared/ui/use-toast';
import { Button } from '../../../shared/ui/button/ui/button';
import { 
  PendingFunctionCall, 
  getPendingFunctionCalls, 
  approveFunctionCall, 
  rejectFunctionCall 
} from '../api/pending-calls-api';
import { AlertCircle } from 'lucide-react';

interface PendingCallsProps {
  onUpdate?: () => void;
}

// Исправим типизацию для аргументов удаления задачи
interface DeleteTaskArgs {
  taskId: string;
  [key: string]: unknown;
}

export function PendingCalls({ onUpdate }: PendingCallsProps) {
  const [pendingCalls, setPendingCalls] = useState<PendingFunctionCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchPendingCalls = useCallback(async () => {
    try {
      setLoading(true);
      const calls = await getPendingFunctionCalls();
      setPendingCalls(calls);
    } catch (error) {
      console.error('Failed to fetch pending calls:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить ожидающие подтверждения действия',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCalls();
    
    // Добавим периодическое обновление списка ожидающих подтверждения действий
    const interval = setInterval(() => {
      fetchPendingCalls();
    }, 10000); // Каждые 10 секунд
    
    return () => clearInterval(interval);
  }, [fetchPendingCalls]);

  const handleApprove = async (callId: string) => {
    setProcessingIds(prev => new Set(prev).add(callId));
    try {
      const response = await approveFunctionCall(callId);
      toast({
        title: 'Действие подтверждено',
        description: response.message || 'Запрошенное действие успешно выполнено',
      });
      await fetchPendingCalls();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to approve function call:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить действие',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  };

  const handleReject = async (callId: string) => {
    setProcessingIds(prev => new Set(prev).add(callId));
    try {
      const response = await rejectFunctionCall(callId);
      toast({
        title: 'Действие отклонено',
        description: response.message || 'Запрошенное действие было отклонено',
      });
      await fetchPendingCalls();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to reject function call:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отклонить действие',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  };

  const formatArgs = useCallback((args: string) => {
    try {
      const parsedArgs = JSON.parse(args);
      return Object.entries(parsedArgs)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
    } catch {
      return args;
    }
  }, []);

  if (loading && pendingCalls.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Загрузка ожидающих подтверждения действий...</div>;
  }

  if (pendingCalls.length === 0) {
    return null;
  }

  return (
    <div className="pending-calls-container bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-4 transition-all duration-300">
      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <span>Действия, требующие подтверждения</span>
        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-full px-2 py-0.5 ml-2">
          {pendingCalls.length}
        </span>
      </h3>
      <div className="space-y-3">
        {pendingCalls.map((call) => {
          // Определим, какой тип функции вызывается
          const isFunctionDelete = call.functionName === 'delete_task';
          
          // Распарсим аргументы для более понятного отображения
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(call.functionArgs);
          } catch (e) {
            console.error('Ошибка парсинга аргументов', e);
          }
          
          return (
            <div 
              key={call.id} 
              className={`relative bg-background rounded-md p-3 shadow-sm border-l-4 ${
                isFunctionDelete ? 'border-l-red-500' : 'border-l-amber-500'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className={`font-medium ${isFunctionDelete ? 'text-red-600' : ''}`}>
                  {isFunctionDelete ? 'Удаление задачи' : call.functionName}
                </span>
                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                  {new Date(call.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {isFunctionDelete && (parsedArgs as DeleteTaskArgs).taskId && (
                  <p>Запрос на удаление задачи с ID: {(parsedArgs as DeleteTaskArgs).taskId}</p>
                )}
                {!isFunctionDelete && (
                  <p>Аргументы: {formatArgs(call.functionArgs)}</p>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className={isFunctionDelete ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => handleApprove(call.id)}
                  disabled={processingIds.has(call.id)}
                >
                  {processingIds.has(call.id) ? 'Обработка...' : (isFunctionDelete ? 'Подтвердить удаление' : 'Подтвердить')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(call.id)}
                  disabled={processingIds.has(call.id)}
                >
                  Отклонить
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Стили для анимации */}
      <style dangerouslySetInnerHTML={{ __html: `
        .highlight-panel {
          animation: highlight-animation 1.5s;
        }
        
        @keyframes highlight-animation {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}} />
    </div>
  );
} 