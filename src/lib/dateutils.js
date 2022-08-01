export const convertDate = (published) => {
    const months = {
        1: 'January',
        2: 'Febuary',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'
    };
    const date = published.substring(0, 10); // 2004-10-08 <- ten characters total
    const [year, month, day] = date.split('-');

    let dayth;
    switch (day[1]) {
        case 1:
            dayth = day + 'st';
        case 2:
            dayth = day + 'nd';
        case 3:
            dayth = day + 'rd';
        default:
            dayth = day + 'th';
    } // there might be a better way to do this but whatever :) it looks funny

    return `${months[parseInt(month)]} ${dayth}, ${year}`;
};