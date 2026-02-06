const errorFunction = (errorBit, message, data) => {
  if (errorBit) return { is_error: errorBit, message };
  else return { is_error: errorBit, message, data };
};

module.exports = errorFunction;
