import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { motion } from 'framer-motion';
import { FaUser, FaUserFriends } from 'react-icons/fa';
import { BsPersonFill, BsCreditCard2Front, BsWallet2, BsBank } from 'react-icons/bs';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { MdQrCodeScanner } from 'react-icons/md';

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

  const getPaidByIcon = (paidBy) => {
    const icons = {
      'Me': <FaUser />,
      'Mom': <BsPersonFill />,
      'Dad': <BsPersonFill />,
      'Family': <FaUserFriends />
    };
    return icons[paidBy] || null;
  };

  const getPaymentIcon = (method) => {
    const icons = {
      'PhonePe': <SiPhonepe />,
      'GPay': <SiGooglepay />,
      'Paytm': <SiPaytm />,
      'Credit Card': <BsCreditCard2Front />,
      'Debit Card': <BsCreditCard2Front />,
      'Cash': <BsWallet2 />,
      'UPI': <MdQrCodeScanner />,
      'Net Banking': <BsBank />
    };
    return icons[method] || null;
  };

  return (
    <motion.div
      className="expense-item"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
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
          {expense.paidBy && (
            <span className="expense-paid-by" title="Paid by">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {getPaidByIcon(expense.paidBy)}
              </span>
              {' '}{expense.paidBy}
            </span>
          )}
          {expense.paymentMethod && (
            <span className="expense-payment-method" title="Payment Method">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {getPaymentIcon(expense.paymentMethod)}
              </span>
              {' '}{expense.paymentMethod}
            </span>
          )}
        </div>
      </div>
      <div className="expense-actions">
        <motion.button 
          onClick={() => onEdit(expense)} 
          className="btn btn-edit"
          title="Edit expense"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdEdit size={18} />
        </motion.button>
        <motion.button 
          onClick={() => onDelete(expense.id)} 
          className="btn btn-delete"
          title="Delete expense"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdDelete size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExpenseItem;