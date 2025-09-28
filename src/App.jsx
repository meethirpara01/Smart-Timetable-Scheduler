import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, User, Book, Building, Users, Calendar, Clock, LogOut, FileText, Download, AlertTriangle, PlusCircle, Pencil, Trash2, X, Plus, Loader2 } from 'lucide-react';

// --- Global Style for Animations ---
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideInDown {
            animation: slideInDown 0.5s ease-out forwards;
        }
    `}</style>
);


// --- DUMMY DATA ---
// This section simulates a database for the prototype.
// NOTE: Batches now have a 'subjects' array to specify their curriculum.
const dummyData = {
    classrooms: [
        { id: 'C101', name: 'Classroom 101', type: 'Normal', capacity: 60 },
        { id: 'C102', name: 'Classroom 102', type: 'Normal', capacity: 60 },
        { id: 'C201', name: 'Classroom 201', type: 'Normal', capacity: 60 },
    ],
    labs: [
        { id: 'L301', name: 'Computer Lab 1', type: 'Lab', capacity: 40 },
        { id: 'L302', name: 'Physics Lab', type: 'Lab', capacity: 30 },
        { id: 'L303', name: 'Chemistry Lab', type: 'Lab', capacity: 30 },
    ],
    faculties: [
        { id: 'F001', name: 'Dr. Alan Grant', department: 'Computer Science', canTeach: ['CS101', 'CS201L', 'PHY101L', 'MAT101', 'CS102', 'CHM101', 'CHM101L'] },
        { id: 'F002', name: 'Dr. Ellie Sattler', department: 'Physics', canTeach: ['PHY101L', 'CS101', 'CS201L', 'MAT101', 'CS102', 'CHM101', 'CHM101L'] },
        { id: 'F003', name: 'Dr. Ian Malcolm', department: 'Mathematics', canTeach: ['MAT101', 'PHY101L', 'CS101', 'CS201L', 'CS102', 'CHM101', 'CHM101L'] },
        { id: 'F004', name: 'Dr. John Hammond', department: 'Computer Science', canTeach: ['CS102', 'PHY101L', 'CS101', 'CS201L', 'MAT101', 'CHM101', 'CHM101L'] },
        { id: 'F005', name: 'Dr. Sarah Harding', department: 'Chemistry', canTeach: ['CHM101', 'CHM101L', 'PHY101L', 'CS101', 'CS201L', 'MAT101', 'CS102', 'CHM101L'] },
    ],
    subjects: [
        { id: 'CS101', name: 'Intro to Programming', type: 'Theory', weeklyLectures: 6 },
        { id: 'CS201L', name: 'Data Structures Lab', type: 'Lab', weeklyLectures: 7 }, // Note: 2 lab sessions = 4 periods
        { id: 'PHY101', name: 'Mechanics', type: 'Theory', weeklyLectures: 6 },
        { id: 'PHY101L', name: 'Mechanics Lab', type: 'Lab', weeklyLectures: 8 },
        { id: 'MAT101', name: 'Calculus I', type: 'Theory', weeklyLectures: 6 },
        { id: 'CS102', name: 'Web Development', type: 'Theory', weeklyLectures: 7 },
        { id: 'CHM101', name: 'General Chemistry', type: 'Theory', weeklyLectures: 6 },
        { id: 'CHM101L', name: 'Chemistry Lab', type: 'Lab', weeklyLectures: 7 },
    ],
    batches: [
        { id: 'B01-A', name: 'CSE Sem 3 - Div A', subjects: ['CS101', 'CS201L', 'PHY101', 'PHY101L', 'MAT101', 'CS102', 'CHM101', 'CHM101L'] },
        { id: 'B01-B', name: 'CSE Sem 3 - Div B', subjects: ['CS101', 'CS201L', 'PHY101', 'PHY101L', 'MAT101', 'CS102', 'CHM101', 'CHM101L'] }
    ],
    constraints: {
        maxClassesPerDayFaculty: 5, // Increased slightly to allow for better packing
    }
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'];

// --- HELPER COMPONENTS ---

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 transition-shadow duration-300 hover:shadow-lg ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, icon: Icon }) => (
    <div className="flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-3 text-blue-600" />}
        <h2 className="text-xl font-bold text-gray-800">{children}</h2>
    </div>
);

const Button = ({ children, onClick, className = '', icon: Icon, type = 'button', disabled = false }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-600 transform hover:scale-105 ${className}`}
    >
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        {children}
    </button>
);

const Input = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input name={name} id={name} {...props} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300" />
    </div>
);

const Select = ({ label, name, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select name={name} id={name} {...props} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300">
            {children}
        </select>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={onClose}>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none">&times;</button>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENTS ---

const TimetableGrid = ({ timetableData, viewType, filterId }) => {
    const filteredTimetable = useMemo(() => {
        if (!timetableData || Object.keys(timetableData).length === 0) return {};

        if (viewType === 'master') {
            if (!filterId || filterId === 'all') return timetableData;
            const filtered = {};
            for (const day of days) {
                filtered[day] = periods.map((_, periodIndex) => {
                    const entry = timetableData[day]?.[periodIndex];
                    return entry?.batchId === filterId ? entry : null;
                });
            }
            return filtered;
        }

        const personalFilter = {};
        for (const day of days) {
            personalFilter[day] = periods.map((_, periodIndex) => {
                const entry = timetableData[day]?.[periodIndex];
                if (!entry) return null;
                if (viewType === 'faculty' && entry.facultyId === filterId) return entry;
                if (viewType === 'student' && entry.batchId === filterId) return entry;
                return null;
            });
        }
        return personalFilter;
    }, [timetableData, viewType, filterId]);

    const getColor = (type) => {
        return type === 'Lab'
            ? 'bg-green-100 border-green-300 text-green-800'
            : 'bg-blue-100 border-blue-300 text-blue-800';
    };

    if (!timetableData || Object.keys(timetableData).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg shadow-inner">
                <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Timetable Generated</h3>
                <p className="text-gray-500 mt-1">Please use the Admin dashboard to generate the schedule.</p>
            </div>
        );
    }
    
    return (
        <div>
            {/* Desktop View: Grid Table */}
            <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 font-semibold text-left text-sm text-gray-600 border-b-2 border-gray-200 bg-gray-50 sticky left-0 z-10 w-28">Day/Time</th>
                            {periods.map(period => (
                                <th key={period} className="p-3 font-semibold text-center text-sm text-gray-600 border-b-2 border-gray-200 bg-gray-50 min-w-[150px]">{period}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {days.map((day, dayIndex) => (
                            <tr key={day}>
                                <td className="p-3 font-bold text-gray-700 bg-gray-50 border-r-2 border-gray-200 sticky left-0 z-10 w-28">{day}</td>
                                {periods.map((_, periodIndex) => {
                                    const entry = filteredTimetable[day]?.[periodIndex];
                                    const isContinuation = entry && periodIndex > 0 && filteredTimetable[day]?.[periodIndex - 1]?.id === entry.id;
                                    if(isContinuation) return null;

                                    let colSpan = 1;
                                    if(entry && entry.type === 'Lab'){
                                      colSpan = 2;
                                    }

                                    return (
                                        <td key={periodIndex} colSpan={colSpan} className="p-2 border-t border-gray-200 align-top">
                                            {entry ? (
                                                <div 
                                                    className={`p-3 rounded-lg border h-full flex flex-col justify-center animate-fadeIn ${getColor(entry.type)}`}
                                                    style={{ animationDelay: `${dayIndex * 50 + periodIndex * 20}ms` }}
                                                >
                                                    <p className="font-bold text-sm">{entry.subjectName}</p>
                                                    <p className="text-xs text-gray-600"><User className="inline w-3 h-3 mr-1" />{entry.facultyName}</p>
                                                    <p className="text-xs text-gray-600"><Users className="inline w-3 h-3 mr-1" />{entry.batchName}</p>
                                                    <p className="text-xs text-gray-600 font-medium mt-1"><Building className="inline w-3 h-3 mr-1" />{entry.roomName}</p>
                                                </div>
                                            ) : (
                                                <div className="h-full"></div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Card List */}
            <div className="block md:hidden space-y-4">
                {days.map(day => {
                    const uniqueEntries = [];
                    const processedIds = new Set();

                    filteredTimetable[day]?.forEach(entry => {
                        if (entry && !processedIds.has(entry.id)) {
                            uniqueEntries.push(entry);
                            processedIds.add(entry.id);
                        }
                    });

                    if (uniqueEntries.length === 0) return null;

                    return (
                        <div key={day} className="bg-white rounded-lg shadow-md p-4 animate-fadeIn">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{day}</h3>
                            <div className="space-y-3">
                                {uniqueEntries.map((entry, index) => {
                                    const periodIndex = filteredTimetable[day].findIndex(p => p?.id === entry.id);
                                    const periodTime = periods[periodIndex];
                                    const endTime = entry.type === 'Lab' && (periodIndex + 1 < periods.length) ? periods[periodIndex + 1].split('-')[1] : periodTime.split('-')[1];
                                    const timeRange = `${periodTime.split('-')[0]}-${endTime}`;

                                    return (
                                        <div key={index} className={`p-3 rounded-lg border ${getColor(entry.type)}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="font-bold text-md">{entry.subjectName}</p>
                                                <p className="font-semibold text-sm">{timeRange}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center"><User className="inline w-4 h-4 mr-1.5 flex-shrink-0" />{entry.facultyName}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center"><Users className="inline w-4 h-4 mr-1.5 flex-shrink-0" />{entry.batchName}</p>
                                            <p className="text-sm text-gray-600 font-medium mt-1 flex items-center"><Building className="inline w-4 h-4 mr-1.5 flex-shrink-0" />{entry.roomName}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- V6: GREEDY HEURISTIC ALGORITHM ---
const generateTimetableLogic = (data) => {
    // 1. Initialization
    const timetable = {};
    days.forEach(day => timetable[day] = Array(periods.length).fill(null));
    let unscheduledLectures = [];

    // 2. Create list of all lectures to be scheduled
    const lecturesToSchedule = [];
    data.batches.forEach(batch => {
        (batch.subjects || []).forEach(subjectId => {
            const subject = data.subjects.find(s => s.id === subjectId);
            if (subject) {
                for (let i = 0; i < subject.weeklyLectures; i++) {
                    lecturesToSchedule.push({
                        id: `${batch.id}-${subject.id}-${i}`,
                        batch,
                        subject,
                        duration: subject.type === 'Lab' ? 2 : 1,
                    });
                }
            }
        });
    });

    // Sort: Labs first, then subjects with more lectures
    lecturesToSchedule.sort((a, b) => {
        if (a.duration !== b.duration) return b.duration - a.duration;
        return b.subject.weeklyLectures - a.subject.weeklyLectures;
    });

    // 3. Iterate and place each lecture
    for (const lecture of lecturesToSchedule) {
        let bestSlot = { score: -1, day: null, period: null, faculty: null, room: null };

        const roomSource = lecture.duration === 2 ? data.labs : data.classrooms;
        const potentialFaculties = data.faculties.filter(f => f.canTeach.includes(lecture.subject.id));

        for (const day of days) {
            for (let period = 0; period <= periods.length - lecture.duration; period++) {
                for (const faculty of potentialFaculties) {
                    for (const room of roomSource) {
                        const isBatchFree = !timetable[day].slice(period, period + lecture.duration).some(s => s && s.batchId === lecture.batch.id);
                        const isFacultyFree = !timetable[day].slice(period, period + lecture.duration).some(s => s && s.facultyId === faculty.id);
                        const isRoomFree = !timetable[day].slice(period, period + lecture.duration).some(s => s && s.roomId === room.id);
                        const facultyWorkload = timetable[day].filter(s => s?.facultyId === faculty.id).length;

                        if (isBatchFree && isFacultyFree && isRoomFree && (facultyWorkload + lecture.duration <= data.constraints.maxClassesPerDayFaculty)) {
                            let score = 100;
                            if (period > 0 && period < periods.length - lecture.duration) score += 10;
                            if (period === periods.length - lecture.duration) score -= 5;
                            const before = timetable[day][period - 1];
                            const after = timetable[day][period + lecture.duration];
                            if (before && before.batchId === lecture.batch.id) score += 5;
                            if (after && after.batchId === lecture.batch.id) score += 5;

                            if (score > bestSlot.score) {
                                bestSlot = { score, day, period, faculty, room };
                            }
                        }
                    }
                }
            }
        }

        if (bestSlot.score > -1) {
            const { day, period, faculty, room } = bestSlot;
            const entry = {
                id: lecture.id,
                subjectName: lecture.subject.name, subjectId: lecture.subject.id,
                facultyName: faculty.name, facultyId: faculty.id,
                roomName: room.name, roomId: room.id,
                batchName: lecture.batch.name, batchId: lecture.batch.id,
                type: lecture.subject.type,
            };
            for (let i = 0; i < lecture.duration; i++) {
                timetable[day][period + i] = entry;
            }
        } else {
            unscheduledLectures.push(lecture);
        }
    }

    return { timetable, unscheduledCount: unscheduledLectures.length };
};

// --- DASHBOARDS ---

const SubjectManager = ({ assigned, all, onAdd, onRemove }) => {
    const assignedIds = new Set(assigned);
    const assignedSubjects = all.filter(s => assignedIds.has(s.id));
    const availableSubjects = all.filter(s => !assignedIds.has(s.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold mb-2 text-gray-700">Assigned Subjects</h4>
                <div className="p-2 border rounded-md min-h-[150px] max-h-[150px] overflow-y-auto bg-gray-50 space-y-2">
                    {assignedSubjects.length > 0 ? assignedSubjects.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm text-sm">
                            <span>{s.name}</span>
                            <button type="button" onClick={() => onRemove(s.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200">
                                <X size={16} />
                            </button>
                        </div>
                    )) : <p className="text-sm text-gray-400 p-2">None assigned</p>}
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-gray-700">Available Subjects</h4>
                 <div className="p-2 border rounded-md min-h-[150px] max-h-[150px] overflow-y-auto bg-gray-50 space-y-2">
                    {availableSubjects.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm text-sm">
                            <span>{s.name}</span>
                            <button type="button" onClick={() => onAdd(s.id)} className="p-1 text-green-500 hover:bg-green-100 rounded-full transition-colors duration-200">
                                <Plus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const DataForm = ({ dataType, initialData, onSave, onCancel, allSubjects }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const defaults = {
            name: '',
            department: '',
            canTeach: [],
            subjects: [],
            type: 'Theory',
            weeklyLectures: 1,
            capacity: 30
        };
        setFormData({ ...defaults, ...(initialData || {}) });
    }, [initialData, dataType]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubjectChange = (newSubjects) => {
        const key = dataType === 'faculties' ? 'canTeach' : 'subjects';
        setFormData(prev => ({ ...prev, [key]: newSubjects }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(dataType, formData);
    };

    const renderFormFields = () => {
        switch (dataType) {
            case 'faculties':
                return <>
                    <Input label="Faculty Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Input label="Department" name="department" value={formData.department || ''} onChange={handleChange} required />
                    <SubjectManager 
                        assigned={formData.canTeach || []}
                        all={allSubjects}
                        onAdd={(subjectId) => handleSubjectChange([...(formData.canTeach || []), subjectId])}
                        onRemove={(subjectId) => handleSubjectChange((formData.canTeach || []).filter(id => id !== subjectId))}
                    />
                </>;
            case 'subjects':
                 return <>
                    <Input label="Subject Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Select label="Type" name="type" value={formData.type || 'Theory'} onChange={handleChange} required>
                        <option value="Theory">Theory</option>
                        <option value="Lab">Lab</option>
                    </Select>
                    <Input label="Weekly Sessions" name="weeklyLectures" type="number" min="1" value={formData.weeklyLectures || 1} onChange={handleChange} required />
                </>;
            case 'batches':
                return <>
                    <Input label="Batch Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <SubjectManager 
                        assigned={formData.subjects || []}
                        all={allSubjects}
                        onAdd={(subjectId) => handleSubjectChange([...(formData.subjects || []), subjectId])}
                        onRemove={(subjectId) => handleSubjectChange((formData.subjects || []).filter(id => id !== subjectId))}
                    />
                </>;
            case 'classrooms':
            case 'labs':
                return <>
                    <Input label="Room/Lab Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Input label="Capacity" name="capacity" type="number" min="1" value={formData.capacity || 30} onChange={handleChange} required />
                </>;
            default: return null;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {renderFormFields()}
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 from-gray-200 to-gray-200 hover:from-gray-300 hover:to-gray-300">Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    )
};


const AdminDashboard = ({ setTimetable, timetable, appData, setAppData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unscheduledCount, setUnscheduledCount] = useState(0);
    const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
    const [confirmDeleteState, setConfirmDeleteState] = useState({ isOpen: false, dataType: null, itemId: null });
    const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');

    const handleGenerate = () => {
        setIsLoading(true);
        setError(null);
        setUnscheduledCount(0);
        setTimetable({});
        setTimeout(() => {
            try {
                const dataForGeneration = JSON.parse(JSON.stringify(appData));
                const { timetable: newTimetable, unscheduledCount: newUnscheduledCount } = generateTimetableLogic(dataForGeneration);
                setTimetable(newTimetable);
                setUnscheduledCount(newUnscheduledCount);
            } catch (e) {
                console.error("Timetable generation failed:", e);
                setError("Failed to generate timetable. Check console for details.");
            }
            setIsLoading(false);
        }, 1000); // Slower timeout for a better loading feel
    };

    const openModal = (type, data = null) => setModalState({ isOpen: true, type, data });
    const closeModal = () => setModalState({ isOpen: false, type: null, data: null });

    const handleSave = (dataType, formData) => {
        setAppData(prevData => {
            const updatedData = { ...prevData };
            const list = updatedData[dataType];
            if (formData.id) {
                const index = list.findIndex(item => item.id === formData.id);
                list[index] = formData;
            } else {
                const newId = `${dataType.slice(0,1).toUpperCase()}${Date.now()}`;
                const type = dataType === 'labs' ? 'Lab' : (dataType === 'classrooms' ? 'Normal' : undefined);
                list.push({ ...formData, id: newId, ...(type && {type}) });
            }
            return { ...updatedData };
        });
        closeModal();
    };

    const handleDelete = (dataType, itemId) => {
        setConfirmDeleteState({ isOpen: true, dataType, itemId });
    };

    const handleConfirmDelete = () => {
        const { dataType, itemId } = confirmDeleteState;
        if (dataType && itemId) {
            setAppData(prevData => ({
                ...prevData,
                [dataType]: prevData[dataType].filter(item => item.id !== itemId)
            }));
        }
        setConfirmDeleteState({ isOpen: false, dataType: null, itemId: null });
    };

    const DataCard = ({ title, data, dataType, icon }) => (
        <Card>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <CardTitle icon={icon}>{title}</CardTitle>
                <Button onClick={() => openModal(dataType)} icon={PlusCircle} className="py-1 px-3 text-sm">Add</Button>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 max-h-60 overflow-y-auto pr-2">
                {data.map((item) => (
                    <li key={item.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-blue-50 hover:shadow-sm transition-all duration-200">
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{item.name}</p>
                            {item.department && <p className="text-xs text-gray-500 truncate">{item.department}</p>}
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                            {item.type && <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'Lab' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>{item.type}</span>}
                            <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-600 cursor-pointer flex-shrink-0" onClick={() => openModal(dataType, item)} />
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600 cursor-pointer flex-shrink-0" onClick={() => handleDelete(dataType, item.id)} />
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );

    const modalTitle = modalState.data
        ? `Edit ${modalState.type?.slice(0, -1).replace(/ie$/, 'y')}`
        : `Add New ${modalState.type?.slice(0, -1).replace(/ie$/, 'y')}`;

    return (
        <div className="space-y-8">
            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalTitle}>
                <DataForm 
                    dataType={modalState.type} 
                    initialData={modalState.data}
                    onSave={handleSave}
                    onCancel={closeModal}
                    allSubjects={appData.subjects}
                />
            </Modal>
            <Modal isOpen={confirmDeleteState.isOpen} onClose={() => setConfirmDeleteState({ isOpen: false, dataType: null, itemId: null })} title="Confirm Deletion">
                <div>
                    <p className="text-gray-700">Are you sure you want to delete this item? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 pt-4 mt-4">
                        <Button onClick={() => setConfirmDeleteState({ isOpen: false, dataType: null, itemId: null })} className="bg-gray-200 hover:bg-gray-300 text-gray-800 from-gray-200 to-gray-200 hover:from-gray-300 hover:to-gray-300">Cancel</Button>
                        <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 from-red-600 to-red-500 hover:from-red-700 hover:to-red-600">Delete</Button>
                    </div>
                </div>
            </Modal>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage data and generate the master timetable.</p>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} icon={isLoading ? Loader2 : Clock} className={`w-full md:w-auto ${isLoading ? 'animate-fadeIn' : ''}`}>
                    {isLoading ? 'Generating...' : 'Generate New Timetable'}
                </Button>
            </div>
            
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center animate-slideInDown"><AlertTriangle className="mr-2"/>{error}</div>}
            {unscheduledCount > 0 && !isLoading && (
                 <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center animate-slideInDown">
                     <AlertTriangle className="mr-2"/>
                     Generation complete with warnings. <strong>{unscheduledCount} sessions</strong> could not be scheduled.
                 </div>
            )}
            {!error && unscheduledCount === 0 && Object.keys(timetable).length > 0 && !isLoading && (
                 <div className="p-4 bg-green-100 text-green-800 rounded-lg animate-slideInDown">
                     Timetable generated successfully! All lectures have been scheduled.
                 </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <DataCard title="Faculties" data={appData.faculties} dataType="faculties" icon={User}/>
                 <DataCard title="Subjects" data={appData.subjects} dataType="subjects" icon={Book}/>
                 <DataCard title="Student Batches" data={appData.batches} dataType="batches" icon={Users}/>
                 <DataCard title="Classrooms" data={appData.classrooms} dataType="classrooms" icon={Building}/>
                 <DataCard title="Labs" data={appData.labs} dataType="labs" icon={Building}/>
            </div>
            
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="flex items-center">
                        <CardTitle icon={Calendar}>Master Timetable</CardTitle>
                    </div>
                    <div className="w-full md:w-auto md:max-w-xs">
                         <Select 
                            label="Filter by Batch" 
                            name="batch-filter"
                            value={selectedBatchFilter}
                            onChange={(e) => setSelectedBatchFilter(e.target.value)}
                        >
                            <option value="all">All Batches (Master View)</option>
                            {appData.batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name}</option>
                            ))}
                        </Select>
                    </div>
                </div>
                 <TimetableGrid timetableData={timetable} viewType="master" filterId={selectedBatchFilter} />
            </div>
        </div>
    );
};

const FacultyDashboard = ({ timetable, user }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome, <span className="font-semibold">{user.name}</span>. Here is your weekly schedule.</p>
            </div>
            <TimetableGrid timetableData={timetable} viewType="faculty" filterId={user.id} />
        </div>
    );
};

const StudentDashboard = ({ timetable, user }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-500 mt-1">Displaying timetable for <span className="font-semibold">{user.name}</span>.</p>
            </div>
            <TimetableGrid timetableData={timetable} viewType="student" filterId={user.id} />
        </div>
    );
};


const LoginPage = ({ onLogin, faculties, batches }) => {
    const [role, setRole] = useState('student');
    const [selectedUser, setSelectedUser] = useState('');
    const [userList, setUserList] = useState(batches);

    useEffect(() => {
        if (role === 'admin') {
            setUserList([{ id: 'admin', name: 'Admin User' }]);
            setSelectedUser('admin');
        } else if (role === 'faculty') {
            setUserList(faculties);
            setSelectedUser(faculties[0]?.id || '');
        } else {
            setUserList(batches);
            setSelectedUser(batches[0]?.id || '');
        }
    }, [role, faculties, batches]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        let user;
        if (role === 'admin') {
            user = { id: 'admin', name: 'Admin' };
        } else if (role === 'faculty') {
            user = faculties.find(f => f.id === selectedUser);
        } else {
            user = batches.find(b => b.id === selectedUser);
        }
        
        onLogin(role, user);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Calendar className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Timetable Scheduler</h2>
                    <p className="mt-2 text-sm text-gray-600">Select your role to view the schedule</p>
                </div>
                <Card className="animate-fadeIn">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Select label="I am a..." name="role-select" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </Select>
                        
                        {role !== 'admin' && userList.length > 0 && (
                           <Select label="Select Your Name/Batch" name="user-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                                {userList.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </Select>
                        )}
                        
                        <Button type="submit" className="w-full">
                           View Dashboard
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

// --- App Component (Main) ---
export default function App() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [timetable, setTimetable] = useState({});
    const [appData, setAppData] = useState(() => {
        try {
            const savedData = localStorage.getItem('timetableAppData');
            return savedData ? JSON.parse(savedData) : dummyData;
        } catch (error) {
            console.error("Could not parse localStorage data:", error);
            return dummyData;
        }
    });

    useEffect(() => {
        localStorage.setItem('timetableAppData', JSON.stringify(appData));
    }, [appData]);


    const handleLogin = (role, user) => {
        setRole(role);
        setUser(user);
    };
    
    const handleLogout = () => {
        setRole(null);
        setUser(null);
    }
    
    const renderDashboard = () => {
        switch (role) {
            case 'admin':
                return <AdminDashboard 
                    setTimetable={setTimetable} 
                    timetable={timetable} 
                    appData={appData}
                    setAppData={setAppData}
                />;
            case 'faculty':
                return <FacultyDashboard timetable={timetable} user={user} />;
            case 'student':
                return <StudentDashboard timetable={timetable} user={user} />;
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <>
                <GlobalStyles />
                <LoginPage onLogin={handleLogin} faculties={appData.faculties} batches={appData.batches} />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <GlobalStyles />
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
                       <div className="flex items-center">
                           <Calendar className="h-8 w-8 text-blue-600" />
                           <span className="ml-3 text-xl font-bold text-gray-800">Smart Scheduler</span>
                       </div>
                       <div className="flex items-center space-x-4">
                           <div className="text-right">
                               <p className="font-semibold text-gray-800">{user.name}</p>
                               <p className="text-sm text-gray-500 capitalize">{role}</p>
                           </div>
                           <Button onClick={handleLogout} icon={LogOut} className="bg-red-500 hover:bg-red-600 from-red-600 to-red-500 hover:from-red-700 hover:to-red-600">
                               Logout
                           </Button>
                       </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderDashboard()}
            </main>
        </div>
    );
}

