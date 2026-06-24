import { useState } from 'react';
import AdminRestaurants from './admin/AdminRestaurants.jsx';
import AdminMenuItems from './admin/AdminMenuItems.jsx';
import AdminOrdersTab from './admin/AdminOrdersTab.jsx';
import AdminUsersTab from './admin/AdminUsersTab.jsx';

const TABS = [
  { key: 'restaurants', label: 'Restaurants', component: AdminRestaurants },
  { key: 'menu-items', label: 'Menu Items', component: AdminMenuItems },
  { key: 'orders', label: 'Orders', component: AdminOrdersTab },
  { key: 'users', label: 'Users', component: AdminUsersTab },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('restaurants');
  const ActiveComponent = TABS.find((t) => t.key === active).component;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <h1 className="font-display font-extrabold text-2xl mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 ${
              active === tab.key ? 'border-fleet-500 text-fleet-600' : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}
