import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { IconCamera, IconMapPin, IconSend, IconArrowLeft, IconBolt, IconShield, IconFlame, IconWallet, IconSword, IconCloudRain, IconBarrierBlock, IconAccessible, IconBulb } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export function ReportIncident() {
  const navigate = useNavigate();
  const { addIncident, userProfile, theme } = useApp();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [description, setDescription] = useState("");

  const incidentTypes = [
    {
      category: "Segurança",
      icon: IconShield,
      color: "from-red-500 to-red-600",
      items: [
        { value: "crime", Icon: IconFlame, label: "Crime", desc: "Atividade criminosa" },
        { value: "danger-zone", Icon: IconShield, label: "Zona Perigosa", desc: "Área de risco" },
        { value: "theft", Icon: IconWallet, label: "Roubo/Furto", desc: "Roubo ou furto" },
        { value: "assault", Icon: IconSword, label: "Assalto", desc: "Assalto a pessoas" },
      ],
    },
    {
      category: "Infraestrutura",
      icon: IconBarrierBlock,
      color: "from-blue-500 to-blue-600",
      items: [
        { value: "flood", Icon: IconCloudRain, label: "Alagamento", desc: "Água acumulada" },
        { value: "obstacle", Icon: IconBarrierBlock, label: "Obstáculo", desc: "Obstrução na via" },
        { value: "accessibility", Icon: IconAccessible, label: "Acessibilidade", desc: "Problema de acesso" },
        { value: "construction", Icon: IconBarrierBlock, label: "Obra", desc: "Obra ou bloqueio" },
        { value: "no-light", Icon: IconBulb, label: "Sem Luz", desc: "Iluminação ruim" },
      ],
    },
  ];

  const severityLevels = [
    { value: "low", label: "Baixo", color: "from-green-500 to-green-600", icon: "●" },
    { value: "medium", label: "Médio", color: "from-yellow-500 to-yellow-600", icon: "●●" },
    { value: "high", label: "Alto", color: "from-orange-500 to-orange-600", icon: "●●●" },
    { value: "critical", label: "Crítico", color: "from-red-500 to-red-600", icon: "●●●●" },
  ];

  const handleSubmit = () => {
    if (!selectedType) return;

    addIncident({
      type: selectedType as any,
      severity: selectedSeverity,
      location: {
        lat: -3.1190275,
        lng: -60.0217314,
        address: "Av. Eduardo Ribeiro, Centro - Manaus",
      },
      description: description || undefined,
      reportedBy: userProfile?.name,
    });

    const pointsMap = { low: 5, medium: 10, high: 15, critical: 20 };
    toast.success("Ocorrência reportada!", {
      description: `+${pointsMap[selectedSeverity]} pontos • Obrigado por ajudar!`,
    });

    navigate("/map");
  };

  const bgClass = theme === "dark" 
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
    : "bg-gradient-to-br from-blue-50 via-white to-purple-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-white/70" : "text-gray-600";
  const cardBg = theme === "dark" ? "bg-white/10" : "bg-white";
  const cardBorder = theme === "dark" ? "border-white/20" : "border-gray-200";

  if (step === 1) {
    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className={`relative z-10 p-5 border-b ${cardBorder} flex items-center gap-4 flex-shrink-0 ${cardBg} backdrop-blur-sm`}>
          <button onClick={() => navigate("/map")} className={`${textPrimary} active:scale-90 transition`}>
            <IconArrowLeft className="w-7 h-7" />
          </button>
          <div>
            <h1 className={`text-2xl ${textPrimary} font-bold`}>Reportar</h1>
            <p className={`text-sm ${textSecondary}`}>Passo 1 de 3 • Tipo</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className="space-y-6">
            {incidentTypes.map((category, catIdx) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={catIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.1 }}
                >
                  <div className={`flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl bg-gradient-to-r ${category.color} bg-opacity-20`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                    <h2 className="text-xl text-white font-bold">{category.category}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((type, idx) => {
                      const TypeIcon = type.Icon;
                      return (
                        <motion.button
                          key={type.value}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                          onClick={() => {
                            setSelectedType(type.value);
                            setStep(2);
                          }}
                          className={`w-full p-5 rounded-2xl ${cardBg} backdrop-blur-sm border ${cardBorder} text-left hover:${theme === "dark" ? "bg-white/20" : "bg-gray-50"} active:scale-98 transition`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                              <TypeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className={`text-xl font-bold ${textPrimary} mb-1`}>{type.label}</div>
                              <div className={`text-sm ${textSecondary}`}>{type.desc}</div>
                            </div>
                            <div className={textSecondary}>→</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const selectedTypeData = incidentTypes
      .flatMap((c) => c.items)
      .find((t) => t.value === selectedType);
    const SelectedIcon = selectedTypeData?.Icon;

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
        </div>

        <div className={`relative z-10 p-5 border-b ${cardBorder} flex items-center gap-4 flex-shrink-0 ${cardBg} backdrop-blur-sm`}>
          <button onClick={() => setStep(1)} className={`${textPrimary} active:scale-90 transition`}>
            <IconArrowLeft className="w-7 h-7" />
          </button>
          <div>
            <h1 className={`text-2xl ${textPrimary} font-bold`}>Nível de Risco</h1>
            <p className={`text-sm ${textSecondary}`}>Passo 2 de 3 • Gravidade</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className={`${cardBg} backdrop-blur-sm border ${cardBorder} p-5 rounded-2xl mb-6`}>
            <div className="flex items-center gap-4">
              {SelectedIcon && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <SelectedIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className={`text-xl font-bold ${textPrimary}`}>{selectedTypeData?.label}</div>
                <div className={`text-sm ${textSecondary}`}>{selectedTypeData?.desc}</div>
              </div>
            </div>
          </div>

          <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Qual o nível de gravidade?</h3>

          <div className="space-y-3">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedSeverity(level.value as any)}
                className={`w-full p-5 rounded-2xl text-left transition active:scale-98 border-2 ${
                  selectedSeverity === level.value
                    ? theme === "dark"
                      ? "bg-white/20 border-white/40 backdrop-blur-sm"
                      : "bg-gray-100 border-gray-400"
                    : `${cardBg} ${cardBorder}`
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{level.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-bold ${textPrimary} mb-1`}>{level.label}</div>
                    <div className={`text-sm ${textSecondary}`}>
                      {level.value === "low" && "Situação controlada"}
                      {level.value === "medium" && "Requer atenção"}
                      {level.value === "high" && "Situação perigosa"}
                      {level.value === "critical" && "Perigo imediato"}
                    </div>
                  </div>
                  {selectedSeverity === level.value && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`relative z-10 p-6 pt-4 flex-shrink-0 bg-gradient-to-t ${theme === "dark" ? "from-slate-900 via-slate-900/90" : "from-white via-white/90"} to-transparent`}>
          <button
            onClick={() => setStep(3)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 active:scale-95 transition shadow-2xl"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  const selectedTypeData = incidentTypes
    .flatMap((c) => c.items)
    .find((t) => t.value === selectedType);
  const SelectedIcon = selectedTypeData?.Icon;
  const selectedSeverityData = severityLevels.find((s) => s.value === selectedSeverity);

  return (
    <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className={`relative z-10 p-5 border-b ${cardBorder} flex items-center gap-4 flex-shrink-0 ${cardBg} backdrop-blur-sm`}>
        <button onClick={() => setStep(2)} className={`${textPrimary} active:scale-90 transition`}>
          <IconArrowLeft className="w-7 h-7" />
        </button>
        <div>
          <h1 className={`text-2xl ${textPrimary} font-bold`}>Detalhes</h1>
          <p className={`text-sm ${textSecondary}`}>Passo 3 de 3 • Finalizar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className={`${cardBg} backdrop-blur-sm border ${cardBorder} p-5 rounded-2xl mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            {SelectedIcon && (
              <div className={`w-12 h-12 bg-gradient-to-br ${selectedSeverityData?.color} rounded-xl flex items-center justify-center`}>
                <SelectedIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className={`text-xl font-bold ${textPrimary}`}>{selectedTypeData?.label}</div>
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${selectedSeverityData?.color} text-white mt-2`}>
                {selectedSeverityData?.label} Risco
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${textSecondary}`}>
            <IconMapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Av. Eduardo Ribeiro, Centro - Manaus</span>
          </div>
        </div>

        <div className="mb-6">
          <label className={`block ${textPrimary} font-bold mb-3`}>Descrição (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Vi pessoas suspeitas na esquina..."
            className={`w-full p-4 ${cardBg} backdrop-blur-sm border-2 ${cardBorder} rounded-2xl ${textPrimary} placeholder:${textSecondary} resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        <button className={`w-full py-4 border-2 border-dashed ${cardBorder} rounded-2xl ${textSecondary} hover:${textPrimary} hover:${theme === "dark" ? "border-white/50" : "border-gray-400"} active:scale-98 transition flex items-center justify-center gap-3 ${cardBg}`}>
          <IconCamera className="w-6 h-6" />
          <span className="font-medium">Adicionar foto (opcional)</span>
        </button>
      </div>

      <div className={`relative z-10 p-6 pt-4 flex-shrink-0 bg-gradient-to-t ${theme === "dark" ? "from-slate-900 via-slate-900/90" : "from-white via-white/90"} to-transparent space-y-3`}>
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition shadow-2xl flex items-center justify-center gap-3"
        >
          <IconSend className="w-6 h-6" />
          Enviar Alerta
        </button>
        <p className={`text-sm ${textSecondary} text-center`}>
          ⚡ Você ganhará {severityLevels.find((s) => s.value === selectedSeverity)?.value === "critical" ? "20" : severityLevels.find((s) => s.value === selectedSeverity)?.value === "high" ? "15" : severityLevels.find((s) => s.value === selectedSeverity)?.value === "medium" ? "10" : "5"} pontos
        </p>
      </div>
    </div>
  );
}