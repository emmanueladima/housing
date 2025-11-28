import { FiFilter, FiSearch } from 'react-icons/fi';

const RoommateFilters = () => {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by major, interests, or name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-full text-sm transition-all"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black hover:bg-gray-50 transition-all whitespace-nowrap">
                            Price Range
                        </button>
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black hover:bg-gray-50 transition-all whitespace-nowrap">
                            Gender
                        </button>
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black hover:bg-gray-50 transition-all whitespace-nowrap">
                            Cleanliness
                        </button>
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-black hover:bg-gray-50 transition-all whitespace-nowrap">
                            Major
                        </button>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap">
                            <FiFilter size={14} />
                            All Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoommateFilters;
