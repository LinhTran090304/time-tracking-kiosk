export interface Employee {
  id: number;
  name: string;
  pin: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  clockIn: Date;
  clockOut?: Date;
  clockInEdited?: boolean;
  clockOutEdited?: boolean;
  lateHours?: number;
  earlyLeaveHours?: number;
}

export interface StoreLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Shift {
    id: string;
    name: string;
    shortName: string;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    color: string; // e.g., 'bg-blue-200'
    clockInGracePeriodMinutesBefore?: number; // Allowed minutes to clock in before shift starts
    clockInGracePeriodMinutesAfter?: number;  // Allowed minutes to clock in after shift starts
    clockOutGracePeriodMinutesBefore?: number; // Allowed minutes to clock out before shift ends
    clockOutGracePeriodMinutesAfter?: number; // Allowed minutes to clock out after shift ends
}

export interface ScheduleEntry {
    employeeId: number;
    date: string; // "YYYY-MM-DD"
    shiftId: string;
    storeId: number;
}