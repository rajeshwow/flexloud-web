import type { MenuItemConfig } from "./menuRegistry";

export function buildMenuTree(
  registry: MenuItemConfig[],
  permissions: string[],
  base: string,
) {
  const hasAny = (req?: string[]) =>
    !req?.length || req.some((p) => permissions.includes(p));

  const walk = (items: MenuItemConfig[]): any[] =>
    items
      .map((it) => {
        const children = it.children ? walk(it.children) : undefined;

        const leafVisible = !!it.path && hasAny(it.requiresAny);
        const groupVisible =
          !it.path && ((children?.length ?? 0) > 0 || hasAny(it.requiresAny));

        if (!leafVisible && !groupVisible) return null;

        return {
          key: it.path ? `${base}${it.path}` : it.key, // leaf navigable
          label: it.label,
          icon: it.icon, // string, map later
          children: children?.length ? children : undefined,
        };
      })
      .filter(Boolean);

  return walk(registry);
}
