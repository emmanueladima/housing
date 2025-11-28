const FilterSection = ({ title, children, collapsible = false }) => {
    return (
        <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default FilterSection;
