import Image from 'next/image';
import Link from 'next/link';
import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';
import { photos } from './images';

export default function CTA() {
  return (
    <section className="bg-[#0b1226] pb-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 px-6 py-16 text-center sm:px-16 sm:py-24">
            <Image src={photos.cashless} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b2652]/95 via-[#121b3d]/90 to-[#0b1226]/95" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-6xl">Start banking smarter today</h2>
              <p className="mx-auto mt-4 max-w-md text-ink-100/75">Open your free account in minutes. No paperwork, no branch visits.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register" className="btn-light">
                  Open free account
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white"><Icon name="upRight" size={15} /></span>
                </Link>
                <Link href="/login" className="glass rounded-full px-6 py-3 text-sm">I already have an account</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
