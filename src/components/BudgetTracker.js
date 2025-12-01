import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';
import AnimatedCounter from './AnimatedCounter';
import EmptyState from './EmptyState';

const BudgetTracker = ({ budgets, expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Helper function to format month display
  const formatMonthDisplay = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get available months from expenses
  const availableMonths = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const months = [...new Set([currentMonth, ...expenses.map(e => e.date.slice(0, 7))])];
    return months.sort().reverse(); // Most recent first
  }, [expenses]);

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
    return budgets.find(budget => budget.month === selectedMonth);
  };

  const currentBudget = getCurrentMonthBudget();
  const totalSpent = getMonthlyExpenses(selectedMonth);
  const categoryExpenses = getCategoryExpenses(selectedMonth);

  return (
    <motion.div
      className="budget-tracker-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="report-header">
        <h2>Budget Tracker</h2>
        <div className="control-group">
          <label htmlFor="budget-month">Month:</label>
          <select
            id="budget-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {!currentBudget ? (
        <EmptyState
          title="No Budget Set"
          message="Set a monthly budget to track your spending and stay on top of your finances!"
        />
      ) : (
        <>
          <div className="budget-list">
            {(() => {
              const remaining = currentBudget.amount - totalSpent;
              const percentage = Math.min((totalSpent / currentBudget.amount) * 100, 100);
              const status = getBudgetStatus(totalSpent, currentBudget.amount);

              return (
                <motion.div
                  className={`budget-item-enhanced ${status}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="budget-visual-section">
                    <div className="progress-ring-wrapper">
                      <ProgressRing
                        percentage={percentage}
                        spent={totalSpent}
                        total={currentBudget.amount}
                        status={status}
                      />
                    </div>
                    <div className="budget-info-section">
                      <div className="budget-header-enhanced">
                        <h3>Total Monthly Budget</h3>
                      </div>
                      <div className="budget-amounts-animated">
                        <div className="amount-box">
                          <span className="amount-label">Spent</span>
                          <span className="amount-value spent">
                            <AnimatedCounter value={totalSpent} />
                          </span>
                        </div>
                        <div className="amount-box">
                          <span className="amount-label">Budget</span>
                          <span className="amount-value budget">
                            <AnimatedCounter value={currentBudget.amount} />
                          </span>
                        </div>
                      </div>
                      <div className="budget-status-enhanced">
                        {remaining >= 0 ? (
                          <motion.span
                            className="remaining positive"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <AnimatedCounter value={remaining} /> remaining
                          </motion.span>
                        ) : (
                          <motion.span
                            className="remaining negative"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <AnimatedCounter value={Math.abs(remaining)} /> over budget
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* Category breakdown */}
          {Object.keys(categoryExpenses).length > 0 && (
            <motion.div
              className="category-breakdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Spending by Category</h3>
              <div className="category-list">
                {Object.entries(categoryExpenses)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount], index) => {
                    const categoryPercentage = ((amount / totalSpent) * 100).toFixed(1);
                    return (
                      <motion.div
                        key={category}
                        className="unbudgeted-item-enhanced"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="category-info">
                          <span className="category">{category}</span>
                          <div className="category-bar">
                            <motion.div
                              className="category-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${categoryPercentage}%` }}
                              transition={{ duration: 1, delay: 0.5 + (0.1 * index) }}
                            />
                          </div>
                          <span className="percentage">{categoryPercentage}% of total</span>
                        </div>
                        <span className="amount">
                          <AnimatedCounter value={amount} duration={1.5} />
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default BudgetTracker;