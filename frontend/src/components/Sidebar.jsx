import {
  NavLink,
} from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  UserCog,
  Bell,
  FileText,
  FileBarChart,
  Menu,
  X,
} from 'lucide-react';

import {
  useAuth,
} from '../context/AuthContext';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: [
      'admin',
      'hr',
      'employee',
    ],
  },
  {
    name: 'Employees',
    path: '/employees',
    icon: Users,
    roles: [
      'admin',
      'hr',
    ],
  },
  {
    name: 'Departments',
    path: '/departments',
    icon: Building2,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: CalendarCheck,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Shifts',
    path: '/shifts',
    icon: Clock,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Attendance',
    path: '/my-attendance',
    icon: CalendarCheck,
    roles: ['employee'],
  },
  {
    name: 'Leaves',
    path: '/leaves',
    icon: CalendarDays,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Leaves',
    path: '/my-leaves',
    icon: CalendarDays,
    roles: ['employee'],
  },
  {
    name: 'Payroll',
    path: '/payroll',
    icon: Wallet,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Payroll',
    path: '/my-payroll',
    icon: Wallet,
    roles: ['employee'],
  },
  {
    name: 'Performance',
    path: '/performance',
    icon: ChartNoAxesCombined,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Performance',
    path: '/my-performance',
    icon: ChartNoAxesCombined,
    roles: ['employee'],
  },
  {
    name: 'Users',
    path: '/users',
    icon: UserCog,
    roles: ['admin'],
  },
  {
    name: 'Documents',
    path: '/documents',
    icon: FileText,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Documents',
    path: '/my-documents',
    icon: FileText,
    roles: ['employee'],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: FileBarChart,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell,
    roles: ['admin', 'hr', 'employee'],
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

function Sidebar({
  isOpen,
  setIsOpen,
}) {
  const {
    user,
  } = useAuth();

  const userRole =
    user?.role;

  const visibleMenuItems =
    menuItems.filter(
      (item) =>
        item.roles.includes(
          userRole,
        ),
    );

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ${
        isOpen
          ? 'w-64'
          : 'w-20'
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
          isOpen
            ? 'justify-between px-4'
            : 'justify-center'
        }`}
      >
        {isOpen && (
          <h1 className="text-xl font-bold text-slate-900">
            HRMS
          </h1>
        )}

        <button
          type="button"
          onClick={() =>
            setIsOpen(
              (previous) =>
                !previous,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          title={
            isOpen
              ? 'Close sidebar'
              : 'Open sidebar'
          }
        >
          {isOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        {visibleMenuItems.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={item.path}
                className="group relative"
              >
                <NavLink
                  to={item.path}
                  className={({
                    isActive,
                  }) =>
                    `flex h-11 items-center rounded-lg text-sm font-medium transition ${
                      isOpen
                        ? 'gap-3 px-3'
                        : 'justify-center'
                    } ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={19} />

                  {isOpen && (
                    <span className="whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </NavLink>

                {!isOpen && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.name}
                  </div>
                )}
              </div>
            );
          },
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;