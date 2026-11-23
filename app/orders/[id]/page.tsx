import React from 'react';
import OrderDetailClient from '@/components/orders/OrderDetailClient';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  return <OrderDetailClient id={decodedId} />;
}
