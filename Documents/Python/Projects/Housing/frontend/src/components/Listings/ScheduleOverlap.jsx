import { useState, useEffect } from 'react';
import { FiClock, FiCalendar } from 'react-icons/fi';
import lifestyleProfileService from '../../services/lifestyleProfileService';

const ScheduleOverlap = ({ hostUserId }) => {
  const [overlap, setOverlap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverlapData();
  }, [hostUserId]);

  const loadOverlapData = async () => {
    try {
      // Get host's profile
      const hostProfile = await lifestyleProfileService.getProfileByUserId(hostUserId);
      
      // Get my profile
      const myProfile = await lifestyleProfileService.getMyProfile();

      if (!hostProfile || !myProfile || !hostProfile.weeklySchedule || !myProfile.weeklySchedule) {
        setOverlap(null);
        return;
      }

      // Calculate overlap percentage
      const overlapPercent = calculateOverlap(myProfile.weeklySchedule, hostProfile.weeklySchedule);
      setOverlap({
        percentage: overlapPercent,
        mySchedule: myProfile.weeklySchedule,
        hostSchedule: hostProfile.weeklySchedule,
      });
    } catch (error) {
      console.error('Error loading overlap data:', error);
      setOverlap(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverlap = (schedule1, schedule2) => {
    // Create a bitmap of occupied hours for each day (7 days × 24 hours)
    const bitmap1 = createBitmap(schedule1);
    const bitmap2 = createBitmap(schedule2);

    let totalHours = 0;
    let overlappingHours = 0;

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const busy1 = bitmap1[key] || false;
        const busy2 = bitmap2[key] || false;

        if (busy1 || busy2) totalHours++;
        if (busy1 && busy2) overlappingHours++;
      }
    }

    if (totalHours === 0) return 0;
    return Math.round((overlappingHours / totalHours) * 100);
  };

  const createBitmap = (schedule) => {
    const bitmap = {};
    schedule.forEach(block => {
      for (let hour = block.startHour; hour < block.endHour; hour++) {
        bitmap[`${block.day}-${hour}`] = true;
      }
    });
    return bitmap;
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700 text-sm">Calculating schedule overlap...</span>
        </div>
      </div>
    );
  }

  if (!overlap) {
    return null;
  }

  const getOverlapConfig = () => {
    if (overlap.percentage >= 70) {
      return {
        color: 'bg-red-50 border-red-200 text-red-700',
        icon: '⚠️',
        label: 'High Overlap',
        description: 'You have very similar schedules - might have limited alone time',
      };
    }
    if (overlap.percentage >= 40) {
      return {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        icon: '⚡',
        label: 'Moderate Overlap',
        description: 'You share some common active hours',
      };
    }
    return {
      color: 'bg-green-50 border-green-200 text-green-700',
      icon: '✅',
      label: 'Low Overlap',
      description: 'You have different schedules - good for privacy and quiet time',
    };
  };

  const config = getOverlapConfig();

  return (
    <div className={`border rounded-lg p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FiClock size={18} />
            <h3 className="font-bold text-lg">{overlap.percentage}% Schedule Overlap</h3>
          </div>
          <p className="text-sm font-medium mb-2">{config.label}</p>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>
      </div>

      {/* Optional: Visual calendar representation */}
      <div className="mt-4 pt-4 border-t border-current/20">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <FiCalendar size={14} />
          <span>Weekly Overlap Heatmap</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIndex) => {
            const dayOverlap = calculateDayOverlap(overlap.mySchedule, overlap.hostSchedule, dayIndex);
            return (
              <div
                key={dayIndex}
                className="flex flex-col items-center gap-1"
                title={`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}: ${dayOverlap}%`}
              >
                <span className="text-xs font-medium">{day}</span>
                <div className="w-full h-8 bg-white/50 rounded relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-current/30 transition-all"
                    style={{ height: `${dayOverlap}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Calculate overlap for a specific day
const calculateDayOverlap = (schedule1, schedule2, day) => {
  const bitmap1 = {};
  const bitmap2 = {};

  schedule1.filter(b => b.day === day).forEach(block => {
    for (let hour = block.startHour; hour < block.endHour; hour++) {
      bitmap1[hour] = true;
    }
  });

  schedule2.filter(b => b.day === day).forEach(block => {
    for (let hour = block.startHour; hour < block.endHour; hour++) {
      bitmap2[hour] = true;
    }
  });

  let total = 0;
  let overlap = 0;

  for (let hour = 0; hour < 24; hour++) {
    const busy1 = bitmap1[hour] || false;
    const busy2 = bitmap2[hour] || false;
    if (busy1 || busy2) total++;
    if (busy1 && busy2) overlap++;
  }

  return total === 0 ? 0 : Math.round((overlap / total) * 100);
};

export default ScheduleOverlap;




