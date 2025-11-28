import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MdDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import EmptyState from './EmptyState';

const ExpenseReports = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState('category');

  const formatAmountForPDF = (amount) => {
    // Use 'Rs.' instead of rupee symbol for PDF compatibility
    return 'Rs. ' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get available months from expenses
  const availableMonths = useMemo(() => {
    const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))];
    return months.sort().reverse(); // Most recent first
  }, [expenses]);

  // Filter expenses by selected month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => expense.date.slice(0, 7) === selectedMonth);
  }, [expenses, selectedMonth]);

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    const categoryData = {};
    monthlyExpenses.forEach(expense => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = {
          total: 0,
          count: 0,
          expenses: []
        };
      }
      categoryData[expense.category].total += expense.amount;
      categoryData[expense.category].count += 1;
      categoryData[expense.category].expenses.push(expense);
    });

    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        ...data,
        average: data.total / data.count
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthlyExpenses]);

  // Daily spending analysis
  const dailyAnalysis = useMemo(() => {
    const dailyData = {};
    monthlyExpenses.forEach(expense => {
      const date = expense.date;
      if (!dailyData[date]) {
        dailyData[date] = {
          total: 0,
          count: 0,
          expenses: []
        };
      }
      dailyData[date].total += expense.amount;
      dailyData[date].count += 1;
      dailyData[date].expenses.push(expense);
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        formattedDate: new Date(date).toLocaleDateString()
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthlyExpenses]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = monthlyExpenses.length;
    const average = count > 0 ? total / count : 0;
    
    const dailyTotals = dailyAnalysis.map(day => day.total);
    const maxDaily = Math.max(...dailyTotals, 0);
    const minDaily = dailyTotals.length > 0 ? Math.min(...dailyTotals) : 0;

    return {
      total,
      count,
      average,
      maxDaily,
      minDaily,
      averageDaily: dailyTotals.length > 0 ? total / dailyTotals.length : 0
    };
  }, [monthlyExpenses, dailyAnalysis]);

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

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const monthName = new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Add background color to header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title with white text
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Expense Report', 105, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(monthName, 105, 32, { align: 'center' });
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    // Summary Section with colored boxes
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Summary', 14, 52);
    
    // Summary boxes with borders
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    
    const summaryY = 60;
    const summaryData = [
      { label: 'Total Spent', value: formatAmountForPDF(summaryStats.total), color: [220, 38, 38] },
      { label: 'Transactions', value: summaryStats.count.toString(), color: [37, 99, 235] },
      { label: 'Average', value: formatAmountForPDF(summaryStats.average), color: [16, 185, 129] },
      { label: 'Highest Daily', value: formatAmountForPDF(summaryStats.maxDaily), color: [245, 158, 11] }
    ];
    
    summaryData.forEach((item, index) => {
      const x = 14 + (index * 48);
      // Colored top border
      doc.setFillColor(...item.color);
      doc.rect(x, summaryY, 45, 2, 'F');
      // Box
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, summaryY, 45, 18);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, x + 2, summaryY + 6);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(item.value, x + 2, summaryY + 14);
      doc.setFont(undefined, 'normal');
    });
    
    // Category Breakdown with styled table
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Category Breakdown', 14, 92);
    
    const categoryTableData = categoryAnalysis.map(item => [
      item.category,
      formatAmountForPDF(item.total),
      item.count.toString(),
      formatAmountForPDF(item.average)
    ]);
    
    autoTable(doc, {
      startY: 96,
      head: [['Category', 'Total Amount', 'Count', 'Average']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [37, 99, 235] },
        1: { halign: 'right', textColor: [220, 38, 38] },
        2: { halign: 'center' },
        3: { halign: 'right' }
      }
    });
    
    // All Expenses Table with enhanced styling
    const startY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('All Expenses', 14, startY);
    
    const expensesTableData = monthlyExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(expense => [
        new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        expense.paymentMethod || 'N/A',
        formatAmountForPDF(expense.amount),
        expense.description,
        expense.category,
        expense.paidBy || 'N/A'
      ]);
    
    autoTable(doc, {
      startY: startY + 4,
      head: [['Date', 'Payment', 'Amount', 'Description', 'Category', 'Paid By']],
      body: expensesTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center', fontSize: 7, textColor: [16, 185, 129] },
        2: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
        3: { cellWidth: 45 },
        4: { cellWidth: 28, halign: 'center', fontSize: 7 },
        5: { cellWidth: 20, halign: 'center', fontSize: 7, textColor: [37, 99, 235] }
      },
      didParseCell: function(data) {
        // Payment column (index 1) - no icons, just text
        if (data.column.index === 1 && data.cell.section === 'body') {
          // Keep as is, no emoji modification
        }
        // Paid By column (index 5) - no icons, just text
        if (data.column.index === 5 && data.cell.section === 'body') {
          // Keep as is, no emoji modification
        }
      }
    });
    
    // Footer with decorative line
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Decorative footer line
      doc.setFillColor(37, 99, 235);
      doc.rect(0, doc.internal.pageSize.height - 15, 210, 1, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN')}`,
        14,
        doc.internal.pageSize.height - 8
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 8,
        { align: 'right' }
      );
    }
    
    // Save the PDF
    doc.save(`Expense_Report_${monthName.replace(' ', '_')}.pdf`);
  };

  const renderCategoryChart = () => {
    const pieData = categoryAnalysis.map(item => ({
      name: item.category,
      value: item.total,
      count: item.count
    }));

    const barData = categoryAnalysis.map(item => ({
      category: item.category,
      amount: item.total,
      count: item.count
    }));

    const COLORS = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#777'
    ];
    
    return (
      <div className="chart-container">
        <h3>Spending by Category</h3>
        
        {/* Pie Chart */}
        <div className="chart-wrapper" style={{ marginBottom: '2rem' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatAmount(value)}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="chart-wrapper">
          <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Amount by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="category" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                formatter={(value) => formatAmount(value)}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDailyChart = () => {
    const lineData = dailyAnalysis.slice(0, 15).reverse().map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: item.total,
      count: item.count
    }));
    
    return (
      <div className="chart-container">
        <h3>Daily Spending Trend</h3>
        
        {/* Line Chart */}
        <div className="chart-wrapper" style={{ marginBottom: '2rem' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Spending Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                formatter={(value) => formatAmount(value)}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#45B7D1" 
                strokeWidth={3}
                dot={{ fill: '#45B7D1', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="chart-wrapper">
          <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Daily Amounts</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                formatter={(value) => formatAmount(value)}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#96CEB4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-reports-container">
        <h2>Expense Reports</h2>
        <EmptyState
          title="No Expenses Yet"
          message="Start adding expenses to see beautiful reports and insights about your spending patterns!"
        />
      </div>
    );
  }

  return (
    <div className="expense-reports-container">
      <div className="reports-header">
        <h2>Expense Reports</h2>
        <div className="report-controls">
          <div className="control-group">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="report-type">View:</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="category">By Category</option>
              <option value="daily">By Day</option>
            </select>
          </div>
          {monthlyExpenses.length > 0 && (
            <button className="btn btn-download" onClick={downloadPDFReport}>
              <MdDownload size={18} />
              Download Report
            </button>
          )}
        </div>
      </div>

      {monthlyExpenses.length === 0 ? (
        <div className="no-data">
          <p>No expenses found for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <motion.div
            className="summary-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Summary</h3>
            <div className="summary-grid">
              <motion.div
                className="summary-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="summary-label">Total Spent</div>
                <div className="summary-value">
                  <AnimatedCounter value={summaryStats.total} duration={1.5} />
                </div>
              </motion.div>
              <motion.div
                className="summary-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="summary-label">Transactions</div>
                <div className="summary-value">{summaryStats.count}</div>
              </motion.div>
              <motion.div
                className="summary-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="summary-label">Average per Transaction</div>
                <div className="summary-value">
                  <AnimatedCounter value={summaryStats.average} duration={1.5} />
                </div>
              </motion.div>
              <motion.div
                className="summary-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="summary-label">Highest Daily Spending</div>
                <div className="summary-value">
                  <AnimatedCounter value={summaryStats.maxDaily} duration={1.5} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Charts */}
          {reportType === 'category' ? renderCategoryChart() : renderDailyChart()}

          {/* Top Expenses */}
          <div className="top-expenses-section">
            <h3>Largest Expenses This Month</h3>
            <div className="top-expenses-list">
              {monthlyExpenses
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map(expense => (
                  <div key={expense.id} className="top-expense-item">
                    <div className="expense-details">
                      <span className="description">{expense.description}</span>
                      <span className="category" style={{color: getCategoryColor(expense.category)}}>
                        {expense.category}
                      </span>
                    </div>
                    <div className="expense-meta">
                      <span className="amount">{formatAmount(expense.amount)}</span>
                      <span className="date">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseReports;