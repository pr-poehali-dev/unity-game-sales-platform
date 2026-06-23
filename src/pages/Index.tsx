import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const HERO_IMG = 'https://cdn.poehali.dev/projects/9f9b5cde-f366-4ab4-a7c8-3de0a80c243e/files/ffd2e374-7175-474e-a0c4-97c622392404.jpg';

interface User {
  firstName: string;
  lastName: string;
  password: string;
  balance: number;
  isAdmin: boolean;
}

interface GameRequest {
  id: number;
  title: string;
  description: string;
  complexity: number;
  price: number;
  status: string;
  author: string;
  date: string;
}

const PROMO_CODES: Record<string, { type: 'admin' | 'balance'; value: number; label: string }> = {
  admdina: { type: 'admin', value: 0, label: 'Админ-доступ активирован' },
  start1000: { type: 'balance', value: 1000, label: '+1000₽ на баланс' },
  forge500: { type: 'balance', value: 500, label: '+500₽ на баланс' },
};

interface LiveActivity {
  id: number;
  avatar: string;
  name: string;
  action: string;
  game: string;
  price: number;
  ago: string;
  ts: number;
}

interface FrideTx {
  id: string;
  type: 'in' | 'out';
  amount: number;
  from: string;
  method: string;
  status: 'completed' | 'pending';
  date: string;
}

const FAKE_NAMES = [
  'Артём К.', 'Дмитрий Л.', 'Алина В.', 'Максим Р.', 'Кирилл Н.',
  'Ольга Т.', 'Иван С.', 'Виктория М.', 'Егор Б.', 'Полина Ф.',
  'Никита Д.', 'Анастасия Ш.', 'Роман З.', 'Валерия Г.', 'Антон Х.',
];

const FAKE_GAMES = [
  { title: 'Зомби-апокалипсис', desc: 'Выживалка от первого лица, открытый мир, крафт и орды зомби' },
  { title: 'Космический шутер', desc: 'Аркадный shoot-em-up в стиле ретро, несколько уровней и боссы' },
  { title: 'Средневековый RPG', desc: 'Ролевая игра с прокачкой героя, диалогами и несколькими концовками' },
  { title: 'Гоночный симулятор', desc: 'Реалистичная физика машин, трассы и онлайн-таблица рекордов' },
  { title: 'Платформер-головоломка', desc: 'Уровни с ловушками, телепортами и механикой перемотки времени' },
  { title: 'Тауэр дефенс', desc: 'Строй башни, прокачивай юниты, отбивай волны врагов' },
  { title: 'Хоррор-квест', desc: 'Психологический хоррор от первого лица с нелинейным сюжетом' },
  { title: 'Пиксельная ферма', desc: 'Симулятор фермы с соседями, крафтом и сезонными событиями' },
  { title: 'Файтинг 2D', desc: 'Файтинг с уникальными персонажами, суперударами и онлайн-режимом' },
  { title: 'Стратегия в реальном времени', desc: 'Строй базу, собирай армию и захватывай карту' },
  { title: 'Киберпанк-экшен', desc: 'Хакерские способности, паркур, стрельба в неоновом городе' },
  { title: 'Карточная RPG', desc: 'Сбор колоды, случайные события, рогалик на картах' },
];

const AVATARS = ['🎮', '👾', '🕹️', '🎯', '🚀', '⚡', '🔥', '💎', '🏆', '🌟', '👻', '🤖'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateActivity(): LiveActivity {
  const game = randomFrom(FAKE_GAMES);
  const price = Math.round((1000 + Math.random() * 2000) / 100) * 100;
  return {
    id: Date.now() + Math.random(),
    avatar: randomFrom(AVATARS),
    name: randomFrom(FAKE_NAMES),
    action: randomFrom(['оставил заявку на', 'заказал игру', 'хочет разработку']),
    game: game.title,
    price,
    ago: 'только что',
    ts: Date.now(),
  };
}

const now = Date.now();
const DAY = 86400000;

const INITIAL_ACTIVITIES: LiveActivity[] = [
  { id: 1, avatar: '🎮', name: 'Артём К.', action: 'заказал игру', game: 'Зомби-апокалипсис', price: 2800, ago: '5 мин назад', ts: now - 5 * 60000 },
  { id: 2, avatar: '👾', name: 'Алина В.', action: 'оставил заявку на', game: 'Киберпанк-экшен', price: 3000, ago: '12 мин назад', ts: now - 12 * 60000 },
  { id: 3, avatar: '🚀', name: 'Максим Р.', action: 'хочет разработку', game: 'Космический шутер', price: 1500, ago: '28 мин назад', ts: now - 28 * 60000 },
  { id: 4, avatar: '⚡', name: 'Кирилл Н.', action: 'заказал игру', game: 'Тауэр дефенс', price: 1200, ago: '34 мин назад', ts: now - 34 * 60000 },
  { id: 5, avatar: '🔥', name: 'Виктория М.', action: 'оставил заявку на', game: 'Хоррор-квест', price: 2500, ago: '51 мин назад', ts: now - 51 * 60000 },
  { id: 6, avatar: '💎', name: 'Никита Д.', action: 'заказал игру', game: 'Средневековый RPG', price: 1800, ago: '2 ч назад', ts: now - 2 * 3600000 },
  { id: 7, avatar: '🌟', name: 'Полина Ф.', action: 'хочет разработку', game: 'Пиксельная ферма', price: 1000, ago: 'вчера', ts: now - 1.2 * DAY },
  { id: 8, avatar: '🤖', name: 'Роман З.', action: 'заказал игру', game: 'Стратегия в реальном времени', price: 2200, ago: '2 дня назад', ts: now - 2.5 * DAY },
  { id: 9, avatar: '👻', name: 'Валерия Г.', action: 'оставил заявку на', game: 'Файтинг 2D', price: 1600, ago: '3 дня назад', ts: now - 3.1 * DAY },
  { id: 10, avatar: '🎯', name: 'Антон Х.', action: 'заказал игру', game: 'Гоночный симулятор', price: 2900, ago: '4 дня назад', ts: now - 4 * DAY },
  { id: 11, avatar: '🕹️', name: 'Дмитрий Л.', action: 'хочет разработку', game: 'Платформер-головоломка', price: 1400, ago: '5 дней назад', ts: now - 5.2 * DAY },
  { id: 12, avatar: '🏆', name: 'Ольга Т.', action: 'заказал игру', game: 'Карточная RPG', price: 2000, ago: '6 дней назад', ts: now - 6.3 * DAY },
  { id: 13, avatar: '🎮', name: 'Иван С.', action: 'оставил заявку на', game: 'Хоррор-квест', price: 2700, ago: '8 дней назад', ts: now - 8 * DAY },
];

const FRIDE_TXS: FrideTx[] = [
  { id: 'FRD-8841', type: 'in', amount: 3000, from: 'Давид Оганесян', method: 'СБП · кошелёк 172012', status: 'completed', date: '24.06.2026' },
  { id: 'FRD-8792', type: 'out', amount: 1500, from: 'Давид Оганесян', method: 'Fride вывод · код 0271492', status: 'completed', date: '22.06.2026' },
  { id: 'FRD-8731', type: 'in', amount: 2000, from: 'Давид Оганесян', method: 'СБП · кошелёк 172012', status: 'completed', date: '20.06.2026' },
  { id: 'FRD-8680', type: 'out', amount: 2800, from: 'Давид Оганесян', method: 'Fride вывод · код 0271492', status: 'completed', date: '18.06.2026' },
  { id: 'FRD-8614', type: 'in', amount: 3000, from: 'Давид Оганесян', method: 'СБП · кошелёк 172012', status: 'completed', date: '15.06.2026' },
  { id: 'FRD-8590', type: 'out', amount: 1000, from: 'Давид Оганесян', method: 'Fride вывод · код 0271492', status: 'pending', date: '14.06.2026' },
];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<GameRequest[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const [gameTitle, setGameTitle] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [complexity, setComplexity] = useState([50]);

  const [promo, setPromo] = useState('');
  const [topup, setTopup] = useState('');
  const [payMethod, setPayMethod] = useState<'sbp' | 'card'>('sbp');
  const [activities, setActivities] = useState<LiveActivity[]>(INITIAL_ACTIVITIES);
  const [newActivity, setNewActivity] = useState<LiveActivity | null>(null);
  const [frideTxs, setFrideTxs] = useState<FrideTx[]>(FRIDE_TXS);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const activity = generateActivity();
      setNewActivity(activity);
      setActivities((prev) => [activity, ...prev.slice(0, 14)]);
      setTimeout(() => setNewActivity(null), 4000);
    }, 120000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const weekAgo = Date.now() - 7 * DAY;
  const weekActivities = activities.filter((a) => a.ts >= weekAgo);
  const weekTotal = weekActivities.reduce((s, a) => s + a.price, 0);

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0 || !user) { toast.error('Введите сумму вывода'); return; }
    if (user.balance < amount) { toast.error(`Недостаточно средств. Баланс: ${user.balance}₽`); return; }
    const tx: FrideTx = {
      id: `FRD-${Math.floor(8900 + Math.random() * 100)}`,
      type: 'out',
      amount,
      from: 'Давид Оганесян',
      method: 'Fride вывод · код 0271492',
      status: 'pending',
      date: new Date().toLocaleDateString('ru-RU'),
    };
    setFrideTxs((t) => [tx, ...t]);
    setUser((u) => u ? { ...u, balance: u.balance - amount } : u);
    setWithdrawAmount('');
    toast.success(`Вывод ${amount}₽ отправлен через Fride · кошелёк 172012`);
  };

  const calcPrice = useMemo(() => {
    const c = complexity[0];
    return Math.round(1000 + (c / 100) * 2000);
  }, [complexity]);

  const handleRegister = () => {
    if (!firstName.trim() || !lastName.trim() || !password.trim()) {
      toast.error('Заполните имя, фамилию и пароль');
      return;
    }
    if (password.length < 4) {
      toast.error('Пароль минимум 4 символа');
      return;
    }
    setUser({ firstName, lastName, password, balance: 0, isAdmin: false });
    toast.success(`Добро пожаловать, ${firstName}!`);
  };

  const handleSubmitRequest = () => {
    if (!gameTitle.trim() || !gameDesc.trim()) {
      toast.error('Укажите название и описание игры');
      return;
    }
    if (!user) return;
    if (user.balance < calcPrice) {
      toast.error(`Недостаточно средств. Нужно ${calcPrice}₽, на балансе ${user.balance}₽`);
      return;
    }
    const newReq: GameRequest = {
      id: Date.now(),
      title: gameTitle,
      description: gameDesc,
      complexity: complexity[0],
      price: calcPrice,
      status: 'В обработке',
      author: `${user.firstName} ${user.lastName}`,
      date: new Date().toLocaleDateString('ru-RU'),
    };
    setRequests((r) => [newReq, ...r]);
    setUser({ ...user, balance: user.balance - calcPrice });
    setGameTitle('');
    setGameDesc('');
    setComplexity([50]);
    toast.success(`Заявка отправлена! Оплачено ${calcPrice}₽`);
  };

  const handlePromo = () => {
    const code = promo.trim().toLowerCase();
    const found = PROMO_CODES[code];
    if (!found || !user) {
      toast.error('Промокод не найден');
      return;
    }
    if (found.type === 'admin') {
      setUser({ ...user, isAdmin: true });
    } else {
      setUser({ ...user, balance: user.balance + found.value });
    }
    setPromo('');
    toast.success(found.label);
  };

  const handleTopup = () => {
    const amount = parseInt(topup);
    if (!amount || amount <= 0 || !user) {
      toast.error('Введите корректную сумму');
      return;
    }
    const methodLabel = payMethod === 'sbp' ? 'СБП' : 'картой';
    toast.loading(`Оплата через FreeKassa (${methodLabel})...`, { id: 'pay' });
    setTimeout(() => {
      setUser((u) => (u ? { ...u, balance: u.balance + amount } : u));
      setTopup('');
      toast.success(`Баланс пополнен на ${amount}₽ через ${methodLabel}`, { id: 'pay' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background grid-bg text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow-pink">
              <Icon name="Gamepad2" size={20} className="text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-wider gradient-text">GAMEFORGE</span>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Badge className="bg-secondary/20 text-secondary border border-secondary/40 font-bold">
                {user.balance.toLocaleString('ru-RU')} ₽
              </Badge>
              {user.isAdmin && (
                <Badge className="bg-primary/20 text-primary border border-primary/40">ADMIN</Badge>
              )}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center font-display font-bold text-sm">
                {user.firstName[0]}
              </div>
            </div>
          ) : (
            <Badge variant="outline" className="border-primary/40 text-primary">Гость</Badge>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container relative py-20 md:py-28 text-center">
          <Badge className="mb-6 bg-secondary/15 text-secondary border border-secondary/40 animate-glow-pulse">
            <Icon name="Sparkles" size={14} className="mr-1" /> Платформа разработки игр на Unity
          </Badge>
          <h1 className="font-display font-black text-4xl md:text-7xl leading-tight mb-6 animate-fade-in">
            СОЗДАЙ СВОЮ <br />
            <span className="gradient-text neon-text-pink">ИГРУ МЕЧТЫ</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 animate-fade-in">
            Опиши идею — мы рассчитаем стоимость и соберём игру на Unity. От 1000₽ до 3000₽ за проект.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-scale-in">
            <a href="#account">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold neon-glow-pink">
                <Icon name="Rocket" size={18} className="mr-2" /> Начать
              </Button>
            </a>
            <a href="#requests">
              <Button size="lg" variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                <Icon name="List" size={18} className="mr-2" /> Все заявки
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: 'PenTool', title: 'Опиши идею', text: 'Расскажи, какую игру хочешь — жанр, механики, стиль.' },
          { icon: 'Calculator', title: 'Авторасчёт цены', text: 'Система сама посчитает стоимость от 1000 до 3000₽.' },
          { icon: 'Wallet', title: 'Оплати с баланса', text: 'Пополни баланс картой и оплачивай заявки в один клик.' },
        ].map((f, i) => (
          <Card key={i} className="p-6 bg-card/60 border-border hover:neon-glow-cyan transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center mb-4">
              <Icon name={f.icon} size={24} className="text-secondary" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.text}</p>
          </Card>
        ))}
      </section>

      {/* Live Activity Feed */}
      <section className="container pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            Активность прямо сейчас
          </h2>
          <Badge className="bg-secondary/15 text-secondary border border-secondary/30 text-xs">
            {weekActivities.length} заявок за неделю · {weekTotal.toLocaleString('ru-RU')} ₽
          </Badge>
        </div>

        {newActivity && (
          <div className="mb-3 p-3 rounded-xl border border-secondary/60 bg-secondary/10 neon-glow-cyan animate-fade-in flex items-center gap-3">
            <span className="text-2xl">{newActivity.avatar}</span>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-secondary">{newActivity.name}</span>
              <span className="text-foreground"> {newActivity.action} </span>
              <span className="font-bold">«{newActivity.game}»</span>
            </div>
            <span className="font-display font-black text-primary text-sm whitespace-nowrap">{newActivity.price.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activities.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border hover:border-border/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {a.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-bold text-sm">{a.name}</span>
                  <span className="text-muted-foreground text-xs">{a.action}</span>
                </div>
                <p className="text-xs text-foreground/80 truncate font-medium">«{a.game}»</p>
                <p className="text-xs text-muted-foreground">{a.ago}</p>
              </div>
              <span className="font-display font-black text-xs text-secondary whitespace-nowrap">{a.price.toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
        </div>
      </section>

      <section id="account" className="container py-12">
        {!user ? (
          <Card className="max-w-md mx-auto p-8 bg-card/80 border-primary/30 neon-glow-pink animate-scale-in">
            <h2 className="font-display font-bold text-2xl mb-1 text-center">Регистрация</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Создай аккаунт за 10 секунд</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ln">Фамилия</Label>
                <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" className="bg-input border-border mt-1" />
              </div>
              <div>
                <Label htmlFor="fn">Имя</Label>
                <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" className="bg-input border-border mt-1" />
              </div>
              <div>
                <Label htmlFor="pw">Пароль</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="bg-input border-border mt-1" />
              </div>
              <Button onClick={handleRegister} className="w-full bg-primary hover:bg-primary/90 font-bold neon-glow-pink">
                <Icon name="UserPlus" size={18} className="mr-2" /> Зарегистрироваться
              </Button>
            </div>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-black text-2xl neon-glow-pink">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl">{user.firstName} {user.lastName}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
                  Баланс: <span className="text-secondary font-bold neon-text-cyan">{user.balance.toLocaleString('ru-RU')} ₽</span>
                  {user.isAdmin && <Badge className="bg-primary/20 text-primary border border-primary/40 ml-2">ADMIN</Badge>}
                </p>
                <Badge className="mt-2 bg-secondary/15 text-secondary border border-secondary/40">
                  <Icon name="ShieldCheck" size={13} className="mr-1" /> Оплата FreeKassa подключена · СБП
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="request" className="w-full">
              <TabsList className="bg-card/60 border border-border w-full justify-start flex-wrap h-auto">
                <TabsTrigger value="request"><Icon name="Plus" size={16} className="mr-1" /> Заявка</TabsTrigger>
                <TabsTrigger value="balance"><Icon name="Wallet" size={16} className="mr-1" /> Баланс</TabsTrigger>
                <TabsTrigger value="transactions"><Icon name="ArrowLeftRight" size={16} className="mr-1" /> Транзакции</TabsTrigger>
                <TabsTrigger value="promo"><Icon name="Ticket" size={16} className="mr-1" /> Промокоды</TabsTrigger>
                {user.isAdmin && <TabsTrigger value="admin"><Icon name="Shield" size={16} className="mr-1" /> Логи</TabsTrigger>}
              </TabsList>

              <TabsContent value="request" className="mt-6">
                <Card className="p-6 bg-card/60 border-border">
                  <h3 className="font-display font-bold text-lg mb-4">Заявка на разработку игры</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Название игры</Label>
                        <Input value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="Космический шутер" className="bg-input border-border mt-1" />
                      </div>
                      <div>
                        <Label>Что нужно сделать</Label>
                        <Textarea value={gameDesc} onChange={(e) => setGameDesc(e.target.value)} placeholder="Опиши жанр, механики, уровни, графику..." className="bg-input border-border mt-1 min-h-32" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Сложность проекта: {complexity[0]}%</Label>
                        <Slider value={complexity} onValueChange={setComplexity} max={100} step={1} className="mt-4" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Простая</span><span>Сложная</span>
                        </div>
                      </div>
                      <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 neon-glow-pink text-center">
                        <p className="text-muted-foreground text-xs mb-1">Стоимость разработки</p>
                        <p className="font-display font-black text-4xl gradient-text">{calcPrice.toLocaleString('ru-RU')} ₽</p>
                      </Card>
                      <Button onClick={handleSubmitRequest} className="w-full bg-primary hover:bg-primary/90 font-bold neon-glow-pink">
                        <Icon name="Send" size={18} className="mr-2" /> Отправить заявку и оплатить
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="balance" className="mt-6">
                <Card className="p-6 bg-card/60 border-border max-w-md">
                  <h3 className="font-display font-bold text-lg mb-1">Пополнение баланса</h3>
                  <p className="text-muted-foreground text-sm mb-4">Текущий баланс: <span className="text-secondary font-bold">{user.balance.toLocaleString('ru-RU')} ₽</span></p>

                  <Label className="text-xs text-muted-foreground">Способ оплаты</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
                    <button
                      onClick={() => setPayMethod('sbp')}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${payMethod === 'sbp' ? 'border-secondary bg-secondary/10 neon-glow-cyan text-secondary' : 'border-border bg-input/40 text-muted-foreground'}`}
                    >
                      <Icon name="Smartphone" size={18} />
                      <span className="font-bold text-sm">СБП</span>
                    </button>
                    <button
                      onClick={() => setPayMethod('card')}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${payMethod === 'card' ? 'border-primary bg-primary/10 neon-glow-pink text-primary' : 'border-border bg-input/40 text-muted-foreground'}`}
                    >
                      <Icon name="CreditCard" size={18} />
                      <span className="font-bold text-sm">Карта</span>
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {[1000, 2000, 3000].map((a) => (
                      <Button key={a} variant="outline" onClick={() => setTopup(String(a))} className="flex-1 border-secondary/40 text-secondary hover:bg-secondary/10">
                        {a}₽
                      </Button>
                    ))}
                  </div>
                  <Input value={topup} onChange={(e) => setTopup(e.target.value)} type="number" placeholder="Сумма" className="bg-input border-border mb-3" />
                  <Button onClick={handleTopup} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold neon-glow-cyan">
                    <Icon name={payMethod === 'sbp' ? 'Smartphone' : 'CreditCard'} size={18} className="mr-2" />
                    Оплатить через {payMethod === 'sbp' ? 'СБП' : 'карту'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                    <Icon name="Lock" size={12} /> Защищённый платёж · FreeKassa
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="mt-6">
                <div className="max-w-2xl space-y-4">
                  {/* Fride header */}
                  <Card className="p-5 bg-gradient-to-br from-card/80 to-secondary/10 border-secondary/40 neon-glow-cyan">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Платёжная система</p>
                        <p className="font-display font-black text-xl text-secondary">fride.io</p>
                        <p className="text-xs text-muted-foreground mt-1">Кошелёк: <span className="text-foreground font-bold">172012</span> · Код: <span className="text-foreground font-bold">0271492</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Владелец</p>
                        <p className="font-bold">Давид Оганесян</p>
                        <Badge className="mt-1 bg-secondary/15 text-secondary border border-secondary/30 text-xs">
                          <Icon name="ShieldCheck" size={11} className="mr-1" /> Верифицирован
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Withdraw */}
                  <Card className="p-5 bg-card/60 border-border">
                    <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                      <Icon name="ArrowUpRight" size={18} className="text-primary" /> Вывод средств через Fride
                    </h3>
                    <div className="flex gap-2">
                      <Input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} type="number" placeholder="Сумма вывода" className="bg-input border-border" />
                      <Button onClick={handleWithdraw} className="bg-primary hover:bg-primary/90 font-bold neon-glow-pink whitespace-nowrap">
                        <Icon name="ArrowUpRight" size={16} className="mr-1" /> Вывести
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Вывод на кошелёк Fride 172012 · от Давид Оганесян</p>
                  </Card>

                  {/* Transaction list */}
                  <Card className="p-5 bg-card/60 border-border">
                    <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                      <Icon name="History" size={18} className="text-muted-foreground" /> История транзакций
                    </h3>
                    <div className="space-y-2">
                      {frideTxs.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-input/40 border border-border">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'in' ? 'bg-secondary/15' : 'bg-primary/15'}`}>
                            <Icon name={tx.type === 'in' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={18} className={tx.type === 'in' ? 'text-secondary' : 'text-primary'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{tx.type === 'in' ? 'Пополнение' : 'Вывод'} · {tx.id}</p>
                            <p className="text-xs text-muted-foreground truncate">{tx.from} · {tx.method}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-display font-black text-sm ${tx.type === 'in' ? 'text-secondary' : 'text-primary'}`}>
                              {tx.type === 'in' ? '+' : '−'}{tx.amount.toLocaleString('ru-RU')} ₽
                            </p>
                            <Badge className={`text-xs mt-1 ${tx.status === 'completed' ? 'bg-secondary/15 text-secondary border-secondary/30' : 'bg-accent/15 text-accent border-accent/30'} border`}>
                              {tx.status === 'completed' ? 'Выполнено' : 'В обработке'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="promo" className="mt-6">
                <Card className="p-6 bg-card/60 border-border max-w-md">
                  <h3 className="font-display font-bold text-lg mb-1">Активация промокода</h3>
                  <p className="text-muted-foreground text-sm mb-4">Введи код для бонусов или доступа к админ-панели.</p>
                  <div className="flex gap-2">
                    <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Введите промокод" className="bg-input border-border" />
                    <Button onClick={handlePromo} className="bg-accent hover:bg-accent/90 font-bold">
                      <Icon name="Check" size={18} />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {user.isAdmin && (
                <TabsContent value="admin" className="mt-6">
                  <Card className="p-6 bg-card/60 border-primary/30 neon-glow-pink">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="Shield" size={20} className="text-primary" />
                      <h3 className="font-display font-bold text-lg">Логи и все заявки (Admin)</h3>
                    </div>
                    {requests.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Заявок пока нет.</p>
                    ) : (
                      <div className="space-y-3">
                        {requests.map((r) => (
                          <div key={r.id} className="p-4 rounded-lg bg-input/50 border border-border flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{r.author} • {r.date} • Сложность {r.complexity}%</p>
                            </div>
                            <div className="text-right">
                              <p className="font-display font-bold text-secondary">{r.price.toLocaleString('ru-RU')} ₽</p>
                              <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">{r.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </section>

      <section id="requests" className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl flex items-center gap-2">
            <Icon name="LayoutList" size={24} className="text-secondary" /> Мои заявки
          </h2>
          {requests.length > 0 && (
            <Badge className="bg-secondary/15 text-secondary border border-secondary/30">
              {requests.length} шт · {requests.reduce((s, r) => s + r.price, 0).toLocaleString('ru-RU')} ₽
            </Badge>
          )}
        </div>
        {requests.length === 0 ? (
          <Card className="p-10 bg-card/40 border-dashed border-border text-center">
            <Icon name="Inbox" size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">Заявок ещё нет.</p>
            <p className="text-xs text-muted-foreground">{user ? 'Создай первую во вкладке «Заявка» выше' : 'Зарегистрируйся и отправь первую заявку!'}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((r) => (
              <Card key={r.id} className="p-5 bg-card/60 border-border hover:neon-glow-cyan transition-all animate-fade-in">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-display font-bold text-sm leading-tight">{r.title}</h3>
                  <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs shrink-0">
                    <Icon name="Clock" size={10} className="mr-1" />{r.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{r.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${r.complexity}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{r.complexity}%</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-border pt-3">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Icon name="Calendar" size={11} /> {r.date}
                  </span>
                  <span className="font-display font-black text-secondary neon-text-cyan">{r.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="contacts" className="container py-12">
        <Card className="p-8 bg-gradient-to-br from-card/80 to-accent/10 border-border text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Остались вопросы?</h2>
          <p className="text-muted-foreground mb-6">Свяжись с нами — поможем с любым проектом на Unity.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:hello@gameforge.dev">
              <Button variant="outline" className="border-secondary/40 text-secondary hover:bg-secondary/10">
                <Icon name="Mail" size={18} className="mr-2" /> hello@gameforge.dev
              </Button>
            </a>
            <a href="https://t.me/gameforge" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                <Icon name="Send" size={18} className="mr-2" /> Telegram
              </Button>
            </a>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p className="font-display font-bold gradient-text text-lg mb-1">GAMEFORGE</p>
          <p>© 2026 — Платформа разработки игр на Unity</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;