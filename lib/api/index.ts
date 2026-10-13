import { getPaymentMethods, getProductReviews, getShippingConfig, placeOrder } from './extras';
import * as http from './http';
import * as mock from './mock';
import type { CatalogApi } from './types';

const useMock = process.env.USE_MOCK_API !== 'false';

type Extras = {
    getProductReviews: typeof getProductReviews;
    getShippingConfig: typeof getShippingConfig;
    getPaymentMethods: typeof getPaymentMethods;
};

export const api: CatalogApi & Extras = {
    ...(useMock ? mock : http),
    getProductReviews,
    getShippingConfig,
    getPaymentMethods,
    createOrder: placeOrder
};

export { OrderError } from './extras';
export { ApiError } from './http';
export type { CatalogApi, Paginated, ProductQuery, ProductSort } from './types';
