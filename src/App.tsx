import { useState, useMemo, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Info, Calculator, Wallet, PartyPopper, CheckCircle2, XCircle } from 'lucide-react';
import GaugeChart from './components/GaugeChart';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { NumericFormat } from 'react-number-format';

interface Multiples {
  monthly: number;
  quarterly: number;
}

const RULES = [
  { range: "Abaixo de 74,99%", min: 0, max: 0.7499, monthly: 0, quarterly: 0, color: "bg-red-500/20 text-red-400" },
  { range: "75% - 89,99%", min: 0.75, max: 0.8999, monthly: 0.5, quarterly: 1.5, color: "bg-orange-500/20 text-orange-400" },
  { range: "90% - 99,99%", min: 0.90, max: 0.9999, monthly: 0.75, quarterly: 2.25, color: "bg-yellow-500/20 text-yellow-400" },
  { range: "100% - 109,99%", min: 1.00, max: 1.0999, monthly: 1, quarterly: 3, color: "bg-lime-500/20 text-lime-400" },
  { range: "110% - 119,99%", min: 1.10, max: 1.1999, monthly: 1.25, quarterly: 3.75, color: "bg-green-500/20 text-green-400" },
  { range: "Acima de 120%", min: 1.20, max: Infinity, monthly: 1.5, quarterly: 4.5, color: "bg-emerald-500/20 text-emerald-400" },
];

export default function App() {
  const [goal, setGoal] = useState<number>(50000.00);
  const [actual, setActual] = useState<number>(40000.00);
  const [baseSalary, setBaseSalary] = useState<number>(7000.00);
  const [visitsMet, setVisitsMet] = useState<boolean>(false);

  const attainment = useMemo(() => {
    const financialAttainmentPercent = goal > 0 ? (actual / goal) : 0;
    const financialWeight = financialAttainmentPercent * 0.75;
    
    // Rule: Visits only count if financial attainment >= 75%
    const visitsEligible = financialAttainmentPercent >= 0.75;
    const visitsWeight = (visitsEligible && visitsMet) ? 0.25 : 0;
    
    return financialWeight + visitsWeight;
  }, [goal, actual, visitsMet]);

  const financialAttainmentPercent = useMemo(() => {
    return goal > 0 ? (actual / goal) : 0;
  }, [goal, actual]);

  const visitsEligible = useMemo(() => {
    return financialAttainmentPercent >= 0.75;
  }, [financialAttainmentPercent]);

  const multiples = useMemo((): Multiples => {
    const rule = RULES.find(r => attainment >= r.min && attainment <= r.max);
    if (rule) return { monthly: rule.monthly, quarterly: rule.quarterly };
    if (attainment >= 1.20) return { monthly: 1.5, quarterly: 4.5 };
    return { monthly: 0, quarterly: 0 };
  }, [attainment]);

  const variablePay = useMemo(() => {
    return baseSalary * multiples.quarterly;
  }, [baseSalary, multiples.quarterly]);

  const dsr = useMemo(() => {
    return variablePay * 0.1923;
  }, [variablePay]);

  const totalVariable = useMemo(() => {
    return variablePay + dsr;
  }, [variablePay, dsr]);

  const currentRule = useMemo(() => {
    return RULES.find(r => attainment >= r.min && attainment <= r.max) || RULES[RULES.length - 1];
  }, [attainment]);

  // Confetti and Sound effect when reaching 100% or more
  useEffect(() => {
    if (attainment >= 1.0) {
      // Play Bell Sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio playback blocked or failed:', err));

      // Confetti logic
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [attainment >= 1.0]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Calculator className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Calculadora de Metas Trimestral</h1>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Performance Engine v1.8</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>Status: Online</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs & Gauge */}
        <div className="lg:col-span-7 space-y-8">
          {/* Input Card */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Parâmetros de Entrada</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Salário Base Mensal</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <NumericFormat
                    value={baseSalary}
                    onValueChange={(values) => setBaseSalary(values.floatValue || 0)}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Meta de Visitas Trimestre (25%)</label>
                  {!visitsEligible && (
                    <span className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1">
                      <Info className="w-3 h-3" /> Bloqueado (Fin. {"<"} 75%)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => visitsEligible && setVisitsMet(!visitsMet)}
                  disabled={!visitsEligible}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    !visitsEligible
                      ? 'bg-zinc-950/50 border-zinc-800/50 text-zinc-700 cursor-not-allowed opacity-50'
                      : visitsMet 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-medium text-sm">
                    {visitsMet && visitsEligible ? 'Meta de visitas atingida' : 'Atingiu a meta de visitas?'}
                  </span>
                  {visitsMet && visitsEligible ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5 opacity-30" />}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Meta Financeira Trimestre (75%)</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <NumericFormat
                    value={goal}
                    onValueChange={(values) => setGoal(values.floatValue || 0)}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Realizado Financeiro Trimestre</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <NumericFormat
                    value={actual}
                    onValueChange={(values) => setActual(values.floatValue || 0)}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-lg"
                  />
                </div>
              </div>

              {/* Calculation Rationale */}
              <div className="md:col-span-2 mt-4 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Calculator className="w-3 h-3" /> Racional do Cálculo
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase mb-1">Batimento Financeiro</span>
                    <span className="text-zinc-300">({(financialAttainmentPercent * 100).toFixed(1)}% × 0,75)</span>
                  </div>
                  <span className="text-zinc-600 self-end mb-1">+</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase mb-1">Bônus Visitas</span>
                    <span className={visitsEligible && visitsMet ? "text-emerald-400" : "text-zinc-600"}>
                      {visitsEligible && visitsMet ? "25,0%" : "0,0%"}
                    </span>
                  </div>
                  <span className="text-zinc-600 self-end mb-1">=</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-500 uppercase mb-1">Score Final</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {(attainment * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {!visitsEligible && visitsMet && (
                  <p className="text-[10px] text-red-500/80 mt-2 italic flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> O bônus de visitas foi ignorado pois o batimento financeiro está abaixo de 75%.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Gauge Card */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Visualização de Atingimento</h2>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2 ${currentRule.color}`}>
                {attainment >= 1.0 && <PartyPopper className="w-3 h-3" />}
                {currentRule.range}
              </div>
            </div>

            <GaugeChart value={attainment} />
          </section>
        </div>

        {/* Right Column: Results & Rules */}
        <div className="lg:col-span-5 space-y-8">
          {/* Multiples Card */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {attainment >= 1.0 && (
              <div className="absolute top-0 right-0 p-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 text-black p-1 rounded-full"
                >
                  <PartyPopper className="w-4 h-4" />
                </motion.div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Múltiplos Salariais</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={attainment + baseSalary}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-zinc-500 text-sm font-medium">Múltiplo Mensal</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">{multiples.monthly}x</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between ring-1 ring-emerald-500/30">
                    <span className="text-zinc-500 text-sm font-medium">Múltiplo Trimestral</span>
                    <span className="text-3xl font-bold text-emerald-400 font-mono">{multiples.quarterly}x</span>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center space-y-4">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Variável Estimado (Trimestre)</p>
                        <p className="text-3xl font-bold text-zinc-300 font-mono">
                          {formatCurrency(variablePay)}
                        </p>
                      </div>

                      <div className="bg-emerald-500/10 rounded-lg py-2 px-4 inline-block border border-emerald-500/30">
                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">DSR Estimado (19,23%)</p>
                        <p className="text-xl font-bold text-emerald-400 font-mono">
                          + {formatCurrency(dsr)}
                        </p>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Previsto</p>
                        <p className="text-4xl font-black text-emerald-400 font-mono">
                          {formatCurrency(totalVariable)}
                        </p>
                      </div>

                      <div className="text-[10px] text-zinc-600 mt-2 italic space-y-1">
                        <p>Base: {formatCurrency(baseSalary)} × {multiples.quarterly}x</p>
                        <p>
                          Composição: {(financialAttainmentPercent * 75).toFixed(1)}% Financeiro (Peso 75%)
                          {visitsEligible && visitsMet ? " + 25,0% Visitas (Peso 25%)" : " + 0% Visitas"}
                          {!visitsEligible && visitsMet && " (Bônus bloqueado: Fin. < 75%)"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Rules Table Card */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Grades de Múltiplos Salariais</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Atingimento</th>
                    <th className="pb-2 font-medium text-center">Mensal</th>
                    <th className="pb-2 font-medium text-center">Trim.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {RULES.map((rule, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-colors ${attainment >= rule.min && attainment <= rule.max ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400'}`}
                    >
                      <td className="py-2">{rule.range}</td>
                      <td className="py-2 text-center">{rule.monthly}</td>
                      <td className="py-2 text-center">{rule.quarterly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-zinc-800 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
          <p>© 2026 Performance Analytics System</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
