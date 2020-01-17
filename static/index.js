const browseInput = document.querySelectorAll(".inputUploadFile");
const progressInfo = document.querySelector(".progressInfo");
const downloadFile = document.querySelector(".downloadFile");
const progressBar = document.querySelector(".progressBar");

browseInput.forEach(e =>
  e.addEventListener("change", event => {
    const files = event.target.files[0];
    const formData = new FormData();
    formData.append("fileToUpload", files);
    const form = event.target.parentElement;

    const ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", () => ajaxComplete(form), false);
    ajax.addEventListener("abort", ajaxAbortHandler, false);
    ajax.addEventListener("error", ajaxErrorHandler, false);

    ajax.open("POST", "/upload");
    ajax.send(formData);
  })
);

downloadFile.addEventListener("click", event => {
  downloadFile.setAttribute("style", "display: none");
  progressInfo.textContent = "";
  progressBar.setAttribute("style", `width: 0`);
});

function progressHandler(event) {
  var percent = (event.loaded / event.total) * 100;
  percent = parseInt(percent);

  progressBar.setAttribute("style", `width: ${percent}%`);
  progressInfo.textContent = `${percent}% of data uploaded... please wait!`;
}

function ajaxComplete(element) {
  if (element.id === "sapArticles") {
    progressInfo.textContent =
      "All data imported. Please click below to process the result!";
    downloadFile.setAttribute("style", "display: block");
    progressBar.setAttribute("style", `width: 0`);
  } else {
    progressInfo.textContent = "Upload Completed!";
    element.setAttribute("style", "display: none");
    element.nextElementSibling.setAttribute("style", "display: block");
  }
}

function ajaxAbortHandler() {
  progressInfo.textContent = "Upload aborted!";
}

function ajaxErrorHandler() {
  progressInfo.textContent = "Upload failed!";
}

function editValues(event,index){
  const inStock = event.target.value;
  
  const ajax = new XMLHttpRequest();
  const formData = new FormData();

  const td = event.target.parentElement.parentElement.querySelectorAll("td");
  const orpakStock = td[4].textContent
  const difference = td[6];
  const differenceValue = Number(inStock) - Number(orpakStock);
  difference.textContent = differenceValue;
  
  const priceValue = td[7].textContent
  const amount = td[8]
  const amountValue = Number(priceValue) * Number(differenceValue);
  amount.textContent = amountValue.toFixed(2);

  index -= 1;
  formData.append("inStock", inStock);
  ajax.open("POST", "/index/" + index + "/inStock/" + inStock + "/difference/" + differenceValue + "/amount/" + amountValue);
  ajax.send(formData);
}