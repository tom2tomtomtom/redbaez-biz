import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 px-8 h-16 border-b bg-white/50 backdrop-blur-sm">
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        to="/marketing"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Marketing
      </Link>
      <Link
        to="/partnerships"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Partnerships
      </Link>
      <Link
        to="/product-development"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Product Development
      </Link>
      <Link
        to="/ai-news"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        AI News
      </Link>
    </nav>
  );
}