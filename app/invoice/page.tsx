import { AppLayout } from '@/components/layout/AppLayout'
import { InvoiceBuilder } from '@/components/invoice/InvoiceBuilder'

export default function InvoicePage() {
  return (
    <AppLayout>
      <InvoiceBuilder />
    </AppLayout>
  )
}
