import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reminders.css';

interface Reminder {
  id: string;
  title: string;
  date: string;
  iconColor: string;
  backgroundColor: string;
}

const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'HVAC filter due',
    date: 'Dec 3',
    iconColor: '#F8A459',
    backgroundColor: '#CBE4F4'
  },
  {
    id: '2',
    title: 'Freeze Warning tonight',
    date: 'Dec 3',
    iconColor: '#FAD157',
    backgroundColor: '#76C8FF'
  },
  {
    id: '3',
    title: 'Smoke detector battery expires',
    date: 'Dec 15',
    iconColor: '#F8A459',
    backgroundColor: '#CBE4F4'
  },
  {
    id: '4',
    title: 'Storm Alert',
    date: 'Dec 20',
    iconColor: '#FAD157',
    backgroundColor: '#76C8FF'
  }
];

export const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const [swipedReminder, setSwipedReminder] = useState<string | null>(null);

  const groupedReminders = mockReminders.reduce((acc, reminder) => {
    if (!acc[reminder.date]) {
      acc[reminder.date] = [];
    }
    acc[reminder.date].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  const handleSwipe = (id: string) => {
    setSwipedReminder(swipedReminder === id ? null : id);
  };

  const handleComplete = (id: string) => {
    // Handle completing the reminder
    console.log('Completing reminder:', id);
  };

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <h1 className="page-title">Reminders</h1>
        <p className="page-subtitle">Check all your upcoming alerts</p>
      </div>

      <div className="reminders-content">
        {Object.entries(groupedReminders).map(([date, reminders]) => (
          <div key={date} className="reminder-group">
            <h2 className="date-heading">{date}</h2>
            <div className="reminder-list">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`reminder-item-wrapper ${swipedReminder === reminder.id ? 'swiped' : ''}`}
                >
                  <div
                    className="reminder-item"
                    style={{ backgroundColor: reminder.backgroundColor }}
                    onClick={() => handleSwipe(reminder.id)}
                  >
                    <div
                      className="reminder-icon"
                      style={{ backgroundColor: reminder.iconColor }}
                    >
                      <svg
                        width="37"
                        height="37"
                        viewBox="0 0 37 37"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="37" height="37" rx="8" fill="white" fillOpacity="0.4" />
                      </svg>
                    </div>
                    <span className="reminder-text">{reminder.title}</span>
                  </div>
                  {swipedReminder === reminder.id && (
                    <button
                      className="complete-button"
                      onClick={() => handleComplete(reminder.id)}
                    >
                      <svg
                        width="49"
                        height="33"
                        viewBox="0 0 49 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 15L17.5 32.5L48.5 0"
                          stroke="#8E8E93"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-navigation">
        <button className="nav-button"></button>
        <button className="nav-button active"></button>
        <button className="nav-button"></button>
        <button className="nav-button"></button>
      </div>
    </div>
  );
};
