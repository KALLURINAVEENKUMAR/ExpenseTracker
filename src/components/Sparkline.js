import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Sparkline = ({ data, color = '#2563eb', trend = 'up' }) => {
  const formattedData = data.map(value => ({ value }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
            animationBegin={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default Sparkline;
