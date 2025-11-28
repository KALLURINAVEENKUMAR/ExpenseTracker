import React, { useState } from 'react';
import { MdDeleteSweep } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseItem from './ExpenseItem';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense, onClearAll }) => {
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPaidBy, setFilterPaidBy] = useState('All');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const categories = [
    'All', 'Food', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  const paidByOptions = ['All', 'Me', 'Mom', 'Dad', 'Family'];
  
  const paymentMethods = [
    'All', 'PhonePe', 'GPay', 'Paytm', 'Credit Card', 
    'Debit Card', 'Cash', 'UPI', 'Net Banking'
  ];

  // Filter and sort expenses
  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
      const matchesPaidBy = filterPaidBy === 'All' || !expense.paidBy || expense.paidBy === filterPaidBy;
      const matchesPaymentMethod = filterPaymentMethod === 'All' || !expense.paymentMethod || expense.paymentMethod === filterPaymentMethod;
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesPaidBy && matchesPaymentMethod && matchesSearch;
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
    <motion.div
      className="expense-list-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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

        <div className="filter-group">
          <label htmlFor="paid-by-filter">Paid By:</label>
          <select
            id="paid-by-filter"
            value={filterPaidBy}
            onChange={(e) => setFilterPaidBy(e.target.value)}
          >
            {paidByOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="payment-method-filter">Payment Method:</label>
          <select
            id="payment-method-filter"
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="expense-list">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedExpenses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {expenses.length === 0 ? (
                <EmptyState
                  title="No Expenses Yet"
                  message="Start by adding your first expense to track your spending!"
                />
              ) : (
                <EmptyState
                  title="No Matches Found"
                  message="Try adjusting your filters to see more expenses."
                />
              )}
            </motion.div>
          ) : (
            filteredAndSortedExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                layout
              >
                <ExpenseItem
                  expense={expense}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExpenseList;