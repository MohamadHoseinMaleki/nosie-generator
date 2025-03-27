export const calculateDecimal = (selectedFrequencies: number[]) => {
  if (selectedFrequencies.length !== 5) {
    throw new Error("Input must be a 5-bit binary array");
  }

  return parseInt(selectedFrequencies.join(""), 2);
};

export const decimalToBinaryArray = (decimalNumber: number | string) => {
  const binaryString = Number(decimalNumber).toString(2).padStart(5, "0");

  return Array.from(binaryString).map(Number);
};
