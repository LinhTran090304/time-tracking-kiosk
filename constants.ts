import { Employee, StoreLocation, AttendanceRecord, Shift, ScheduleEntry } from './types';

export const INITIAL_STORE_LOCATIONS: StoreLocation[] = [
  { id: 1, name: "Kho", latitude: 21.030, longitude: 105.800 }, // Placeholder coordinates
  { id: 2, name: "Resco", latitude: 21.040, longitude: 105.810 }, // Placeholder coordinates
  { id: 3, name: "Võng Thị", latitude: 21.050, longitude: 105.820 }, // Placeholder coordinates
  { id: 4, name: "Nam Cường", latitude: 21.010, longitude: 105.780 }, // Placeholder coordinates
  { id: 5, name: "Vĩnh Phúc", latitude: 21.309, longitude: 105.601 }, // Placeholder coordinates
  { id: 6, name: "Nghĩa Đô", latitude: 21.045, longitude: 105.795 }, // Placeholder coordinates
  { id: 7, name: "Chưa phân công", latitude: 0, longitude: 0 }, // No valid location
];

export const GEOLOCATION_RADIUS_METERS = 500; // 500 meters radius for clock-in

export const ADMIN_PASSWORD = "admin";

export const INITIAL_EMPLOYEES: Employee[] = [
    { id: 1, name: "Nguyễn Thị Dịu", pin: "1111" },
    { id: 2, name: "Phạm Thị Nhẹ", pin: "2222" },
    { id: 3, name: "Đoàn Thị Minh Anh", pin: "3333" },
    { id: 4, name: "Nguyễn Thị Cẩm Vân", pin: "4444" },
    { id: 5, name: "Nguyễn Thị Nhung", pin: "5555" },
    { id: 6, name: "Nguyễn Thảo Mây", pin: "1234" },
    { id: 7, name: "Nguyễn Hải Anh", pin: "1234" },
    { id: 8, name: "Đặng Thùy Dương", pin: "1234" },
    { id: 9, name: "Phạm Thị Mai", pin: "1234" },
    { id: 10, name: "Lò Thị Biên", pin: "1234" },
    { id: 11, name: "Lý Nguyễn Ngọc Diệp", pin: "1234" },
    { id: 12, name: "Nguyễn Thị Minh Tâm", pin: "1234" },
    { id: 13, name: "Hoàng Thị Ngọc Anh", pin: "1234" },
    { id: 14, name: "Nguyễn Thị Hoa Lan", pin: "1234" },
    { id: 15, name: "Trần Hoàng Linh Nhi", pin: "1234" },
    { id: 16, name: "Đinh Thị Hồng Liên", pin: "1234" },
    { id: 17, name: "Nguyễn Thị Vân Khánh", pin: "1234" },
    { id: 18, name: "Trần Thị Ánh Nguyệt", pin: "1234" },
    { id: 19, name: "Phạm Hân Bình", pin: "1234" },
    { id: 20, name: "Nông Phương Thảo", pin: "1234" },
    { id: 21, name: "Vương Ngọc Anh", pin: "1234" },
    { id: 22, name: "Trần Trà My", pin: "1234" },
    { id: 23, name: "Nguyễn Đức Hải", pin: "1234" },
    { id: 24, name: "Đỗ Hoàng Kim Tân", pin: "1234" },
    { id: 25, name: "Nguyễn Hà My", pin: "1234" },
    { id: 26, name: "Lê Phương Linh", pin: "1234" },
    { id: 27, name: "Nguyễn Hồng Nhung", pin: "1234" },
];

export const INITIAL_SHIFTS: Shift[] = [
    { 
        id: 'PT-S', name: 'Ca Part-time Sáng', shortName: '6:30-12:00', startTime: '06:30', endTime: '12:00', color: 'bg-sky-200',
        clockInGracePeriodMinutesBefore: 30, clockInGracePeriodMinutesAfter: 10,
        clockOutGracePeriodMinutesBefore: 10, clockOutGracePeriodMinutesAfter: 30
    },
    { 
        id: 'PT-C', name: 'Ca Part-time Chiều', shortName: '12:00-18:00', startTime: '12:00', endTime: '18:00', color: 'bg-amber-200',
        clockInGracePeriodMinutesBefore: 30, clockInGracePeriodMinutesAfter: 10,
        clockOutGracePeriodMinutesBefore: 10, clockOutGracePeriodMinutesAfter: 30
    },
    { 
        id: 'PT-T', name: 'Ca Part-time Tối', shortName: '16:00-22:00', startTime: '16:00', endTime: '22:00', color: 'bg-indigo-200',
        clockInGracePeriodMinutesBefore: 30, clockInGracePeriodMinutesAfter: 10,
        clockOutGracePeriodMinutesBefore: 10, clockOutGracePeriodMinutesAfter: 30
    },
    { 
        id: 'FT-S', name: 'Ca Full-time Sáng', shortName: '6:30-17:00', startTime: '06:30', endTime: '17:00', color: 'bg-teal-200',
        clockInGracePeriodMinutesBefore: 30, clockInGracePeriodMinutesAfter: 10,
        clockOutGracePeriodMinutesBefore: 10, clockOutGracePeriodMinutesAfter: 30
    },
    { 
        id: 'FT-C', name: 'Ca Full-time Chiều', shortName: '12:00-22:00', startTime: '12:00', endTime: '22:00', color: 'bg-blue-200',
        clockInGracePeriodMinutesBefore: 30, clockInGracePeriodMinutesAfter: 10,
        clockOutGracePeriodMinutesBefore: 10, clockOutGracePeriodMinutesAfter: 30
    },
];

export const INITIAL_SCHEDULE: ScheduleEntry[] = [
    { employeeId: 1, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], shiftId: 'FT-S', storeId: 1 },
    { employeeId: 1, date: new Date().toISOString().split('T')[0], shiftId: 'FT-S', storeId: 1 },
    { employeeId: 2, date: new Date().toISOString().split('T')[0], shiftId: 'PT-C', storeId: 2 },
    { employeeId: 3, date: new Date().toISOString().split('T')[0], shiftId: 'PT-T', storeId: 3 },
    { employeeId: 4, date: new Date().toISOString().split('T')[0], shiftId: 'PT-C', storeId: 2 },
];

const generateMockAttendanceRecords = (employees: Employee[], daysToGoBack: number): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  let recordId = 1;
  const today = new Date();

  for (let i = daysToGoBack; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    currentDate.setHours(0, 0, 0, 0);

    // Bỏ qua cuối tuần để thực tế hơn
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    employees.forEach(employee => {
      // Giả sử không phải nhân viên nào cũng đi làm mỗi ngày
      if (Math.random() > 0.15) { // 85% cơ hội đi làm
        
        // Giờ vào làm từ 8:00 AM đến 9:30 AM
        const clockInHour = 8 + Math.random() * 1.5;
        const clockIn = new Date(currentDate);
        clockIn.setHours(clockInHour, Math.random() * 60, Math.random() * 60);

        let clockOut: Date | undefined = undefined;

        // Nếu là ngày trong quá khứ, họ nên đã ra về
        if (i > 0) {
          // Thời gian làm việc từ 8 đến 9.5 giờ (bao gồm nghỉ)
          const workDurationMs = (8 + Math.random() * 1.5) * 60 * 60 * 1000;
          clockOut = new Date(clockIn.getTime() + workDurationMs);
        } else { // Nếu là hôm nay
          const now = new Date();
          // Nếu đã qua giờ vào làm
          if (now > clockIn) {
             // 50% cơ hội vẫn đang làm việc nếu trước 5 PM
             if (now.getHours() < 17 && Math.random() > 0.5) {
                clockOut = undefined;
             } else {
                const workDurationMs = (8 + Math.random() * 1.5) * 60 * 60 * 1000;
                let potentialClockOut = new Date(clockIn.getTime() + workDurationMs);
                // Đảm bảo giờ ra về không ở tương lai
                if (potentialClockOut > now) {
                    potentialClockOut = new Date(now.getTime() - Math.random() * 3600000); // ra về trong khoảng 1 giờ trước
                }
                clockOut = potentialClockOut;
             }
          } else {
             // Bỏ qua, nhân viên chưa vào làm hôm nay
             return;
          }
        }
        
        records.push({
          id: recordId++,
          employeeId: employee.id,
          clockIn: clockIn,
          clockOut: clockOut,
        });
      }
    });
  }
  return records;
};

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = generateMockAttendanceRecords(INITIAL_EMPLOYEES, 30);