import {
  BookOpen,
  Calculator,
  ClipboardList,
  Code2,
  Headphones,
  Keyboard,
  Megaphone,
  Palette,
  PenLine,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  headphones: Headphones,
  keyboard: Keyboard,
  phone: PhoneCall,
  clipboard: ClipboardList,
  pen: PenLine,
  megaphone: Megaphone,
  code: Code2,
  palette: Palette,
  calculator: Calculator,
  book: BookOpen,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const Icon = icons[icon ?? ""] ?? BookOpen;
  return <Icon className={className} />;
}
