import { z } from 'zod';

export const localizedTextSchema = z.object({
    ar: z.string().min(1),
    en: z.string().min(1)
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

const idSchema = z.string().min(1);
const slugSchema = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug لازم يكون kebab-case إنجليزي');

export const imageSchema = z.object({
    src: z.string().min(1),
    alt: localizedTextSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    /** نوع الصورة: scale = المنتج بجانب شيء معروف الحجم */
    kind: z.enum(['main', 'detail', 'scale', 'lifestyle']).optional()
});
export type ImageAsset = z.infer<typeof imageSchema>;

export const governorateSchema = z.object({
    slug: slugSchema,
    name: localizedTextSchema
});
export type Governorate = z.infer<typeof governorateSchema>;

export const craftSchema = z.object({
    id: idSchema,
    slug: slugSchema,
    name: localizedTextSchema,
    tagline: localizedTextSchema,
    description: localizedTextSchema,
    cover: imageSchema
});
export type Craft = z.infer<typeof craftSchema>;

export const artisanSchema = z.object({
    id: idSchema,
    slug: slugSchema,
    name: localizedTextSchema,
    craftId: idSchema,
    governorate: governorateSchema,
    bio: localizedTextSchema,
    story: localizedTextSchema,
    portrait: imageSchema,
    yearsOfExperience: z.number().int().nonnegative()
});
export type Artisan = z.infer<typeof artisanSchema>;

export const customizationOptionSchema = z.object({
    key: z.string().min(1),
    label: localizedTextSchema,
    type: z.enum(['text', 'choice']),
    required: z.boolean(),
    maxLength: z.number().int().positive().optional(),
    choices: z.array(z.object({ value: z.string().min(1), label: localizedTextSchema })).optional()
});
export type CustomizationOption = z.infer<typeof customizationOptionSchema>;

export const productSchema = z.object({
    id: idSchema,
    slug: slugSchema,
    name: localizedTextSchema,
    summary: localizedTextSchema,
    description: localizedTextSchema,
    story: localizedTextSchema,
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.literal('EGP'),
    images: z.array(imageSchema).min(1),
    craftId: idSchema,
    artisanId: idSchema,
    governorate: governorateSchema,
    materials: z.array(localizedTextSchema),
    dimensions: z
        .object({
            widthCm: z.number().positive(),
            heightCm: z.number().positive(),
            depthCm: z.number().positive().optional(),
            weightGrams: z.number().positive().optional()
        })
        .optional(),
    madeToOrder: z.boolean(),
    leadTimeDays: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    customizable: z.boolean(),
    customizationOptions: z.array(customizationOptionSchema),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().nonnegative(),
    badges: z.array(z.enum(['new', 'bestseller', 'limited', 'giftable'])),
    createdAt: z.string().min(10),

    // حقول اختيارية (v2): لو الـ API مرجّعهاش بنستخدم قيم افتراضية
    sku: z.string().min(1).optional(),
    careInstructions: localizedTextSchema.optional(),
    returnDays: z.number().int().nonnegative().optional(),
    giftWrap: z.object({ available: z.boolean(), price: z.number().nonnegative() }).optional()
});
export type Product = z.infer<typeof productSchema>;

export const paginatedSchema = <T extends z.ZodType>(item: T) =>
    z.object({
        items: z.array(item),
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
        totalPages: z.number().int().nonnegative()
    });
