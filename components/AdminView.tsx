
import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord, StoreLocation, ScheduleEntry, Shift } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import LiveStatus from './admin/LiveStatus';
import EmployeeManagement from './admin/EmployeeManagement';
import Reports from './admin/Reports';
import StoreManagement from './admin/StoreManagement';
import ScheduleManagement from './admin/ScheduleManagement';
import ShiftManagement from './admin/ShiftManagement';

interface AdminViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  stores: StoreLocation[];
  schedule: ScheduleEntry[];
  shifts: Shift[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateStore: (store: StoreLocation) => void;
  onUpdateSchedule: (entry: ScheduleEntry) => void;
  onUpdateShift: (shift: Shift) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onDeleteShift: (shiftId: string) => void;
  onSwitchToKiosk: () => void;
}

type AdminTab = 'status' | 'employees' | 'schedule' | 'shifts' | 'reports' | 'stores';

const AdminView: React.FC<AdminViewProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('schedule');
  
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mật khẩu không đúng.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng Nhập Quản Trị</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Nhập mật khẩu"
            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
            Đăng Nhập
          </button>
           <button onClick={props.onSwitchToKiosk} className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition mt-4">
            Quay lại Kiosk
          </button>
        </div>
      </div>
    );
  }

  const tabOptions: {tab: AdminTab, label: string, icon: string}[] = [
      {tab: 'status', label: 'Trạng thái', icon: 'fa-desktop'},
      {tab: 'employees', label: 'Nhân viên', icon: 'fa-users'},
      {tab: 'schedule', label: 'Lịch làm việc', icon: 'fa-calendar-alt'},
      {tab: 'shifts', label: 'Ca làm việc', icon: 'fa-clock'},
      {tab: 'reports', label: 'Báo cáo', icon: 'fa-chart-bar'},
      {tab: 'stores', label: 'Cửa hàng', icon: 'fa-store'},
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-white shadow-md z-10 sticky top-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <h1 className="text-xl font-bold text-blue-700">Trang Quản Trị</h1>
                
                {/* Desktop Tabs */}
                <nav className="hidden md:flex space-x-2">
                    {tabOptions.map(({tab, label, icon}) => (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <i className={`fas ${icon}`}></i>
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>

                {/* Mobile Dropdown */}
                 <div className="md:hidden">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                        {tabOptions.map(({tab, label}) => (
                            <option key={tab} value={tab}>{label}</option>
                        ))}
                    </select>
                </div>
                 
                 <button onClick={props.onSwitchToKiosk} className="text-gray-500 hover:text-blue-600 transition">
                    <i className="fas fa-power-off fa-lg sm:mr-2"></i>
                    <span className="hidden sm:inline">Thoát</span>
                </button>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
            {activeTab === 'status' && <LiveStatus {...props} />}
            {activeTab === 'employees' && <EmployeeManagement {...props} />}
            {activeTab === 'schedule' && <ScheduleManagement {...props} />}
            {activeTab === 'shifts' && <ShiftManagement shifts={props.shifts} onUpdateShift={props.onUpdateShift} onAddShift={props.onAddShift} onDeleteShift={props.onDeleteShift} />}
            {activeTab === 'reports' && <Reports {...props} />}
            {activeTab === 'stores' && <StoreManagement stores={props.stores} onUpdateStore={props.onUpdateStore} />}
        </main>
    </div>
  );
};

export default AdminView;
