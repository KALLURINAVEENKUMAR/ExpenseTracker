import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MdDownload } from 'react-icons/md';

const ExpenseReports = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState('category');

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatAmountForPDF = (amount) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Expense Report', 14, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(monthName, 14, 28);
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Total Spent: ${formatAmountForPDF(summaryStats.total)}`, 14, 48);
    doc.text(`Total Transactions: ${summaryStats.count}`, 14, 54);
    doc.text(`Average per Transaction: ${formatAmountForPDF(summaryStats.average)}`, 14, 60);
    doc.text(`Highest Daily Spending: ${formatAmountForPDF(summaryStats.maxDaily)}`, 14, 66);
    
    // Category Breakdown
    doc.setFontSize(14);
    doc.text('Category Breakdown', 14, 78);
    
    const categoryTableData = categoryAnalysis.map(item => [
      item.category,
      formatAmountForPDF(item.total),
      item.count.toString(),
      formatAmountForPDF(item.average)
    ]);
    
    autoTable(doc, {
      startY: 82,
      head: [['Category', 'Total Amount', 'Count', 'Average']],
      body: categoryTableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 }
    });
    
    // All Expenses Table
    const startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('All Expenses', 14, startY);
    
    const expensesTableData = monthlyExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(expense => [
        new Date(expense.date).toLocaleDateString('en-IN'),
        expense.description,
        expense.category,
        formatAmountForPDF(expense.amount)
      ]);
    
    autoTable(doc, {
      startY: startY + 4,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: expensesTableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
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
        <div className="no-data">
          <p>No expenses to analyze yet.</p>
          <p>Start adding expenses to see reports and insights!</p>
        </div>
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
          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Total Spent</div>
                <div className="summary-value">{formatAmount(summaryStats.total)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Transactions</div>
                <div className="summary-value">{summaryStats.count}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Average per Transaction</div>
                <div className="summary-value">{formatAmount(summaryStats.average)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Highest Daily Spending</div>
                <div className="summary-value">{formatAmount(summaryStats.maxDaily)}</div>
              </div>
            </div>
          </div>

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