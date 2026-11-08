export const ATTENDANCE_STATUSES = [
  "Present",
  "Absent",
  "Half-day",
  "Leave",
];

export const validateAttendance = (
  record,
  attendance = [],
  excludeId = null,
  workers = []
) => {
  const errors = {};

  // Validate worker
  if (!record.workerId) {
    errors.workerId = "Please select a worker.";
  } else if (
    workers.length > 0 &&
    !workers.some(
      (worker) => String(worker.id) === String(record.workerId)
    )
  ) {
    errors.workerId = "Selected worker does not exist.";
  }

  // Validate date
  if (!record.date) {
    errors.date = "Please select an attendance date.";
  } else {
    const date = new Date(`${record.date}T00:00:00`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(record.date) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== record.date
    ) {
      errors.date = "Please select a valid date.";
    }
  }

  // Validate status
  if (!ATTENDANCE_STATUSES.includes(record.status)) {
    errors.status = "Please select a valid attendance status.";
  }

  // Prevent duplicate attendance
  const duplicate = attendance.some(
    (item) =>
      String(item.workerId) === String(record.workerId) &&
      item.date === record.date &&
      String(item.id) !== String(excludeId)
  );

  if (record.workerId && record.date && duplicate) {
    errors.date =
      "Attendance for this worker already exists on this date.";
  }

  return errors;
};