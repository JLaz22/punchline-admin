import Link from 'next/link';import {MediaForm} from '@/components/media-form';import {requireAdmin} from '@/lib/auth';
export default async function NewMedia(){await requireAdmin();return <><Link href="/media">← Media library</Link><div className="page-title"><div><span className="eyebrow">MAKE ROOM FOR SOMETHING GOOD</span><h1>New creation<span>.</span></h1></div></div><MediaForm/></>}
