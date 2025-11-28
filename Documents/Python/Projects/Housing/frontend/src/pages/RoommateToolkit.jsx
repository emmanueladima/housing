import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiDollarSign, FiBook, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const RoommateToolkit = () => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('chores'); // chores, expenses, rules

    useEffect(() => {
        fetchGroup();
    }, []);

    const fetchGroup = async () => {
        try {
            const { data } = await api.get('/roommate-groups/my-group');
            setGroup(data);
        } catch (err) {
            console.error('Error fetching group:', err);
            setError('Failed to load group data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    if (!group) return <div className="text-center py-12">No group found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Roommate Toolkit</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('chores')}
                            className={`flex-1 py-4 text-center font-medium ${activeTab === 'chores' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiCheckSquare /> Chores
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 py-4 text-center font-medium ${activeTab === 'expenses' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiDollarSign /> Expenses
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-4 text-center font-medium ${activeTab === 'rules' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiBook /> House Rules
                            </div>
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'chores' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Chore Rotation</h2>
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2">
                                        <FiPlus /> Add Chore
                                    </button>
                                </div>
                                {group.choreRotation?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No chores assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {group.choreRotation?.map((chore, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <button className={`w-6 h-6 rounded-full border flex items-center justify-center ${chore.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                                        {chore.completed && <FiCheck size={14} />}
                                                    </button>
                                                    <div>
                                                        <p className="font-medium">{chore.title}</p>
                                                        <p className="text-sm text-gray-500">Assigned to: {chore.assignedTo?.firstName || 'Unassigned'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500 capitalize">{chore.frequency}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'expenses' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Shared Expenses</h2>
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2">
                                        <FiPlus /> Add Expense
                                    </button>
                                </div>
                                {group.expenses?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No expenses recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {group.expenses?.map((expense, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{expense.title}</p>
                                                    <p className="text-sm text-gray-500">Paid by: {expense.paidBy?.firstName}</p>
                                                </div>
                                                <span className="font-bold text-gray-900">${expense.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'rules' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">House Rules</h2>
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2">
                                        <FiPlus /> Add Rule
                                    </button>
                                </div>
                                {group.houseRules?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No house rules set yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {group.houseRules?.map((rule, idx) => (
                                            <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span>{rule}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoommateToolkit;
