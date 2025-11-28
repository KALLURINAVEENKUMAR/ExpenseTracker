export const paidByOptions = [
  { value: 'Me', label: '👤 Me', color: '#2563eb' },
  { value: 'Mom', label: '👩 Mom', color: '#ec4899' },
  { value: 'Dad', label: '👨 Dad', color: '#8b5cf6' },
  { value: 'Family', label: '👨‍👩‍👦 Family', color: '#16a34a' }
];

export const paymentMethods = [
  { value: 'PhonePe', label: '📱 PhonePe', icon: '💜' },
  { value: 'GPay', label: '💳 Google Pay', icon: '🟦' },
  { value: 'Paytm', label: '💰 Paytm', icon: '🔵' },
  { value: 'Credit Card', label: '💳 Credit Card', icon: '💳' },
  { value: 'Debit Card', label: '💳 Debit Card', icon: '💳' },
  { value: 'Cash', label: '💵 Cash', icon: '💵' },
  { value: 'UPI', label: '📲 UPI', icon: '📲' },
  { value: 'Net Banking', label: '🏦 Net Banking', icon: '🏦' }
];

export const getPaidByColor = (paidBy) => {
  const option = paidByOptions.find(opt => opt.value === paidBy);
  return option ? option.color : '#64748b';
};

export const getPaymentMethodIcon = (method) => {
  const option = paymentMethods.find(opt => opt.value === method);
  return option ? option.icon : '💰';
};
