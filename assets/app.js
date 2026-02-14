// ========================================
// FNVL - Finval 2026 Website Scripts
// ========================================

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

// ========================================
// ROI Calculator
// ========================================

const calculateRoi = () => {
  const ASSET_LIFETIME_HOURS = 34000;
  const AVG_MONTHLY_WORK_HOURS = 170;

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
  const depreciation = investmentRub / ASSET_LIFETIME_HOURS;
  const laborCost = operatorSalary / AVG_MONTHLY_WORK_HOURS;
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
    investmentM, availableHours, effectiveHours, depreciation,
    laborCost, energyCost, toolCost, maintenanceCost, totalCostHour,
    partPrice, partsPerHour, revenueHour, revenueYear, costsYear,
    profitYear, paybackMonths, roiYear, roi3Year,
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

// ========================================
// Contact Form
// ========================================

const setupContactForm = () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("contactName")?.value.trim() || "";
    const email = document.getElementById("contactEmail")?.value.trim() || "";
    const company = document.getElementById("contactCompany")?.value.trim() || "";
    const phone = document.getElementById("contactPhone")?.value.trim() || "";
    const message = document.getElementById("contactMessage")?.value.trim() || "";
    const subject = encodeURIComponent("Запрос консультации Finval 2026");
    const body = encodeURIComponent(
      `Имя: ${name}\nКомпания: ${company}\nEmail: ${email}\nТелефон: ${phone}\n\nСообщение:\n${message}`
    );
    window.location.href = `mailto:sales@finval.ru?subject=${subject}&body=${body}`;
  });
};

// ========================================
// Section Animations
// ========================================

const setupReveal = () => {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.15}s`;
  });
};

// ========================================
// Podbor (Machine Selection)
// ========================================

const parsePodborValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || value.trim() === '' || value.trim() === '—') return 0;
  const cleanedString = value.split('/')[0].replace(/[^0-9.]/g, '').trim();
  const number = parseFloat(cleanedString);
  return Number.isFinite(number) ? number : 0;
};

const loadCatalogTable = async () => {
  const tbody = document.getElementById("catalogBody");
  if (!tbody) return;

  try {
    const response = await fetch("podbor.json");
    if (!response.ok) throw new Error("Failed to load catalog");
    const rawData = await response.json();

    const machines = rawData
      .filter(item => item["Серия / Модель"] && item["Серия / Модель"].trim() !== "")
      .map(item => ({
        model: item["Серия / Модель"],
        type: item["Назначение / Тип обработки"],
        xyz: item["Перемещение X/Y/Z (мм)"] || "—",
        power: parsePodborValue(item["Мощность шпинделя (кВт)"]),
        rpm: parsePodborValue(item["Частота вращения (об/мин)"]),
        load: parsePodborValue(item["Макс. нагрузка / Масса детали (кг)"]),
      }));

    tbody.innerHTML = machines.map(m => `
      <tr>
        <td><strong>${m.model}</strong></td>
        <td>${m.type}</td>
        <td>${m.xyz}</td>
        <td>${m.power} кВт</td>
        <td>${m.rpm.toLocaleString('ru-RU')}</td>
        <td>${m.load} кг</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Failed to load catalog:", error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="6">Не удалось загрузить каталог</td></tr>';
  }
};

const setupPodbor = () => {
  const form = document.getElementById("podborForm");
  if (!form) return;

  const resultEl = document.getElementById("podborResult");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultEl.innerHTML = `<p style="color: var(--gold);">Подбираем модель...</p>`;

    try {
      const response = await fetch("podbor.json");
      if (!response.ok) throw new Error("Could not load machine data.");
      const rawData = await response.json();

      const machines = rawData
        .filter(item => item["Серия / Модель"] && item["Серия / Модель"].trim() !== "")
        .map(item => ({
          model: item["Серия / Модель"],
          type: item["Назначение / Тип обработки"],
          x: parsePodborValue(item["Перемещение X/Y/Z (мм)"]),
          y: parsePodborValue(item["Перемещение X/Y/Z (мм)"]),
          z: parsePodborValue(item["Перемещение X/Y/Z (мм)"]),
          power: parsePodborValue(item["Мощность шпинделя (кВт)"]),
          rpm: parsePodborValue(item["Частота вращения (об/мин)"]),
          load: parsePodborValue(item["Макс. нагрузка / Масса детали (кг)"]),
          xyz: item["Перемещение X/Y/Z (мм)"] || "—",
        }));

      // Get user input
      const userInput = {
        x: getValue("podborX") || getValue("podborY") || 0,
        y: getValue("podborY") || 0,
        z: getValue("podborZ") || 0,
        power: getValue("podborPower"),
        rpm: getValue("podborRpm"),
        load: getValue("podborLoad"),
      };

      // Filter candidates: must meet minimum requirements
      const candidates = machines.filter(m => {
        const xOk = userInput.x > 0 ? m.x >= userInput.x : true;
        const yOk = userInput.y > 0 ? m.y >= userInput.y : true;
        const zOk = userInput.z > 0 ? m.z >= userInput.z : true;
        const powerOk = userInput.power > 0 ? m.power >= userInput.power : true;
        const rpmOk = userInput.rpm > 0 ? m.rpm >= userInput.rpm : true;
        const loadOk = userInput.load > 0 ? m.load >= userInput.load : true;
        return xOk && yOk && zOk && powerOk && rpmOk && loadOk;
      });

      if (candidates.length === 0) {
        resultEl.innerHTML = `
          <div class="card" style="border-color: var(--copper);">
            <h3 style="color: var(--copper);">Модели не найдены</h3>
            <p>Не найдено моделей, удовлетворяющих всем вашим критериям. Попробуйте смягчить требования.</p>
          </div>`;
        return;
      }

      // Score candidates - lower is better
      const scoredCandidates = candidates.map(m => {
        let score = 0;
        if (userInput.x > 0) score += (m.x - userInput.x) / userInput.x;
        if (userInput.y > 0) score += (m.y - userInput.y) / userInput.y;
        if (userInput.z > 0) score += (m.z - userInput.z) / userInput.z;
        if (userInput.power > 0) score += (m.power - userInput.power) / userInput.power;
        if (userInput.rpm > 0) score += (m.rpm - userInput.rpm) / userInput.rpm;
        if (userInput.load > 0) score += (m.load - userInput.load) / userInput.load;
        return { ...m, score };
      });

      scoredCandidates.sort((a, b) => a.score - b.score);

      const best = scoredCandidates[0];
      const alts = scoredCandidates.slice(1, 4);

      resultEl.innerHTML = `
        <div class="card" style="border-color: var(--gold);">
          <h3 style="color: var(--gold);">Рекомендуемая модель: ${best.model}</h3>
          <p style="margin-bottom: 16px;">${best.type}</p>
          <table class="table" style="margin-top: 16px;">
            <thead>
              <tr>
                <th>Параметр</th>
                <th>Ваше требование</th>
                <th>Значение станка</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>X / Y / Z, мм</td><td>${userInput.x || '—'}</td><td><strong>${best.xyz}</strong></td></tr>
              <tr><td>Мощность, кВт</td><td>${userInput.power || '—'}</td><td><strong>${best.power}</strong></td></tr>
              <tr><td>Частота, об/мин</td><td>${userInput.rpm || '—'}</td><td><strong>${best.rpm.toLocaleString('ru-RU')}</strong></td></tr>
              <tr><td>Нагрузка, кг</td><td>${userInput.load || '—'}</td><td><strong>${best.load}</strong></td></tr>
            </tbody>
          </table>
          ${alts.length > 0 ? `<p style="margin-top: 16px; color: var(--text-muted);">Альтернативы: ${alts.map(a => a.model).join(', ')}</p>` : ''}
        </div>`;

    } catch (error) {
      console.error("Podbor error:", error);
      resultEl.innerHTML = `<p style="color: var(--copper);">Ошибка загрузки данных. Попробуйте позже.</p>`;
    }
  });
};

// ========================================
// Header Loader
// ========================================

const loadHeader = async () => {
  const headerElement = document.querySelector("header");
  if (!headerElement) return;

  try {
    const response = await fetch("header.html");
    if (!response.ok) throw new Error(`Header not found: ${response.statusText}`);
    const headerHTML = await response.text();
    headerElement.innerHTML = headerHTML;

    // Highlight active page
    const currentPageName = window.location.pathname.split("/").pop();
    const activePage = currentPageName === '' ? 'index.html' : currentPageName;

    const navLinks = headerElement.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === activePage) {
        link.classList.add("active");
      }
    });
  } catch (error) {
    console.error("Failed to load header:", error);
    headerElement.innerHTML = `<div class="navbar"><div class="logo">Fin<span>val</span></div></div>`;
  }
};

// ========================================
// Initialize
// ========================================

window.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  setupCalculator();
  setupContactForm();
  setupReveal();
  setupPodbor();
  loadCatalogTable();
});
