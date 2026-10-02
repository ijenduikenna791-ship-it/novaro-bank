'use client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon, Analytics01Icon, CreditCardIcon, UserIcon, Notification03Icon, Menu01Icon, Cancel01Icon,
  ArrowRight01Icon, ArrowUpRight01Icon, ArrowLeft01Icon, ArrowDown01Icon, ArrowUp01Icon, SentIcon, QrCodeIcon,
  Shield01Icon, SecurityCheckIcon, LockPasswordIcon, ViewIcon, ViewOffSlashIcon, Copy01Icon, Logout01Icon,
  Settings01Icon, CustomerSupportIcon, Add01Icon, Tick02Icon, CheckmarkCircle02Icon, Clock01Icon, Wallet01Icon,
  BankIcon, Search01Icon, DashboardSquare01Icon, UserMultipleIcon, Download01Icon, Upload01Icon, GlobalIcon,
  FlashIcon, Mail01Icon, SmartPhone01Icon, PiggyBankIcon, ChartLineData01Icon, Alert02Icon, InformationCircleIcon,
  GridViewIcon, Activity01Icon, SparklesIcon, FingerPrintIcon, Exchange01Icon, Coins01Icon,
  ArrowDataTransferHorizontalIcon, SnowIcon, Delete02Icon, Atom01Icon, Leaf01Icon, StarIcon, Message01Icon,
  Key01Icon, CircleIcon, Diamond01Icon, HourglassIcon, Building03Icon, Refresh01Icon, Invoice01Icon,
  CheckmarkBadge01Icon, Cancel02Icon, Call02Icon, Briefcase01Icon,
} from '@hugeicons/core-free-icons';

const ICONS = {
  home: Home01Icon, stats: Analytics01Icon, card: CreditCardIcon, user: UserIcon, bell: Notification03Icon,
  menu: Menu01Icon, close: Cancel01Icon, right: ArrowRight01Icon, upRight: ArrowUpRight01Icon,
  left: ArrowLeft01Icon, down: ArrowDown01Icon, up: ArrowUp01Icon, send: SentIcon, qr: QrCodeIcon,
  shield: Shield01Icon, shieldCheck: SecurityCheckIcon, lock: LockPasswordIcon, eye: ViewIcon,
  eyeOff: ViewOffSlashIcon, copy: Copy01Icon, logout: Logout01Icon, settings: Settings01Icon,
  support: CustomerSupportIcon, plus: Add01Icon, tick: Tick02Icon, check: CheckmarkCircle02Icon,
  clock: Clock01Icon, wallet: Wallet01Icon, bank: BankIcon, search: Search01Icon,
  dashboard: DashboardSquare01Icon, users: UserMultipleIcon, download: Download01Icon, upload: Upload01Icon,
  globe: GlobalIcon, flash: FlashIcon, mail: Mail01Icon, phone: SmartPhone01Icon, piggy: PiggyBankIcon,
  chart: ChartLineData01Icon, alert: Alert02Icon, info: InformationCircleIcon, grid: GridViewIcon,
  activity: Activity01Icon, sparkles: SparklesIcon, fingerprint: FingerPrintIcon, exchange: Exchange01Icon,
  coins: Coins01Icon, transfer: ArrowDataTransferHorizontalIcon, snow: SnowIcon, trash: Delete02Icon,
  atom: Atom01Icon, leaf: Leaf01Icon, star: StarIcon, message: Message01Icon, key: Key01Icon,
  circle: CircleIcon, diamond: Diamond01Icon, hourglass: HourglassIcon, building: Building03Icon,
  refresh: Refresh01Icon, invoice: Invoice01Icon, badge: CheckmarkBadge01Icon, x: Cancel02Icon,
  call: Call02Icon, briefcase: Briefcase01Icon,
};

/** Hugeicons wrapper:  <Icon name="home" size={20} /> */
export default function Icon({ name, size = 20, strokeWidth = 1.6, className = '', ...rest }) {
  const icon = ICONS[name] || CircleIcon;
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} color="currentColor" className={className} {...rest} />;
}
