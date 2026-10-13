"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isActivePath } from "@/lib/utils/nav";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function NavLink({ href, ...props }: Props) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-active={active}
      {...props}
    />
  );
}
