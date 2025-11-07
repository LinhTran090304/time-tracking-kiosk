
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, AttendanceRecord, StoreLocation, ScheduleEntry, Shift } from '../types';
import { GEOLOCATION_RADIUS_METERS } from '../constants';
import Avatar from './Avatar';

interface KioskViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  stores: StoreLocation[];
  schedule: ScheduleEntry[];
  shifts: Shift[];
  onClockIn: (employeeId: number, lateHours?: number) => void;
  onClockOut: (employeeId: number, earlyLeaveHours?: number) => void;
  onSwitchToAdmin: () => void;
}

const KioskView: React.FC<KioskViewProps> = ({ employees, attendanceRecords, stores, schedule, shifts, onClockIn, onClockOut, onSwitchToAdmin }) => {
  const [time, setTime] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New states for PIN authentication
  const [enteredPin, setEnteredPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);
    
  useEffect(() => {
    if (enteredPin.length === 4 && selectedEmployeeId) {
        const employee = employees.find(e => e.id === selectedEmployeeId);
        if (employee && employee.pin === enteredPin) {
            setIsPinVerified(true);
            setPinError(false);
            setMessage({ type: 'success', text: 'Xác thực thành công!' });
        } else {
            setPinError(true);
            setTimeout(() => {
                setEnteredPin('');
                setPinError(false);
            }, 800);
        }
    }
  }, [enteredPin, selectedEmployeeId, employees]);

  const selectedEmployeeSchedule = useMemo(() => {
    if (!selectedEmployeeId) return null;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));

    const weekSchedule: { day: string; shiftShortName: string | null; isToday: boolean, storeName: string | null }[] = [];
    const todayString = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const dateString = currentDay.toISOString().split('T')[0];
        
        const scheduleEntry = schedule.find(s => s.employeeId === selectedEmployeeId && s.date === dateString);
        const shift = scheduleEntry ? shifts.find(sh => sh.id === scheduleEntry.shiftId) : null;
        const store = scheduleEntry ? stores.find(st => st.id === scheduleEntry.storeId) : null;
        
        weekSchedule.push({
            day: currentDay.toLocaleDateString('vi-VN', { weekday: 'long' }),
            shiftShortName: shift ? shift.shortName : null,
            isToday: dateString === todayString,
            storeName: store ? store.name : null,
        });
    }
    return weekSchedule;
  }, [selectedEmployeeId, schedule, shifts, stores]);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chúc một buổi chiều năng suất';
    return 'Chào buổi tối';
  };

  const getEmployeeStatus = (employeeId: number) => {
    const lastRecord = attendanceRecords
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime())[0];
    return lastRecord && !lastRecord.clockOut ? 'clocked-in' : 'clocked-out';
  };
  
  const recentActivities = useMemo(() => {
    return [...attendanceRecords]
      .sort((a, b) => (b.clockOut || b.clockIn).getTime() - (a.clockOut || a.clockIn).getTime())
      .slice(0, 5)
      .map(record => {
          const employee = employees.find(e => e.id === record.employeeId);
          if (!employee) return null;

          if (record.clockOut) {
              return {
                  id: record.id,
                  message: `${employee.name} vừa ra về.`,
                  time: record.clockOut.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'out' as const
              };
          }
          return {
              id: record.id,
              message: `${employee.name} vừa vào làm.`,
              time: record.clockIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              type: 'in' as const
          };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [attendanceRecords, employees]);

  const filteredEmployees = useMemo(() => {
      return employees.filter(employee =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [employees, searchTerm]);

  const getTodaysScheduleInfo = (employeeId: number) => {
      const todayString = new Date().toISOString().split('T')[0];
      const scheduleEntry = schedule.find(s => s.employeeId === employeeId && s.date === todayString);
      if (!scheduleEntry) return { storeName: 'Không có lịch', storeId: null };
      
      const store = stores.find(s => s.id === scheduleEntry.storeId);
      return { storeName: store?.name || 'Không rõ', storeId: store?.id || null };
  }


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };
  
  const calculateLateOrEarlyLeaveHours = (employeeId: number) => {
    const todayString = new Date().toISOString().split('T')[0];
    const scheduleEntry = schedule.find(s => s.employeeId === employeeId && s.date === todayString);
    if (!scheduleEntry) return { lateHours: undefined, earlyLeaveHours: undefined };

    const shift = shifts.find(s => s.id === scheduleEntry.shiftId);
    if (!shift) return { lateHours: undefined, earlyLeaveHours: undefined };

    const now = new Date();
    
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const shiftStartTime = new Date();
    shiftStartTime.setHours(startHour, startMinute, 0, 0);

    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    const shiftEndTime = new Date();
    shiftEndTime.setHours(endHour, endMinute, 0, 0);

    const lateMs = now.getTime() - shiftStartTime.getTime();
    const earlyLeaveMs = shiftEndTime.getTime() - now.getTime();

    const lateHours = lateMs > 0 ? lateMs / (1000 * 60 * 60) : 0;
    const earlyLeaveHours = earlyLeaveMs > 0 ? earlyLeaveMs / (1000 * 60 * 60) : 0;
    
    return { lateHours, earlyLeaveHours };
  };

  const validateClockingTime = (shift: Shift, action: 'clock-in' | 'clock-out'): { isValid: boolean; message?: string } => {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (action === 'clock-in') {
      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date();
      shiftStartTime.setHours(startHour, startMinute, 0, 0);

      const graceBefore = shift.clockInGracePeriodMinutesBefore ?? 0;
      const graceAfter = shift.clockInGracePeriodMinutesAfter ?? 0;

      const allowedStartTime = new Date(shiftStartTime.getTime() - graceBefore * 60000);
      const allowedEndTime = new Date(shiftStartTime.getTime() + graceAfter * 60000);

      if (now < allowedStartTime || now > allowedEndTime) {
        return { 
          isValid: false, 
          message: `Bạn chỉ có thể vào làm từ ${timeFormatter.format(allowedStartTime)} đến ${timeFormatter.format(allowedEndTime)}.` 
        };
      }
    } else { // clock-out
      const [endHour, endMinute] = shift.endTime.split(':').map(Number);
      const shiftEndTime = new Date();
      shiftEndTime.setHours(endHour, endMinute, 0, 0);

      const graceBefore = shift.clockOutGracePeriodMinutesBefore ?? 0;
      const graceAfter = shift.clockOutGracePeriodMinutesAfter ?? 0;
      
      const allowedStartTime = new Date(shiftEndTime.getTime() - graceBefore * 60000);
      const allowedEndTime = new Date(shiftEndTime.getTime() + graceAfter * 60000);

       if (now < allowedStartTime || now > allowedEndTime) {
        return { 
          isValid: false, 
          message: `Bạn chỉ có thể ra về từ ${timeFormatter.format(allowedStartTime)} đến ${timeFormatter.format(allowedEndTime)}.`
        };
      }
    }

    return { isValid: true };
  };

  const handleAction = (employeeId: number, action: 'clock-in' | 'clock-out') => {
    setIsLoading(true);
    setMessage(null);

    const todayString = new Date().toISOString().split('T')[0];
    const scheduleEntry = schedule.find(s => s.employeeId === employeeId && s.date === todayString);

    if (!scheduleEntry) {
        setMessage({ type: 'error', text: 'Bạn không có lịch làm việc hôm nay.' });
        setIsLoading(false);
        return;
    }

    const shift = shifts.find(s => s.id === scheduleEntry.shiftId);
    if (!shift) {
        setMessage({ type: 'error', text: 'Không tìm thấy thông tin ca làm việc.' });
        setIsLoading(false);
        return;
    }

    // ** 1. Time Validation **
    const timeValidation = validateClockingTime(shift, action);
    if (!timeValidation.isValid) {
        setMessage({ type: 'error', text: `Chấm công thất bại. ${timeValidation.message}` });
        setIsLoading(false);
        return;
    }
    
    const storeLocation = stores.find(s => s.id === scheduleEntry.storeId);
    if (!storeLocation || (storeLocation.latitude === 0 && storeLocation.longitude === 0)) {
        setMessage({ type: 'error', text: `Cửa hàng '${storeLocation?.name || 'lạ'}' chưa có vị trí.` });
        setIsLoading(false);
        return;
    }
    
    // ** 2. Geolocation Validation **
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          storeLocation.latitude,
          storeLocation.longitude
        );

        if (distance <= GEOLOCATION_RADIUS_METERS) {
           const employee = employees.find(e => e.id === employeeId)!;
           if (action === 'clock-in') {
            const { lateHours } = calculateLateOrEarlyLeaveHours(employee.id);
            onClockIn(employee.id, lateHours && lateHours > 0 ? lateHours : undefined);
            setMessage({ type: 'success', text: `Chào mừng ${employee.name}!` });
          } else {
            const { earlyLeaveHours } = calculateLateOrEarlyLeaveHours(employee.id);
            onClockOut(employee.id, earlyLeaveHours && earlyLeaveHours > 0 ? earlyLeaveHours : undefined);
            setMessage({ type: 'success', text: `Tạm biệt ${employee.name}!` });
          }
          setSelectedEmployeeId(null); // Reset selection on success
        } else {
          setMessage({ type: 'error', text: `Bạn không ở trong phạm vi cửa hàng. (${Math.round(distance)}m)` });
        }
        setIsLoading(false);
      },
      (error) => {
        let errorText = 'Không thể lấy vị trí.';
        if(error.code === 1) errorText = 'Vui lòng cho phép truy cập vị trí.';
        setMessage({ type: 'error', text: errorText });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectEmployee = (employeeId: number) => {
      if (isLoading) return;
      const isCurrentlySelected = selectedEmployeeId === employeeId;
      
      setEnteredPin('');
      setIsPinVerified(false);
      setPinError(false);
      setMessage(null); // Clear previous messages
      
      setSelectedEmployeeId(isCurrentlySelected ? null : employeeId);
  };
  
  const handlePinPadClick = (value: string) => {
      if (pinError) return;
      if (value === 'backspace') {
          setEnteredPin(p => p.slice(0, -1));
      } else if (value === 'clear') {
          setEnteredPin('');
      } else if (enteredPin.length < 4) {
          setEnteredPin(p => p + value);
      }
  };
  
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans">
      {/* Left Info Panel */}
      <div className="w-full lg:w-2/5 bg-white shadow-lg flex flex-col p-6 lg:p-8 justify-between">
        <div>
          <header className="mb-8 lg:mb-12">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">BOOKSTORE CHAIN</h1>
            <p className="text-gray-500">Hệ thống chấm công</p>
          </header>
          <div className="text-center">
             <h2 className="text-5xl sm:text-6xl font-bold text-gray-800 tracking-wider">
                {time.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
             </h2>
             <p className="text-lg sm:text-xl text-gray-500 mt-2">{time.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             <p className="text-xl sm:text-2xl text-blue-600 mt-6 lg:mt-8 font-semibold">{getGreeting()}</p>
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
                {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center text-sm">
                        <i className={`fas ${activity.type === 'in' ? 'fa-sign-in-alt text-green-500' : 'fa-sign-out-alt text-red-500'} mr-3 fa-lg w-6 text-center`}></i>
                        <span className="text-gray-600 flex-grow">{activity.message}</span>
                        <span className="text-gray-400 font-mono">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Employee Grid */}
      <main className="w-full lg:w-3/5 flex flex-col relative flex-grow">
        {/* Toast Notification */}
        {message && (
            <div className={`absolute top-6 right-6 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 transition-transform transform-gpu animate-fade-in-down ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                <span>{message.text}</span>
            </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-b border-gray-200 gap-4">
            <div className="relative w-full max-w-md">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button onClick={onSwitchToAdmin} className="text-gray-500 hover:text-blue-600 transition flex items-center space-x-2" title="Admin Login">
                <i className="fas fa-user-shield fa-2x"></i>
                <span className="font-semibold hidden lg:inline">Quản trị</span>
            </button>
        </div>

        <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
          {filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map(employee => {
                    const status = getEmployeeStatus(employee.id);
                    const isSelected = selectedEmployeeId === employee.id;
                    const isClockedIn = status === 'clocked-in';
                    const { storeName } = getTodaysScheduleInfo(employee.id);

                    return (
                    <div 
                        key={employee.id} 
                        onClick={() => handleSelectEmployee(employee.id)} 
                        className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-300 ease-in-out ${isClockedIn ? 'bg-green-100/70 border-green-300' : 'bg-white border-gray-200'} border-2 ${isSelected ? 'scale-105 shadow-xl ring-2 ring-blue-500' : 'transform hover:scale-[1.03]'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                                <Avatar name={employee.name} className="border-2 border-white shadow-md"/>
                                <div className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full ${isClockedIn ? 'bg-green-500' : 'bg-gray-400'} border-2 ${isClockedIn ? 'border-green-100' : 'border-white'}`}></div>
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-gray-800 truncate">{employee.name}</p>
                                <p className={`text-sm truncate ${storeName === 'Không có lịch' ? 'text-gray-400 font-style-italic' : 'text-gray-500'}`}>{storeName}</p>
                            </div>
                        </div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-300/80">
                        {isPinVerified ? (
                            <>
                                {selectedEmployeeSchedule && (
                                    <div className="text-xs text-left border-b border-gray-300/80 pb-3 mb-3">
                                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Lịch làm việc tuần này</h4>
                                        <ul className="space-y-1">
                                            {selectedEmployeeSchedule.map(({ day, shiftShortName, isToday, storeName }) => (
                                                <li key={day} className={`flex justify-between items-start p-1 rounded ${isToday ? 'bg-blue-100' : ''}`}>
                                                    <span className={`text-gray-700 ${isToday ? 'font-bold' : ''}`}>{day}</span>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-0.5 rounded text-white text-[11px] ${!shiftShortName ? 'bg-gray-400' : 'bg-blue-500'}`}>
                                                            {shiftShortName || 'Nghỉ'}
                                                        </span>
                                                        {storeName && <p className="text-gray-600 text-[10px] mt-0.5 truncate max-w-[100px]">{storeName}</p>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {isLoading ? (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        <span>Đang xử lý...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAction(employee.id, isClockedIn ? 'clock-out' : 'clock-in'); }}
                                            className={`w-full text-white font-bold py-2 px-3 rounded-lg text-md transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 ${isClockedIn ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' : 'bg-green-500 hover:bg-green-600 focus:ring-green-300'}`}
                                        >
                                            <i className={`fas ${isClockedIn ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} mr-2`}></i>
                                            {isClockedIn ? 'Ra Về' : 'Vào Làm'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <p className="font-semibold mb-2">Nhập mã PIN</p>
                                <div className={`flex items-center space-x-2 mb-3 h-8 ${pinError ? 'shake-error' : ''}`}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className={`w-5 h-5 rounded-full border-2 transition-colors ${enteredPin.length > i ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-400'}`}></div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
                                    {[...Array(9).keys()].map(i => i + 1).map(digit => (
                                        <button key={digit} onClick={(e) => { e.stopPropagation(); handlePinPadClick(String(digit)); }} className="py-2 text-lg font-bold bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">{digit}</button>
                                    ))}
                                    <button onClick={(e) => { e.stopPropagation(); handlePinPadClick('clear'); }} className="py-2 text-lg font-bold bg-yellow-400/80 rounded-md hover:bg-yellow-500/80 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">C</button>
                                    <button onClick={(e) => { e.stopPropagation(); handlePinPadClick('0'); }} className="py-2 text-lg font-bold bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">0</button>
                                    <button onClick={(e) => { e.stopPropagation(); handlePinPadClick('backspace'); }} className="py-2 text-lg font-bold bg-red-400/80 rounded-md hover:bg-red-500/80 focus:outline-none focus:ring-2 focus:ring-red-400 transition"><i className="fas fa-backspace"></i></button>
                                </div>
                            </div>
                        )}
                        </div>
                      )}
                    </div>
                    );
                })}
            </div>
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
                <i className="fas fa-user-slash fa-3x mb-4"></i>
                <p>Không tìm thấy nhân viên nào.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default KioskView;
