import type { AuthUser } from "@/contexts/auth-context";

type RouterLike = { push: (href: any) => void };

export function openNotificationLink(router: RouterLike, user: AuthUser | null, linkRef?: string | null) {
  if (!user || !linkRef || linkRef === "test:ping") return false;
  const invoice = linkRef.match(/^invoices\/(.+)$/);
  if (invoice) {
    router.push({ pathname: user.role === "Tenant" ? "/(dashboard)/tenant/invoices/[id]" : "/(dashboard)/landlord/invoices/[id]", params: { id: invoice[1] } } as any);
    return true;
  }
  const maintenance = linkRef.match(/^maintenance:(.+)$/);
  if (maintenance) {
    router.push({ pathname: user.role === "Tenant" ? "/(dashboard)/tenant/maintenance/[id]" : "/(dashboard)/landlord/maintenance/[id]", params: { id: maintenance[1] } } as any);
    return true;
  }
  const lease = linkRef.match(/^lease:(.+)$/);
  if (lease) {
    router.push(user.role === "Tenant" ? "/(dashboard)/tenant/lease" as any : { pathname: "/(dashboard)/landlord/leases/[id]", params: { id: lease[1] } } as any);
    return true;
  }
  return false;
}
