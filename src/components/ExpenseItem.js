import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#FF6B6B',
      'Transportation': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Bills & Utilities': '#FECA57',
      'Healthcare': '#FF9FF3',
      'Education': '#54A0FF',
      'Travel': '#5F27CD',
      'Other': '#777'
    };
    return colors[category] || '#777';
  };

  return (
    <div className="expense-item">
      <div className="expense-info">
        <div className="expense-main">
          <h3 className="expense-description">{expense.description}</h3>
          <span className="expense-amount">{formatAmount(expense.amount)}</span>
        </div>
        <div className="expense-meta">
          <span 
            className="expense-category"
            style={{ backgroundColor: getCategoryColor(expense.category) }}
          >
            {expense.category}
          </span>
          <span className="expense-date">{formatDate(expense.date)}</span>
        </div>
      </div>
      <div className="expense-actions">
        <button 
          onClick={() => onEdit(expense)} 
          className="btn btn-edit"
          title="Edit expense"
        >
          <MdEdit size={18} />
        </button>
        <button 
          onClick={() => onDelete(expense.id)} 
          className="btn btn-delete"
          title="Delete expense"
        >
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;