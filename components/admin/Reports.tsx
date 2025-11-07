import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, ScheduleEntry, Shift } from '../../types';

declare const XLSX: any;

interface ReportsProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  schedule: ScheduleEntry[];
  shifts: Shift[];
}

const Reports: React.FC<ReportsProps> = ({ employees, attendanceRecords, schedule, shifts }) => {
    const [reportType, setReportType] = useState<'summary' | 'detail'>('summary');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees.length > 0 ? String(employees[0].id) : 'all');

    const summaryReportData = useMemo(() => {
        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();

        return employees.map(employee => {
            const employeeRecords = attendanceRecords.filter(r =>
                r.employeeId === employee.id &&
                r.clockIn.getFullYear() === selectedYear &&
                r.clockIn.getMonth() === selectedMonth
            );

            let totalHours = 0;
            let totalLateHours = 0;
            let totalOvertimeHours = 0;
            let lateCount = 0;
            let earlyLeaveCount = 0;
            let overtimeCount = 0;

            employeeRecords.forEach(record => {
                // Tổng giờ làm
                if (record.clockOut) {
                    totalHours += (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60);
                }

                // Giờ đi muộn (lệch âm) và số lần
                if (record.lateHours && record.lateHours > 0) {
                    totalLateHours += record.lateHours;
                    lateCount++;
                }
                
                // Số lần về sớm
                if (record.earlyLeaveHours && record.earlyLeaveHours > 0) {
                    earlyLeaveCount++;
                }

                // Giờ về muộn (lệch dương) và số lần
                if (record.clockOut) {
                    const recordDateString = record.clockIn.toISOString().split('T')[0];
                    const scheduleEntry = schedule.find(s => s.employeeId === employee.id && s.date === recordDateString);
                    if (scheduleEntry) {
                        const shift = shifts.find(s => s.id === scheduleEntry.shiftId);
                        if (shift) {
                            const [endHour, endMinute] = shift.endTime.split(':').map(Number);
                            const shiftEndTime = new Date(record.clockOut);
                            shiftEndTime.setHours(endHour, endMinute, 0, 0);

                            if (record.clockOut > shiftEndTime) {
                                const overtimeMs = record.clockOut.getTime() - shiftEndTime.getTime();
                                totalOvertimeHours += overtimeMs / (1000 * 60 * 60);
                                overtimeCount++;
                            }
                        }
                    }
                }
            });

            return {
                employeeId: employee.id,
                employeeName: employee.name,
                totalHours: totalHours.toFixed(2),
                totalLateHours: totalLateHours.toFixed(2),
                totalOvertimeHours: totalOvertimeHours.toFixed(2),
                lateCount,
                overtimeCount,
                earlyLeaveCount,
            };
        });
    }, [employees, attendanceRecords, schedule, shifts, currentDate]);

    const detailReportData = useMemo(() => {
        if (selectedEmployeeId === 'all' || employees.length === 0) return [];

        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();
        const empId = parseInt(selectedEmployeeId);
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const report = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth, day);
            const dateString = date.toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            const scheduleEntry = schedule.find(s => s.employeeId === empId && s.date === dateString);
            const shift = scheduleEntry ? shifts.find(sh => sh.id === scheduleEntry.shiftId) : null;
            const attendanceRecord = attendanceRecords.find(r =>
                r.employeeId === empId &&
                r.clockIn.toDateString() === date.toDateString()
            );

            let status = '';
            let statusColorClass = '';
            if (attendanceRecord) {
                status = 'Đã chấm công';
                statusColorClass = 'bg-green-100 text-green-800';
            } else if (isWeekend) {
                status = 'Ngày nghỉ cuối tuần';
                statusColorClass = 'bg-gray-100 text-gray-800';
            } else if (shift) {
                status = 'Nghỉ làm';
                statusColorClass = 'bg-red-100 text-red-800';
            } else {
                 status = 'Không có lịch';
                 statusColorClass = 'bg-yellow-100 text-yellow-800';
            }

            const duration = attendanceRecord?.clockOut ? (attendanceRecord.clockOut.getTime() - attendanceRecord.clockIn.getTime()) / (1000 * 60 * 60) : 0;
            const lateHours = attendanceRecord?.lateHours || 0;
            const earlyHours = attendanceRecord?.earlyLeaveHours || 0;

            report.push({
                date: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                shiftName: shift ? shift.shortName : (isWeekend ? '-' : 'Nghỉ'),
                clockIn: attendanceRecord?.clockIn.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) || '-',
                clockOut: attendanceRecord?.clockOut?.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) || '-',
                lateHours: lateHours > 0 ? lateHours.toFixed(2) : '-',
                earlyHours: earlyHours > 0 ? earlyHours.toFixed(2) : '-',
                totalHours: duration > 0 ? duration.toFixed(2) : '-',
                status,
                statusColorClass
            });
        }
        return report;
    }, [selectedEmployeeId, employees, attendanceRecords, schedule, shifts, currentDate]);

    const handleExportExcel = () => {
        let worksheet;
        let filename;
        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();
        const employeeName = employees.find(e => e.id === parseInt(selectedEmployeeId))?.name || 'TatCa';
        
        if (reportType === 'summary') {
            const dataToExport = summaryReportData.map(d => ({
                "Nhân viên": d.employeeName,
                "Tổng giờ làm (h)": parseFloat(d.totalHours),
                "Tổng lệch âm (h)": parseFloat(d.totalLateHours),
                "Tổng lệch dương (h)": parseFloat(d.totalOvertimeHours),
                "Số lần đi muộn": d.lateCount,
                "Số lần về muộn": d.overtimeCount,
                "Số lần về sớm": d.earlyLeaveCount,
            }));
            worksheet = XLSX.utils.json_to_sheet(dataToExport);
            filename = `BaoCaoTongHop_T${selectedMonth + 1}_${selectedYear}.xlsx`;
        } else {
            const dataToExport = detailReportData.map(d => ({
                "Ngày": `${d.date}, ${d.fullDate}`,
                "Ca làm việc": d.shiftName,
                "Giờ vào": d.clockIn,
                "Giờ ra": d.clockOut,
                "Đi muộn (h)": d.lateHours,
                "Về sớm (h)": d.earlyHours,
                "Tổng giờ (h)": d.totalHours,
                "Trạng thái": d.status
            }));
            worksheet = XLSX.utils.json_to_sheet(dataToExport);
            filename = `BaoCaoChiTiet_${employeeName.replace(/\s/g, '')}_T${selectedMonth + 1}_${selectedYear}.xlsx`;
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');
        XLSX.writeFile(workbook, filename);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month] = e.target.value.split('-').map(Number);
        setCurrentDate(new Date(year, month - 1, 1));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold">Báo Cáo Bảng Công</h2>
            
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setReportType('summary')} className={`px-4 py-2 rounded-md font-semibold transition ${reportType === 'summary' ? 'bg-blue-600 text-white shadow' : 'bg-white hover:bg-gray-200'}`}>Báo cáo Tổng hợp</button>
                    <button onClick={() => setReportType('detail')} className={`px-4 py-2 rounded-md font-semibold transition ${reportType === 'detail' ? 'bg-blue-600 text-white shadow' : 'bg-white hover:bg-gray-200'}`}>Báo cáo Chi tiết</button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label htmlFor="month-picker" className="text-sm font-medium text-gray-700 mr-2">Chọn tháng:</label>
                        <input 
                            type="month" 
                            id="month-picker"
                            value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                            onChange={handleMonthChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    {reportType === 'detail' && (
                        <div>
                            <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                        <i className="fas fa-file-excel"></i>
                        <span>Xuất Excel</span>
                    </button>
                </div>
            </div>

            {reportType === 'summary' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Nhân viên</th>
                                <th className="px-4 py-3">Tổng giờ làm</th>
                                <th className="px-4 py-3">Tổng lệch âm (giờ đi muộn)</th>
                                <th className="px-4 py-3">Tổng lệch dương (giờ về muộn)</th>
                                <th className="px-4 py-3">Số lần đi muộn</th>
                                <th className="px-4 py-3">Số lần về muộn</th>
                                <th className="px-4 py-3">Số lần về sớm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryReportData.map(d => (
                                <tr key={d.employeeId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{d.employeeName}</td>
                                    <td className="px-4 py-3 font-semibold">{d.totalHours} h</td>
                                    <td className={`px-4 py-3 font-semibold ${parseFloat(d.totalLateHours) > 0 ? 'text-red-500' : ''}`}>{d.totalLateHours} h</td>
                                    <td className={`px-4 py-3 font-semibold ${parseFloat(d.totalOvertimeHours) > 0 ? 'text-green-500' : ''}`}>{d.totalOvertimeHours} h</td>
                                    <td className={`px-4 py-3 font-semibold ${d.lateCount > 0 ? 'text-red-500' : ''}`}>{d.lateCount}</td>
                                    <td className={`px-4 py-3 font-semibold ${d.overtimeCount > 0 ? 'text-green-500' : ''}`}>{d.overtimeCount}</td>
                                    <td className={`px-4 py-3 font-semibold ${d.earlyLeaveCount > 0 ? 'text-orange-500' : ''}`}>{d.earlyLeaveCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Ngày</th>
                                <th className="px-4 py-3">Ca làm</th>
                                <th className="px-4 py-3">Giờ vào</th>
                                <th className="px-4 py-3">Giờ ra</th>
                                <th className="px-4 py-3">Đi muộn (h)</th>
                                <th className="px-4 py-3">Về sớm (h)</th>
                                <th className="px-4 py-3">Tổng giờ</th>
                                <th className="px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailReportData.map((d, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{d.date}, {d.fullDate}</td>
                                    <td className="px-4 py-3">{d.shiftName}</td>
                                    <td className="px-4 py-3">{d.clockIn}</td>
                                    <td className="px-4 py-3">{d.clockOut}</td>
                                    <td className={`px-4 py-3 font-semibold ${d.lateHours !== '-' ? 'text-red-500' : ''}`}>{d.lateHours}</td>
                                    <td className={`px-4 py-3 font-semibold ${d.earlyHours !== '-' ? 'text-red-500' : ''}`}>{d.earlyHours}</td>
                                    <td className="px-4 py-3 font-semibold">{d.totalHours}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.statusColorClass}`}>{d.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {detailReportData.length === 0 && <p className="text-center py-4 text-gray-500">Vui lòng chọn nhân viên để xem chi tiết.</p>}
                </div>
            )}
        </div>
    );
};

export default Reports;