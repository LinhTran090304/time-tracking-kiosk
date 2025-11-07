
import React, { useState } from 'react';
import { StoreLocation } from '../../types';

interface StoreManagementProps {
  stores: StoreLocation[];
  onUpdateStore: (store: StoreLocation) => void;
}

const StoreForm: React.FC<{
  store: StoreLocation;
  onSave: (store: StoreLocation) => void;
  onCancel: () => void;
}> = ({ store, onSave, onCancel }) => {
  const [latitude, setLatitude] = useState(store.latitude);
  const [longitude, setLongitude] = useState(store.longitude);
  const [link, setLink] = useState('');
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLink(inputValue);

    let urlToParse = inputValue;

    // Check if it's an iframe embed code and extract the src URL
    if (inputValue.trim().startsWith('<iframe')) {
      const srcMatch = inputValue.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        urlToParse = srcMatch[1];
      }
    }

    // Regex for standard Google Maps URL: @lat,lng
    const urlRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const urlMatch = urlToParse.match(urlRegex);

    // Regex for Google Maps embed URL: !2d(lng)...!3d(lat)
    const embedRegex = /!2d(-?\d+\.\d+).*!3d(-?\d+\.\d+)/;
    const embedMatch = urlToParse.match(embedRegex);

    if (urlMatch && urlMatch[1] && urlMatch[2]) {
      // Standard URL format
      const lat = parseFloat(urlMatch[1]);
      const lon = parseFloat(urlMatch[2]);
      setLatitude(lat);
      setLongitude(lon);
      setParseStatus('success');
    } else if (embedMatch && embedMatch[1] && embedMatch[2]) {
      // Embed URL format
      const lon = parseFloat(embedMatch[1]);
      const lat = parseFloat(embedMatch[2]);
      setLatitude(lat);
      setLongitude(lon);
      setParseStatus('success');
    } else if (inputValue.trim() !== '') {
      setParseStatus('error');
    } else {
      setParseStatus('idle');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...store, latitude: Number(latitude), longitude: Number(longitude) });
  };

  const getParseMessage = () => {
    switch(parseStatus) {
        case 'success':
            return { text: 'Tọa độ đã được trích xuất thành công!', className: 'text-green-600' };
        case 'error':
            return { text: 'Không tìm thấy tọa độ. Vui lòng kiểm tra lại liên kết hoặc mã nhúng.', className: 'text-red-600' };
        case 'idle':
        default:
            return { text: 'Dán liên kết hoặc mã nhúng từ Google Maps để tự động điền.', className: 'text-gray-500' };
    }
  };

  const parseMessage = getParseMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Chỉnh sửa vị trí cửa hàng</h3>
        <p className="text-gray-600 mb-4 font-semibold">{store.name}</p>
        <form onSubmit={handleSubmit}>
           <div className="mb-4">
            <label htmlFor="google-maps-link" className="block text-sm font-medium text-gray-700 mb-1">
              Liên kết hoặc Mã nhúng Google Maps
            </label>
            <input
              type="text"
              id="google-maps-link"
              value={link}
              onChange={handleLinkChange}
              placeholder="Dán URL hoặc mã <iframe> tại đây"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className={`text-xs mt-1 ${parseMessage.className}`}>{parseMessage.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  required
                />
            </div>
            <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  required
                />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StoreManagement: React.FC<StoreManagementProps> = ({ stores, onUpdateStore }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);

  const handleEdit = (store: StoreLocation) => {
    setEditingStore(store);
    setIsFormOpen(true);
  };

  const handleSave = (store: StoreLocation) => {
    onUpdateStore(store);
    setIsFormOpen(false);
    setEditingStore(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Quản Lý Cửa Hàng</h2>
      
      {isFormOpen && editingStore && (
        <StoreForm
          store={editingStore}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Tên cửa hàng</th>
              <th scope="col" className="px-6 py-3">Vĩ độ (Latitude)</th>
              <th scope="col" className="px-6 py-3">Kinh độ (Longitude)</th>
              <th scope="col" className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                <td className="px-6 py-4">{store.latitude}</td>
                <td className="px-6 py-4">{store.longitude}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(store)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i> Sửa vị trí</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreManagement;
