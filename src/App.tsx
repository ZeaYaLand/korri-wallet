import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, Copy, Eye, EyeOff, Home, Layers3, Search, Settings, ShieldCheck, Sun, TrendingUp, WalletCards } from 'lucide-react'

type Tab = 'home' | 'assets' | 'activity' | 'settings'
type TxFilter = 'all' | 'incoming' | 'outgoing'
type Currency = 'USD' | 'EUR'
type Tx = { id: number; title: string; detail: string; amount: string; incoming: boolean; time: string }

const assets = [
  { symbol: 'TON', name: 'Toncoin', amount: 128.42, price: 5.24, change: '+2.8%', mark: '💎', color: 'blue' },
  { symbol: 'USDT', name: 'Tether USD', amount: 245, price: 1, change: '+0.1%', mark: '₮', color: 'green' },
  { symbol: 'ETH', name: 'Ethereum', amount: 0.84, price: 3240.5, change: '+1.4%', mark: '◆', color: 'purple' }
]
const initialTx: Tx[] = [
  { id: 1042, title: 'Получение TON', detail: 'Demo Testnet · демо-адрес', amount: '+12.50 TON', incoming: true, time: 'Сегодня, 14:32' },
  { id: 1041, title: 'Отправка TON', detail: 'Demo Testnet · демо-адрес', amount: '−3.20 TON', incoming: false, time: 'Вчера, 19:08' },
  { id: 1040, title: 'Получение USDT', detail: 'Демо-зачисление', amount: '+50.00 USDT', incoming: true, time: '12 окт., 11:47' }
]
const DEMO_EUR_RATE = 0.92 // Фиксированный учебный курс, не актуальный биржевой курс.
const money = (n: number, currency: Currency = 'USD') => new Intl.NumberFormat(currency === 'EUR' ? 'de-AT' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(currency === 'EUR' ? n * DEMO_EUR_RATE : n)

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<'main' | 'send' | 'receive'>('main')
  const [balanceVisible, setBalanceVisible] = useState(() => {
    try { return localStorage.getItem('korri-wallet-balance-visible') !== 'false' } catch { return true }
  })
  const [lightTheme, setLightTheme] = useState(() => {
    try { return localStorage.getItem('korri-wallet-light-theme') === 'true' } catch { return false }
  })
  const [confirmReset, setConfirmReset] = useState(false)
  const [currency, setCurrency] = useState<Currency>(() => {
    try { return localStorage.getItem('korri-wallet-currency') === 'EUR' ? 'EUR' : 'USD' } catch { return 'USD' }
  })
  const [transactions, setTransactions] = useState<Tx[]>(() => {
    try {
      const saved = localStorage.getItem('korri-wallet-demo-transactions')
      if (!saved) return initialTx
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.every((tx: unknown) => {
        if (!tx || typeof tx !== 'object') return false
        const item = tx as Partial<Tx>
        return typeof item.id === 'number' &&
          typeof item.title === 'string' &&
          typeof item.detail === 'string' &&
          typeof item.amount === 'string' &&
          typeof item.incoming === 'boolean' &&
          typeof item.time === 'string'
      })) return parsed as Tx[]
    } catch {
      // If saved demo data is unavailable or invalid, use the sample history.
    }
    return initialTx
  })
  const [txFilter, setTxFilter] = useState<TxFilter>('all')
  const [txSearch, setTxSearch] = useState('')
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<typeof assets[number] | null>(null)
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try { localStorage.setItem('korri-wallet-currency', currency) } catch { /* Storage is optional. */ }
  }, [currency])
  useEffect(() => {
    try {
      localStorage.setItem('korri-wallet-demo-transactions', JSON.stringify(transactions))
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [transactions])
  const total = assets.reduce((sum, a) => sum + a.amount * a.price, 0)
  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = txFilter === 'all' || (txFilter === 'incoming' ? tx.incoming : !tx.incoming)
    const query = txSearch.trim().toLocaleLowerCase()
    const matchesSearch = !query || [tx.title, tx.detail, tx.amount, tx.time].some(value => value.toLocaleLowerCase().includes(query))
    return matchesFilter && matchesSearch
  })
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000) }
  const sendDemo = () => {
    const value = Number(amount)
    if (address.trim().length < 8 || !Number.isFinite(value) || value <= 0) { notify('Введи демо-адрес и сумму больше нуля.'); return }
    setTransactions(prev => [{ id: Date.now(), title: 'Симуляция перевода', detail: 'Demo Testnet · ' + address.slice(0, 12), amount: '−' + value.toFixed(2) + ' TON', incoming: false, time: 'Только что' }, ...prev])
    setAddress(''); setAmount(''); setScreen('main'); setTab('activity'); setTxFilter('all')
    notify('Добавлена только демо-операция. Блокчейн не использовался.')
  }
  const back = () => setScreen('main')

  return <div className={'app-shell ' + (lightTheme ? 'light-theme' : '')}>
    <div className="ambient ambient-a" /><div className="ambient ambient-b" />
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark"><WalletCards size={22} /></div><div><strong>korri<span>.</span></strong><small>WALLET</small></div></div>
      <div className="topbar-actions"><span className="network-badge"><i /> DEMO TESTNET</span><button className="round-icon" onClick={() => notify('Уведомлений пока нет.')} aria-label="Уведомления"><Bell size={18} /></button></div>
    </header>
    {screen === 'send' ? <main className="page">
      <button className="back-button" onClick={back}>← Назад</button>
      <div className="page-heading"><span className="section-kicker">DEMO TESTNET</span><h1>Отправить <span>актив</span></h1><p>Это симуляция, реальный перевод не выполняется.</p></div>
      <div className="form-card glass"><label htmlFor="address">Адрес получателя</label><input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Введи демо-адрес" autoComplete="off" /><p className="field-note">Не вводи seed-фразы или приватные ключи.</p><label htmlFor="amount">Сумма TON</label><div className="amount-input"><input id="amount" type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" /><span>TON</span></div><div className="security-note"><ShieldCheck size={17} /> Тестовый режим: реальные средства не используются.</div><button className="submit-button" onClick={sendDemo}><ArrowUpRight size={17} /> Симулировать отправку</button></div>
    </main> : screen === 'receive' ? <main className="page">
      <button className="back-button" onClick={back}>← Назад</button>
      <div className="page-heading"><span className="section-kicker">DEMO TESTNET</span><h1>Получить <span>актив</span></h1><p>Адрес ниже демонстрационный. Не отправляй на него средства.</p></div>
      <div className="receive-card glass"><div className="qr-placeholder"><WalletCards size={54} /><span>DEMO ONLY</span></div><div className="receive-network"><i /> Demo Testnet</div><div className="address-box">EQDemoKorriWalletTestAddress2026</div><button className="submit-button" onClick={() => { void navigator.clipboard?.writeText('EQDemoKorriWalletTestAddress2026'); notify('Демо-адрес скопирован.') }}><Copy size={17} /> Копировать демо-адрес</button></div>
    </main> : <>
      {tab === 'home' && <main className="page home-page">
        <div className="greeting-row"><div><div className="section-kicker">ТВОЙ КРИПТОМИР</div><h1>Привет, <span>Korri</span> ✦</h1><p>Всё под контролем. Всё в одном месте.</p></div><button className="profile-orb" onClick={() => setTab('settings')}>K</button></div>
        <section className="balance-card"><div className="orb orb-one" /><div className="orb orb-two" /><div className="balance-top"><span className="eyebrow">ОБЩИЙ ДЕМО-БАЛАНС</span><button className="round-icon" onClick={() => setBalanceVisible(v => !v)} aria-label="Показать или скрыть баланс">{balanceVisible ? <Eye size={17} /> : <EyeOff size={17} />}</button></div><div className="balance-number">{balanceVisible ? money(total, currency) : '••••••••'}</div><div className="balance-foot"><span className="demo-pill"><i /> DEMO MODE</span><span className="balance-change">↗ 2.4% <small>условное изменение</small></span></div><div className="quick-actions"><button className="primary-action" onClick={() => setScreen('send')}><ArrowUpRight size={17} /> Отправить</button><button className="secondary-action" onClick={() => setScreen('receive')}><ArrowDownLeft size={17} /> Получить</button></div></section>
        <PortfolioChart total={total} currency={currency} visible={balanceVisible} />
        <SectionHeading title="Мои активы" subtitle="Тестовые данные" action="Все" onClick={() => setTab('assets')} />
        <div className="asset-list">{assets.map(a => <AssetRow key={a.symbol} asset={a} currency={currency} onClick={() => setSelectedAsset(a)} />)}</div>
        <SectionHeading title="Последние операции" subtitle="История демо-транзакций" action="Все" onClick={() => setTab('activity')} extraClass="transactions-heading" />
        <div className="transaction-list glass-subtle">{transactions.slice(0, 3).map(tx => <TransactionRow key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />)}</div>
        <div className="test-warning"><ShieldCheck size={16} /><span>DEMO MODE · Все цифры условные, реальных средств нет.</span></div>
      </main>}
      {tab === 'assets' && <main className="page"><PageHeading kicker="ПОРТФЕЛЬ" title="Мои активы" subtitle="Демонстрационные активы для тестирования." /><div className="mini-total glass"><span>Общая стоимость</span><strong>{balanceVisible ? money(total, currency) : '••••••••'}</strong><button className="text-action" onClick={() => setBalanceVisible(v => !v)}>{balanceVisible ? 'Скрыть' : 'Показать'}</button></div><div className="asset-list">{assets.map(a => <AssetRow key={a.symbol} asset={a} currency={currency} onClick={() => setSelectedAsset(a)} />)}</div></main>}
      {tab === 'activity' && <main className="page"><PageHeading kicker="ЖУРНАЛ" title="История операций" subtitle="Здесь отображаются только действия прототипа." /><label className="tx-search"><Search size={17} /><input aria-label="Поиск по истории операций" value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Поиск по названию, активу или адресу" /></label><div className="filter-pills" aria-label="Фильтр операций"><button type="button" className={txFilter === 'all' ? 'selected' : ''} onClick={() => setTxFilter('all')}>Все операции</button><button type="button" className={txFilter === 'incoming' ? 'selected' : ''} onClick={() => setTxFilter('incoming')}>Получение</button><button type="button" className={txFilter === 'outgoing' ? 'selected' : ''} onClick={() => setTxFilter('outgoing')}>Отправка</button></div><div className="transaction-list glass-subtle">{filteredTransactions.length ? filteredTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />) : <p className="empty-transactions">{txSearch.trim() ? 'По этому запросу ничего не найдено.' : 'Операций в этой категории пока нет.'}</p>}</div><div className="test-warning"><ShieldCheck size={16} /><span>История демо-операций сохраняется в браузере на этом устройстве.</span></div></main>}
      {tab === 'settings' && <main className="page"><PageHeading kicker="ПРОФИЛЬ" title="Настройки кошелька" subtitle="Korri Wallet · версия 0.1.0" /><div className="profile-card glass"><div className="profile-large">K</div><div><h2>Korri</h2><p>Локальный демо-профиль</p><span className="demo-pill"><i /> ТЕСТОВЫЙ РЕЖИМ</span></div></div><div className="settings-list glass-subtle"><div className="currency-setting"><div className="currency-setting-copy"><strong>Валюта баланса</strong><small>Отображение стоимости портфеля</small></div><div className="currency-options" role="group" aria-label="Валюта баланса"><button className={currency === 'USD' ? 'selected' : ''} onClick={() => setCurrency('USD')} aria-pressed={currency === 'USD'}>USD $</button><button className={currency === 'EUR' ? 'selected' : ''} onClick={() => setCurrency('EUR')} aria-pressed={currency === 'EUR'}>EUR €</button></div><p className="currency-note">Для EUR используется условный курс 1 USD = 0,92 EUR. Это демо-значение, не курс в реальном времени.</p></div><button onClick={() => setLightTheme(v => !v)}><Sun /><span><strong>Оформление</strong><small>{lightTheme ? 'Светлая тема' : 'Тёмная тема'}</small></span><span className={'setting-switch ' + (lightTheme ? 'on' : '')}><i /></span></button><button onClick={() => setBalanceVisible(v => !v)}><Eye /><span><strong>Отображение баланса</strong><small>{balanceVisible ? 'Баланс виден' : 'Баланс скрыт'}</small></span><span className={'setting-switch ' + (balanceVisible ? 'on' : '')}><i /></span></button><button onClick={() => notify('Выбрана сеть Demo Testnet.')}><Layers3 /><span><strong>Сеть</strong><small>Demo Testnet</small></span><ChevronRight /></button><button onClick={() => notify('Ключи пока не создаются.')}><ShieldCheck /><span><strong>Безопасность</strong><small>Ключи пока не создаются</small></span><ChevronRight /></button><button onClick={() => notify('В прототипе нет внешних подключений.')}><Settings /><span><strong>Приватность</strong><small>Тестовый интерфейс</small></span><ChevronRight /></button></div><button className="dashed-button" onClick={() => setConfirmReset(true)}>Сбросить демо-историю</button></main>}
    </>}
    <nav className="bottom-nav">{([['home', Home, 'Главная'], ['assets', Layers3, 'Активы'], ['activity', ArrowUpRight, 'История'], ['settings', Settings, 'Настройки']] as const).map(([id, Icon, label]) => <button key={id} className={'nav-item ' + (tab === id && screen === 'main' ? 'active' : '')} onClick={() => { setTab(id); setScreen('main') }}><Icon size={19} /><span>{label}</span></button>)}</nav>
    {confirmReset && <div className="tx-modal-backdrop" onClick={() => setConfirmReset(false)}><section className="tx-modal glass" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title" onClick={e => e.stopPropagation()}><div className="tx-modal-top"><span className="section-kicker">ПОДТВЕРЖДЕНИЕ</span><button className="round-icon" onClick={() => setConfirmReset(false)} aria-label="Закрыть">×</button></div><div className="tx-modal-symbol outgoing"><ShieldCheck size={24} /></div><h2 id="reset-modal-title">Сбросить демо-историю?</h2><p className="tx-modal-note">Все добавленные тобой тестовые операции будут удалены из истории на этом устройстве. Вернутся исходные примеры. Это действие нельзя отменить.</p><div className="reset-actions"><button className="secondary-action" onClick={() => setConfirmReset(false)}>Отмена</button><button className="submit-button" onClick={() => { setTransactions(initialTx); setTxFilter('all'); setTxSearch(''); setConfirmReset(false); setTab('home'); notify('Демо-история восстановлена.') }}>Сбросить</button></div></section></div>}
    {selectedTx && <div className="tx-modal-backdrop" onClick={() => setSelectedTx(null)}><section className="tx-modal glass" role="dialog" aria-modal="true" aria-labelledby="tx-modal-title" onClick={e => e.stopPropagation()}><div className="tx-modal-top"><span className="section-kicker">ДЕТАЛИ ОПЕРАЦИИ</span><button className="round-icon" onClick={() => setSelectedTx(null)} aria-label="Закрыть детали">×</button></div><div className={'tx-modal-symbol ' + (selectedTx.incoming ? 'incoming' : 'outgoing')}>{selectedTx.incoming ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}</div><h2 id="tx-modal-title">{selectedTx.title}</h2><div className={'tx-modal-amount ' + (selectedTx.incoming ? 'positive' : '')}>{selectedTx.amount}</div><span className="tx-modal-status"><i /> Демо-операция · не блокчейн</span><div className="tx-detail-list"><div><span>Тип</span><strong>{selectedTx.incoming ? 'Получение' : 'Отправка'}</strong></div><div><span>Дата и время</span><strong>{selectedTx.time}</strong></div><div><span>Сеть</span><strong>Demo Testnet</strong></div><div><span>Адрес / описание</span><strong className="tx-detail-address">{selectedTx.detail.replace('Demo Testnet · ', '')}</strong></div><div><span>ID операции</span><strong>#{selectedTx.id}</strong></div><div><span>Статус</span><strong className="tx-detail-demo">Симуляция</strong></div></div><p className="tx-modal-note">Это запись демонстрационного интерфейса. Реальный перевод не выполнялся.</p><button className="submit-button" onClick={() => setSelectedTx(null)}>Готово</button></section></div>}
    {selectedAsset && <AssetDetailModal asset={selectedAsset} currency={currency} visible={balanceVisible} onClose={() => setSelectedAsset(null)} />}
    {notice && <div className="toast"><ShieldCheck size={16} />{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <footer className="app-footer"><span>korri.wallet</span><span>BUILT FOR TELEGRAM · DEMO</span></footer>
  </div>
}


type ChartRange = '24H' | '7D' | '30D'
const chartSeries: Record<ChartRange, number[]> = {
  '24H': [0.972, 0.981, 0.976, 0.988, 0.983, 0.995, 0.991, 1],
  '7D': [0.914, 0.928, 0.919, 0.951, 0.944, 0.972, 0.961, 1],
  '30D': [0.872, 0.889, 0.883, 0.914, 0.905, 0.938, 0.927, 0.962, 0.951, 1]
}
function PortfolioChart({ total, currency, visible }: { total: number; currency: Currency; visible: boolean }) {
  const [range, setRange] = useState<ChartRange>('7D')
  const values = chartSeries[range].map(point => total * point)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = max - min || 1
  const coords = values.map((value, i) => ({
    x: 10 + (i / (values.length - 1)) * 300,
    y: 94 - ((value - min) / spread) * 70
  }))
  const line = coords.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const area = `${line} L 310 106 L 10 106 Z`
  const change = ((values[values.length - 1] / values[0]) - 1) * 100
  return <section className="portfolio-chart glass-subtle">
    <div className="chart-heading"><div><span className="section-kicker">АНАЛИТИКА</span><h2>Динамика портфеля</h2><p>Условная история стоимости</p></div><div className="chart-icon"><TrendingUp size={19} /></div></div>
    <div className="chart-summary"><strong>{visible ? money(total, currency) : '••••••'}</strong><span className="chart-change">↗ {change.toFixed(1)}% <small>за период</small></span></div>
    <div className="chart-plot" role="img" aria-label={`Демонстрационный график стоимости портфеля за ${range}`}>
      <svg viewBox="0 0 320 112" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="portfolioChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".34" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0" /></linearGradient></defs>
        <path className="chart-grid-line" d="M 0 24 H 320 M 0 60 H 320 M 0 96 H 320" />
        <path d={area} fill="url(#portfolioChartFill)" />
        <path d={line} className="chart-line" />
        <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="4" className="chart-current-dot" />
      </svg>
    </div>
    <div className="chart-axis"><span>{visible ? money(min, currency) : '••••'}</span><span>{visible ? money(max, currency) : '••••'}</span></div>
    <div className="chart-ranges" role="group" aria-label="Период графика">{(['24H', '7D', '30D'] as ChartRange[]).map(item => <button key={item} className={range === item ? 'selected' : ''} aria-pressed={range === item} onClick={() => setRange(item)}>{item === '24H' ? '24 часа' : item === '7D' ? '7 дней' : '30 дней'}</button>)}</div>
    <p className="chart-disclaimer">График построен на условных данных и не отражает реальные рыночные цены.</p>
  </section>
}

function PageHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return <div className="page-heading"><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{subtitle}</p></div>
}
function SectionHeading({ title, subtitle, action, onClick, extraClass = '' }: { title: string; subtitle: string; action: string; onClick: () => void; extraClass?: string }) {
  return <div className={'section-heading ' + extraClass}><div><h2>{title}</h2><p>{subtitle}</p></div><button className="text-action" onClick={onClick}>{action} <ChevronRight size={15} /></button></div>
}
function AssetRow({ asset, currency, onClick }: { asset: typeof assets[number]; currency: Currency; onClick: () => void }) {
  const total = asset.amount * asset.price
  return <div className="asset-row asset-row-clickable glass-subtle" role="button" tabIndex={0} aria-label={`Подробнее об активе ${asset.name}`} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}><div className={'coin-icon ' + asset.color}>{asset.mark}</div><div className="asset-main"><strong>{asset.symbol}</strong><span>{asset.name}</span></div><div className="asset-value"><strong>{asset.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })}</strong><span>{money(total, currency)}</span></div><div className="asset-change">{asset.change} ↗</div><ChevronRight className="asset-chevron" size={15} /></div>
}
function AssetDetailModal({ asset, currency, visible, onClose }: { asset: typeof assets[number]; currency: Currency; visible: boolean; onClose: () => void }) {
  const total = asset.amount * asset.price
  const points = asset.symbol === 'TON' ? '2,70 28,58 55,63 82,36 109,44 137,24 164,35 192,15 220,25 248,9 278,16 308,4' : asset.symbol === 'ETH' ? '2,52 28,45 55,54 82,31 109,37 137,19 164,28 192,35 220,16 248,21 278,8 308,12' : '2,36 28,35 55,37 82,33 109,35 137,31 164,33 192,30 220,32 248,29 278,30 308,28'
  return <div className="tx-modal-backdrop asset-modal-backdrop" onClick={onClose}><section className="tx-modal glass asset-detail-modal" role="dialog" aria-modal="true" aria-labelledby="asset-modal-title" onClick={e => e.stopPropagation()}><div className="tx-modal-top"><span className="section-kicker">ДЕТАЛИ АКТИВА</span><button className="round-icon" onClick={onClose} aria-label="Закрыть детали актива">×</button></div><div className={'coin-icon asset-detail-icon ' + asset.color}>{asset.mark}</div><h2 id="asset-modal-title">{asset.name}</h2><p className="asset-detail-symbol">{asset.symbol} · Demo Testnet</p><div className="asset-detail-total">{visible ? money(total, currency) : '••••••••'}</div><p className="asset-detail-caption">Общая демо-стоимость</p><div className="asset-detail-chart" role="img" aria-label={`Условный график ${asset.symbol}`}><svg viewBox="0 0 310 76" preserveAspectRatio="none" aria-hidden="true"><path className="chart-grid-line" d="M0 20 H310 M0 42 H310 M0 64 H310" /><polyline points={points} className="chart-line" /></svg></div><div className="tx-detail-list asset-detail-list"><div><span>Количество</span><strong>{asset.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })} {asset.symbol}</strong></div><div><span>Цена за единицу</span><strong>{visible ? money(asset.price, currency) : '••••'}</strong></div><div><span>Изменение (демо)</span><strong className="asset-detail-positive">{asset.change} ↗</strong></div><div><span>Сеть</span><strong>Demo Testnet</strong></div></div><p className="tx-modal-note">Демо-данные: цены и график не обновляются в реальном времени. Реального подключения к рынку нет.</p><button className="submit-button" onClick={onClose}>Готово</button></section></div>
}
function TransactionRow({ tx, onClick }: { tx: Tx; onClick: () => void }) {
  return <div className="transaction-row" role="button" tabIndex={0} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}><div className={'tx-icon ' + (tx.incoming ? 'incoming' : 'outgoing')}>{tx.incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</div><div className="tx-main"><strong>{tx.title}</strong><span>{tx.detail}</span><small>{tx.time}</small></div><div className="tx-amount"><strong className={tx.incoming ? 'positive' : ''}>{tx.amount}</strong><span className="tx-status">● Demo</span></div></div>
}