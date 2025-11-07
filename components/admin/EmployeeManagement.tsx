import React, { useState } from 'react';
import { Employee, StoreLocation } from '../../types';

interface EmployeeManagementProps {
  employees: Employee[];
  stores: StoreLocation[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
}

const EmployeeForm: React.FC<{
  employee?: Employee;
  onSave: (employee: Omit<Employee, 'id'> | Employee) => void;
  onCancel: () => void;
}> = ({ employee, onSave, onCancel }) => {
  const [name, setName] = useState(employee?.name || '');
  const [pin, setPin] = useState(employee?.pin || '');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      setFormError('Tên nhân viên không được để trống.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setFormError('Mã PIN phải là 4 chữ số.');
      return;
    }
    setFormError('');
    const data = { ...employee, name, pin };
    onSave(data);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{employee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên nhân viên</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">Mã PIN (4 chữ số)</label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 4) {
                      setPin(value);
                  }
              }}
              className="w-full p-2 border border-gray-300 rounded-md tracking-widest"
              placeholder="••••"
              maxLength={4}
              required
            />
          </div>
          
          {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, stores, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

  const handleSave = (employee: Omit<Employee, 'id'> | Employee) => {
    if ('id' in employee) {
      onUpdateEmployee(employee as Employee);
    } else {
      onAddEmployee(employee as Omit<Employee, 'id'>);
    }
    setIsFormOpen(false);
    setEditingEmployee(undefined);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản Lý Nhân Viên</h2>
        <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
          <i className="fas fa-plus"></i>
          <span>Thêm Mới</span>
        </button>
      </div>
      
      {isFormOpen && <EmployeeForm employee={editingEmployee} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Tên nhân viên</th>
              <th scope="col" className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{employee.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{employee.name}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDeleteEmployee(employee.id)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;