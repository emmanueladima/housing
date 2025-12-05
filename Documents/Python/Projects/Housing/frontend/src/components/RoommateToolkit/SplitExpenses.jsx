import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const SplitExpenses = ({ members = [], expenses: propExpenses = [], onAddExpense, isPersonal = false }) => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        paidBy: 'me',
        splitWith: 'all',
        category: 'other'
    });

    useEffect(() => {
        if (isPersonal) {
            // Load from localStorage for personal use
            const saved = localStorage.getItem('personal_expenses');
            if (saved) {
                setExpenses(JSON.parse(saved));
            }
        } else if (propExpenses.length > 0) {
            setExpenses(propExpenses);
        }
    }, [propExpenses, isPersonal]);

    const saveExpenses = (newExpenses) => {
        if (isPersonal) {
            localStorage.setItem('personal_expenses', JSON.stringify(newExpenses));
        }
    };

    const handleAddExpense = () => {
        if (!newExpense.title || !newExpense.amount) return;

        const expense = {
            id: Date.now().toString(),
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            payer: newExpense.paidBy === 'me'
                ? { firstName: 'You', _id: user?._id }
                : { firstName: 'Roommate', _id: 'other' },
            date: new Date().toISOString(),
            status: 'Open',
            category: newExpense.category,
            splitWith: newExpense.splitWith
        };

        const updated = [expense, ...expenses];
        setExpenses(updated);
        saveExpenses(updated);

        if (onAddExpense && !isPersonal) {
            onAddExpense(expense);
        }

        setShowModal(false);
        setNewExpense({ title: '', amount: '', paidBy: 'me', splitWith: 'all', category: 'other' });
    };

    const handleSettleExpense = (id) => {
        const updated = expenses.map(e =>
            e.id === id ? { ...e, status: 'Settled' } : e
        );
        setExpenses(updated);
        saveExpenses(updated);
    };

    const handleDeleteExpense = (id) => {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        saveExpenses(updated);
    };

    // Calculate totals
    const youOwe = expenses
        .filter(e => e.status === 'Open' && e.payer?.firstName !== 'You')
        .reduce((sum, e) => sum + (e.amount / 2), 0); // Assuming 50/50 split

    const youreOwed = expenses
        .filter(e => e.status === 'Open' && e.payer?.firstName === 'You')
        .reduce((sum, e) => sum + (e.amount / 2), 0);

    const categories = [
        { value: 'rent', label: 'Rent' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'groceries', label: 'Groceries' },
        { value: 'household', label: 'Household' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {isPersonal ? 'My Expenses' : 'Split Expenses'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isPersonal ? 'Track your personal expenses.' : 'Track shared costs easily.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <FiPlus /> Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            {!isPersonal && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">You Owe</p>
                        <p className="text-2xl font-black text-gray-900">${youOwe.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">You're Owed</p>
                        <p className="text-2xl font-black text-gray-900">${youreOwed.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Personal Total */}
            {isPersonal && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Total Tracked</p>
                    <p className="text-2xl font-black text-gray-900">
                        ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                </div>
            )}

            {/* Expenses List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <FiDollarSign size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Expenses Yet</h3>
                        <p className="text-gray-500">Add an expense to start tracking.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {expenses.map(expense => (
                            <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${expense.payer?.firstName === 'You' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            <FiDollarSign />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{expense.title}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                Paid by <span className="font-medium text-gray-700">{expense.payer?.firstName || 'Unknown'}</span>
                                                • {new Date(expense.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${expense.status === 'Settled' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {expense.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {expense.status === 'Open' && !isPersonal && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => handleSettleExpense(expense.id)}
                                            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                                        >
                                            <FiCheck /> Mark as Settled
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add Expense</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={newExpense.title}
                                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                    placeholder="e.g., Groceries, Utilities"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                                >
                                    {categories.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            {!isPersonal && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Paid By</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, paidBy: 'me' })}
                                            className={`py-3 rounded-xl font-bold transition-all ${newExpense.paidBy === 'me'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            I Paid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewExpense({ ...newExpense, paidBy: 'other' })}
                                            className={`py-3 rounded-xl font-bold transition-all ${newExpense.paidBy === 'other'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Roommate Paid
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddExpense}
                                disabled={!newExpense.title || !newExpense.amount}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitExpenses;
