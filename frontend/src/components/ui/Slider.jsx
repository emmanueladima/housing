import React from 'react';
import { Slider as HeroSlider, Tooltip } from '@heroui/react';

export const InfoIcon = (props) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
            <path
                d="M12 8V13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
            <path
                d="M11.9945 16H12.0035"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
};

// Utility for conditional class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

const PriceRangeSlider = ({
    label = "Price Range",
    tooltip,
    minValue = 0,
    maxValue = 1000,
    step = 10,
    defaultValue = [100, 300],
    value,
    onChange,
    formatOptions = { style: "currency", currency: "USD" },
    size = "lg",
    className = "",
    ...props
}) => {
    const handleChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <HeroSlider
            classNames={{
                base: cn("max-w-md gap-3", className),
                filler: "bg-gradient-to-r from-orange-300 to-orange-500",
                track: "bg-gray-200",
                label: "text-gray-700 font-medium",
                value: "text-gray-600",
            }}
            defaultValue={defaultValue}
            formatOptions={formatOptions}
            label={label}
            maxValue={maxValue}
            minValue={minValue}
            renderLabel={tooltip ? ({ children, ...labelProps }) => (
                <label {...labelProps} className="text-medium flex gap-2 items-center text-gray-700 font-medium">
                    {children}
                    <Tooltip
                        className="w-[200px] px-1.5 text-tiny text-gray-600 rounded-lg bg-white shadow-lg border"
                        content={tooltip}
                        placement="right"
                    >
                        <span className="transition-opacity opacity-80 hover:opacity-100 text-gray-400">
                            <InfoIcon />
                        </span>
                    </Tooltip>
                </label>
            ) : undefined}
            renderThumb={({ index, ...thumbProps }) => (
                <div
                    {...thumbProps}
                    className="group p-1 top-1/2 bg-white border border-gray-200 shadow-md rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                >
                    <span
                        className={cn(
                            "transition-transform shadow-sm rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80",
                            index === 0
                                ? "bg-gradient-to-br from-orange-300 to-orange-500"
                                : "bg-gradient-to-br from-orange-400 to-orange-600",
                        )}
                    />
                </div>
            )}
            size={size}
            step={step}
            value={value}
            onChange={handleChange}
            {...props}
        />
    );
};

// Simple single-value slider for sleep time, etc.
const SimpleSlider = ({
    label,
    tooltip,
    minValue = 0,
    maxValue = 24,
    step = 1,
    defaultValue = 12,
    value,
    onChange,
    showValue = true,
    size = "md",
    className = "",
    ...props
}) => {
    const handleChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <HeroSlider
            classNames={{
                base: cn("max-w-md gap-3", className),
                filler: "bg-gradient-to-r from-orange-400 to-orange-500",
                track: "bg-gray-200",
                label: "text-gray-700 font-medium",
                value: "text-gray-600",
            }}
            defaultValue={defaultValue}
            hideValue={!showValue}
            label={label}
            maxValue={maxValue}
            minValue={minValue}
            renderLabel={tooltip ? ({ children, ...labelProps }) => (
                <label {...labelProps} className="text-medium flex gap-2 items-center text-gray-700 font-medium">
                    {children}
                    <Tooltip
                        className="w-[200px] px-1.5 text-tiny text-gray-600 rounded-lg bg-white shadow-lg border"
                        content={tooltip}
                        placement="right"
                    >
                        <span className="transition-opacity opacity-80 hover:opacity-100 text-gray-400">
                            <InfoIcon />
                        </span>
                    </Tooltip>
                </label>
            ) : undefined}
            size={size}
            step={step}
            value={value}
            onChange={handleChange}
            {...props}
        />
    );
};

export { PriceRangeSlider, SimpleSlider };
export default PriceRangeSlider;
