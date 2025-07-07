export const createDateRangeFilter = (dateString: string) => {
  if (!dateString) return null;

  const [day, month, year] = dateString.split('.');

  if (!day || !month || !year) return null;

  const startDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    0,
    0,
    0,
    0,
  );

  const endDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    23,
    59,
    59,
    999,
  );

  return {
    $gte: startDate,
    $lte: endDate,
  };
};
