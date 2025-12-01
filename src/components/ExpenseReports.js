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
    
    // Modern gradient-style header with dark theme
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 50, 'F');
    
    // Accent line under header
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 50, 210, 2, 'F');
    
    // Title with modern font
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('EXPENSE REPORT', 105, 22, { align: 'center' });
    
    // Subtitle with accent color
    doc.setFontSize(12);
    doc.setTextColor(165, 180, 252); // indigo-300
    doc.setFont(undefined, 'normal');
    doc.text(monthName.toUpperCase(), 105, 38, { align: 'center' });
    
    // Add decorative elements
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(60, 42, 150, 42);
    
    // Reset text color for body
    doc.setTextColor(30, 41, 59); // slate-800
    
    // Modern Summary Section
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('SUMMARY', 14, 65);
    
    // Modern Summary Cards with shadow effect
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const summaryY = 72;
    const summaryData = [
      { label: 'TOTAL SPENT', value: formatAmountForPDF(summaryStats.total), color: [239, 68, 68], bgColor: [254, 242, 242] },
      { label: 'TRANSACTIONS', value: summaryStats.count.toString(), color: [59, 130, 246], bgColor: [239, 246, 255] },
      { label: 'AVERAGE', value: formatAmountForPDF(summaryStats.average), color: [16, 185, 129], bgColor: [236, 253, 245] },
      { label: 'HIGHEST DAILY', value: formatAmountForPDF(summaryStats.maxDaily), color: [245, 158, 11], bgColor: [255, 251, 235] }
    ];
    
    summaryData.forEach((item, index) => {
      const x = 14 + (index * 48);
      
      // Card background with shadow effect (simulated with darker border)
      doc.setFillColor(...item.bgColor);
      doc.roundedRect(x, summaryY, 45, 22, 2, 2, 'F');
      
      // Colored accent bar on top
      doc.setFillColor(...item.color);
      doc.roundedRect(x, summaryY, 45, 3, 2, 2, 'F');
      
      // Shadow effect (darker outline)
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, summaryY, 45, 22, 2, 2);
      
      // Label
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setFont(undefined, 'bold');
      doc.text(item.label, x + 22.5, summaryY + 8, { align: 'center' });
      
      // Value
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...item.color);
      doc.text(item.value, x + 22.5, summaryY + 17, { align: 'center' });
      
      doc.setFont(undefined, 'normal');
    });
    
    // Modern Category Breakdown Section
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('CATEGORY BREAKDOWN', 14, 108);
    
    // Decorative underline
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(14, 110, 80, 110);
    
    const categoryTableData = categoryAnalysis.map(item => [
      item.category,
      formatAmountForPDF(item.total),
      item.count.toString(),
      formatAmountForPDF(item.average)
    ]);
    
    autoTable(doc, {
      startY: 114,
      head: [['CATEGORY', 'TOTAL', 'COUNT', 'AVERAGE']],
      body: categoryTableData,
      theme: 'plain',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [99, 102, 241], halign: 'left' },
        1: { halign: 'right', textColor: [239, 68, 68], fontStyle: 'bold' },
        2: { halign: 'center', textColor: [100, 116, 139] },
        3: { halign: 'right', textColor: [100, 116, 139] }
      }
    });
    
    // Modern All Expenses Section
    const startY = doc.lastAutoTable.finalY + 16;
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('ALL EXPENSES', 14, startY);
    
    // Decorative underline
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(14, startY + 2, 70, startY + 2);
    
    const expensesTableData = monthlyExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(expense => [
        new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        expense.paymentMethod || 'N/A',
        expense.amount, // Keep as number for custom formatting
        expense.description,
        expense.category,
        expense.paidBy || 'N/A'
      ]);
    
    autoTable(doc, {
      startY: startY + 6,
      head: [['DATE', 'PAYMENT', 'AMOUNT', 'DESCRIPTION', 'CATEGORY', 'PAID BY']],
      body: expensesTableData,
      theme: 'plain',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139], fillColor: [241, 245, 249] },
        1: { cellWidth: 24, halign: 'center', fontSize: 7, textColor: [16, 185, 129], fontStyle: 'bold' },
        2: { cellWidth: 26, halign: 'right', fontStyle: 'bold', fontSize: 9 },
        3: { cellWidth: 50, textColor: [51, 65, 85] },
        4: { cellWidth: 26, halign: 'center', fontSize: 7, textColor: [99, 102, 241] },
        5: { cellWidth: 18, halign: 'center', fontSize: 7, textColor: [100, 116, 139], fillColor: [241, 245, 249] }
      },
      didDrawCell: function(data) {
        // Custom rendering for Amount column (index 2)
        if (data.column.index === 2 && data.cell.section === 'body') {
          const amount = data.cell.raw;
          if (typeof amount === 'number') {
            const formattedNumber = new Intl.NumberFormat('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(amount);
            
            // Position for text
            const cellX = data.cell.x;
            const cellY = data.cell.y;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            
            // Clear the cell content
            doc.setFillColor(data.row.index % 2 === 0 ? 255 : 248, data.row.index % 2 === 0 ? 255 : 250, data.row.index % 2 === 0 ? 255 : 252);
            doc.rect(cellX, cellY, cellWidth, cellHeight, 'F');
            
            // Draw "Rs." in red color (same as amount)
            doc.setFontSize(8);
            doc.setTextColor(239, 68, 68); // Red - same as amount
            doc.setFont(undefined, 'bold');
            const rsText = 'Rs. ';
            const rsWidth = doc.getTextWidth(rsText);
            
            // Draw amount in red color
            doc.setTextColor(239, 68, 68); // Red
            doc.setFont(undefined, 'bold');
            const numberWidth = doc.getTextWidth(formattedNumber);
            
            // Calculate total width and starting position for right alignment
            const totalWidth = rsWidth + numberWidth;
            const startX = cellX + cellWidth - totalWidth - 2;
            
            // Draw Rs. and number in same red color
            doc.setTextColor(239, 68, 68);
            doc.setFont(undefined, 'bold');
            doc.text(rsText, startX, cellY + cellHeight / 2 + 2);
            doc.text(formattedNumber, startX + rsWidth, cellY + cellHeight / 2 + 2);
          }
        }
      }
    });
    
    // Modern Footer with gradient-style
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, doc.internal.pageSize.height - 20, 210, 20, 'F');
      
      // Accent line above footer
      doc.setFillColor(99, 102, 241);
      doc.rect(0, doc.internal.pageSize.height - 20, 210, 1, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        14,
        doc.internal.pageSize.height - 10
      );
      
      // Add name in center
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(
        'NAVEENKUMAR KALLURI',
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.setFont(undefined, 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(
        `${i} / ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
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
          <p>No expenses found for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
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