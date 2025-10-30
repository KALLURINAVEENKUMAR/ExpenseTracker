import React, { useState } from 'react';

const BudgetForm = ({ budgets, onSetBudget }) => {
  const [budget, setBudget] = useState({
    amount: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!budget.amount || budget.amount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    const budgetData = {
      amount: parseFloat(budget.amount),
      month: budget.month,
      id: `total-${budget.month}`
    };

    onSetBudget(budgetData);

    // Reset amount but keep month
    setBudget(prev => ({
      ...prev,
      amount: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentBudget = () => {
    const existingBudget = budgets.find(b => b.month === budget.month);
    return existingBudget?.amount || 0;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="budget-form-container">
      <h2>Set Monthly Budget</h2>
      <p className="form-description">Set your total spending budget for the month</p>
      <form onSubmit={handleSubmit} className="budget-form">
        <div className="form-group">
          <label htmlFor="month">Month</label>
          <input
            type="month"
            id="month"
            name="month"
            value={budget.month}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Total Budget Amount (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={budget.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="Enter your monthly budget"
          />
          {getCurrentBudget() > 0 && (
            <div className="current-budget">
              Current budget: {formatAmount(getCurrentBudget())}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          {getCurrentBudget() > 0 ? 'Update Budget' : 'Set Budget'}
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;