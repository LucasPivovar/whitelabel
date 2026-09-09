import { forwardRef, type SVGProps } from 'react';
type Props = SVGProps<SVGSVGElement> & { size?: number | string };
function icon(name: string) {
  const Icon = forwardRef<SVGSVGElement, Props>(
    ({ size = 20, children, ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        {...props}
      >
        <use href={`/bootstrap-icons.svg#${name}`} />
        {children}
      </svg>
    ),
  );
  Icon.displayName = `BootstrapIcon(${name})`;
  return Icon;
}
export const ArrowUpRight = icon('arrow-up-right'),
  ArrowLeft = icon('arrow-left'),
  Plus = icon('plus-lg'),
  Search = icon('search'),
  Building2 = icon('buildings'),
  PanelsTopLeft = icon('window-stack'),
  Plug = icon('plug'),
  Globe = icon('globe2'),
  Settings2 = icon('sliders'),
  ShieldCheck = icon('shield-check'),
  ChevronRight = icon('chevron-right'),
  Pencil = icon('pencil'),
  Copy = icon('copy'),
  Trash2 = icon('trash3'),
  Monitor = icon('display'),
  Smartphone = icon('phone'),
  Save = icon('floppy'),
  Eye = icon('eye'),
  EyeOff = icon('eye-slash'),
  Check = icon('check-lg'),
  Star = icon('star-fill'),
  LockKeyhole = icon('lock'),
  Upload = icon('upload'),
  ArrowUp = icon('arrow-up'),
  ArrowDown = icon('arrow-down'),
  Activity = icon('activity'),
  Palette = icon('palette'),
  ImageIcon = icon('image'),
  Tag = icon('tag'),
  Megaphone = icon('megaphone'),
  Bell = icon('bell'),
  Layers = icon('layers'),
  ExternalLink = icon('box-arrow-up-right'),
  X = icon('x-lg'),
  Zap = icon('lightning-charge-fill'),
  LayoutDashboard = icon('grid'),
  Undo2 = icon('arrow-counterclockwise'),
  Redo2 = icon('arrow-clockwise'),
  GripVertical = icon('grip-vertical'),
  Type = icon('fonts'),
  AlignLeft = icon('text-left'),
  AlignCenter = icon('text-center'),
  AlignRight = icon('text-right'),
  LayoutTemplate = icon('layout-split'),
  PanelTop = icon('window'),
  FormInput = icon('input-cursor-text'),
  Minus = icon('dash'),
  MousePointer2 = icon('cursor'),
  Mail = icon('envelope'),
  Link = icon('link-45deg'),
  Braces = icon('braces'),
  LogOut = icon('box-arrow-right');
