import React from 'react';

const BudgetTracker = ({ budgets, expenses }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMonthlyExpenses = (month) => {
    return expenses
      .filter(expense => expense.date.slice(0, 7) === month)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryExpenses = (month) => {
    const categoryMap = {};
    expenses
      .filter(expense => expense.date.slice(0, 7) === month)
      .forEach(expense => {
        if (!categoryMap[expense.category]) {
          categoryMap[expense.category] = 0;
        }
        categoryMap[expense.category] += expense.amount;
      });
    return categoryMap;
  };

  const getBudgetStatus = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage <= 50) return 'safe';
    if (percentage <= 80) return 'warning';
    return 'danger';
  };

  const getCurrentMonthBudget = () => {
    return budgets.find(budget => budget.month === currentMonth);
  };

  const currentBudget = getCurrentMonthBudget();
  const totalSpent = getMonthlyExpenses(currentMonth);
  const categoryExpenses = getCategoryExpenses(currentMonth);

  return (
    <div className="budget-tracker-container">
      <h2>Budget Tracker - {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
      
      {!currentBudget ? (
        <div className="no-budgets">
          <p>No budget set for this month.</p>
          <p>Set a monthly budget to track your spending!</p>
        </div>
      ) : (
        <>
          <div className="budget-list">
            {(() => {
              const remaining = currentBudget.amount - totalSpent;
              const percentage = Math.min((totalSpent / currentBudget.amount) * 100, 100);
              const status = getBudgetStatus(totalSpent, currentBudget.amount);

              return (
                <div className={`budget-item ${status}`}>
                  <div className="budget-header">
                    <h3>Total Monthly Budget</h3>
                    <div className="budget-amounts">
                      <span className="spent">{formatAmount(totalSpent)}</span>
                      <span className="separator"> / </span>
                      <span className="budget">{formatAmount(currentBudget.amount)}</span>
                    </div>
                  </div>
                  
                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${status}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {percentage.toFixed(1)}% used
                    </div>
                  </div>

                  <div className="budget-status">
                    {remaining >= 0 ? (
                      <span className="remaining positive">
                        {formatAmount(remaining)} remaining
                      </span>
                    ) : (
                      <span className="remaining negative">
                        {formatAmount(Math.abs(remaining))} over budget
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Category breakdown */}
          {Object.keys(categoryExpenses).length > 0 && (
            <div className="category-breakdown">
              <h3>Spending by Category</h3>
              <div className="category-list">
                {Object.entries(categoryExpenses)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const categoryPercentage = ((amount / totalSpent) * 100).toFixed(1);
                    return (
                      <div key={category} className="unbudgeted-item">
                        <div className="category-info">
                          <span className="category">{category}</span>
                          <span className="percentage">{categoryPercentage}% of total</span>
                        </div>
                        <span className="amount">{formatAmount(amount)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetTracker;