import { Redirect } from 'expo-router';

export default function TenantReportsRedirect() {
  return <Redirect href={'/(dashboard)/tenant/payment-history' as never} />;
}
