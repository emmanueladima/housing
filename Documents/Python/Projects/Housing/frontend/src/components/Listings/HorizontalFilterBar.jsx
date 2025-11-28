import ButtonGroup from '../shared/ButtonGroup';

const HorizontalFilterBar = ({ onMoreFiltersClick, activeFilterCount }) => {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-full px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMoreFiltersClick}
                        className="px-4 py-2 border border-gray-300 rounded-full hover:border-black transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: 3, overflow: 'visible' }}>
                            <path fill="none" d="M7 16H3m26 0H15M29 6h-4m-8 0H3m26 20h-4M7 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM17 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 20a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0H3"></path>
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Scrollable chips for quick filters could go here if needed later */}
                </div>
            </div>
        </div>
    );
};

export default HorizontalFilterBar;
