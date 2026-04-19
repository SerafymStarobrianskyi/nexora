import {
  FolderClosed,
  Home,
  Settings,
} from "lucide-react";
import "./layout.css";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: React.ReactNode;
};

const railMenu = [
  { icon: Home, label: "Notes", link: "/" },
  { icon: FolderClosed, label: "Projects", link: "/projects" },
  { icon: Settings, label: "Settings", link: "/settings" },
];


export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="app-rail">
        <nav className="app-rail__nav" aria-label="Main navigation">
          {railMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                className="app-rail__icon"
                aria-label={item.label}
                to={item.link}
              >
                <Icon size={17} />
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}
