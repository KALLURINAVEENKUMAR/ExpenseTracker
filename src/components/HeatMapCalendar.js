import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './HeatMapCalendar.css';

const HeatMapCalendar = ({ expenses, selectedMonth }) => {
  const heatMapData = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).getDate();

    const dailySpending = {};
    
    expenses
      .filter(expense => expense.date.slice(0, 7) === selectedMonth)
      .forEach(expense => {
        const day = parseInt(expense.date.split('-')[2]);
        dailySpending[day] = (dailySpending[day] || 0) + expense.amount;
      });

    const maxSpending = Math.max(...Object.values(dailySpending), 1);

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const amount = dailySpending[day] || 0;
      const intensity = amount / maxSpending;
      return { day, amount, intensity };
    });
  }, [expenses, selectedMonth]);

  const getColor = (intensity) => {
    if (intensity === 0) return 'rgba(148, 163, 184, 0.1)';
    if (intensity < 0.2) return 'rgba(37, 99, 235, 0.2)';
    if (intensity < 0.4) return 'rgba(37, 99, 235, 0.4)';
    if (intensity < 0.6) return 'rgba(37, 99, 235, 0.6)';
    if (intensity < 0.8) return 'rgba(37, 99, 235, 0.8)';
    return 'rgba(37, 99, 235, 1)';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="heatmap-calendar">
      <h4>Daily Spending Intensity</h4>
      <div className="heatmap-grid">
        {heatMapData.map((data, index) => (
          <motion.div
            key={data.day}
            className="heatmap-cell"
            style={{
              backgroundColor: getColor(data.intensity),
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.2,
              delay: index * 0.01,
            }}
            whileHover={{
              scale: 1.2,
              zIndex: 10,
            }}
            title={`Day ${data.day}: ${formatAmount(data.amount)}`}
          >
            <span className="heatmap-day">{data.day}</span>
          </motion.div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Less</span>
        <div className="legend-gradient">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div
              key={intensity}
              className="legend-box"
              style={{ backgroundColor: getColor(intensity) }}
            />
          ))}
        </div>
        <span className="legend-label">More</span>
      </div>
    </div>
  );
};

export default HeatMapCalendar;
