// ==========================================
// WORKER VALIDATION
// ==========================================

export const validateWorker = (
  worker = {},
  workers = [],
  excludeId = null
) => {
  const errors = {};

  // Name validation
  const name = String(worker.name || "").trim();

  if (
    !/^[A-Za-z][A-Za-z\s'-]{1,}$/.test(name) ||
    name.replace(/[^A-Za-z]/g, "").length < 3
  ) {
    errors.name =
      "Name must contain at least 3 letters.";
  }

  // CNIC validation
  const cnic = String(worker.cnic || "").trim();

  if (!/^\d{13}$/.test(cnic)) {
    errors.cnic =
      "CNIC must contain exactly 13 digits.";
  } else {
    const duplicateCNIC = workers.some(
      (item) =>
        String(item.cnic || "").trim() === cnic &&
        String(item.id) !== String(excludeId)
    );

    if (duplicateCNIC) {
      errors.cnic =
        "This CNIC is already registered.";
    }
  }

  // Phone validation
  const phone = String(worker.phone || "").trim();

  if (!/^\d{11}$/.test(phone)) {
    errors.phone =
      "Phone number must contain exactly 11 digits.";
  }

  // Daily wage validation
  const dailyWage = Number(worker.dailyWage);

  if (
    worker.dailyWage === "" ||
    worker.dailyWage === null ||
    !Number.isFinite(dailyWage) ||
    dailyWage <= 0
  ) {
    errors.dailyWage =
      "Daily wage must be greater than zero.";
  }

  return errors;
};


// ==========================================
// MONTHLY WAGE CALCULATION
// ==========================================

export const calculateMonthlyWage = (
  attendance = [],
  workerId,
  dailyWage,
  month,
  year
) => {

  // Get attendance records for the selected worker and month
  const records = attendance.filter((record) => {
    if (
      String(record.workerId) !== String(workerId) ||
      !record.date
    ) {
      return false;
    }

    const date = new Date(
      `${record.date}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  });

  // Count attendance statuses
  const presentDays = records.filter(
    (record) => record.status === "Present"
  ).length;

  const absentDays = records.filter(
    (record) => record.status === "Absent"
  ).length;

  const halfDays = records.filter(
    (record) => record.status === "Half-day"
  ).length;

  const leaveDays = records.filter(
    (record) => record.status === "Leave"
  ).length;

  // Calculate payable days
  const payableDays =
    presentDays + halfDays * 0.5;

  // Calculate total wages
  const wage = Number(dailyWage) || 0;

  const totalWage = payableDays * wage;

  return {
    presentDays,
    absentDays,
    halfDays,
    leaveDays,
    payableDays,
    totalWage,
  };
};