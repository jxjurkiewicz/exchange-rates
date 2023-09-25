const apiUrl = "http://api.exchangeratesapi.io/v1";
const apiAccessKey = "18b307333aefd4ec012fc91d03e783ec";

function params(paramsObj) {
  return new URLSearchParams({
    access_key: apiAccessKey,
    ...paramsObj,
  });
}

async function getRates(date = "latest") {
  // Api returns rate in EUR, we have to convert it to PLN
  const res = await fetch(`${apiUrl}/${date}?${params()}`);
  const data = await res.json();

  const ratesInEur = data.rates;
  const rates = {};
  const euroRate = Number(data.rates["PLN"]);

  for (const currencyKey in ratesInEur) {
    if (currencyKey === "PLN") {
      continue;
    }
    if (currencyKey === "EUR") {
      rates[currencyKey] = euroRate.toFixed(4);
      continue;
    }

    const valueInEur = Number(ratesInEur[currencyKey]);
    rates[currencyKey] = ((1 / valueInEur) * euroRate).toFixed(4);
  }

  return rates;
}

async function loadLatestRates() {
  const rates = await getRates("latest");

  const documentFragment = document.createDocumentFragment();
  for (const currencyKey in rates) {
    const li = document.createElement("li");
    li.textContent = `${currencyKey}: ${rates[currencyKey]}`;
    li.setAttribute("data-currency", currencyKey);
    documentFragment.appendChild(li);
  }

  const ul = document.querySelector("ul.rates");
  ul.innerHTML = "";
  ul.appendChild(documentFragment);

  document.querySelectorAll("[data-currency]").forEach((currencyEl) => {
    const currencyKey = currencyEl.getAttribute("data-currency");
    currencyEl.addEventListener("click", () => displayHistoricalRates(currencyKey));
  });
}

async function getHistoricalRate(date, currencyKey) {
  // Api returns rate in EUR, we have to convert it to PLN
  const res = await fetch(`${apiUrl}/${date}?${params({ symbols: [currencyKey, "PLN"] })}`);
  const data = await res.json();

  return ((1 / data.rates[currencyKey]) * data.rates["PLN"]).toFixed(4);
}

async function displayHistoricalRates(currencyKey) {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  month = month.toString().padStart(2, "0");
  const year = date.getFullYear();

  const dates = [];
  const promises = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = `${year}-${month}-${day}`;
    dates.push(currentDate);
    promises.push(getHistoricalRate(i === 0 ? "latest" : currentDate, currencyKey));
    day -= 1;
  }

  const historicalRates = await Promise.all(promises);

  const documentFragment = document.createDocumentFragment();
  dates.forEach((date, index) => {
    const li = document.createElement("li");
    li.textContent = `${date}: ${historicalRates[index]}`;
    documentFragment.appendChild(li);
  });

  const ul = document.querySelector("ul.specific-currency");
  ul.innerHTML = "";
  ul.appendChild(documentFragment);
}

loadLatestRates();
