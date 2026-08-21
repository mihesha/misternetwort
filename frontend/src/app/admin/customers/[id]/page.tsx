'use client';
import { CustomerDetailsView } from '@/components/admin/views/CustomerDetailsView';
import { useParams } from 'next/navigation';

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  return <CustomerDetailsView customerId={id} />;
}
