
import React from 'react';
import { Employee, AttendanceRecord, ScheduleEntry, StoreLocation } from '../../types';

interface LiveStatusProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  schedule: ScheduleEntry[];
  stores: StoreLocation[];
}

const LiveStatus: React.FC<LiveStatusProps> = ({ employees, attendanceRecords, schedule, stores }) => {
  
  const getEmployeeStatusInfo = (employeeId: number) => {
    const lastRecord = attendanceRecords
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime())[0];

    let currentStoreName = '-';
    
    if (lastRecord && !lastRecord.clockOut) {
      const clockInDateString = lastRecord.clockIn.toISOString().split('T')[0];
      const scheduleEntry = schedule.find(s => s.employeeId === employeeId && s.date === clockInDateString);
      if (scheduleEntry) {
        const store = stores.find(st => st.id === scheduleEntry.storeId);
        currentStoreName = store?.name || 'Không rõ';
      }
      return { status: 'Đang làm việc', time: lastRecord.clockIn, isWorking: true, storeName: currentStoreName };
    }
    
    if (lastRecord && lastRecord.clockOut) {
        return { status: 'Đã ra về', time: lastRecord.clockOut, isWorking: false, storeName: '-' };
    }

    return { status: 'Chưa chấm công', time: null, isWorking: false, storeName: '-' };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Trạng Thái Trực Tiếp</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nhân viên</th>
              <th scope="col" className="px-6 py-3">Cửa hàng làm việc</th>
              <th scope="col" className="px-6 py-3">Trạng thái</th>
              <th scope="col" className="px-6 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => {
              const { status, time, isWorking, storeName } = getEmployeeStatusInfo(employee.id);
              return (
                <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4">{storeName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{time ? time.toLocaleString('vi-VN') : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveStatus;