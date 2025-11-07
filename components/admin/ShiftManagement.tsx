
import React, { useState } from 'react';
import { Shift } from '../../types';

// Let's define the color options for the form
const COLOR_OPTIONS = [
    { label: 'Sky', value: 'bg-sky-200' },
    { label: 'Amber', value: 'bg-amber-200' },
    { label: 'Indigo', value: 'bg-indigo-200' },
    { label: 'Teal', value: 'bg-teal-200' },
    { label: 'Blue', value: 'bg-blue-200' },
    { label: 'Rose', value: 'bg-rose-200' },
    { label: 'Lime', value: 'bg-lime-200' },
    { label: 'Fuchsia', value: 'bg-fuchsia-200' },
    { label: 'Cyan', value: 'bg-cyan-200' },
];

// Sub-component for the editing form (modal)
const ShiftForm: React.FC<{
    shift: Shift | Omit<Shift, 'id'>;
    onSave: (shift: Shift | Omit<Shift, 'id'>) => void;
    onCancel: () => void;
}> = ({ shift, onSave, onCancel }) => {
    const [formData, setFormData] = useState(shift);
    const isEditing = 'id' in shift;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes('Minutes') ? (value === '' ? undefined : Number(value)) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <h3 className="text-xl font-bold mb-6">{isEditing ? `Chỉnh sửa Ca làm việc: ${shift.name}` : 'Thêm Ca làm việc mới'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên ca</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 mb-1">Tên viết tắt</label>
                            <input type="text" id="shortName" name="shortName" value={formData.shortName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                            <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                            <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                            <select id="color" name="color" value={formData.color} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                                {COLOR_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Quy định Chấm công (số phút)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="clockInGracePeriodMinutesBefore" className="block text-sm font-medium text-gray-700 mb-1">Vào làm (Sớm)</label>
                                <input type="number" id="clockInGracePeriodMinutesBefore" name="clockInGracePeriodMinutesBefore" value={formData.clockInGracePeriodMinutesBefore ?? ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" min="0" />
                            </div>
                            <div>
                                <label htmlFor="clockInGracePeriodMinutesAfter" className="block text-sm font-medium text-gray-700 mb-1">Vào làm (Muộn)</label>
                                <input type="number" id="clockInGracePeriodMinutesAfter" name="clockInGracePeriodMinutesAfter" value={formData.clockInGracePeriodMinutesAfter ?? ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" min="0" />
                            </div>
                            <div>
                                <label htmlFor="clockOutGracePeriodMinutesBefore" className="block text-sm font-medium text-gray-700 mb-1">Ra về (Sớm)</label>
                                <input type="number" id="clockOutGracePeriodMinutesBefore" name="clockOutGracePeriodMinutesBefore" value={formData.clockOutGracePeriodMinutesBefore ?? ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" min="0" />
                            </div>
                             <div>
                                <label htmlFor="clockOutGracePeriodMinutesAfter" className="block text-sm font-medium text-gray-700 mb-1">Ra về (Muộn)</label>
                                <input type="number" id="clockOutGracePeriodMinutesAfter" name="clockOutGracePeriodMinutesAfter" value={formData.clockOutGracePeriodMinutesAfter ?? ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" min="0" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{isEditing ? 'Lưu thay đổi' : 'Thêm ca làm việc'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Main component
interface ShiftManagementProps {
    shifts: Shift[];
    onUpdateShift: (shift: Shift) => void;
    onAddShift: (shift: Omit<Shift, 'id'>) => void;
    onDeleteShift: (shiftId: string) => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = ({ shifts, onUpdateShift, onAddShift, onDeleteShift }) => {
    const [editingShift, setEditingShift] = useState<Shift | Omit<Shift, 'id'> | null>(null);

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
    };

    const handleAddNew = () => {
        setEditingShift({
            name: 'Ca Mới',
            shortName: 'NEW',
            startTime: '08:00',
            endTime: '17:00',
            color: 'bg-gray-200',
            clockInGracePeriodMinutesBefore: 30,
            clockInGracePeriodMinutesAfter: 10,
            clockOutGracePeriodMinutesBefore: 10,
            clockOutGracePeriodMinutesAfter: 30,
        });
    };
    
    const handleSave = (shift: Shift | Omit<Shift, 'id'>) => {
        if ('id' in shift) {
            onUpdateShift(shift);
        } else {
            onAddShift(shift);
        }
        setEditingShift(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý Ca làm việc</h2>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                    <i className="fas fa-plus"></i>
                    <span>Thêm Mới</span>
                </button>
            </div>

            {editingShift && (
                <ShiftForm shift={editingShift} onSave={handleSave} onCancel={() => setEditingShift(null)} />
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tên ca</th>
                            <th scope="col" className="px-6 py-3">Giờ làm việc</th>
                            <th scope="col" className="px-6 py-3">Cho phép Vào làm (Sớm/Muộn)</th>
                            <th scope="col" className="px-6 py-3">Cho phép Ra về (Sớm/Muộn)</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map(shift => (
                            <tr key={shift.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-3 h-3 rounded-full ${shift.color}`}></span>
                                        <span>{shift.name} ({shift.shortName})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{shift.startTime} - {shift.endTime}</td>
                                <td className="px-6 py-4">{shift.clockInGracePeriodMinutesBefore ?? '-'} / {shift.clockInGracePeriodMinutesAfter ?? '-'} phút</td>
                                <td className="px-6 py-4">{shift.clockOutGracePeriodMinutesBefore ?? '-'} / {shift.clockOutGracePeriodMinutesAfter ?? '-'} phút</td>
                                <td className="px-6 py-4 flex items-center space-x-4">
                                    <button onClick={() => handleEdit(shift)} className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                                      <i className="fas fa-edit"></i>
                                      <span>Sửa</span>
                                    </button>
                                    <button onClick={() => onDeleteShift(shift.id)} className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1">
                                      <i className="fas fa-trash"></i>
                                      <span>Xóa</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShiftManagement;
