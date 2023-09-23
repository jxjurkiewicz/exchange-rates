let url = "http://api.exchangeratesapi.io/v1";

function params(paramsObj) {
  return new URLSearchParams({
    access_key: "ad7080edebef089173c4c0cf016f29c0",
    ...paramsObj,
  });
}

function getPlnRate(options) {
  fetch(`${url}/latest?${params(options)}`)
    .then((res) => res.json())
    .then((data) => {
      return Number(data.rates["PLN"]);
    });
}

function getLatest(options) {
  fetch(`${url}/latest?${params(options)}`)
    .then((res) => res.json())
    .then((data) => (data = data.rates))
    .then((data) => {
      for (const property in data) {
        let calculatedToPln = data[property] * getPlnRate();

        const markup = `<li>${property}: ${calculatedToPln}</li>`;

        document.querySelector("ul.rates").insertAdjacentHTML("beforeend", markup);
      }
    })
    .catch((error) => console.log(error));
}

getLatest();
