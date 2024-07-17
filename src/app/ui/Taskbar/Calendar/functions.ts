type DayType = "curr" | "next" | "prev" | "today";
type Day = [number, DayType, Date?];

export type WeekCalendar = Day[][];

const DAYS_IN_WEEK = 7;
const GRID_ROW_COUNT = 6;

const FIRST_WEEK: Day[] = [
  [1, "curr"],
  [2, "curr"],
  [3, "curr"],
  [4, "curr"],
  [5, "curr"],
  [6, "curr"],
  [7, "curr"],
];

export const createWeekCalendar = (date: Date): any => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayInCurrentMonth = new Date(year, month, 1).getDay();
  const firstWeek = FIRST_WEEK.slice(0, DAYS_IN_WEEK - firstDayInCurrentMonth);
  const prevLastRow = Array.from({
    length: DAYS_IN_WEEK - firstWeek.length,
  })
    .map<Day>((_, index) => [new Date(year, month, -index).getDate(), "prev"])
    .reverse();
  const firstRow = [...prevLastRow, ...firstWeek];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const remainingDays = Array.from({ length: daysInMonth })
    .map((_, index) => new Date(year, month, index + 1).getDate())
    .slice(firstRow[firstRow.length - 1][0])
    .map<Day>((d) => [d, "curr"]);
  const rows = [...firstRow, ...remainingDays].reduce<WeekCalendar>(
    (acc, value, index) => {
      if (index % DAYS_IN_WEEK === 0) acc.push([]);
      const [vDay, vType] = value;
      acc[acc.length - 1].push(
        vType === "curr" && vDay === day
          ? [vDay, "today", new Date(year, month, vDay)]
          : [
              vDay,
              vType,
              new Date(year, vType === "prev" ? month - 1 : month, vDay),
            ],
      );

      return acc;
    },
    [],
  );
  const lastRow = rows[rows.length - 1];
  const lastRowDays = Array.from({
    length: DAYS_IN_WEEK - lastRow.length,
  }).map<Day>((_, index) => [
    new Date(year, month + 1, index + 1).getDate(),
    "next",
    new Date(year, month + 1, index + 1),
  ]);
  lastRow.push(...lastRowDays);
  if (rows.length < GRID_ROW_COUNT) {
    const [lastNumber] = lastRow[lastRow.length - 1];
    return [
      ...rows,
      lastNumber > DAYS_IN_WEEK - 1
        ? FIRST_WEEK.map(([value]) => [
            value,
            "next",
            new Date(year, month + 1, value),
          ])
        : Array.from({ length: DAYS_IN_WEEK }).map<Day>((_, index) => [
            index + 1 + lastNumber,
            "next",
            new Date(year, month + 1, index + 1 + lastNumber),
          ]),
      ...(rows.length === 4
        ? [
            FIRST_WEEK.map(([value]) => [
              value + DAYS_IN_WEEK,
              "next",
              new Date(year, month + 1, value + DAYS_IN_WEEK),
            ]),
          ]
        : []),
    ] as WeekCalendar;
  }
  return rows;
};

export const isSameDate = (
  d1: Date | undefined,
  d2: Date | undefined,
): Boolean => {
  if (d1 instanceof Date && d2 instanceof Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
  return false;
};
