export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateSalary = (salary) => {
  return !isNaN(salary) && parseFloat(salary) > 0;
};
