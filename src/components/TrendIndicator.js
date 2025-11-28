import React from 'react';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';

const TrendIndicator = ({ trend, percentage, compact = false }) => {
  const getTrendData = () => {
    if (trend === 'up') {
      return {
        icon: MdTrendingUp,
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)',
        text: 'increase'
      };
    } else if (trend === 'down') {
      return {
        icon: MdTrendingDown,
        color: '#16a34a',
        bgColor: 'rgba(22, 163, 74, 0.1)',
        text: 'decrease'
      };
    } else {
      return {
        icon: MdTrendingFlat,
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.1)',
        text: 'stable'
      };
    }
  };

  const trendData = getTrendData();
  const Icon = trendData.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: compact ? '0.25rem 0.6rem' : '0.4rem 0.8rem',
        borderRadius: '999px',
        backgroundColor: trendData.bgColor,
        color: trendData.color,
        fontSize: compact ? '0.75rem' : '0.85rem',
        fontWeight: 600,
      }}
    >
      <Icon size={compact ? 14 : 16} />
      {percentage && <span>{Math.abs(percentage).toFixed(1)}%</span>}
    </motion.div>
  );
};

export default TrendIndicator;
