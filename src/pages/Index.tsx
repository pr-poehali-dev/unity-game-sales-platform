import { useState, useMemo } from 'react';
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
    setUser({ ...user, balance: user.balance + amount });
    setTopup('');
    toast.success(`Баланс пополнен на ${amount}₽`);
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
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  Баланс: <span className="text-secondary font-bold neon-text-cyan">{user.balance.toLocaleString('ru-RU')} ₽</span>
                  {user.isAdmin && <Badge className="bg-primary/20 text-primary border border-primary/40 ml-2">ADMIN</Badge>}
                </p>
              </div>
            </div>

            <Tabs defaultValue="request" className="w-full">
              <TabsList className="bg-card/60 border border-border w-full justify-start flex-wrap h-auto">
                <TabsTrigger value="request"><Icon name="Plus" size={16} className="mr-1" /> Заявка</TabsTrigger>
                <TabsTrigger value="balance"><Icon name="Wallet" size={16} className="mr-1" /> Баланс</TabsTrigger>
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
                  <div className="flex gap-2 mb-4">
                    {[1000, 2000, 3000].map((a) => (
                      <Button key={a} variant="outline" onClick={() => setTopup(String(a))} className="flex-1 border-secondary/40 text-secondary hover:bg-secondary/10">
                        {a}₽
                      </Button>
                    ))}
                  </div>
                  <Input value={topup} onChange={(e) => setTopup(e.target.value)} type="number" placeholder="Сумма" className="bg-input border-border mb-3" />
                  <Button onClick={handleTopup} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold neon-glow-cyan">
                    <Icon name="CreditCard" size={18} className="mr-2" /> Пополнить
                  </Button>
                </Card>
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
        <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
          <Icon name="LayoutList" size={24} className="text-secondary" /> Мои заявки
        </h2>
        {requests.length === 0 ? (
          <Card className="p-10 bg-card/40 border-dashed border-border text-center">
            <Icon name="Inbox" size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Заявок ещё нет. Создай первую в профиле!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((r) => (
              <Card key={r.id} className="p-5 bg-card/60 border-border hover:neon-glow-cyan transition-all animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold">{r.title}</h3>
                  <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">{r.status}</Badge>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{r.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.date}</span>
                  <span className="font-display font-bold text-secondary neon-text-cyan">{r.price.toLocaleString('ru-RU')} ₽</span>
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
            <Button variant="outline" className="border-secondary/40 text-secondary hover:bg-secondary/10">
              <Icon name="Mail" size={18} className="mr-2" /> hello@gameforge.dev
            </Button>
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              <Icon name="Send" size={18} className="mr-2" /> Telegram
            </Button>
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
