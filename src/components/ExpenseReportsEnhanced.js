import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MdDownload, MdCompareArrows } from 'react-icons/md';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import AnimatedCounter from './AnimatedCounter';
import TrendIndicator from './TrendIndicator';
import HeatMapCalendar from './HeatMapCalendar';
import EmptyState from './EmptyState';

const ExpenseReportsEnhanced = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));