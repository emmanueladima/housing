const RangeInput = ({ label, minValue, maxValue, onMinChange, onMaxChange, placeholder = { min: 'Min', max: 'Max' }, unit = '' }) => {
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    value={minValue}
                    onChange={(e) => onMinChange(e.target.value)}
                    placeholder={placeholder.min}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
                <span className="text-gray-500">to</span>
                <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => onMaxChange(e.target.value)}
                    placeholder={placeholder.max}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
                {unit && <span className="text-gray-600 text-sm">{unit}</span>}
            </div>
        </div>
    );
};

export default RangeInput;
