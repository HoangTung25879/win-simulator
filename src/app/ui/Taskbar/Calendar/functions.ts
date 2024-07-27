type DayType = "curr" | "next" | "prev" | "today";
type Day = [number, DayType, Date?];

export type WeekCalendar = Day[][];
export type Calendar = WeekCalendar;
export type CalendarMode = "week" | "month" | "year";

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

export const createCalendar = (
  date: Date,
  mode: CalendarMode = "week",
): Calendar => {
  const mapping = {
    week: createWeekCalendar(date),
    month: createMonthCalendar(date),
    year: createYearCalendar(date),
  };
  return mapping[mode];
};

export const getDecadeRange = (year: number): [number, number] => {
  const startYear = Math.floor(year / 10) * 10;
  const endYear = startYear + 9;
  return [startYear, endYear];
};

export const createYearCalendar = (date: Date): Calendar => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const yearRange = getDecadeRange(year);
  const rows: Calendar = [[], [], [], []];
  const isOddRange = (yearRange[0] / 2) % 10 === 5; //* get last digit number
  let accYear = yearRange[0] - (isOddRange ? 2 : 0);
  rows.map((value) => {
    for (let i = 0; i < 4; i++) {
      const isInRange = accYear >= yearRange[0] && accYear <= yearRange[1];
      if (isInRange) {
        value.push([
          accYear,
          accYear === year ? "today" : "curr",
          new Date(accYear, month, day),
        ]);
      } else {
        value.push([
          accYear,
          accYear < yearRange[0] ? "prev" : "next",
          new Date(accYear, month, day),
        ]);
      }
      accYear += 1;
    }
    return value;
  });
  return rows;
};

export const createMonthCalendar = (date: Date): Calendar => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const rows: Calendar = [[], [], [], []];
  let accMonth = 0;
  let monthType: DayType = "curr";
  rows.map((value) => {
    if (accMonth > 11) {
      accMonth = 0;
      monthType = "next";
    }
    for (let i = 0; i < 4; i++) {
      if (accMonth === month && monthType === "curr") {
        value.push([accMonth, "today", new Date(year, accMonth, day)]);
      } else {
        value.push([
          accMonth,
          monthType,
          new Date(year + (monthType === "next" ? 1 : 0), accMonth, day),
        ]);
      }
      accMonth += 1;
    }
    return value;
  });
  return rows;
};

export const createWeekCalendar = (date: Date): WeekCalendar => {
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

export const isSameDate = (d1: Date, d2: Date): Boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
