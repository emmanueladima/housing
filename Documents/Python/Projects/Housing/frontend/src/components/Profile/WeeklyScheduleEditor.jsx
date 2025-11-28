import { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

const WeeklyScheduleEditor = ({ initialSchedule = [], onSave, onClose }) => {
  const [schedule, setSchedule] = useState(
    initialSchedule.length > 0
      ? initialSchedule
      : [{ day: 0, activity: '', startHour: 9, endHour: 17 }]
  );

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const addBlock = () => {
    setSchedule([
      ...schedule,
      { day: 0, activity: '', startHour: 9, endHour: 17 },
    ]);
  };

  const removeBlock = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateBlock = (index, field, value) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const handleSave = () => {
    const valid = schedule.every(
      block =>
        block.activity.trim() &&
        block.startHour < block.endHour &&
        block.endHour <= 23
    );

    if (!valid) {
      alert('Please ensure all blocks have an activity and valid time ranges.');
      return;
    }

    onSave(schedule);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <FiX size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Weekly Schedule</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
            <p className="text-orange-800 text-sm font-medium">
              Add your regular weekly activities (classes, work, clubs) to help us find roommates with compatible schedules.
            </p>
          </div>

          <div className="space-y-4">
            {schedule.map((block, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Day */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Day</label>
                    <select
                      value={block.day}
                      onChange={(e) => updateBlock(index, 'day', parseInt(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                    >
                      {days.map((day, dayIndex) => (
                        <option key={dayIndex} value={dayIndex}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Activity */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Activity</label>
                    <input
                      type="text"
                      value={block.activity}
                      onChange={(e) => updateBlock(index, 'activity', e.target.value)}
                      placeholder="e.g. Chemistry Lab"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                    />
                  </div>

                  {/* Time Range */}
                  <div className="md:col-span-4 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Start</label>
                      <select
                        value={block.startHour}
                        onChange={(e) => updateBlock(index, 'startHour', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      >
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">End</label>
                      <select
                        value={block.endHour}
                        onChange={(e) => updateBlock(index, 'endHour', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      >
                        {hours.filter(h => h > block.startHour).map((hour) => (
                          <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeBlock(index)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addBlock}
            className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            <FiPlus size={20} />
            Add Another Activity
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 bg-white rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Save Schedule
            <FiCheck />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleEditor;
