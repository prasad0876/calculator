const display = document.getElementById("display");
const history = document.getElementById("history");
const keys = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

function formatExpression(value) {
  return value.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−");
}

function updateDisplay(value = expression || "0") {
  display.value = value;
}

function clearCalculator() {
  expression = "";
  history.textContent = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (justCalculated) {
    clearCalculator();
    return;
  }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function isOperator(char) {
  return ["+", "-", "*", "/", "%"].includes(char);
}

function appendValue(value) {
  if (justCalculated) {
    expression = "";
    justCalculated = false;
    history.textContent = "";
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).pop();
    if (currentNumber.includes(".")) return;
    if (!currentNumber) expression += "0";
  }

  if (isOperator(value)) {
    if (!expression && value !== "-") return;
    const last = expression.at(-1);
    if (isOperator(last)) {
      expression = expression.slice(0, -1) + value;
      updateDisplay(formatExpression(expression));
      return;
    }
  }

  expression += value;
  updateDisplay(formatExpression(expression));
}

function calculate() {
  if (!expression) return;

  let sanitized = expression;
  if (isOperator(sanitized.at(-1))) {
    sanitized = sanitized.slice(0, -1);
  }

  if (!sanitized) return;

  try {
    // Basic calculator input is restricted to digits/operators before evaluation.
    if (!/^[0-9+\-*/%.()\s]+$/.test(sanitized)) throw new Error("Invalid input");

    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!Number.isFinite(result)) throw new Error("Invalid result");

    const rounded = Number.parseFloat(result.toFixed(12));
    history.textContent = formatExpression(sanitized) + " =";
    expression = String(rounded);
    justCalculated = true;
    updateDisplay(rounded);
  } catch {
    history.textContent = "Invalid expression";
    expression = "";
    justCalculated = false;
    updateDisplay("Error");
  }
}

function handleAction(action) {
  if (action === "clear") clearCalculator();
  if (action === "delete") deleteLast();
  if (action === "equals") calculate();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 120);

  const { action, value } = button.dataset;
  if (action) {
    handleAction(action);
  } else {
    appendValue(value);
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) appendValue(key);
  else if (["+", "-", "*", "/", "%"].includes(key)) appendValue(key);
  else if (key === "Enter" || key === "=") calculate();
  else if (key === "Backspace") deleteLast();
  else if (key === "Escape" || key === "Delete") clearCalculator();

  const target = [...document.querySelectorAll(".key")].find(
    (button) => button.dataset.value === key || (key === "Enter" && button.dataset.action === "equals")
  );
  if (target) {
    target.classList.add("pressed");
    setTimeout(() => target.classList.remove("pressed"), 120);
  }
});