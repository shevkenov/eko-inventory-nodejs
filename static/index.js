const uploadFiles = document.querySelector(".inputUploadFile");
const progressInfo = document.querySelector(".notification-heading");

uploadFiles.addEventListener("click", event => {
  progressInfo.textContent = 'Моля изчакайте информацията се обработва .....!'
});

function editValues(event, index) {
  const inStock = event.target.value;

  const ajax = new XMLHttpRequest();
  const formData = new FormData();

  const td = event.target.parentElement.parentElement.querySelectorAll("td");
  const orpakStock = td[4].textContent;
  const difference = td[6];
  const differenceValue = Number(inStock) - Number(orpakStock);
  difference.textContent = differenceValue;

  const priceValue = td[7].textContent;
  const amount = td[8];
  const amountValue = Number(priceValue) * Number(differenceValue);
  amount.textContent = amountValue.toFixed(2);

  index -= 1;
  formData.append("inStock", inStock);
  ajax.open(
    "POST",
    "/index/" +
      index +
      "/inStock/" +
      inStock +
      "/difference/" +
      differenceValue +
      "/amount/" +
      amountValue
  );
  ajax.send(formData);
}
