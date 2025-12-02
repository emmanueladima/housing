import React, { useState } from 'react';
import { FiDollarSign, FiPlus, FiUser, FiCalendar, FiCheck } from 'react-icons/fi';

const SplitExpenses = ({ members = [] }) => {
    // Mock Data
    const [expenses, setExpenses] = useState([
        { id: 1, title: 'Internet Bill', amount: 80, payer: members[0] || { firstName: 'You' }, date: '2023-11-01', status: 'Open', participants: ['All'] },
        { id: 2, title: 'Groceries', amount: 120, payer: members[1] || { firstName: 'Sarah' }, date: '2023-11-05', status: 'Settled', participants: ['You', 'Sarah'] },
        { id: 3, title: 'Cleaning Supplies', amount: 25, payer: members[0] || { firstName: 'You' }, date: '2023-11-10', status: 'Open', participants: ['All'] },
    ]);

    const settleExpense = (id) => {
        setExpenses(expenses.map(exp =>
            exp.id === id ? { ...exp, status: 'Settled' } : exp
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Split Expenses</h2>
                    <p className="text-gray-500 text-sm">Track shared costs easily.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    <FiPlus /> Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">You Owe</p>
                    <p className="text-2xl font-black text-gray-900">$40.00</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">You're Owed</p>
                    <p className="text-2xl font-black text-gray-900">$12.50</p>
                </div>
            </div>

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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${expense.payer.firstName === 'You' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            <FiDollarSign />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{expense.title}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                Paid by <span className="font-medium text-gray-700">{expense.payer.firstName}</span>
                                                • {new Date(expense.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${expense.status === 'Settled' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {expense.status}
                                        </span>
                                    </div>
                                </div>
                                {expense.status === 'Open' && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => settleExpense(expense.id)}
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
        </div>
    );
};

export default SplitExpenses;
