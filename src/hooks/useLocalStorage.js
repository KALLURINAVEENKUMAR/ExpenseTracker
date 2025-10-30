import { useState } from 'react';

// Custom hook for localStorage with JSON serialization
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook specifically for expenses with additional utility functions
export const useExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage('expenses', []);

  const addExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = (updatedExpense) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
  };

  const deleteExpense = (expenseId) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  const getExpensesByCategory = (category) => {
    return expenses.filter(expense => expense.category === category);
  };

  const getExpensesByMonth = (month) => {
    return expenses.filter(expense => expense.date.slice(0, 7) === month);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyTotal = (month) => {
    return getExpensesByMonth(month).reduce((total, expense) => total + expense.amount, 0);
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    getExpensesByCategory,
    getExpensesByMonth,
    getTotalExpenses,
    getMonthlyTotal,
    setExpenses
  };
};

// Hook specifically for budgets with additional utility functions
export const useBudgets = () => {
  const [budgets, setBudgets] = useLocalStorage('budgets', []);

  const setBudget = (budget) => {
    setBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.id === budget.id);
      if (existingIndex >= 0) {
        // Update existing budget
        const updated = [...prev];
        updated[existingIndex] = budget;
        return updated;
      } else {
        // Add new budget
        return [...prev, budget];
      }
    });
  };

  const deleteBudget = (budgetId) => {
    setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
  };

  const getBudgetForCategory = (category, month) => {
    return budgets.find(budget => 
      budget.category === category && budget.month === month
    );
  };

  const getBudgetsForMonth = (month) => {
    return budgets.filter(budget => budget.month === month);
  };

  const getTotalBudgetForMonth = (month) => {
    return getBudgetsForMonth(month).reduce((total, budget) => total + budget.amount, 0);
  };

  return {
    budgets,
    setBudget,
    deleteBudget,
    getBudgetForCategory,
    getBudgetsForMonth,
    getTotalBudgetForMonth,
    setBudgets
  };
};

// Hook for app settings
export const useAppSettings = () => {
  const [settings, setSettings] = useLocalStorage('appSettings', {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    defaultCategory: 'Food'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    settings,
    updateSetting,
    setSettings
  };
};