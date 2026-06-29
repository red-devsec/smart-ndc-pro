import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAppStore } from "../../store/appStore";
import type { Employee } from "../../data/types";

// Palette déterministe pour les avatars initials
const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(emp: Employee): string {
  return (emp.firstName.charAt(0) + emp.lastName.charAt(0)).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

const AVATAR_MAP: Record<string, string> = {
  e1: "/images/user/user-02.jpg",
  e2: "/images/user/user-03.jpg",
  e3: "/images/user/user-04.jpg",
  e4: "/images/user/user-05.jpg",
  e5: "/images/user/user-06.jpg",
  e6: "/images/user/user-07.jpg",
  e7: "/images/user/user-08.jpg",
  e8: "/images/user/user-09.jpg",
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useAppStore((s) => s.notifications);
  const employees = useAppStore((s) => s.employees);

  const notifying = useMemo(
    () => notifications.some((n) => !n.isRead),
    [notifications]
  );

  // Fusionner les notifications avec les données employés
  const items = useMemo(() => {
    const empMap = new Map(employees.map((e) => [e.id, e]));
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((n) => {
        const emp = empMap.get(n.userId);
        return { notif: n, employee: emp };
      });
  }, [notifications, employees]);

  function toggleDropdown() {
    setIsOpen((v) => !v);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {items.length === 0 && (
            <li className="py-8 text-center text-gray-400 text-theme-sm">
              Aucune notification
            </li>
          )}
          {items.map(({ notif, employee }) => (
            <li key={notif.id}>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <span className="relative block w-10 h-10 rounded-full shrink-0">
                  {employee ? (
                    <>
                      <img
                        width={40}
                        height={40}
                        src={AVATAR_MAP[employee.id] ?? ""}
                        alt={employee.firstName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback sur les initials si l'image ne charge pas
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLImageElement)
                            .nextElementSibling as HTMLElement | null;
                          if (parent) parent.style.display = "flex";
                        }}
                      />
                      <span
                        className={`absolute inset-0 flex items-center justify-center rounded-full text-white text-xs font-semibold ${getAvatarColor(employee.id)} hidden`}
                      >
                        {initials(employee)}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-xs font-semibold text-gray-500 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-400">
                      N/A
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${
                      notif.isRead
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-success-500"
                    } dark:border-gray-900`}
                  ></span>
                </span>

                <span className="block min-w-0 flex-1">
                  <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                    {employee ? (
                      <>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {employee.firstName} {employee.lastName}
                        </span>{" "}
                        <span>{notif.message}</span>
                      </>
                    ) : (
                      <span>{notif.message}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                    <span>
                      {employee?.position ?? "Système"}
                    </span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{timeAgo(notif.createdAt)}</span>
                  </span>
                </span>
              </DropdownItem>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir toutes les notifications
        </Link>
      </Dropdown>
    </div>
  );
}
