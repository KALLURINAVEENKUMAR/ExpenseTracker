import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

const ProgressRing = ({ percentage, spent, total, status = 'safe' }) => {
  const getColors = () => {
    switch (status) {
      case 'safe':
        return {
          pathColor: '#16a34a',
          trailColor: 'rgba(22, 163, 74, 0.15)',
          textColor: '#16a34a'
        };
      case 'warning':
        return {
          pathColor: '#f59e0b',
          trailColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#f59e0b'
        };
      case 'danger':
        return {
          pathColor: '#dc2626',
          trailColor: 'rgba(220, 38, 38, 0.15)',
          textColor: '#dc2626'
        };
      default:
        return {
          pathColor: '#2563eb',
          trailColor: 'rgba(37, 99, 235, 0.15)',
          textColor: '#2563eb'
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <CircularProgressbar
        value={Math.min(percentage, 100)}
        text={`${percentage.toFixed(0)}%`}
        styles={buildStyles({
          rotation: 0,
          strokeLinecap: 'round',
          textSize: '1.5rem',
          pathTransitionDuration: 1.5,
          pathColor: colors.pathColor,
          textColor: colors.textColor,
          trailColor: colors.trailColor,
          backgroundColor: 'transparent',
        })}
      />
    </motion.div>
  );
};

export default ProgressRing;
