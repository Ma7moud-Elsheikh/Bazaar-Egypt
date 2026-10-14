import { PolicyPage, policyMetadata } from '@/components/static/policy-page';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
    return policyMetadata('terms', (await params).locale);
}

export default async function TermsPage({ params }: Props) {
    return <PolicyPage doc="terms" locale={(await params).locale} />;
}
