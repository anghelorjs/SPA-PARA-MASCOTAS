//agenda/utils/date.ts
export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (date: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T00:00:00`);
  }

  return new Date(date);
};

export const formatLocalDate = (
  date: string,
  options: Intl.DateTimeFormatOptions,
  locale = 'es-ES',
): string => parseLocalDate(date).toLocaleDateString(locale, options);
