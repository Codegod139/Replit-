import { Link, useLocation } from "wouter";

export function Nav() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-primary">NutriTrack</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/" 
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                  Tracking
                </a>
              </Link>
              <Link href="/profile">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/profile"
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                  Profile
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
