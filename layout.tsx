import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title:'Plume + Boulier | Les petites aventures',
 description:'Écris, calcule et construis tes aventures. Un cahier cursif et des maths pour grandir en confiance.',
 icons:{icon:'/favicon.svg',apple:'/favicon.svg'},
 appleWebApp:{capable:true,statusBarStyle:'default',title:'Plume + Boulier'},
};
export const viewport: Viewport = {width:'device-width', initialScale:1, maximumScale:3, themeColor:'#faf7ef'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="fr"><body>{children}</body></html>; }
