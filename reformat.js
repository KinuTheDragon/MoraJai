function reformat() {
    for (let colorable of document.querySelectorAll("[data-color]")) {
        let color = COLORS[colorable.getAttribute("data-color")];
        colorable.style.setProperty("--color", color);
        colorable.style.backgroundColor = color;
        colorable.style.color = isLight(color) ? "#000" : "#fff";
    }

    for (let symbolable of document.querySelectorAll("[data-symbol]")) {
        let symbol = symbolFromColor(symbolable.getAttribute("data-symbol"), symbolable.getAttribute("data-symfill"));
        while (symbolable.firstChild) symbolable.removeChild(symbolable.firstChild);
        symbolable.appendChild(symbol);
    }
}

reformat();