import React, { useState, useMemo } from 'react';
import { Employee, StoreLocation, ScheduleEntry, Shift } from '../../types';

interface ScheduleManagementProps {
  employees: Employee[];
  stores: StoreLocation[];
  schedule: ScheduleEntry[];
  shifts: Shift[];
  onUpdateSchedule: (entry: ScheduleEntry) => void;
}

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ employees, stores, schedule, shifts, onUpdateSchedule }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekDates = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startOfWeek.setDate(diff);

        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [currentDate]);

    const shiftStoreOptions = useMemo(() => {
        const options: { value: string; label: string; shiftId: string }[] = [{ value: 'none', label: '-- Nghỉ --', shiftId: 'none' }];
        const activeStores = stores.filter(s => s.latitude !== 0);
        
        shifts.forEach(shift => {
            activeStores.forEach(store => {
                options.push({
                    value: `${shift.id}|${store.id}`,
                    label: `${shift.name} @ ${store.name}`,
                    shiftId: shift.id,
                });
            });
        });
        return options;
    }, [shifts, stores]);

    const handleScheduleChange = (employeeId: number, date: string, value: string) => {
        if (value === 'none') {
            onUpdateSchedule({ employeeId, date, shiftId: 'none', storeId: 0 });
            return;
        }

        const [shiftId, storeIdStr] = value.split('|');
        const storeId = parseInt(storeIdStr, 10);

        if (shiftId && !isNaN(storeId)) {
            onUpdateSchedule({ employeeId, date, shiftId, storeId });
        }
    };
    
    const handleBulkAssign = (date: Date, value: string) => {
        const dateString = date.toISOString().split('T')[0];
        const selectedOption = shiftStoreOptions.find(opt => opt.value === value);
        if (!selectedOption) return;

        const confirmationMessage = value === 'none'
            ? `Bạn có chắc muốn xóa lịch làm việc của tất cả nhân viên vào ngày ${date.toLocaleDateString('vi-VN')} không?`
            : `Bạn có chắc muốn gán "${selectedOption.label}" cho tất cả nhân viên vào ngày ${date.toLocaleDateString('vi-VN')} không?`;

        if (window.confirm(confirmationMessage)) {
            employees.forEach(employee => {
                handleScheduleChange(employee.id, dateString, value);
            });
        }
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
            return newDate;
        });
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold">Quản lý Lịch làm việc</h2>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-md bg-gray-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => changeWeek('prev')} className="px-3 py-2 bg-white border rounded-md hover:bg-gray-100"><i className="fas fa-chevron-left"></i></button>
                    <span className="font-semibold text-lg text-center w-52 sm:w-64">
                        {weekDates[0].toLocaleDateString('vi-VN')} - {weekDates[6].toLocaleDateString('vi-VN')}
                    </span>
                    <button onClick={() => changeWeek('next')} className="px-3 py-2 bg-white border rounded-md hover:bg-gray-100"><i className="fas fa-chevron-right"></i></button>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    <span>Sử dụng ô "Gán cho tất cả" để xếp lịch nhanh.</span>
                </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 border sticky left-0 bg-gray-50 z-20 min-w-[200px]">Nhân viên</th>
                            {weekDates.map(date => (
                                <th key={date.toISOString()} className="px-4 py-3 border text-center whitespace-nowrap min-w-[220px]">
                                    {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    <br/>
                                    {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </th>
                            ))}
                        </tr>
                        {/* Bulk Assign Row */}
                         <tr className="bg-gray-100">
                            <th className="px-4 py-2 border sticky left-0 bg-gray-100 z-20 font-semibold text-gray-600">
                                <div className="flex items-center gap-2">
                                  <i className="fas fa-tasks"></i> Gán cho tất cả
                                </div>
                            </th>
                            {weekDates.map(date => (
                                <td key={`bulk-${date.toISOString()}`} className="px-2 py-1 border">
                                    <select
                                        onChange={(e) => handleBulkAssign(date, e.target.value)}
                                        className="w-full p-1.5 border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        defaultValue="placeholder"
                                    >
                                        <option value="placeholder" disabled>-- Chọn để gán --</option>
                                        {shiftStoreOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.sort((a,b) => a.name.localeCompare(b.name)).map(employee => (
                            <tr key={employee.id} className="bg-white hover:bg-gray-50/80">
                                <td className="px-4 py-2 border font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50/80 whitespace-nowrap z-10">{employee.name}</td>
                                {weekDates.map(date => {
                                    const dateString = date.toISOString().split('T')[0];
                                    const entry = schedule.find(s => s.employeeId === employee.id && s.date === dateString);
                                    const currentShift = shifts.find(s => s.id === entry?.shiftId);
                                    
                                    const currentValue = entry && entry.shiftId !== 'none' ? `${entry.shiftId}|${entry.storeId}` : 'none';
                                    const bgColor = currentShift ? currentShift.color : 'bg-white';

                                    return (
                                        <td key={dateString} className={`px-2 py-1 border align-middle transition-colors ${bgColor}`}>
                                            <select 
                                                value={currentValue} 
                                                onChange={(e) => handleScheduleChange(employee.id, dateString, e.target.value)}
                                                className="w-full p-1.5 border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {shiftStoreOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                      {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {employees.length === 0 && <p className="text-center py-4 text-gray-500">Không có nhân viên nào.</p>}
            </div>
        </div>
    );
};

export default ScheduleManagement;