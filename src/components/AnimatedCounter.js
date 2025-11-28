import React from 'react';
import CountUp from 'react-countup';

const AnimatedCounter = ({ value, prefix = '₹', duration = 2, decimals = 2 }) => {
  return (
    <CountUp
      start={0}
      end={value}
      duration={duration}
      decimals={decimals}
      separator=","
      prefix={prefix}
      preserveValue={true}
    />
  );
};

export default AnimatedCounter;
