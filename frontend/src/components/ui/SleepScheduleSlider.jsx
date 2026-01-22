import React from 'react';
import { Slider } from '@heroui/react';
import { FiMoon, FiSun } from 'react-icons/fi';

// Format hour to readable time (e.g., 22 -> "10 PM", 8 -> "8 AM")
const formatHour = (hour) => {
    // Normalize hour to 0-23 range
    const h = ((hour % 24) + 24) % 24;
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    if (h > 12) return `${h - 12} PM`;
    return `${h} AM`;
};

// Convert display value (18-30) to actual hour (0-23)
const sliderToHour = (val) => {
    if (val >= 24) return val - 24; // 24-30 becomes 0-6
    return val; // 18-23 stays the same
};

// Convert actual hour to slider value (18-30)
const hourToSlider = (hour) => {
    if (hour <= 6) return hour + 24; // 0-6 becomes 24-30
    if (hour >= 18) return hour; // 18-23 stays
    return 24; // Default to midnight for other values
};

const SleepScheduleSlider = ({
    bedtime = 23,
    wakeup = 7,
    onChange,
    label = "Sleep Schedule",
    className = "",
}) => {
    // Convert to slider values for range [18 (6PM) to 30 (6AM next day)]
    const bedtimeSlider = hourToSlider(bedtime);
    const wakeupSlider = hourToSlider(wakeup);

    // Ensure wakeup is always after bedtime for the slider
    const sliderValue = [Math.min(bedtimeSlider, wakeupSlider), Math.max(bedtimeSlider, wakeupSlider)];

    const handleChange = (newValue) => {
        if (onChange && Array.isArray(newValue)) {
            const newBedtime = sliderToHour(newValue[0]);
            const newWakeup = sliderToHour(newValue[1]);
            onChange({ bedtime: newBedtime, wakeup: newWakeup });
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-white/70">{label}</label>
            )}

            {/* Visual display container */}
            <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <FiMoon className="text-white" size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-white/50">Bedtime</p>
                        <p className="font-bold text-white text-lg">{formatHour(bedtime)}</p>
                    </div>
                </div>

                <div className="flex-1 mx-6 h-2 rounded-full bg-white/10" />

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-xs text-white/50">Wake Up</p>
                        <p className="font-bold text-white text-lg">{formatHour(wakeup)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <FiSun className="text-orange-500" size={18} />
                    </div>
                </div>
            </div>

            {/* Dual-thumb Slider - Custom Styled */}
            <Slider
                classNames={{
                    base: "max-w-full gap-3",
                    track: "bg-white/10 backdrop-blur-md h-3 rounded-full border border-white/5",
                    filler: "bg-gradient-to-r from-orange-400 to-orange-600",
                    thumb: [
                        "bg-white",
                        "shadow-lg",
                        "w-6",
                        "h-6",
                        "after:w-4",
                        "after:h-4",
                        "after:bg-orange-500",
                        "group-data-[dragging=true]:scale-110",
                    ],
                }}
                aria-label="Sleep schedule"
                maxValue={30}
                minValue={18}
                step={1}
                value={sliderValue}
                onChange={handleChange}
                showSteps={false}
            />

            <div className="flex justify-between text-xs text-white/40 font-medium px-1">
                <span>6 PM</span>
                <span>9 PM</span>
                <span>12 AM</span>
                <span>3 AM</span>
                <span>6 AM</span>
            </div>
        </div>
    );
};

export default SleepScheduleSlider;
