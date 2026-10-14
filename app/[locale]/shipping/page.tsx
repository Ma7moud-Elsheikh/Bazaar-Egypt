import { PolicyPage, policyMetadata } from '@/components/static/policy-page';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
    return policyMetadata('shipping', (await params).locale);
}

export default async function ShippingPage({ params }: Props) {
    return <PolicyPage doc="shipping" locale={(await params).locale} />;
}
