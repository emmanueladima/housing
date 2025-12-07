import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ type = 'success', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="text-teal-600" size={24} />,
    error: <FiXCircle className="text-red-500" size={24} />,
    warning: <FiAlertCircle className="text-yellow-500" size={24} />,
    info: <FiInfo className="text-blue-500" size={24} />,
  };

  const bgColors = {
    success: 'bg-teal-50 border-teal-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 min-w-[320px] max-w-md animate-slideIn ${bgColors[type]} border rounded-lg shadow-2xl p-4 flex items-start space-x-3`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FiX size={20} />
      </button>
    </div>
  );
};

export default Toast;

