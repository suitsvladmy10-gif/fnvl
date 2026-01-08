const formatNumber = (value, options = {}) => {
  if (!Number.isFinite(value)) return "—";
  const formatter = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    ...options,
  });
  return formatter.format(value);
};

const formatRubles = (value, digits = 0) =>
  formatNumber(value, { maximumFractionDigits: digits });

const getValue = (id) => {
  const el = document.getElementById(id);
  if (!el) return 0;
  const value = parseFloat(el.value);
  return Number.isFinite(value) ? value : 0;
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
};

const calculateRoi = () => {
  const equipmentCost = getValue("equipmentCost");
  const commissioningPercent = getValue("commissioningPercent");
  const investmentM = equipmentCost * (1 + commissioningPercent / 100);

  const workDays = getValue("workDays");
  const shiftsPerDay = getValue("shiftsPerDay");
  const hoursPerShift = getValue("hoursPerShift");
  const utilizationPercent = getValue("utilizationPercent");

  const availableHours = workDays * shiftsPerDay * hoursPerShift;
  const effectiveHours = availableHours * (utilizationPercent / 100);

  const operatorSalary = getValue("operatorSalary");
  const energyCost = getValue("energyCost");
  const toolCost = getValue("toolCost");
  const servicePercent = getValue("servicePercent");

  const investmentRub = investmentM * 1_000_000;
  const depreciation = investmentRub / 34000;
  const laborCost = operatorSalary / 170;
  const maintenanceCost =
    effectiveHours > 0
      ? (investmentRub * (servicePercent / 100)) / effectiveHours
      : 0;

  const totalCostHour =
    depreciation + laborCost + energyCost + toolCost + maintenanceCost;

  const partPrice = getValue("partPrice");
  const partsPerHour = getValue("partsPerHour");
  const revenueHour = partPrice * partsPerHour;

  const revenueYear = (revenueHour * effectiveHours) / 1_000_000;
  const costsYear = (totalCostHour * effectiveHours) / 1_000_000;
  const profitYear = revenueYear - costsYear;

  const paybackMonths = profitYear > 0 ? (investmentM / profitYear) * 12 : null;
  const roiYear = profitYear > 0 ? (profitYear / investmentM) * 100 : null;
  const roi3Year = profitYear > 0 ? ((profitYear * 3 - investmentM) / investmentM) * 100 : null;

  setText("investmentTotal", `${formatRubles(investmentM, 2)} млн ₽`);
  setText("availableHours", formatRubles(availableHours));
  setText("effectiveHours", formatRubles(effectiveHours));
  setText("depreciation", `${formatRubles(depreciation)} ₽/час`);
  setText("laborCost", `${formatRubles(laborCost)} ₽/час`);
  setText("maintenanceCost", `${formatRubles(maintenanceCost)} ₽/час`);
  setText("totalCostHour", `${formatRubles(totalCostHour)} ₽/час`);
  setText("revenueHour", `${formatRubles(revenueHour)} ₽/час`);
  setText("revenueYear", `${formatRubles(revenueYear, 2)} млн ₽`);
  setText("costsYear", `${formatRubles(costsYear, 2)} млн ₽`);
  setText("profitYear", `${formatRubles(profitYear, 2)} млн ₽`);
  setText("paybackMonths", paybackMonths ? `${formatRubles(paybackMonths, 1)} мес` : "—");
  setText("roiYear", roiYear ? `${formatRubles(roiYear, 1)}%` : "—");
  setText("roi3Year", roi3Year ? `${formatRubles(roi3Year, 1)}%` : "—");

  return {
    investmentM,
    availableHours,
    effectiveHours,
    depreciation,
    laborCost,
    energyCost,
    toolCost,
    maintenanceCost,
    totalCostHour,
    partPrice,
    partsPerHour,
    revenueHour,
    revenueYear,
    costsYear,
    profitYear,
    paybackMonths,
    roiYear,
    roi3Year,
  };
};

const setupCalculator = () => {
  const calcRoot = document.querySelector("[data-calculator]");
  if (!calcRoot) return;

  const inputs = calcRoot.querySelectorAll("input");
  const update = () => calculateRoi();
  inputs.forEach((input) => input.addEventListener("input", update));
  update();

  const emailButton = document.getElementById("emailResults");
  if (emailButton) {
    emailButton.addEventListener("click", () => {
      const data = calculateRoi();
      const lines = [
        "Результаты ROI-калькулятора",
        `Инвестиция: ${formatRubles(data.investmentM, 2)} млн ₽`,
        `Эффективные часы: ${formatRubles(data.effectiveHours)} ч/год`,
        `Затраты на час: ${formatRubles(data.totalCostHour)} ₽`,
        `Выручка на час: ${formatRubles(data.revenueHour)} ₽`,
        `Прибыль в год: ${formatRubles(data.profitYear, 2)} млн ₽`,
        `Окупаемость: ${data.paybackMonths ? `${formatRubles(data.paybackMonths, 1)} мес` : "—"}`,
        `ROI в год: ${data.roiYear ? `${formatRubles(data.roiYear, 1)}%` : "—"}`,
      ];
      const subject = encodeURIComponent("Запрос по ROI-калькулятору Finval");
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:sales@finval.ru?subject=${subject}&body=${body}`;
    });
  }
};

const setupContactForm = () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const company = document.getElementById("contactCompany").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const subject = encodeURIComponent("Запрос консультации Finval 2026");
    const body = encodeURIComponent(
      `Имя: ${name}\nКомпания: ${company}\nEmail: ${email}\n\nСообщение:\n${message}`
    );
    window.location.href = `mailto:sales@finval.ru?subject=${subject}&body=${body}`;
  });
};

const setupReveal = () => {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section, index) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    requestAnimationFrame(() => {
      section.style.opacity = "1";
      section.style.transform = "translateY(0)";
    });
  });
};

const setupSelector = () => {
  const root = document.querySelector("[data-selector]");
  if (!root) return;

  const catalog = [
    {
      id: "FVA",
      type: "vertical",
      name: "FVA серия",
      power: 11,
      rpm: 8000,
      note: "Вертикально-фрезерные центры, опции до 15 000 об/мин.",
    },
    {
      id: "FVC",
      type: "vertical",
      name: "FVC серия",
      power: 15,
      rpm: 10000,
      note: "Универсальные вертикальные центры, опции до 18 000 об/мин.",
    },
    {
      id: "FVC-H",
      type: "vertical",
      name: "FVC/H серия",
      power: 18.5,
      rpm: 8000,
      note: "Высокая жесткость и нагрузка, опции до 18 000 об/мин.",
    },
    {
      id: "FAR-300B",
      type: "five-axis",
      name: "FAR-300B",
      power: 19.5,
      rpm: 24000,
      note: "5-осевой центр с высокой скоростью шпинделя.",
    },
    {
      id: "FAR-300AU",
      type: "five-axis",
      name: "FAR-300AU",
      power: 18.5,
      rpm: 18000,
      note: "5-осевой центр для сложной геометрии.",
    },
    {
      id: "FAR-600B",
      type: "five-axis",
      name: "FAR-600B",
      power: 18.5,
      rpm: 18000,
      note: "5-осевой центр для среднего габарита.",
    },
    {
      id: "FS-46TY",
      type: "turning",
      name: "FS-46TY",
      power: 5.5,
      rpm: 6000,
      note: "Токарный центр для серийной обработки.",
    },
    {
      id: "FF-32/38BSYB",
      type: "swiss",
      name: "FF-32/38BSYB",
      power: 7.5,
      rpm: 6000,
      note: "Автомат продольного точения с осью B.",
    },
    {
      id: "FPC-2516",
      type: "portal",
      name: "FPC-2516",
      power: 18.5,
      rpm: 6000,
      note: "Портальный центр для крупногабаритных деталей.",
    },
  ];

  const typeSelect = document.getElementById("machineType");
  const powerInput = document.getElementById("machinePower");
  const speedInput = document.getElementById("machineSpeed");
  const resultEl = document.getElementById("selectorResult");
  const altEl = document.getElementById("selectorAlternatives");

  const scoreMachine = (machine, power, rpm) => {
    let score = 0;
    if (power > 0) score += Math.abs(power - machine.power) / power;
    if (rpm > 0) score += Math.abs(rpm - machine.rpm) / rpm;
    return score;
  };

  const update = () => {
    const type = typeSelect.value;
    const power = parseFloat(powerInput.value) || 0;
    const rpm = parseFloat(speedInput.value) || 0;
    let list = catalog;
    if (type !== "any") {
      list = list.filter((item) => item.type === type);
    }
    if (!list.length) {
      resultEl.textContent = "Под этот тип оборудования модели не найдены.";
      altEl.textContent = "";
      return;
    }
    const ranked = list
      .map((item) => ({ item, score: scoreMachine(item, power, rpm) }))
      .sort((a, b) => a.score - b.score);
    const best = ranked[0].item;
    resultEl.textContent = `${best.name} — ${best.power} кВт, ${best.rpm} об/мин. ${best.note}`;

    const alt = ranked.slice(1, 3).map((row) => row.item);
    altEl.textContent = alt.length
      ? `Альтернативы: ${alt.map((item) => item.name).join(", ")}.`
      : "";
  };

  [typeSelect, powerInput, speedInput].forEach((el) =>
    el.addEventListener("input", update)
  );
  update();
};

window.addEventListener("DOMContentLoaded", () => {
  setupCalculator();
  setupContactForm();
  setupReveal();
  setupSelector();
});
