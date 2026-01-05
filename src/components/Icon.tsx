import { 
  Calendar, MapPin, Search, Plus, X, ChevronLeft, ChevronRight,
  CheckCircle2, Users, BadgeJapaneseYen, Sparkles, Save, Building,
  Footprints, Eye, Briefcase, Filter, ChevronDown, ChevronUp,
  Edit, Check, Compass, ExternalLink, Store, TrendingUp, Lightbulb,
  Camera, Image, Trash2, Maximize, AlertTriangle, List, LogOut, User, Lock, FileText
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Calendar,
  MapPin,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  BadgeJapaneseYen,
  Sparkles,
  Save,
  Building,
  Footprints,
  Eye,
  Briefcase,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Check,
  Compass,
  ExternalLink,
  Store,
  TrendingUp,
  Lightbulb,
  Camera,
  Image,
  Trash2,
  Maximize,
  AlertTriangle,
  List,
  LogOut,
  User,
  Lock,
  FileText,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = '' }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <div className={`w-${size} h-${size}`} />;
  }
  return <IconComponent size={size} className={className} />;
}

