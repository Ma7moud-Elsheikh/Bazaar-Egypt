import { StarIcon } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/reveal';
import type { Locale } from '@/i18n/routing';
import type { ReviewsResult } from '@/lib/schemas/review';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { CheckCircleIcon } from './icons';

type Props = { reviews: ReviewsResult; locale: Locale };

function Stars({ rating, label }: { rating: number; label: string }) {
    return (
        <span role="img" aria-label={label} className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon
                    key={n}
                    className={`size-4 ${n <= Math.round(rating) ? 'text-gold' : 'text-fg/20'}`}
                />
            ))}
        </span>
    );
}

export async function Reviews({ reviews, locale }: Props) {
    const t = await getTranslations('ProductPage');
    const { summary, items } = reviews;

    const formatDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en', {
        year: 'numeric',
        month: 'long'
    });

    return (
        <section
            id="reviews"
            aria-labelledby="reviews-title"
            className="scroll-mt-28 px-4 py-16 sm:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <h2 id="reviews-title" className="font-display text-3xl font-bold">
                        {t('reviewsTitle')}
                    </h2>
                </Reveal>

                {summary.count === 0 ? (
                    <p className="mt-4 text-muted">{t('noReviews')}</p>
                ) : (
                    <>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <p className="font-display text-5xl font-bold">
                                {summary.average.toFixed(1)}
                            </p>
                            <div>
                                <Stars
                                    rating={summary.average}
                                    label={t('starsLabel', { rating: summary.average.toFixed(1) })}
                                />
                                <p className="mt-1 text-sm text-muted">
                                    {t('reviewsCount', { count: summary.count })}
                                </p>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <ul className="mt-8 grid gap-4 lg:grid-cols-2">
                                {items.map((review, index) => (
                                    <Reveal as="li" key={review.id} delay={Math.min(index, 6) * 60}>
                                        <article className="glass h-full rounded-[1.75rem] p-5 sm:p-6">
                                            <div className="flex items-center justify-between gap-3">
                                                <Stars
                                                    rating={review.rating}
                                                    label={t('starsLabel', {
                                                        rating: review.rating
                                                    })}
                                                />
                                                <time
                                                    dateTime={review.createdAt}
                                                    className="text-xs text-muted"
                                                >
                                                    {formatDate.format(new Date(review.createdAt))}
                                                </time>
                                            </div>

                                            {review.title && (
                                                <h3 className="mt-3 font-display text-lg font-bold">
                                                    {review.title}
                                                </h3>
                                            )}
                                            <p className="mt-2 leading-relaxed">{review.body}</p>

                                            {review.photos && review.photos.length > 0 && (
                                                <ul className="mt-3 flex gap-2">
                                                    {review.photos.map((photo) => (
                                                        <li key={photo.src}>
                                                            <Image
                                                                src={photo.src}
                                                                alt={t('reviewPhotoAlt', {
                                                                    name: review.authorName
                                                                })}
                                                                width={72}
                                                                height={72}
                                                                className="size-[72px] rounded-xl object-cover"
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                                                <span className="font-semibold text-fg">
                                                    {review.authorName}
                                                </span>
                                                {review.governorate && (
                                                    <span>
                                                        {localize(review.governorate, locale)}
                                                    </span>
                                                )}
                                                {review.verifiedPurchase && (
                                                    <span className="inline-flex items-center gap-1 text-accent">
                                                        <CheckCircleIcon className="size-4" />
                                                        {t('verified')}
                                                    </span>
                                                )}
                                            </p>

                                            {review.reply && (
                                                <div className="mt-4 rounded-2xl border border-line bg-fg/5 p-4">
                                                    <p className="text-xs font-semibold text-accent">
                                                        {t('storeReply')}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-relaxed">
                                                        {review.reply.body}
                                                    </p>
                                                </div>
                                            )}
                                        </article>
                                    </Reveal>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
