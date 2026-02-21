//Serbian date format
export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
