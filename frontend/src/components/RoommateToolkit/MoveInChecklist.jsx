import React, { useState, useEffect } from 'react';
import { FiCheck, FiPlus, FiTrash2, FiRefreshCw, FiBox, FiTruck, FiClipboard, FiHome, FiPackage, FiStar, FiList, FiEdit3 } from 'react-icons/fi';
import checklistService from '../../services/checklistService';

const CATEGORY_CONFIG = {
    planning: { label: 'Planning', icon: FiClipboard, color: 'blue' },
    packing: { label: 'Packing', icon: FiPackage, color: 'purple' },
    logistics: { label: 'Logistics', icon: FiTruck, color: 'green' },
    admin: { label: 'Admin', icon: FiClipboard, color: 'yellow' },
    'move-day': { label: 'Move Day', icon: FiBox, color: 'orange' },
    settling: { label: 'Settling In', icon: FiHome, color: 'pink' },
    custom: { label: 'Custom', icon: FiStar, color: 'gray' },
};

const MoveInChecklist = () => {
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newItemText, setNewItemText] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('custom');
    const [filterCategory, setFilterCategory] = useState('all');
    const [needsSetup, setNeedsSetup] = useState(false);

    useEffect(() => {
        fetchChecklist();
    }, []);

    const fetchChecklist = async () => {
        try {
            const data = await checklistService.getPersonalChecklist();
            if (data.notCreated) {
                setNeedsSetup(true);
                setChecklist(null);
            } else {
                setChecklist(data);
                setNeedsSetup(false);
            }
        } catch (error) {
            console.error('Error fetching checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializeChecklist = async (useTemplate) => {
        setLoading(true);
        try {
            const data = await checklistService.initPersonalChecklist(useTemplate);
            setChecklist(data);
            setNeedsSetup(false);
        } catch (error) {
            console.error('Error initializing checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (itemId) => {
        if (!checklist) return;

        const updatedItems = checklist.items.map(item =>
            item._id === itemId ? { ...item, completed: !item.completed } : item
        );

        setChecklist({ ...checklist, items: updatedItems });

        try {
            await checklistService.updatePersonalChecklist(updatedItems);
        } catch (error) {
            console.error('Error updating checklist:', error);
            fetchChecklist();
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItemText.trim()) return;

        try {
            const data = await checklistService.addPersonalItem(newItemText, selectedCategory);
            setChecklist(data);
            setNewItemText('');
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            const data = await checklistService.deletePersonalItem(itemId);
            setChecklist(data);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const resetChecklist = async () => {
        if (!window.confirm('Reset checklist to template? This will replace all items.')) return;

        try {
            const data = await checklistService.resetPersonalChecklist();
            setChecklist(data);
        } catch (error) {
            console.error('Error resetting checklist:', error);
        }
    };

    const clearChecklist = async () => {
        if (!window.confirm('Clear all items? You can add new ones after.')) return;

        try {
            await checklistService.updatePersonalChecklist([]);
            setChecklist({ ...checklist, items: [] });
        } catch (error) {
            console.error('Error clearing checklist:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 min-h-[400px]">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    // Template Choice Screen
    if (needsSetup) {
        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Move-In Checklist</h2>
                    <p className="text-white/70">How would you like to start your checklist?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Template Option */}
                    <button
                        onClick={() => initializeChecklist(true)}
                        className="group p-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all text-left backdrop-blur-md"
                    >
                        <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FiList className="text-orange-400" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Use Template</h3>
                        <p className="text-gray-600 mb-4">Start with 20 pre-made tasks organized by category. Perfect if you want guidance.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Planning</span>
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Packing</span>
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Move Day</span>
                            <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">+3 more</span>
                        </div>
                    </button>

                    {/* Custom Option */}
                    <button
                        onClick={() => initializeChecklist(false)}
                        className="group p-8 bg-white/60 rounded-2xl border-2 border-white/40 hover:border-white/60 hover:shadow-lg transition-all text-left backdrop-blur-md"
                    >
                        <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FiEdit3 className="text-gray-700" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Fresh</h3>
                        <p className="text-gray-600 mb-4">Create your own custom checklist from scratch. Add exactly what you need.</p>
                        <div className="flex items-center gap-2 text-gray-500">
                            <FiPlus size={16} />
                            <span className="text-sm">Add your own tasks</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    const items = checklist?.items || [];
    const completedCount = items.filter(i => i.completed).length;
    const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

    const filteredItems = filterCategory === 'all'
        ? items
        : items.filter(item => item.category === filterCategory);

    const groupedItems = filteredItems.reduce((acc, item) => {
        const cat = item.category || 'custom';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Move-In Checklist</h2>
                    <p className="text-white/80 mt-1">Track your moving progress step by step</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={resetChecklist}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm"
                        title="Reset to template"
                    >
                        <FiRefreshCw size={16} />
                        Template
                    </button>
                    <button
                        onClick={clearChecklist}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm"
                        title="Clear all items"
                    >
                        <FiTrash2 size={16} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            {items.length > 0 && (
                <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl p-6 border border-orange-500/30 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-white">{progress}% Complete</span>
                        <span className="text-sm text-white/70">{completedCount} of {items.length} tasks</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {progress === 100 && (
                        <div className="mt-4 flex items-center gap-2 text-green-600 font-bold">
                            <FiCheck className="text-green-500" size={20} />
                            🎉 Congratulations! You're ready for your move!
                        </div>
                    )}
                </div>
            )}

            {/* Category Filter Pills */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCategory === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All ({items.length})
                    </button>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                        const count = items.filter(i => i.category === key).length;
                        if (count === 0) return null;
                        const Icon = config.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterCategory(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCategory === key
                                    ? 'bg-white text-gray-900'
                                    : 'bg-white/40 text-gray-700 hover:bg-white/60'
                                    }`}
                            >
                                <Icon size={14} />
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FiClipboard className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No tasks yet</h3>
                    <p className="text-gray-500 mb-4">Add your first task to get started!</p>
                </div>
            )}

            {/* Checklist Items by Category */}
            <div className="space-y-6">
                {Object.entries(groupedItems).sort((a, b) => {
                    const order = ['planning', 'packing', 'logistics', 'admin', 'move-day', 'settling', 'custom'];
                    return order.indexOf(a[0]) - order.indexOf(b[0]);
                }).map(([category, categoryItems]) => {
                    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.custom;
                    const Icon = config.icon;
                    const completedInCat = categoryItems.filter(i => i.completed).length;

                    return (
                        <div key={category} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden">
                            <div className="px-5 py-3 bg-white/40 border-b border-white/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                                        <Icon className="text-gray-700" size={16} />
                                    </div>
                                    <span className="font-bold text-gray-900">{config.label}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {completedInCat}/{categoryItems.length}
                                </span>
                            </div>

                            <div className="divide-y divide-gray-200/50">
                                {categoryItems.sort((a, b) => a.order - b.order).map(item => (
                                    <div
                                        key={item._id}
                                        className={`flex items-center gap-4 px-5 py-4 hover:bg-white/20 transition-all ${item.completed ? 'bg-green-50' : ''
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleItem(item._id)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-400 hover:border-orange-500'
                                                }`}
                                        >
                                            {item.completed && <FiCheck size={14} />}
                                        </button>
                                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            onClick={() => deleteItem(item._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Custom Item */}
            {showAddForm ? (
                <form onSubmit={addItem} className="bg-orange-50 bg-white/60 rounded-2xl p-5 border border-orange-200 backdrop-blur-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Add Task</label>
                    <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="e.g., Buy new curtains for bedroom"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all mb-3 bg-white text-gray-900 placeholder-gray-400"
                        autoFocus
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === key
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <Icon size={12} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                        >
                            Add Task
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowAddForm(false); setNewItemText(''); }}
                            className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-4 border-2 border-dashed border-white/50 rounded-2xl text-white/70 hover:border-orange-400 hover:text-orange-400 transition-all flex items-center justify-center gap-2 font-medium bg-white/5 backdrop-blur-sm"
                >
                    <FiPlus size={20} />
                    Add Task
                </button>
            )}
        </div>
    );
};

export default MoveInChecklist;
