"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

type HeaderLogoProps = {
  href: string;
  onClick: () => void;
};

const HeaderLogo = ({ href, onClick }: HeaderLogoProps) => (
  <Link
    href={href}
    className="relative z-20 flex items-center gap-2 rounded-full px-2 py-1"
    onClick={onClick}
  >
    <Image
      src="/app_logo.png"
      alt="TaleCrafter AI"
      width={42}
      height={42}
      className="object-contain"
      priority
    />
    <span className="tc-title-gradient hidden text-xl font-bold tracking-tight sm:block">
      TaleCrafterAI
    </span>
  </Link>
);

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();
  const currentUserEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const isAdmin = adminEmail !== "" && currentUserEmail === adminEmail;

  const visitorItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Explore Stories", link: "/explore" },
    { name: "Contact", link: "/contact" },
  ];

  const userItems = [
    { name: "Create Story", link: "/create-story" },
    { name: "Explore Stories", link: "/explore" },
    { name: "My Stories", link: "/dashboard" },
    ...(isAdmin ? [{ name: "Admin Panel", link: "/admin" }] : []),
  ];

  const isAuthenticated = isLoaded && isSignedIn;
  const navItems = !isLoaded ? [] : isAuthenticated ? userItems : visitorItems;
  const logoHref = isAuthenticated ? "/dashboard" : "/";
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar className="px-3 py-2">
      <NavBody className="border-blue-300/15 bg-[#010715]/90">
        <HeaderLogo href={logoHref} onClick={closeMobileMenu} />
        <NavItems items={navItems} />
        <div className="relative z-20 flex items-center gap-3">
          {!isLoaded ? null : isAuthenticated ? (
            <>
              <Link href="/create-story">
                <NavbarButton
                  as="button"
                  variant="gradient"
                  className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-500"
                >
                  Create
                </NavbarButton>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <NavbarButton
                  as="button"
                  variant="secondary"
                  className="rounded-full text-blue-100/80 hover:text-white"
                >
                  Login
                </NavbarButton>
              </Link>
              <Link href="/sign-up">
                <NavbarButton
                  as="button"
                  variant="gradient"
                  className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-500"
                >
                  Sign Up
                </NavbarButton>
              </Link>
            </>
          )}
        </div>
      </NavBody>

      <MobileNav className="border-blue-300/15 bg-[#010715]/90">
        <MobileNavHeader>
          <HeaderLogo href={logoHref} onClick={closeMobileMenu} />
          <div className="flex items-center gap-3">
            {isAuthenticated && <UserButton />}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="rounded-full border border-blue-300/20 p-2"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
            >
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((value) => !value)}
              />
            </button>
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          className="bg-[#03122e]/95"
        >
          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={closeMobileMenu}
              className={`w-full rounded-xl px-4 py-3 text-base font-semibold transition ${
                pathname === item.link
                  ? "border border-blue-300/20 bg-blue-500/20 text-white"
                  : "text-blue-100/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}

          <div className="flex w-full flex-col gap-3 border-t border-blue-300/15 pt-4">
            {!isLoaded ? null : isAuthenticated ? (
              <Link href="/create-story" onClick={closeMobileMenu}>
                <NavbarButton
                  as="button"
                  variant="gradient"
                  className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                >
                  Create Story
                </NavbarButton>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={closeMobileMenu}>
                  <NavbarButton
                    as="button"
                    variant="secondary"
                    className="w-full rounded-xl border border-blue-300/20 text-blue-100"
                  >
                    Login
                  </NavbarButton>
                </Link>
                <Link href="/sign-up" onClick={closeMobileMenu}>
                  <NavbarButton
                    as="button"
                    variant="gradient"
                    className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Sign Up
                  </NavbarButton>
                </Link>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};

export default Header;
