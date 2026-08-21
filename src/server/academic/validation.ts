export function validateAcademicYearInput(input: {
  name?: unknown;
  startDate?: unknown;
  endDate?: unknown;
}) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const startDate = typeof input.startDate === "string" ? new Date(input.startDate) : null;
  const endDate = typeof input.endDate === "string" ? new Date(input.endDate) : null;

  if (name.length < 2 || name.length > 100) {
    return { error: "Enter an academic year name between 2 and 100 characters." };
  }

  if (!startDate || Number.isNaN(startDate.getTime())) {
    return { error: "Enter a valid start date." };
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return { error: "Enter a valid end date." };
  }

  if (endDate <= startDate) {
    return { error: "End date must be after the start date." };
  }

  return { value: { name, startDate, endDate } };
}

export function validateAcademicTermInput(input: {
  name?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  sortOrder?: unknown;
}, academicYear: { startDate: Date; endDate: Date }) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const startDate = typeof input.startDate === "string" ? new Date(input.startDate) : null;
  const endDate = typeof input.endDate === "string" ? new Date(input.endDate) : null;
  const sortOrder = typeof input.sortOrder === "number" && Number.isInteger(input.sortOrder) ? input.sortOrder : 0;

  if (name.length < 1 || name.length > 100) return { error: "Enter a term name between 1 and 100 characters." };
  if (!startDate || Number.isNaN(startDate.getTime())) return { error: "Enter a valid start date." };
  if (!endDate || Number.isNaN(endDate.getTime())) return { error: "Enter a valid end date." };
  if (endDate <= startDate) return { error: "End date must be after the start date." };
  if (startDate < academicYear.startDate || endDate > academicYear.endDate) {
    return { error: "Term dates must be within the academic year." };
  }
  if (sortOrder < 1) return { error: "Term order must be a positive number." };

  return { value: { name, startDate, endDate, sortOrder } };
}

export function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
