const COLORS = {
    gray: "#52595f",
    white: "#d5dce2",
    yellow: "#d9d533",
    orange: "#c2792d",
    violet: "#882496",
    red: "#98232b",
    green: "#1e8d2b",
    black: "#1e272e",
    pink: "#d88cdd",
    blue: "#1c73c3"
};

function isLight(hexColor) {
    let components = [...hexColor.slice(1).match(/../g)].map(x => parseInt(x, 16));
    let [r, g, b] = components.map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.179;
}