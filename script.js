const apiUrl = "http://api.exchangeratesapi.io/v1";

function params(paramsObj) {
  return new URLSearchParams({
    access_key: "ad7080edebef089173c4c0cf016f29c0",
    ...paramsObj,
  });
}

async function getPlnRate(date) {
  try {
    let res;
    if (date) {
      res = await fetch(`${apiUrl}/${date}?${params()}`);
    } else {
      res = await fetch(`${apiUrl}/latest?${params()}`);
    }
    const data = await res.json();
    return Number(data.rates["PLN"]);
  } catch (error) {
    console.log(error);
  }
}

async function loadAndInsertLatestRates() {
  try {
    const [plnRate, res] = await Promise.all([getPlnRate(), fetch(`${apiUrl}/latest?${params()}`)]);
    const data = await res.json();
    // const rates = data.rates;
    const { rates } = data;

    let documentFragment = document.createDocumentFragment();

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
      currency.addEventListener("click", (curr) => getHistoricalRates(curr));
    });
  } catch (error) {
    console.log(error);
  }
}

loadAndInsertLatestRates();

async function getHistoricalRates(curr) {
  const currencyValue = curr.target.getAttribute("data-currency");

  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  month = month.toString().padStart(2, "0");
  let year = date.getFullYear();
  let currentDate = `${year}-${month}-${day}`;

  const [res, plnRate] = await Promise.all([
    fetch(`${apiUrl}/2023-09-20?${params({ symbols: currencyValue })}`),
    getPlnRate(currentDate),
  ]);

  const data = await res.json();
  const { rates } = data;
  for (const currency in rates) {
    const currencyToPlnRate = (rates[currency] / plnRate).toFixed(5);
    console.log(currencyToPlnRate);
  }

  return console.log(data);
}

// TO-DO: Naprawić funkcje getPlnRate(), zeby mozna bylo przekazac jako argument date
