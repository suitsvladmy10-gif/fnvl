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
  // Нормативный срок службы оборудования в часах для расчета амортизации
  const ASSET_LIFETIME_HOURS = 34000;
  // Среднее количество рабочих часов в месяце для расчета стоимости часа оператора
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
    // Set initial state via class
    section.classList.add("section--hidden");
    // Set staggered delay. This is an acceptable use of inline style as it's dynamic.
    section.style.transitionDelay = `${index * 0.1}s`;

    // Trigger the animation after the initial styles have been applied
    requestAnimationFrame(() => {
      section.classList.remove("section--hidden");
    });
  });
};

const setupSelector = () => {
  const root = document.querySelector("[data-selector]");
  if (!root) return;

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

  const update = (catalog) => {
    if (!catalog) return;
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

  fetch("./catalog.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((catalog) => {
      [typeSelect, powerInput, speedInput].forEach((el) =>
        el.addEventListener("input", () => update(catalog))
      );
      update(catalog);
    })
    .catch((error) => {
      console.error("Could not load catalog:", error);
      resultEl.textContent = "Не удалось загрузить каталог оборудования.";
    });
};

const setupDecisionSurvey = () => {
  const root = document.querySelector("[data-decision]");
  if (!root) return;

  const volumeEl = document.getElementById("surveyVolume");
  const typesEl = document.getElementById("surveyTypes");
  const setupEl = document.getElementById("surveySetup");
  const accuracyEl = document.getElementById("surveyAccuracy");
  const budgetEl = document.getElementById("surveyBudget");
  const resultEl = document.getElementById("surveyResult");
  const nextEl = document.getElementById("surveyNext");

  const update = () => {
    const volume = parseFloat(volumeEl.value) || 0;
    const types = parseFloat(typesEl.value) || 0;
    const setup = parseFloat(setupEl.value) || 4;
    const accuracy = parseFloat(accuracyEl.value) || 0.015;
    const budget = parseFloat(budgetEl.value) || 0;

    let recommendation = "Специализированный станок";
    let nextStep = "Подготовить ТЗ на деталь и уточнить требования к оснастке.";

    if (volume > 500 || types > 8 || setup <= 0.5) {
      recommendation = "Многозадачный центр или горизонтальный обрабатывающий центр";
      nextStep = "Собрать перечень типовых деталей и запросить расчет производительности.";
    } else if (volume >= 200 || types >= 4 || setup <= 2) {
      recommendation = "Специализированный + рассмотреть многозадачный центр";
      nextStep = "Сравнить экономику 2-х станков против одного центра.";
    }

    if (accuracy <= 0.005 && setup <= 2) {
      recommendation = "Горизонтальный или усиленный многозадачный центр";
      nextStep = "Проверить требования по точности и доступные системы контроля.";
    }

    if (budget >= 80) {
      nextStep = "Сформировать два сценария: горизонтальный + многозадачный / несколько специализированных.";
    } else if (budget >= 50) {
      nextStep = "Сравнить бюджет на многозадачный центр и пару специализированных станков.";
    }

    resultEl.textContent = recommendation;
    nextEl.textContent = `Следующий шаг: ${nextStep}`;
  };

  [volumeEl, typesEl, setupEl, accuracyEl, budgetEl].forEach((el) =>
    el.addEventListener("input", update)
  );
  update();
};

const setupComparisonFilters = () => {
  const root = document.querySelector("[data-compare-filters]");
  if (!root) return;

  const volumeEl = document.getElementById("filterVolume");
  const materialEl = document.getElementById("filterMaterial");
  const accuracyEl = document.getElementById("filterAccuracy");
  const budgetEl = document.getElementById("filterBudget");
  const priorityEl = document.getElementById("filterPriority");
  const rows = document.querySelectorAll("[data-compare-table] tbody tr");

  const matches = (row, key, value) => {
    if (value === "any") return true;
    return row.getAttribute(`data-${key}`) === value;
  };

  const getNumber = (row, key) => {
    const raw = row.getAttribute(`data-${key}`);
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
  };

  const normalize = (value, min, max) => {
    if (max === min) return 0;
    return (value - min) / (max - min);
  };

  const update = () => {
    const volume = volumeEl.value;
    const material = materialEl.value;
    const accuracy = accuracyEl.value;
    const budget = budgetEl.value;
    const priority = priorityEl.value;
    const filteredRows = [];

    rows.forEach((row) => {
      const show =
        matches(row, "volume", volume) &&
        matches(row, "material", material) &&
        matches(row, "accuracy", accuracy) &&
        matches(row, "budget", budget);
      row.style.display = show ? "" : "none";
      if (show) {
        filteredRows.push(row);
      }
    });

    if (!filteredRows.length) return;

    const prices = filteredRows.map((row) => getNumber(row, "price"));
    const accuracies = filteredRows.map((row) => getNumber(row, "accuracy-val"));
    const cycles = filteredRows.map((row) => getNumber(row, "cycle"));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minAccuracy = Math.min(...accuracies);
    const maxAccuracy = Math.max(...accuracies);
    const minCycle = Math.min(...cycles);
    const maxCycle = Math.max(...cycles);

    filteredRows.forEach((row) => {
      const price = getNumber(row, "price");
      const accuracyVal = getNumber(row, "accuracy-val");
      const cycle = getNumber(row, "cycle");
      const priceScore = 1 - normalize(price, minPrice, maxPrice);
      const accuracyScore = 1 - normalize(accuracyVal, minAccuracy, maxAccuracy);
      const speedScore = 1 - normalize(cycle, minCycle, maxCycle);

      let score = 0;
      if (priority === "accuracy") {
        score = accuracyScore * 0.6 + speedScore * 0.25 + priceScore * 0.15;
      } else if (priority === "speed") {
        score = speedScore * 0.6 + accuracyScore * 0.25 + priceScore * 0.15;
      } else if (priority === "budget") {
        score = priceScore * 0.6 + accuracyScore * 0.25 + speedScore * 0.15;
      } else {
        score = accuracyScore * 0.45 + speedScore * 0.35 + priceScore * 0.2;
      }
      row.dataset.score = score.toFixed(4);
    });

    const tbody = document.querySelector("[data-compare-table] tbody");
    filteredRows
      .sort((a, b) => parseFloat(b.dataset.score) - parseFloat(a.dataset.score))
      .forEach((row) => tbody.appendChild(row));
  };

  [volumeEl, materialEl, accuracyEl, budgetEl, priorityEl].forEach((el) =>
    el.addEventListener("input", update)
  );
  update();
};

window.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  setupCalculator();
  setupContactForm();
  setupReveal();
  setupSelector();
  setupDecisionSurvey();
  setupComparisonFilters();
  setupPodborFilter();
});

const loadHeader = async () => {
  const headerElement = document.querySelector("header");
  if (!headerElement) return;

  try {
    const response = await fetch("header.html");
    if (!response.ok) {
      throw new Error(`Header not found: ${response.statusText}`);
    }
    const headerHTML = await response.text();
    headerElement.innerHTML = headerHTML;

    // Highlight active page link
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
    // Provide a fallback UI in case the header fails to load
    headerElement.innerHTML = "<div class='navbar'><div class='logo'>Finval • 2026</div><nav class='nav-links' style='color:red;'>Could not load navigation</nav></div>";
  }
};

const setupPodborFilter = () => {
  const form = document.getElementById("podborForm");
  if (!form) return;

  const resultEl = document.getElementById("podborResult");

  // Helper to parse messy string values into clean numbers
  const parsePodborValue = (value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value !== 'string' || value.trim() === '' || value.trim() === '—') {
      return 0;
    }
    // Take the first part of a complex string (e.g., "400 / 200 / 200" -> "400")
    // And remove all non-digit characters except for a decimal point.
    const cleanedString = value.split('/')[0].replace(/[^0-9.]/g, '').trim();
    const number = parseFloat(cleanedString);
    return Number.isFinite(number) ? number : 0;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultEl.innerHTML = `<p class="notice">Подбираем модель...</p>`;

    try {
      const response = await fetch("podbor.json");
      if (!response.ok) throw new Error("Could not load machine data.");

      const rawData = await response.json();

      // Clean and pre-process the data
      const machines = rawData
        .filter(item => item["Серия / Модель"] && item["Серия / Модель"].trim() !== "")
        .map(item => ({
          model: item["Серия / Модель"],
          type: item["Назначение / Тип обработки"],
          x: parsePodborValue(item["Перемещение X/Y/Z (мм)"]),
          power: parsePodborValue(item["Мощность шпинделя (кВт)"]),
          rpm: parsePodborValue(item["Частота вращения (об/мин)"]),
          load: parsePodborValue(item["Макс. нагрузка / Масса детали (кг)"]),
          raw: item // Keep raw data for display
        }));

      // Get user input
      const userInput = {
        x: getValue("podborX"),
        power: getValue("podborPower"),
        rpm: getValue("podborRpm"),
        load: getValue("podborLoad"),
      };
      
      // Filter candidates: must be >= user input in all specified fields
      const candidates = machines.filter(m => {
        return (userInput.x > 0 ? m.x >= userInput.x : true) &&
               (userInput.power > 0 ? m.power >= userInput.power : true) &&
               (userInput.rpm > 0 ? m.rpm >= userInput.rpm : true) &&
               (userInput.load > 0 ? m.load >= userInput.load : true);
      });

      if (candidates.length === 0) {
        resultEl.innerHTML = `<div class="notice">Не найдено моделей, удовлетворяющих всем вашим критериям. Попробуйте смягчить требования.</div>`;
        return;
      }

      // Score and find the best candidate
      const scoredCandidates = candidates.map(m => {
        let score = 0;
        if (userInput.x > 0) score += (m.x - userInput.x) / userInput.x;
        if (userInput.power > 0) score += (m.power - userInput.power) / userInput.power;
        if (userInput.rpm > 0) score += (m.rpm - userInput.rpm) / userInput.rpm;
        if (userInput.load > 0) score += (m.load - userInput.load) / userInput.load;
        return { ...m, score };
      });
      
      scoredCandidates.sort((a, b) => a.score - b.score);
      const bestMatch = scoredCandidates[0];

      // Display the result
      resultEl.innerHTML = `
        <div class="card">
          <h3>Рекомендованная модель: <span class="output">${bestMatch.model}</span></h3>
          <p>${bestMatch.type}</p>
          <table class="table" style="margin-top: 16px;">
            <thead>
              <tr>
                <th>Параметр</th>
                <th>Требование</th>
                <th>Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Перемещение X, мм</td><td>&ge; ${userInput.x || 'N/A'}</td><td><strong>${bestMatch.x}</strong></td></tr>
              <tr><td>Мощность, кВт</td><td>&ge; ${userInput.power || 'N/A'}</td><td><strong>${bestMatch.power}</strong></td></tr>
              <tr><td>Вращение, об/мин</td><td>&ge; ${userInput.rpm || 'N/A'}</td><td><strong>${bestMatch.rpm}</strong></td></tr>
              <tr><td>Нагрузка, кг</td><td>&ge; ${userInput.load || 'N/A'}</td><td><strong>${bestMatch.load}</strong></td></tr>
            </tbody>
          </table>
        </div>
      `;

    } catch (error) {
      console.error("Failed during machine selection:", error);
      resultEl.innerHTML = `<div class="notice" style="color: var(--copper);">Ошибка: Не удалось загрузить или обработать данные для подбора.</div>`;
    }
  });
};
