import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'بازار مصر | Bazaar Egypt',
        short_name: 'Bazaar Egypt',
        description: 'حرف يدوية مصرية أصيلة | Authentic Egyptian handmade crafts',
        start_url: '/',
        display: 'standalone',
        background_color: '#F6EEE2',
        theme_color: '#1A1410',
        icons: [
            { src: '/icon.png', sizes: '512x512', type: 'image/png' },
            { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
        ]
    };
}
