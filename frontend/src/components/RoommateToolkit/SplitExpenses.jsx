import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const SplitExpenses = ({
    members = [],
    expenses: propExpenses = [],
    onAddExpense,
    onSettleExpense,
    onDeleteExpense,
    isPersonal = false
}) => {
    const { user } = useAuth();
    const [localExpenses, setLocalExpenses] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        paidBy: 'me',
        splitWith: 'all',
        category: 'other'
    });

    // Use prop expenses for group mode, localStorage for personal mode
    const expenses = isPersonal ? localExpenses : propExpenses;

    useEffect(() => {
        if (isPersonal) {
            // Load from localStorage for personal use
            const saved = localStorage.getItem('personal_expenses');
            if (saved) {
                setLocalExpenses(JSON.parse(saved));
            }
        }
        setIsLoaded(true);
    }, [isPersonal]);

    const saveLocalExpenses = (newExpenses) => {
        localStorage.setItem('personal_expenses', JSON.stringify(newExpenses));
    };

    const handleAddExpense = async () => {
        if (!newExpense.title || !newExpense.amount) return;

        setIsSubmitting(true);

        try {
            if (isPersonal) {
                // Personal mode: use localStorage
                const expense = {
                    id: Date.now().toString(),
                    title: newExpense.title,
                    amount: parseFloat(newExpense.amount),
                    payer: { firstName: 'You', _id: user?._id },
                    date: new Date().toISOString(),
                    status: 'open',
                    category: newExpense.category,
                    splitWith: newExpense.splitWith
                };

                const updated = [expense, ...localExpenses];
                setLocalExpenses(updated);
                saveLocalExpenses(updated);
            } else if (onAddExpense) {
                // Group mode: use API callback
                await onAddExpense({
                    title: newExpense.title,
                    amount: parseFloat(newExpense.amount),
                    paidBy: newExpense.paidBy === 'me' ? user?._id : newExpense.paidBy,
                    category: newExpense.category,
                    splitAmong: members.map(m => m._id)
                });
            }

            setShowModal(false);
            setNewExpense({ title: '', amount: '', paidBy: 'me', splitWith: 'all', category: 'other' });
        } catch (error) {
            console.error('Failed to add expense:', error);
            alert('Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSettleExpense = async (id) => {
        try {
            if (isPersonal) {
                // Personal mode: use localStorage
                const updated = localExpenses.map(e =>
                    e.id === id ? { ...e, status: 'settled' } : e
                );
                setLocalExpenses(updated);
                saveLocalExpenses(updated);
            } else if (onSettleExpense) {
                // Group mode: use API callback
                await onSettleExpense(id);
            }
        } catch (error) {
            console.error('Failed to settle expense:', error);
            alert('Failed to settle expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            if (isPersonal) {
                // Personal mode: use localStorage
                const updated = localExpenses.filter(e => e.id !== id);
                setLocalExpenses(updated);
                saveLocalExpenses(updated);
            } else if (onDeleteExpense) {
                // Group mode: use API callback
                await onDeleteExpense(id);
            }
        } catch (error) {
            console.error('Failed to delete expense:', error);
            alert('Failed to delete expense. Please try again.');
        }
    };

    // Calculate totals
    const youOwe = expenses
        .filter(e => (e.status === 'open' || e.status === 'Open') && e.paidBy?.firstName !== 'You' && e.paidBy?._id !== user?._id)
        .reduce((sum, e) => sum + (e.amount / 2), 0); // Assuming 50/50 split

    const youreOwed = expenses
        .filter(e => (e.status === 'open' || e.status === 'Open') && (e.paidBy?.firstName === 'You' || e.paidBy?._id === user?._id))
        .reduce((sum, e) => sum + (e.amount / 2), 0);

    const categories = [
        { value: 'rent', label: 'Rent' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'groceries', label: 'Groceries' },
        { value: 'household', label: 'Household' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'other', label: 'Other' }
    ];

    const getExpenseStatus = (expense) => {
        return expense.status?.toLowerCase() === 'settled' ? 'Settled' : 'Open';
    };

    const isExpenseOpen = (expense) => {
        return expense.status?.toLowerCase() !== 'settled';
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        {isPersonal ? 'My Expenses' : 'Split Expenses'}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {isPersonal ? 'Track your personal expenses.' : 'Track shared costs easily.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                    <FiPlus /> Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            {!isPersonal && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                        <p className="text-xs font-bold text-red-200 uppercase tracking-wide mb-1">You Owe</p>
                        <p className="text-2xl font-black text-white">${youOwe.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                        <p className="text-xs font-bold text-green-200 uppercase tracking-wide mb-1">You're Owed</p>
                        <p className="text-2xl font-black text-white">${youreOwed.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Personal Total */}
            {isPersonal && (
                <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-500/30">
                    <p className="text-xs font-bold text-orange-200 uppercase tracking-wide mb-1">Total Tracked</p>
                    <p className="text-2xl font-black text-white">
                        ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                </div>
            )}

            {/* Expenses List */}
            {!isLoaded ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden animate-fade-in">
                    {expenses.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white/50">
                                <FiDollarSign size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Expenses Yet</h3>
                            <p className="text-white/60">Add an expense to start tracking.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {expenses.map(expense => {
                                const expenseId = expense._id || expense.id;
                                const isUserPayer = expense.paidBy?.firstName === 'You' || expense.paidBy?._id === user?._id;
                                return (
                                    <div key={expenseId} className="p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isUserPayer ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                                                    }`}>
                                                    <FiDollarSign />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{expense.title}</h3>
                                                    <p className="text-xs text-white/60 flex items-center gap-1">
                                                        Paid by <span className="font-medium text-white/80">{expense.paidBy?.firstName || 'Unknown'}</span>
                                                        • {new Date(expense.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <div>
                                                    <p className="font-bold text-white">${expense.amount.toFixed(2)}</p>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getExpenseStatus(expense) === 'Settled' ? 'bg-white/10 text-white/50' : 'bg-red-500/20 text-red-300'
                                                        }`}>
                                                        {getExpenseStatus(expense)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteExpense(expenseId)}
                                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {isExpenseOpen(expense) && !isPersonal && (
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={() => handleSettleExpense(expenseId)}
                                                    className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1"
                                                >
                                                    <FiCheck /> Mark as Settled
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

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
                                disabled={!newExpense.title || !newExpense.amount || isSubmitting}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitExpenses;
