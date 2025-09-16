import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🍽️</span>
          </div>
          <span className="hidden font-bold sm:inline-block">UK Meal Planner</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <a href="/" className="transition-colors hover:text-primary">
            Dashboard
          </a>
          <a href="#meal-plans" className="transition-colors hover:text-primary">
            Meal Plans
          </a>
          <a href="/recipes" className="transition-colors hover:text-primary">
            Recipes
          </a>
          <a href="/planning" className="transition-colors hover:text-primary">
            Planning
          </a>
          <a href="/food-database" className="transition-colors hover:text-primary">
            Food Database
          </a>
          <a href="/mobile" className="transition-colors hover:text-primary">
            Mobile App
          </a>
        </nav>

        {/* User Menu & Mobile Toggle */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col space-y-2 p-4">
            <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </a>
            <a href="#meal-plans" className="text-sm font-medium transition-colors hover:text-primary">
              Meal Plans
            </a>
            <a href="/recipes" className="text-sm font-medium transition-colors hover:text-primary">
              Recipes
            </a>
            <a href="/planning" className="text-sm font-medium transition-colors hover:text-primary">
              Planning
            </a>
            <a href="/food-database" className="text-sm font-medium transition-colors hover:text-primary">
              Food Database
            </a>
            <a href="/mobile" className="text-sm font-medium transition-colors hover:text-primary">
              Mobile App
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}