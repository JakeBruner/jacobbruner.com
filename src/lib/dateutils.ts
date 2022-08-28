export const convertDate = (published: string): string => {
  const months = {
    1: "January",
    2: "Febuary",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  }; // this would be a good use of enum

  const date = published.substring(0, 10); // 2004-10-08 <- ten characters total
  const array = date.split("-");
  let [year, month, day]: number[] = array.map((x) => parseInt(x));

  let dayth: string;
  switch (day[1]) {
    case 1: // infer concatanation
      dayth = day + "st";
    case 2:
      dayth = day + "nd";
    case 3:
      dayth = day + "rd";
    default:
      dayth = day + "th";
  } // there might be a better way to do this but whatever :) it looks funny

  return `${months[month]} ${dayth}, ${year}`;
};
