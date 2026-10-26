import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Punchline / Control room',description:'The private control room for Punchline.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
