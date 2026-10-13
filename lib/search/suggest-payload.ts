import type { LocalizedText } from "@/lib/schemas/catalog";

/** الشكل الخفيف اللي بيوصل للمتصفح من /api/search/suggest */
export type SuggestPayload = {
  queries: string[];
  crafts: {
    slug: string;
    name: LocalizedText;
    cover: { src: string; alt: LocalizedText };
  }[];
  products: {
    slug: string;
    name: LocalizedText;
    price: number;
    image: { src: string; alt: LocalizedText };
  }[];
};