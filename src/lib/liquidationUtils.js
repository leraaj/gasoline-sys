const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createLiquidationRow = (date = getLocalDate()) => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  date,
  previous: 0,
  added: 0,
  price: 0,
  total: 0,
  trip: 0,
  remaining: 0,
});

export const calculateLiquidations = (rows = [], startingGas = 0) => {
  let previousRemaining = round2(toNumber(startingGas));

  // Sort chronologically while preserving the existing order
  // of records that have the same date.
  const sortedRows = rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const dateA = new Date(a.row.date).getTime();
      const dateB = new Date(b.row.date).getTime();

      const validA = Number.isFinite(dateA);
      const validB = Number.isFinite(dateB);

      if (validA && validB && dateA !== dateB) {
        return dateA - dateB;
      }

      if (validA !== validB) {
        return validA ? -1 : 1;
      }

      return a.index - b.index;
    });

  return sortedRows.map(({ row }) => {
    const added = toNumber(row.added);
    const price = toNumber(row.price);
    const trip = toNumber(row.trip);

    const previous = previousRemaining;
    const total = round2(previous + added);
    const remaining = round2(total - trip);

    previousRemaining = remaining;

    return {
      ...row,
      previous,
      // Preserve the raw input value so an input can be cleared
      // while the user is typing.
      added: row.added ?? 0,
      price: row.price ?? 0,
      total,
      trip: row.trip ?? 0,
      remaining,
    };
  });
};

export const prepareLiquidationEntries = (rows = [], startingGas = 0) => {
  return calculateLiquidations(rows, startingGas).map((row) => ({
    ...(row._id ? { _id: row._id } : {}),
    date: row.date,
    previous: toNumber(row.previous),
    added: toNumber(row.added),
    price: toNumber(row.price),
    total: toNumber(row.total),
    trip: toNumber(row.trip),
    remaining: toNumber(row.remaining),
  }));
};
