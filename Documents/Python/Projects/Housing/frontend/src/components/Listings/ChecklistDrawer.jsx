import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const ChecklistDrawer = ({ listingId, onClose }) => {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultItems = [
    'Review and sign lease agreement',
    'Submit security deposit',
    'Set up utilities (electricity, water, gas)',
    'Arrange internet and cable service',
    'Get renter\'s insurance',
    'Schedule move-in inspection',
    'Collect keys and access codes',
    'Change mailing address',
    'Plan furniture and appliances',
    'Create packing list',
    'Arrange moving truck/helpers',
    'Deep clean new place',
    'Take photos of condition',
  ];

  useEffect(() => {
    loadChecklist();
  }, [listingId]);

  const loadChecklist = async () => {
    try {
      const { data } = await api.get(`/checklists/${listingId}`);
      if (data) {
        setChecklist(data);
      } else {
        // Create new checklist with default items
        const newChecklist = {
          listing: listingId,
          items: defaultItems.map((text, index) => ({
            text,
            completed: false,
            order: index,
          })),
        };
        const { data: created } = await api.post('/checklists', newChecklist);
        setChecklist(created);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
      // If error is 404, create a new one
      if (error.response?.status === 404) {
        try {
          const newChecklist = {
            listing: listingId,
            items: defaultItems.map((text, index) => ({
              text,
              completed: false,
              order: index,
            })),
          };
          const { data: created } = await api.post('/checklists', newChecklist);
          setChecklist(created);
        } catch (createError) {
          console.error('Error creating checklist:', createError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemIndex) => {
    if (saving) return;

    const updated = { ...checklist };
    updated.items[itemIndex].completed = !updated.items[itemIndex].completed;
    setChecklist(updated);

    try {
      setSaving(true);
      await api.put(`/checklists/${checklist._id}`, { items: updated.items });
    } catch (error) {
      console.error('Error updating checklist:', error);
      // Revert on error
      updated.items[itemIndex].completed = !updated.items[itemIndex].completed;
      setChecklist(updated);
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItemText.trim() || saving) return;

    const newItem = {
      text: newItemText.trim(),
      completed: false,
      order: checklist.items.length,
    };

    const updated = { ...checklist };
    updated.items.push(newItem);
    setChecklist(updated);
    setNewItemText('');

    try {
      setSaving(true);
      await api.put(`/checklists/${checklist._id}`, { items: updated.items });
    } catch (error) {
      console.error('Error adding item:', error);
      // Revert on error
      updated.items.pop();
      setChecklist(updated);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemIndex) => {
    if (saving) return;

    const itemToDelete = checklist.items[itemIndex];
    const updated = { ...checklist };
    updated.items.splice(itemIndex, 1);
    setChecklist(updated);

    try {
      setSaving(true);
      await api.put(`/checklists/${checklist._id}`, { items: updated.items });
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert on error
      updated.items.splice(itemIndex, 0, itemToDelete);
      setChecklist(updated);
    } finally {
      setSaving(false);
    }
  };

  const completedCount = checklist?.items.filter(item => item.completed).length || 0;
  const totalCount = checklist?.items.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-t-3xl flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Pre-Move Checklist</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close checklist"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{completedCount} of {totalCount} completed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {checklist?.items.map((item, index) => (
                <div
                  key={index}
                  className={`group flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    item.completed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                    aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    disabled={saving}
                  >
                    {item.completed && <FiCheck size={14} strokeWidth={3} />}
                  </button>

                  <span
                    className={`flex-1 text-gray-800 transition-all ${
                      item.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {item.text}
                  </span>

                  <button
                    onClick={() => deleteItem(index)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                    aria-label="Delete item"
                    disabled={saving}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Add New Item */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="Add a custom item..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  disabled={saving}
                />
                <button
                  onClick={addItem}
                  disabled={!newItemText.trim() || saving}
                  className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Add item"
                >
                  <FiPlus size={20} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {progressPercentage === 100 && (
          <div className="bg-green-50 border-t border-green-200 p-4 flex items-center justify-center gap-2 text-green-700">
            <FiCheckCircle size={20} />
            <span className="font-semibold">All done! You're ready to move in! 🎉</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistDrawer;




