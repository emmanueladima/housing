import { FiCheck } from 'react-icons/fi';

const CheckboxGroup = ({ options, selectedValues = [], onChange, columns = 2 }) => {
    const handleToggle = (value) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className={`grid grid-cols-${columns} gap-3`}>
            {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleToggle(option.value)}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left
              ${isSelected
                                ? 'bg-orange-50 border-orange-500 text-orange-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'
                            }
            `}
                    >
                        <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
              ${isSelected
                                ? 'bg-orange-600 border-orange-600'
                                : 'bg-white border-gray-400'
                            }
            `}>
                            {isSelected && <FiCheck className="text-white" size={14} />}
                        </div>
                        <span className="text-sm font-medium">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CheckboxGroup;
