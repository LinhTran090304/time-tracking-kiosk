
import React, { useState, useEffect } from 'react';
// FIX: Import 'getDocs' from firebase/firestore
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Import the Firestore instance
import { Employee, AttendanceRecord, StoreLocation, Shift, ScheduleEntry } from './types';
import { INITIAL_EMPLOYEES, INITIAL_STORE_LOCATIONS, INITIAL_SHIFTS, INITIAL_SCHEDULE } from './constants';
import KioskView from './components/KioskView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [view, setView] = useState<'kiosk' | 'admin'>('kiosk');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch all data from Firestore on initial load
  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'employees'), (snapshot) => {
        // FIX: Correctly map Firestore doc to Employee type, parsing string doc.id to a number.
        const fetchedEmployees = snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Employee, 'id'>), id: parseInt(doc.id, 10) }));
        setEmployees(fetchedEmployees.sort((a, b) => a.name.localeCompare(b.name)));
      }),
      onSnapshot(collection(db, 'attendanceRecords'), (snapshot) => {
        // FIX: Correctly map Firestore doc to AttendanceRecord, parsing string doc.id to a number and handling timestamps.
        const fetchedRecords = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...(data as Omit<AttendanceRecord, 'id' | 'clockIn' | 'clockOut'>),
                id: parseInt(doc.id, 10),
                clockIn: data.clockIn.toDate(),
                clockOut: data.clockOut ? data.clockOut.toDate() : undefined,
            } as AttendanceRecord;
        });
        setAttendanceRecords(fetchedRecords);
      }),
      onSnapshot(collection(db, 'stores'), (snapshot) => {
        // FIX: Correctly map Firestore doc to StoreLocation type, parsing string doc.id to a number.
        const fetchedStores = snapshot.docs.map(doc => ({ ...(doc.data() as Omit<StoreLocation, 'id'>), id: parseInt(doc.id, 10) }));
        if (snapshot.empty) {
           // Seed initial data if collection is empty
           const batch = writeBatch(db);
           INITIAL_STORE_LOCATIONS.forEach(store => {
               const { id, ...data } = store;
               const docRef = doc(db, 'stores', String(id));
               batch.set(docRef, data);
           });
           batch.commit();
        } else {
           setStores(fetchedStores);
        }
      }),
       onSnapshot(collection(db, 'shifts'), (snapshot) => {
        const fetchedShifts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Shift[];
        setShifts(fetchedShifts);
      }),
      onSnapshot(collection(db, 'schedule'), (snapshot) => {
        // FIX: Correctly map Firestore doc to ScheduleEntry type. The doc.id is not part of the ScheduleEntry.
        const fetchedSchedule = snapshot.docs.map(doc => doc.data() as ScheduleEntry);
        setSchedule(fetchedSchedule);
      }),
    ];

    setIsLoading(false);

    // Cleanup subscriptions on unmount
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);


  const handleClockIn = async (employeeId: number, lateHours?: number) => {
    const newId = Date.now(); // Use a timestamp for a more unique ID
    const docRef = doc(db, 'attendanceRecords', String(newId));
    await setDoc(docRef, {
        employeeId,
        clockIn: new Date(),
        lateHours: lateHours || null,
        clockOut: null,
    });
  };

  const handleClockOut = async (employeeId: number, earlyLeaveHours?: number) => {
    const q = query(
        collection(db, "attendanceRecords"),
        where("employeeId", "==", employeeId),
        where("clockOut", "==", null)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const recordDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'attendanceRecords', recordDoc.id), {
            clockOut: new Date(),
            earlyLeaveHours: earlyLeaveHours || null,
        });
    }
  };
  
  const handleUpdateSchedule = async (updatedEntry: ScheduleEntry) => {
    const q = query(
      collection(db, "schedule"),
      where("employeeId", "==", updatedEntry.employeeId),
      where("date", "==", updatedEntry.date)
    );
    const querySnapshot = await getDocs(q);

    if (updatedEntry.shiftId === "none") {
        if (!querySnapshot.empty) {
            await deleteDoc(doc(db, 'schedule', querySnapshot.docs[0].id));
        }
    } else {
        if (!querySnapshot.empty) {
            // FIX: Spread the updatedEntry object to avoid type issues with the Firebase SDK's updateDoc function.
            await updateDoc(doc(db, 'schedule', querySnapshot.docs[0].id), { ...updatedEntry });
        } else {
            await addDoc(collection(db, 'schedule'), updatedEntry);
        }
    }
  };

  const handleAddEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newId = Date.now(); // Use a timestamp for a more unique ID
    const docRef = doc(db, 'employees', String(newId));
    await setDoc(docRef, employee);
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    const docRef = doc(db, 'employees', String(updatedEmployee.id));
    const { id, ...dataToUpdate } = updatedEmployee;
    await updateDoc(docRef, dataToUpdate);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này? Hành động này sẽ xóa tất cả dữ liệu liên quan.')) {
        await deleteDoc(doc(db, 'employees', String(employeeId)));
        
        const batch = writeBatch(db);

        const attendanceQuery = query(collection(db, "attendanceRecords"), where("employeeId", "==", employeeId));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        attendanceSnapshot.forEach(doc => batch.delete(doc.ref));

        const scheduleQuery = query(collection(db, "schedule"), where("employeeId", "==", employeeId));
        const scheduleSnapshot = await getDocs(scheduleQuery);
        scheduleSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    }
  };
  
  const handleUpdateAttendance = async (updatedRecord: AttendanceRecord) => {
     const docRef = doc(db, 'attendanceRecords', String(updatedRecord.id));
     const { id, ...dataToUpdate } = updatedRecord;
     await updateDoc(docRef, dataToUpdate as any);
  };

  const handleUpdateStore = async (updatedStore: StoreLocation) => {
     const docRef = doc(db, 'stores', String(updatedStore.id));
     const { id, ...dataToUpdate } = updatedStore;
     await updateDoc(docRef, dataToUpdate);
  };

  const handleUpdateShift = async (updatedShift: Shift) => {
    const docRef = doc(db, 'shifts', updatedShift.id);
    const { id, ...dataToUpdate } = updatedShift;
    await updateDoc(docRef, dataToUpdate);
  };

  const handleAddShift = async (shiftToAdd: Omit<Shift, 'id'>) => {
    await addDoc(collection(db, 'shifts'), shiftToAdd);
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này? Hành động này cũng sẽ xóa tất cả các lịch làm việc đã được phân công cho ca này.')) {
        await deleteDoc(doc(db, 'shifts', shiftId));
        
        const batch = writeBatch(db);
        const q = query(collection(db, "schedule"), where("shiftId", "==", shiftId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <i className="fas fa-spinner fa-spin fa-3x text-blue-600"></i>
                <p className="mt-4 text-lg font-semibold text-gray-700">Đang tải dữ liệu...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800">
      {view === 'kiosk' ? (
        <KioskView
          employees={employees}
          attendanceRecords={attendanceRecords}
          stores={stores}
          schedule={schedule}
          shifts={shifts}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          onSwitchToAdmin={() => setView('admin')}
        />
      ) : (
        <AdminView
          employees={employees}
          attendanceRecords={attendanceRecords}
          stores={stores}
          schedule={schedule}
          shifts={shifts}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateAttendance={handleUpdateAttendance}
          onUpdateStore={handleUpdateStore}
          onUpdateSchedule={handleUpdateSchedule}
          onUpdateShift={handleUpdateShift}
          onAddShift={handleAddShift}
          onDeleteShift={handleDeleteShift}
          onSwitchToKiosk={() => setView('kiosk')}
        />
      )}
    </div>
  );
};

export default App;