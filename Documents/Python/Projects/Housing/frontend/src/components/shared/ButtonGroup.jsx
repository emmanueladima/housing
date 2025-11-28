import { FiCheck } from 'react-icons/fi';

const ButtonGroup = ({ options, value, onChange, name }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`
              px-4 py-2 rounded-lg border-2 font-medium transition-all
              ${isSelected
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                            }
            `}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ButtonGroup;
