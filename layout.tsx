import type { Metadata, Viewport } from 'next';
import './globals.css';
import './college.css';
export const metadata: Metadata = {
 title:'Plume + Boulier | Les petites aventures',
 description:'Du CP–CE1 au collège : écriture, maths, français, anglais et allemand. Des défis et des aventures pour progresser.',
 icons:{icon:'/favicon.svg',apple:'/favicon.svg'},
 appleWebApp:{capable:true,statusBarStyle:'default',title:'Plume + Boulier'},
};
export const viewport: Viewport = {width:'device-width', initialScale:1, maximumScale:3, themeColor:'#faf7ef'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="fr"><body>{children}</body></html>; }
