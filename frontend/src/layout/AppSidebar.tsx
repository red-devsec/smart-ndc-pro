import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
  GroupIcon,
  AlertIcon,
  DollarLineIcon,
  FileIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAppStore } from "../store/appStore";
import type { UserRole } from "../data/types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  roles?: UserRole[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"],
  },
  {
    icon: <PieChartIcon />,
    name: "Administration",
    roles: ["ADMIN"],
    subItems: [
      { name: "Dashboard Admin", path: "/admin" },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "RH - Employés",
    roles: ["ADMIN", "RH"],
    subItems: [
      { name: "Liste des employés", path: "/employees" },
      { name: "Pointage", path: "/attendance" },
      { name: "Congés & Absences", path: "/leaves" },
      { name: "Attestations & Paies", path: "/certificates" },
      { name: "Bulletins de paie", path: "/hr/payslips" },
      { name: "Cartes RFID", path: "/rfid-cards" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Stock & Inventaire",
    roles: ["ADMIN", "MANAGER", "MAGASINIER"],
    subItems: [
      { name: "Produits", path: "/products" },
      { name: "Mouvements", path: "/stock-movements" },
      { name: "Scan code-barres", path: "/barcode-scan" },
      { name: "Catégories", path: "/categories" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Rapports",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER"],
    subItems: [
      { name: "Rapports RH", path: "/reports/hr" },
      { name: "Rapports Stock", path: "/reports/inventory" },
      { name: "Rapports combinés", path: "/reports/combined" },
    ],
  },
  {
    icon: <AlertIcon />,
    name: "Alertes",
    path: "/alerts",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"],
  },
  {
    icon: <FileIcon />,
    name: "Employé",
    roles: ["EMPLOYE"],
    subItems: [
      { name: "Attestations", path: "/certificates" },
      { name: "Congé", path: "/leaves" },
      { name: "Paie", path: "/payslips" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Calendrier",
    path: "/calendar",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"],
  },
  {
    icon: <UserCircleIcon />,
    name: "Mon Profil",
    path: "/profile",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"],
  },
  {
    icon: <DollarLineIcon />,
    name: "Paramètres",
    roles: ["ADMIN", "RH"],
    subItems: [
      { name: "Configuration", path: "/settings" },
      { name: "Utilisateurs", path: "/users" },
      { name: "Templates attestations", path: "/settings/templates" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentification",
    roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"],
    subItems: [
      { name: "Connexion", path: "/signin" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 h-screen transition-all duration-300 ease-in-out z-50 border-r
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      style={{
        backgroundColor: '#101828',
        borderRightColor: '#1d2939',
        color: '#ffffff',
      }}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src="/images/logo/logo-dark.svg"
              alt="SMART NDC"
              width={150}
              height={40}
            />
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="SMART NDC"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu Principal"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems.filter(item => !item.roles || (currentUser && item.roles.includes(currentUser.role))), "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  currentUser ? `Connecté: ${currentUser.name}` : "Système"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems.filter(item => !item.roles || (currentUser && item.roles.includes(currentUser.role))), "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
