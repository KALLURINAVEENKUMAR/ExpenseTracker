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

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const progressPercentage = ((currentTabIndex + 1) / tabs.length) * 100;
  const totalExpenses = expenses.length;
  const totalBudgets = budgets.length;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const formattedTotalSpent = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalSpent);

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

        <nav className="nav-tabs">
          {isMobile && (
            <div
              className="tab-progress"
              style={{ width: `${progressPercentage}%` }}
            />
          )}

          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.fullLabel}
              >
                {isMobile ? (
                  <>
                    <IconComponent className="tab-icon" size={20} />
                    <span>{tab.label}</span>
                  </>
                ) : (
                  <>
                    <IconComponent className="tab-icon" size={20} />
                    <span>{tab.fullLabel}</span>
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <main className="main-content">
          {renderTabContent()}
        </main>

        <footer className="app-footer">
          <div className="footer-stat">
            <span className="stat-value">{totalExpenses}</span>
            <span className="stat-label">Expenses</span>
          </div>
          <div className="footer-stat total">
            <span className="stat-value">{formattedTotalSpent}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="footer-stat">
            <span className="stat-value">{totalBudgets}</span>
            <span className="stat-label">Budgets</span>
          </div>
          <div className="footer-credit">
            Made with ❤️ by Naveenkumar Kalluri
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
