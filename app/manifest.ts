import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Org Toolbox',
        short_name: 'Toolbox',
        description: 'Modulare Organisationstoolbox für Star-Citizen-Organisationen.',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        background_color: '#070a10',
        theme_color: '#070a10',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
