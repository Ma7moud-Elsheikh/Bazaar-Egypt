import { PolicyPage, policyMetadata } from '@/components/static/policy-page';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
    return policyMetadata('privacy', (await params).locale);
}

export default async function PrivacyPage({ params }: Props) {
    return <PolicyPage doc="privacy" locale={(await params).locale} />;
}
