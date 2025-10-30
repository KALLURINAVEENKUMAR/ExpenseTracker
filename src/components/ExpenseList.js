import React, { useState } from 'react';
import { MdDeleteSweep } from 'react-icons/md';
import ExpenseItem from './ExpenseItem';
import ConfirmModal from './ConfirmModal';

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense, onClearAll }) => {
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const categories = [
    'All', 'Food', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  // Filter and sort expenses
  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'description':
          return a.description.localeCompare(b.description);
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  const totalAmount = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleClearAllClick = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    setShowClearModal(false);
    onClearAll();
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <div className="header-content">
          <h2>Your Expenses</h2>
          <div className="expense-summary">
            <span className="total-expenses">
              Total: {formatAmount(totalAmount)}
            </span>
            <span className="expense-count">
              ({filteredAndSortedExpenses.length} expenses)
            </span>
          </div>
        </div>
        {expenses.length > 0 && (
          <button 
            onClick={handleClearAllClick}
            className="btn btn-danger btn-clear-all"
            title="Clear all expenses"
          >
            <MdDeleteSweep size={20} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
        title="Clear All Expenses?"
        message={`Are you sure you want to delete all ${expenses.length} expenses? This action cannot be undone.`}
        confirmText="Yes, Clear All"
        cancelText="No, Keep Them"
      />

      <div className="expense-filters">
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date (Newest first)</option>
            <option value="amount">Amount (Highest first)</option>
            <option value="category">Category</option>
            <option value="description">Description</option>
          </select>
        </div>
      </div>

      <div className="expense-list">
        {filteredAndSortedExpenses.length === 0 ? (
          <div className="no-expenses">
            <p>No expenses found.</p>
            {expenses.length === 0 ? (
              <p>Start by adding your first expense!</p>
            ) : (
              <p>Try adjusting your filters.</p>
            )}
          </div>
        ) : (
          filteredAndSortedExpenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;