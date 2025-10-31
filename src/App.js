import React, { useState } from 'react';
import './AppStyles.css';
import { MdAddCircle, MdReceipt, MdPieChart, MdBarChart } from 'react-icons/md';

// Components
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetForm from './components/BudgetForm';
import BudgetTracker from './components/BudgetTracker';
import ExpenseReports from './components/ExpenseReports';
import { useIsMobile, PullToRefresh } from './components/MobileEnhancements';
import { ThemeProvider, ThemeToggle } from './components/ThemeProvider';

// Custom hooks
import { useExpenses, useBudgets } from './hooks/useLocalStorage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [editingExpense, setEditingExpense] = useState(null);
  const isMobile = useIsMobile();

  // Use custom hooks for data management
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses
  } = useExpenses();

  const {
    budgets,
    setBudget
  } = useBudgets();

  const tabs = [
    { id: 'add-expense', label: 'Add', fullLabel: 'Add Expense', icon: MdAddCircle },
    { id: 'expenses', label: 'Expenses', fullLabel: 'Expenses', icon: MdReceipt },
    { id: 'budget', label: 'Budget', fullLabel: 'Budget', icon: MdPieChart },
    { id: 'reports', label: 'Reports', fullLabel: 'Reports', icon: MdBarChart }
  ];

  // Swipe navigation disabled - removed to prevent accidental tab switching

  const handleAddExpense = (expenseData) => {
    addExpense(expenseData);
    // Auto navigate to expenses list after adding
    if (isMobile) {
      setTimeout(() => setActiveTab('expenses'), 500);
    }
  };

  const handleUpdateExpense = (expenseData) => {
    updateExpense(expenseData);
    setEditingExpense(null);
    // Auto navigate to expenses list after updating
    if (isMobile) {
      setTimeout(() => setActiveTab('expenses'), 500);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setActiveTab('add-expense');
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    const message = isMobile 
      ? 'Delete this expense?' 
      : 'Are you sure you want to delete this expense?';
    
    if (window.confirm(message)) {
      deleteExpense(expenseId);
    }
  };

  const handleClearAllExpenses = () => {
    clearAllExpenses();
  };

  const handleSetBudget = (budgetData) => {
    setBudget(budgetData);
  };

  const handleRefresh = () => {
    // Simulate refresh action
    window.location.reload();
  };

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'add-expense':
          return (
            <ExpenseForm
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
              onUpdateExpense={handleUpdateExpense}
              onCancelEdit={handleCancelEdit}
            />
          );
        case 'expenses':
          return (
            <ExpenseList
              expenses={expenses}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onClearAll={handleClearAllExpenses}
            />
          );
        case 'budget':
          return (
            <div>
              <BudgetForm
                budgets={budgets}
                onSetBudget={handleSetBudget}
              />
              <BudgetTracker
                budgets={budgets}
                expenses={expenses}
              />
            </div>
          );
        case 'reports':
          return (
            <ExpenseReports
              expenses={expenses}
            />
          );
        default:
          return null;
      }
    })();

    // Wrap with pull-to-refresh for mobile
    if (isMobile && (activeTab === 'expenses' || activeTab === 'reports')) {
      return (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      );
    }

    return content;
  };

  // Variables removed - no longer needed with bottom navigation

  return (
    <div className="App">
      <ThemeToggle />
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">Expense Tracker</h1>
          <p className="app-subtitle">
            Track your expenses in INR • Device-specific storage(only you can view the expenses added on this device)
          </p>
        </header>

        <main className="main-content">
          {renderTabContent()}
        </main>

        <nav className="bottom-nav">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.fullLabel}
              >
                <IconComponent className="bottom-nav-icon" size={24} />
                <span className="bottom-nav-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <footer className="app-footer-credit">
          <div className="credit-text">Made with ❤️ by Naveenkumar Kalluri</div>
          <div className="social-links">
            <a 
              href="https://www.linkedin.com/in/naveenkumar-kalluri-3b7709224/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              <svg className="linkedin-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Click here to Follow me on LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
