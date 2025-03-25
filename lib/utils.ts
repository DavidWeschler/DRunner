export function getIsraelTimezoneOffset(): number {
  const ISRAEL_TIMEZONE_OFFSET = 2;
  const ISRAEL_TIMEZONE_OFFSET_DURING_DAYLIGHT_SAVING = 3;

  const date = new Date();
  const start = new Date(date.getFullYear(), 2, 28);
  const end = new Date(date.getFullYear(), 9, 26);
  return date >= start && date < end ? ISRAEL_TIMEZONE_OFFSET_DURING_DAYLIGHT_SAVING : ISRAEL_TIMEZONE_OFFSET;
}

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(0) || 0;

  if (formattedMinutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export function formatDate(dateString: string, future = false): string {
  const offset = getIsraelTimezoneOffset();

  const date = new Date(future ? new Date(dateString).getTime() + offset * 60 * 60 * 1000 : dateString);
  const day = date.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${month} ${day} ${year < 2025 || future ? year : ""}, ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
}
