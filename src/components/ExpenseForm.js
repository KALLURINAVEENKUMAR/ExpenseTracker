import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaUserFriends } from 'react-icons/fa';
import { BsPersonFill, BsCreditCard2Front, BsWallet2, BsBank } from 'react-icons/bs';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { MdQrCodeScanner } from 'react-icons/md';

const ExpenseForm = ({ onAddExpense, editingExpense, onUpdateExpense, onCancelEdit }) => {
  const [expense, setExpense] = useState({
    id: '',
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'Me',
    paymentMethod: 'PhonePe'
  });

  const categories = [
    'Food', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  const paidByOptions = [
    { value: 'Me', label: 'Me', Icon: FaUser },
    { value: 'Mom', label: 'Mom', Icon: BsPersonFill },
    { value: 'Dad', label: 'Dad', Icon: BsPersonFill },
    { value: 'Family', label: 'Family (Shared)', Icon: FaUserFriends }
  ];

  const paymentMethods = [
    { value: 'PhonePe', label: 'PhonePe', Icon: SiPhonepe },
    { value: 'GPay', label: 'Google Pay', Icon: SiGooglepay },
    { value: 'Paytm', label: 'Paytm', Icon: SiPaytm },
    { value: 'Credit Card', label: 'Credit Card', Icon: BsCreditCard2Front },
    { value: 'Debit Card', label: 'Debit Card', Icon: BsCreditCard2Front },
    { value: 'Cash', label: 'Cash', Icon: BsWallet2 },
    { value: 'UPI', label: 'UPI (Other)', Icon: MdQrCodeScanner },
    { value: 'Net Banking', label: 'Net Banking', Icon: BsBank }
  ];

  useEffect(() => {
    if (editingExpense) {
      setExpense({
        ...editingExpense,
        paidBy: editingExpense.paidBy || 'Me',
        paymentMethod: editingExpense.paymentMethod || 'PhonePe'
      });
    } else {
      setExpense({
        id: '',
        amount: '',
        description: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        paidBy: 'Me',
        paymentMethod: 'PhonePe'
      });
    }
  }, [editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!expense.amount || !expense.description) {
      alert('Please fill in all required fields');
      return;
    }

    const expenseData = {
      ...expense,
      amount: parseFloat(expense.amount),
      id: expense.id || Date.now().toString()
    };

    if (editingExpense) {
      onUpdateExpense(expenseData);
    } else {
      onAddExpense(expenseData);
    }

    // Reset form
    setExpense({
      id: '',
      amount: '',
      description: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Me',
      paymentMethod: 'PhonePe'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <motion.div
      className="expense-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="amount">Amount (₹) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={expense.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </motion.div>

        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            required
            placeholder="What did you spend on?"
          />
        </motion.div>

        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={expense.category}
            onChange={handleChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </motion.div>

        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={expense.date}
            onChange={handleChange}
          />
        </motion.div>

        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label htmlFor="paidBy">Paid By</label>
          <select
            id="paidBy"
            name="paidBy"
            value={expense.paidBy}
            onChange={handleChange}
          >
            {paidByOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={expense.paymentMethod}
            onChange={handleChange}
          >
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            type="submit"
            className="btn btn-primary btn-interactive"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </motion.button>
          {editingExpense && (
            <motion.button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ExpenseForm;