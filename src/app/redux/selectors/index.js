// ==========================================
// BASIC REDUX STATE SELECTORS
// ==========================================

export const selectCrops = (state) => state.crops ?? [];

export const selectTasks = (state) => state.tasks ?? [];

export const selectInventory = (state) => state.inventory ?? [];

export const selectExpenses = (state) => state.expenses ?? [];

export const selectBuyers = (state) => state.buyers ?? [];

export const selectHarvest = (state) => state.harvest ?? {};

export const selectActivity = (state) => state.activity ?? [];

export const selectWorkers = (state) => state.workers ?? [];

export const selectAttendance = (state) => state.attendance ?? [];

export const selectEquipment = (state) => state.equipment ?? [];

export const selectMaintenance = (state) => state.maintenance ?? [];

export const selectAuthUser = (state) => state.auth?.user ?? null;

export const selectIsAuthenticated = (state) =>
  state.auth?.isAuthenticated ?? false;


// ==========================================
// BASIC COUNT SELECTORS
// ==========================================

export const selectCropCount = (state) =>
  selectCrops(state).length;

export const selectTaskCount = (state) =>
  selectTasks(state).length;

export const selectInventoryCount = (state) =>
  selectInventory(state).length;

export const selectExpenseCount = (state) =>
  selectExpenses(state).length;

export const selectBuyerCount = (state) =>
  selectBuyers(state).length;

export const selectWorkerCount = (state) =>
  selectWorkers(state).length;

export const selectEquipmentCount = (state) =>
  selectEquipment(state).length;


// ==========================================
// LOCAL DATE HELPER
// ==========================================

const getLocalDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


// ==========================================
// WORKERS & ATTENDANCE SELECTORS
// ==========================================

import { calculateMonthlyWage } from "../../../features/workers/workerUtils.js";

export const selectActiveWorkers = (state) =>
  selectWorkers(state).filter(
    (worker) => worker.status === "Active"
  );


export const selectWorkersPresentToday = (state) => {
  const today = getLocalDate();

  return selectAttendance(state).filter(
    (record) =>
      record.date === today &&
      record.status === "Present"
  ).length;
};


export const selectWorkersAbsentToday = (state) => {
  const today = getLocalDate();

  return selectAttendance(state).filter(
    (record) =>
      record.date === today &&
      record.status === "Absent"
  ).length;
};


// ==========================================
// MONTHLY WAGES SELECTOR
// ==========================================

export const selectMonthlyWagesPayable = (state) => {
  const workers = selectActiveWorkers(state);
  const attendance = selectAttendance(state);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return workers.reduce((total, worker) => {
    const summary = calculateMonthlyWage(
      attendance,
      worker.id,
      Number(worker.dailyWage) || 0,
      month,
      year
    );

    return total + (Number(summary?.totalWage) || 0);
  }, 0);
};


// ==========================================
// WORKER ABSENCE PERCENTAGE
// ==========================================

export const selectWorkerAbsencePercentage = (state) => {
  const present = selectWorkersPresentToday(state);
  const absent = selectWorkersAbsentToday(state);

  const markedAttendance = present + absent;

  return markedAttendance > 0
    ? (absent / markedAttendance) * 100
    : 0;
};