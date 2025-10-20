module.exports = ({ utilsLib, load }) => {
  //[Time conversion]
  const timeUnitToMs = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
  };
  //[Convert time to milliseconds]
  utilsLib.timeToMilliseconds = (time, units) => {
    const conversion = timeUnitToMs[units.toLowerCase()];
    if (!conversion) utilsLib.throwError(__filename, `Invalid time unit "${units}"`);

    return +time * conversion;
  };
  //[Convert milliseconds to time]
  utilsLib.millisecondsToTime = (ms, units = "") => {
    if (units) {
      const conversion = timeUnitToMs[units.toLowerCase()];
      if (!conversion) utilsLib.throwError(__filename, `Invalid time unit "${units}"`);
      return utilsLib.chopNumber(+ms / conversion, 3);
    }
    let time;
    let calculatedTime = ms;
    for (const [name, conversion] of Object.entries(timeUnitToMs)) {
      calculatedTime = utilsLib.chopNumber(+ms / conversion, 3);
      if (calculatedTime < 1) break;
      time = calculatedTime;
      units = name;
    }
    return { time, units };
  };
  //[Difference between two times in s/ms]
  utilsLib.timeDiff = (start, end = new Date()) => {
    const ms = end.getTime() - start.getTime();
    const chop = ms > 9999 ? 1 : 2;
    if (ms > 999) {
      const seconds = utilsLib.millisecondsToTime(ms, "seconds");
      return `${utilsLib.chopNumber(seconds, chop)}s`;
    }
    return `${utilsLib.chopNumber(ms, chop)}ms`;
  };

  //[Format date OR timestamp into Discord timestamp]
  utilsLib.unixFormat = (format, { date, timestamp } = {}) => {
    let resultTimestamp;
    //timestamp from date
    if (date && !isNaN(new Date(date).getTime())) {
      const normalizedDate = new Date(date);
      resultTimestamp = Math.floor(normalizedDate.getTime() / 1000);
    }
    //use given timestamp
    else if (timestamp && Number.isInteger(timestamp)) {
      resultTimestamp = timestamp;
    }
    //timestamp from current time
    else {
      const now = new Date();
      resultTimestamp = Math.floor(now.getTime() / 1000);
      utilsLib.warn("unixFormat", `Didn't receive a valid date (${date}) or timestamp (${timestamp}).`);
    }

    function tsIsToday() {
      const d = new Date(resultTimestamp * 1000);
      const today = new Date();
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    }

    //prettier-ignore
    switch (format) {
      case "time": return `<t:${resultTimestamp}:t>`;
      case "date": return `<t:${resultTimestamp}:d>`;
      case "full": return `<t:${resultTimestamp}:t>, <t:${resultTimestamp}:d>`;
      case "relative": return `<t:${resultTimestamp}:R>`;
      case "describe":
        return tsIsToday()
          ? `<t:${resultTimestamp}:t>.\n(<t:${resultTimestamp}:R>)`
          : `<t:${resultTimestamp}:t>, <t:${resultTimestamp}:d>.\n(<t:${resultTimestamp}:R>)`;
      default:
        return tsIsToday()
          ? `<t:${resultTimestamp}:t>`
          : `<t:${resultTimestamp}:t>, <t:${resultTimestamp}:d>`;
    }
  };

  //[Log load times]
  utilsLib.logTime = (name, type, start, actual = null) => {
    //"T] Name ", "Ready/Done", "Exec/Idle "
    if (!load || !load.times || !load.start) return;
    let process = `${type[0]}] ${name}`;
    let rd = start ? utilsLib.timeDiff(load.start, start) : " ".repeat(6) + utilsLib.timeDiff(load.start).padEnd(5);
    let ei = "";
    if (start) {
      rd = `${rd.padEnd(5)}/${utilsLib.timeDiff(load.start).padEnd(5)}`; //ready/done
      ei = actual ? utilsLib.timeDiff(actual) : utilsLib.timeDiff(start); //exec/idle
      if (actual) ei = `${ei.padEnd(5)}/${utilsLib.timeDiff(start, actual).padEnd(5)}`;
    }
    load.times.addRow(process, rd, ei);
  };
};
