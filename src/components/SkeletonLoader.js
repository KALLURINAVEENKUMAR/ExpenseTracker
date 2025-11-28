import React from 'react';
import './SkeletonLoader.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
  </div>
);

export const SkeletonChart = () => (
  <div className="skeleton-chart">
    <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: '1.5rem' }}></div>
    <div className="skeleton skeleton-chart-area"></div>
  </div>
);

export const SkeletonExpenseItem = () => (
  <div className="skeleton-expense-item">
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '0.5rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.8rem' }}></div>
    </div>
    <div className="skeleton skeleton-text" style={{ width: '80px' }}></div>
  </div>
);
