const apiUrl = "http://api.exchangeratesapi.io/v1";

function params(paramsObj) {
  return new URLSearchParams({
    access_key: "18b307333aefd4ec012fc91d03e783ec",
    ...paramsObj,
  });
}

async function getPlnRate(date = "latest") {
  const res = await fetch(`${apiUrl}/${date}?${params()}`);

  const data = await res.json();

  return Number(data.rates["PLN"]);
}

async function loadAndInsertLatestRates() {
  const [plnRate, res] = await Promise.all([getPlnRate(), fetch(`${apiUrl}/latest?${params()}`)]);

  const data = await res.json();

  // const rates = data.rates;
  const { rates } = data;
  const documentFragment = document.createDocumentFragment();

  for (const currency in rates) {
    const currencyToPlnRate = (rates[currency] / plnRate).toFixed(5);
    const li = document.createElement("li");
    li.textContent = `${currency}: ${currencyToPlnRate}`;
    li.setAttribute("data-currency", currency);
    documentFragment.appendChild(li);
  }

  const ul = document.querySelector("ul.rates");
  ul.innerHTML = "";
  ul.appendChild(documentFragment);

  const dataCurrency = document.querySelectorAll("[data-currency]");

  dataCurrency.forEach((currency) => {
    currency.addEventListener("click", (curr) => {
      document.querySelector("ul.specific-currency").innerHTML = "";
      getHistoricalRates(curr);
    });
  });
}

loadAndInsertLatestRates();

async function getHistoricalRates(curr) {
  const currencyValue = curr.target.getAttribute("data-currency");

  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  month = month.toString().padStart(2, "0");
  const year = date.getFullYear();

  for (let i = 0; i < 7; i++) {
    const currentDate = `${year}-${month}-${day}`;
    const [res, plnRate] = await Promise.all([
      fetch(`${apiUrl}/${currentDate}?${params({ symbols: currencyValue })}`),
      getPlnRate(currentDate),
    ]);

    const data = await res.json();

    const { rates } = data;
    const documentFragment = document.createDocumentFragment();

    const currency = Object.keys(rates)[0];
    const currencyToPlnRate = (rates[currency] / plnRate).toFixed(5);
    const li = document.createElement("li");
    li.textContent = `${currentDate}: ${currencyToPlnRate}`;
    documentFragment.appendChild(li);

    const ul = document.querySelector("ul.specific-currency");
    ul.appendChild(documentFragment);

    day -= 1;
  }
}
