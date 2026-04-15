export interface MenuItem {
  id: string;
  num: string;
  label: string;
  sub: string;
  href: string;
  onClick?: () => void;
}

export const GUEST_ITEMS: MenuItem[] = [
  { id: "home", num: "01", label: "Início", sub: "Você está aqui", href: "/" },
  { id: "ler", num: "02", label: "Mostre sua mão", sub: "Começar agora", href: "/ler/nome" },
  { id: "tarot", num: "03", label: "Tarot Online", sub: "Três cartas, de graça", href: "/tarot" },
  { id: "login", num: "04", label: "Entrar", sub: "Já te conheço", href: "/login" },
  { id: "registro", num: "05", label: "Criar conta", sub: "Pra você voltar", href: "/registro" },
];

export const LOGGED_ITEMS: MenuItem[] = [
  { id: "home", num: "01", label: "Início", sub: "Você está aqui", href: "/" },
  {
    id: "leituras",
    num: "02",
    label: "Minhas leituras",
    sub: "O que suas mãos já disseram",
    href: "/conta/leituras",
  },
  {
    id: "tarot",
    num: "03",
    label: "Tarot Online",
    sub: "Três cartas pra distrair a sorte",
    href: "/tarot",
  },
  { id: "perfil", num: "04", label: "Perfil", sub: "Quem você é pra mim", href: "/conta/perfil" },
];
