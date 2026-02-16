import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconX,
  IconSend,
  IconMapPin,
  IconArrowLeft,
  IconShield,
  IconCar,
  IconTool,
  IconDots,
  IconCamera,
  IconShieldExclamation,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconSword,
  IconShieldCheck,
  IconBolt,
  IconBarrierBlock,
  IconBan,
  IconCloudRain,
  IconBulbOff,
  IconHelmet,
  IconAccessible,
  IconAlertOctagon,
  IconSiren,
  IconGasStation,
  IconCloudSun,
  IconMapPinOff,
} from "@tabler/icons-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

interface QuickReportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportItem {
  emoji: string;
  label: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  desc: string;
}

interface ReportSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  borderColor: string;
  items: ReportItem[];
}

const ITEM_ICONS: Record<string, any> = {
  "🥷": IconShieldExclamation,
  "⚠️": IconAlertTriangle,
  "💰": IconCurrencyDollar,
  "⚔️": IconSword,
  "👮": IconShieldCheck,
  "🚗": IconCar,
  "💥": IconBolt,
  "🚧": IconBarrierBlock,
  "🚫": IconBan,
  "🌧️": IconCloudRain,
  "💡": IconBulbOff,
  "🏗️": IconHelmet,
  "🚶": IconAccessible,
  "🪨": IconAlertOctagon,
  "🆘": IconSiren,
  "📷": IconCamera,
  "⛽": IconGasStation,
  "🌡️": IconCloudSun,
  "📱": IconMapPinOff,
};

const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "seguranca",
    title: "Segurança",
    icon: <IconShield className="w-4 h-4" />,
    gradient: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    items: [
      { emoji: "🥷", label: "Insegurança", type: "crime", severity: "high", desc: "Atividade suspeita ou criminosa" },
      { emoji: "⚠️", label: "Zona Perigosa", type: "danger-zone", severity: "high", desc: "Área de risco conhecida" },
      { emoji: "💰", label: "Roubo/Furto", type: "theft", severity: "high", desc: "Roubo ou furto na região" },
      { emoji: "⚔️", label: "Assalto", type: "assault", severity: "critical", desc: "Assalto a pessoas" },
      { emoji: "👮", label: "Polícia", type: "crime", severity: "low", desc: "Presença policial no local" },
    ],
  },
  {
    id: "transito",
    title: "Trânsito",
    icon: <IconCar className="w-4 h-4" />,
    gradient: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    items: [
      { emoji: "🚗", label: "Trânsito", type: "obstacle", severity: "medium", desc: "Congestionamento ou lentidão" },
      { emoji: "💥", label: "Acidente", type: "danger-zone", severity: "high", desc: "Acidente de trânsito" },
      { emoji: "🚧", label: "Faixa Bloqueada", type: "construction", severity: "medium", desc: "Faixa parcialmente interditada" },
      { emoji: "🚫", label: "Via Interditada", type: "construction", severity: "high", desc: "Via completamente fechada" },
    ],
  },
  {
    id: "infraestrutura",
    title: "Infraestrutura",
    icon: <IconTool className="w-4 h-4" />,
    gradient: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    items: [
      { emoji: "🌧️", label: "Alagamento", type: "flood", severity: "medium", desc: "Acúmulo de água na via" },
      { emoji: "💡", label: "Sem Iluminação", type: "no-light", severity: "medium", desc: "Falta de iluminação pública" },
      { emoji: "🏗️", label: "Obras", type: "construction", severity: "medium", desc: "Obras na via ou calçada" },
      { emoji: "🚶", label: "Acessibilidade", type: "accessibility", severity: "medium", desc: "Problema de acessibilidade" },
      { emoji: "🪨", label: "Obstáculo", type: "obstacle", severity: "medium", desc: "Obstrução na via ou calçada" },
    ],
  },
  {
    id: "outros",
    title: "Outros",
    icon: <IconDots className="w-4 h-4" />,
    gradient: "from-slate-500 to-slate-600",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
    items: [
      { emoji: "🆘", label: "SOS", type: "assault", severity: "critical", desc: "Emergência — pedir ajuda" },
      { emoji: "📷", label: "Câmera", type: "crime", severity: "low", desc: "Câmera de vigilância" },
      { emoji: "⛽", label: "Combustível", type: "obstacle", severity: "low", desc: "Preço do combustível" },
      { emoji: "🌡️", label: "Clima", type: "flood", severity: "low", desc: "Condição climática adversa" },
      { emoji: "📱", label: "Erro no Mapa", type: "obstacle", severity: "low", desc: "Erro de informação no mapa" },
    ],
  },
];

const SEVERITY_OPTIONS = [
  { value: "low" as const, label: "Baixo", color: "bg-green-500", ring: "ring-green-500/30", icon: "●" },
  { value: "medium" as const, label: "Médio", color: "bg-yellow-500", ring: "ring-yellow-500/30", icon: "●●" },
  { value: "high" as const, label: "Alto", color: "bg-orange-500", ring: "ring-orange-500/30", icon: "●●●" },
  { value: "critical" as const, label: "Crítico", color: "bg-red-500", ring: "ring-red-500/30", icon: "●●●●" },
];

export function QuickReport({ isOpen, onClose }: QuickReportProps) {
  const { addIncident, userProfile, theme } = useApp();
  const isDark = theme === "dark";
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);
  const [selectedSection, setSelectedSection] = useState<ReportSection | null>(null);
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [description, setDescription] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectItem = (item: ReportItem, section: ReportSection) => {
    setSelectedItem(item);
    setSelectedSection(section);
    setSeverity(item.severity);
    setStep(2);
  };

  const handleSend = () => {
    if (!selectedItem) return;

    addIncident({
      type: selectedItem.type as any,
      severity: severity,
      location: {
        lat: -3.0356 + (Math.random() - 0.5) * 0.01,
        lng: -60.0222 + (Math.random() - 0.5) * 0.01,
        address: "Próximo à sua localização",
      },
      description: description || `${selectedItem.label} reportado`,
      reportedBy: userProfile?.name,
    });

    const pointsMap = { low: 5, medium: 10, high: 15, critical: 20 };
    toast.success(`${selectedItem.label} reportado!`, {
      description: `+${pointsMap[severity]} pontos • Obrigado por ajudar!`,
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep(1);
    setSelectedItem(null);
    setSelectedSection(null);
    setSeverity("medium");
    setDescription("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSelectedItem(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 z-[500]"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`absolute bottom-0 left-0 right-0 ${isDark ? "bg-[#1a1a2e]" : "bg-white"} rounded-tl-[24px] rounded-tr-[24px] z-[501] max-h-[88vh] flex flex-col shadow-2xl`}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className={`w-10 h-1 ${isDark ? "bg-white/20" : "bg-gray-300"} rounded-full`} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} active:scale-90 transition`}
                  >
                    <IconArrowLeft className={`w-5 h-5 ${isDark ? "text-white/80" : "text-gray-600"}`} />
                  </motion.button>
                )}
                <div>
                  <h2 className={`${isDark ? "text-white" : "text-gray-900"} text-[18px] font-bold font-['Poppins']`}>
                    {step === 1 ? "O que você está vendo?" : "Detalhes do Alerta"}
                  </h2>
                  <p className={`${isDark ? "text-white/40" : "text-gray-400"} text-[12px] font-['Poppins']`}>
                    {step === 1 ? "Selecione a categoria do alerta" : "Ajuste a gravidade e envie"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`w-9 h-9 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} active:scale-90 transition`}
              >
                <IconX className={`w-5 h-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-5 pb-8"
                >
                  <div className="space-y-5">
                    {REPORT_SECTIONS.map((section, sIdx) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.08 }}
                      >
                        {/* Section Header */}
                        <div className={`flex items-center gap-2.5 mb-3`}>
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center`}>
                            {section.icon}
                          </div>
                          <span className={`${isDark ? "text-white/90" : "text-gray-800"} text-[14px] font-bold font-['Poppins']`}>
                            {section.title}
                          </span>
                          <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-gray-200"}`} />
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {section.items.map((item, idx) => {
                            const ItemIcon = ITEM_ICONS[item.emoji] || IconAlertTriangle;
                            return (
                            <motion.button
                              key={`${section.id}-${idx}`}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: sIdx * 0.08 + idx * 0.03 }}
                              onClick={() => handleSelectItem(item, section)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border active:scale-90 transition-all group ${
                                isDark
                                  ? `${section.bgColor} ${section.borderColor} hover:bg-white/10`
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <div className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center group-hover:scale-110 transition-all ${
                                isDark
                                  ? "bg-white/10 group-hover:bg-white/15"
                                  : "bg-gradient-to-br " + section.gradient + " shadow-sm"
                              }`}>
                                <ItemIcon className={`w-[18px] h-[18px] ${isDark ? "text-white/90" : "text-white"}`} strokeWidth={2} />
                              </div>
                              <span className={`text-[11px] font-medium font-['Poppins'] text-center leading-tight transition-colors ${
                                isDark
                                  ? "text-white/70 group-hover:text-white"
                                  : "text-gray-600 group-hover:text-gray-900"
                              }`}>
                                {item.label}
                              </span>
                            </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-y-auto px-5 pb-8"
                >
                  {selectedItem && selectedSection && (
                    <div className="space-y-5">
                      {/* Selected Item Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border ${
                          isDark
                            ? `${selectedSection.bgColor} ${selectedSection.borderColor}`
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedSection.gradient} flex items-center justify-center`}>
                            {(() => {
                              const SelectedIcon = ITEM_ICONS[selectedItem.emoji] || IconAlertTriangle;
                              return <SelectedIcon className="w-7 h-7 text-white" strokeWidth={2} />;
                            })()}
                          </div>
                          <div className="flex-1">
                            <h3 className={`${isDark ? "text-white" : "text-gray-900"} text-[16px] font-bold font-['Poppins']`}>
                              {selectedItem.label}
                            </h3>
                            <p className={`${isDark ? "text-white/50" : "text-gray-500"} text-[12px] font-['Poppins']`}>
                              {selectedItem.desc}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${selectedSection.gradient}`} />
                              <span className={`${isDark ? "text-white/40" : "text-gray-400"} text-[11px] font-['Poppins']`}>
                                {selectedSection.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Location */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="flex items-center gap-3 px-1"
                      >
                        <IconMapPin className="w-4 h-4 text-[#2b7fff]" />
                        <span className={`${isDark ? "text-white/50" : "text-gray-500"} text-[13px] font-['Poppins']`}>
                          Próximo à sua localização
                        </span>
                      </motion.div>

                      {/* Severity Selector */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className={`${isDark ? "text-white/60" : "text-gray-600"} text-[13px] font-bold font-['Poppins'] mb-3`}>
                          Nível de gravidade
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {SEVERITY_OPTIONS.map((opt) => {
                            const isActive = severity === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setSeverity(opt.value)}
                                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                                  isActive
                                    ? `${opt.color} border-transparent ring-2 ${opt.ring} scale-105`
                                    : isDark
                                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                <span className={`text-[10px] ${isActive ? "text-white" : isDark ? "text-white/40" : "text-gray-400"}`}>
                                  {opt.icon}
                                </span>
                                <span className={`text-[11px] font-bold font-['Poppins'] ${isActive ? "text-white" : isDark ? "text-white/60" : "text-gray-600"}`}>
                                  {opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>

                      {/* Description */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <p className={`${isDark ? "text-white/60" : "text-gray-600"} text-[13px] font-bold font-['Poppins'] mb-3`}>
                          Descrição (opcional)
                        </p>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder='Ex: "Vi pessoas suspeitas na esquina..."'
                          className={`w-full rounded-2xl p-4 text-[14px] font-['Poppins'] outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/30 resize-none h-[80px] transition ${
                            isDark
                              ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                              : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"
                          }`}
                        />
                      </motion.div>

                      {/* Photo Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`w-full flex items-center justify-center gap-2 py-3 border border-dashed rounded-2xl active:scale-95 transition ${
                          isDark
                            ? "border-white/15 text-white/40 hover:text-white/60 hover:border-white/30"
                            : "border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <IconCamera className="w-4 h-4" />
                        <span className="text-[13px] font-medium font-['Poppins']">
                          Adicionar foto
                        </span>
                      </motion.button>

                      {/* Points Preview */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-center"
                      >
                        <span className={`${isDark ? "text-white/30" : "text-gray-400"} text-[12px] font-['Poppins']`}>
                          ⚡ Você ganhará{" "}
                          <span className="text-[#2b7fff] font-bold">
                            +{{ low: 5, medium: 10, high: 15, critical: 20 }[severity]} pontos
                          </span>
                        </span>
                      </motion.div>

                      {/* Send Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={handleSend}
                        className="w-full bg-gradient-to-r from-[#2b7fff] to-blue-600 text-white py-4 rounded-2xl font-bold text-[15px] font-['Poppins'] hover:opacity-90 active:scale-[0.97] transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2.5"
                      >
                        <IconSend className="w-5 h-5" />
                        Enviar Alerta
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}