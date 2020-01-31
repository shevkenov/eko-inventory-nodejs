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

  index -= 1;
  formData.append("inStock", inStock);
  ajax.open(
    "POST",
    "/index/" +
      index +
      "/inStock/" +
      inStock +
      "/difference/" +
      differenceValue
  );
  ajax.send(formData);
}
