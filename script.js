const form = document.getElementById("form"),
  input = document.getElementById("input"),
  output = document.getElementById("output"),
  card = document.getElementById("card"),
  popup = document.getElementById("popup"),
  background = document.getElementById("background");

const reset = document.getElementById("reset"),
  save = document.getElementById("save"),
  copyButton = document.getElementById("copy"),
  keyInput = document.getElementById("keyInput"),
  keyButton = document.getElementById("keyButton"),
  temperatureInput = document.getElementById("temperatureInput"),
  temperatureLabel = document.getElementById("temperatureLabel"),
  lengthInput = document.getElementById("lengthInput"),
  lengthLabel = document.getElementById("lengthLabel"),
  ada = document.getElementById("ada"),
  babbage = document.getElementById("babbage"),
  curie = document.getElementById("curie"),
  davinci = document.getElementById("davinci");

async function generate() {
  await lastUsed();
  const uses = readCookie("uses") ? Number(readCookie("uses")) : false;
  if (!uses) createCookie("uses", 0);
  const key = localStorage.getItem("key");
  const model = localStorage.getItem("model");
  const temperature = localStorage.getItem("temperature");
  const length = localStorage.getItem("length");
  if (25 > uses || key) {
    if (window.innerWidth > 750) input.focus();

    output.value = "Generating...";

    const prompt = input.value;

    const json = await (
      await fetch(
        `https://rmx-grp-hub.glitch.me/ai?prompt=${prompt}${
          key ? "&key=" + key : ""
        }&model=${model || "babbage"}&temperature=${
          temperature || 0.3
        }&length=${length || 200}`
      )
    ).json();

    if (json.error) {
      output.value = json.error;
      copyButton.setAttribute("disabled", "");
    } else {
      output.value = json.data;
      copyButton.removeAttribute("disabled");
      createCookie("uses", uses + 1);
    }
  } else {
    output.value = "You have used your 25 daily credits.";
    copyButton.setAttribute("disabled", "");
  }
}

document.body.addEventListener(
  
  "keydown",
  function (event) {    
    const key = event.which || event.keyCode;

    const ctrl = event.ctrlKey ? event.ctrlKey : key === 17 ? true : false;
    const cmd = event.metaKey ? event.metaKey : key === 91 ? true : false;

    if (key == 75 && (ctrl || cmd)) {
      event.preventDefault();
      generate();
    } 
  },
  false
);

if (readCookie("card") !== "hidden") {
  setTimeout(() => {
    /*card.setAttribute("class", "shown");*/
  }, 2000);
}

function hideCard() {
  card.setAttribute("class", "hidden");
  createCookie("card", "hidden", 7);
}

function closeCard() {
  card.setAttribute("class", "hidden");
}

function saveConfig() {
  localStorage.setItem("key", keyButton.getAttribute("key") || "");

  const models = ["ada", "babbage", "curie", "davinci"];
  let model;
  models.forEach((id) => {
    if (document.getElementById(id).getAttribute("selected") !== null)
      model = id;
  });
  localStorage.setItem("model", model || "babbage");

  localStorage.setItem("temperature", Number(temperatureInput.value) / 100);

  localStorage.setItem("length", Number(lengthInput.value) * 5);

  background.setAttribute("class", "hidden");
  popup.setAttribute("class", "hidden");
  document.body.setAttribute("class", "");
}

function openConfig() {
  const key = localStorage.getItem("key");
  if (key) {
    keyInput.value = key;
    keyButton.setAttribute("key", key);

    keyChange(true);
  }

  const model = localStorage.getItem("model");
  if (model) select(model);

  const temperature = localStorage.getItem("temperature");
  if (temperature) {
    temperatureInput.value = Number(temperature) * 100;
    temperatureLabel.innerText = Number(temperature).toFixed(2);
  }

  const length = localStorage.getItem("length");
  if (length) {
    lengthInput.value = Number(length) / 5;
    lengthLabel.innerText = Number(length);
  }

  background.setAttribute("class", "shown-none");
  popup.setAttribute("class", "shown-none");
  document.body.setAttribute("class", "no-scroll");
}

function copy() {
  const notyf = new Notyf({
    duration: 3000,
    ripple: false,
    position: { x: "center", y: "bottom" },
    dismissible: false,
  });
  
  const element = document.createElement("INPUT");
  element.setAttribute("value", output.value);
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  element.remove();
  
  notyf.success("Output copied to clipboard!");
}

async function setKey() {
  const apiKey = keyInput.value;

  keyButton.innerText = "Checking key...";

  const json = await (
    await fetch(`https://api.openai.com/v1/engines`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  ).json();

  const valid = !json.error;

  if (!apiKey) {
    keyChange(false);
    keyButton.setAttribute("key", "");
    keyButton.innerText = "API key reset to default.";
  } else if (valid === true) {
    keyChange(true);
    keyButton.setAttribute("key", apiKey);
    keyButton.innerText = "API key set!";
  } else {
    keyChange(false);
    keyButton.setAttribute("key", "");
    keyButton.innerText = "Invalid API key - reset to default.";
  }
  setTimeout(() => {
    keyButton.innerText = "Set";
  }, 2500);
}

function select(item) {
  let models = ["ada", "babbage", "curie", "davinci"];

  const index = models.indexOf(item);

  if (index < 0) return;

  models.splice(index, 1);

  models.forEach((id) => {
    document.getElementById(id).removeAttribute("selected");
  });

  document.getElementById(item).setAttribute("selected", "");
}

function keyChange(added) {
  if (added === true) {
    lengthInput.setAttribute("max", "400");
    curie.removeAttribute("disabled");
    davinci.removeAttribute("disabled");
  } else {
    lengthInput.setAttribute("max", "40");
    curie.setAttribute("disabled", "");
    davinci.setAttribute("disabled", "");
  }
}

reset.onclick = resetConfig;

function resetConfig() {
  keyInput.value = "";
  keyButton.removeAttribute("key");
  keyChange(false);

  select("babbage");

  temperatureInput.value = 30;
  temperatureLabel.innerText = "0.30";

  lengthInput.value = 40;
  lengthLabel.innerText = "200";
}

document.onkeydown = function (evt) {
  evt = evt || window.event;
  var isEscape = false;
  if ("key" in evt) {
    isEscape = evt.key === "Escape" || evt.key === "Esc";
  } else {
    isEscape = evt.keyCode === 27;
  }
  if (isEscape) {
    saveConfig();
  }
};

function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name + "=" + value + expires + ";";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const isToday = (date) => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
  );
  const last = new Date(date);
  return (
    last.getDate() === now.getDate() &&
    last.getMonth() === now.getMonth() &&
    last.getFullYear() === now.getFullYear()
  );
};

function lastUsed() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
  ).getTime();
  const last = readCookie("lastused") ? Number(readCookie("lastused")) : false;

  if (!last) return createCookie("lastused", now);

  if (!isToday(last)) createCookie("uses", 0);

  return createCookie("lastused", now);
}
