import { vnd } from '@/core/formatters';
import { KeyValueRow } from '@/ui';
import { InvoiceLine } from '../models/billing';

export function InvoiceLineItem({ line }: { line: InvoiceLine }) {
  return <KeyValueRow label={line.label} detail={line.detail} value={vnd(line.amount)} />;
}
