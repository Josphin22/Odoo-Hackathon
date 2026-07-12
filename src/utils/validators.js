// Input regex validators
export const validateRegistrationNumber = (val) => {
  const regex = /^[A-Z]{2}-[0-9]{2}-[A-Z]{2,3}-[0-9]{4}$/i;
  return regex.test(val) || 'Format must match: XX-00-XX-0000';
};

export const validateContactNumber = (val) => {
  const regex = /^\+?[0-9\s-]{10,15}$/;
  return regex.test(val) || 'Enter a valid phone number format.';
};
