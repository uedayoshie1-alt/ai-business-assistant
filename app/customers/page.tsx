import { AppLayout } from '@/components/layout/AppLayout'
import { CustomerList } from '@/components/customers/CustomerList'

export default function CustomersPage() {
  return (
    <AppLayout>
      <CustomerList />
    </AppLayout>
  )
}
