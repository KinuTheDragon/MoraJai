const CODE = {
    "-": "gray",
    w: "white",
    y: "yellow",
    o: "orange",
    v: "violet",
    r: "red",
    g: "green",
    k: "black",
    p: "pink",
    b: "blue"
};
const ANTICODE = {};
for (let k in CODE) ANTICODE[CODE[k]] = k;

let isMobile = (function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
})();
if (isMobile) document.body.classList.add("no-transition");

let puzzleData = null;
let initialState = null;
let isEditMode = false;
let randomSolution = null;
let isMuted = document.getElementById("mute").checked;

let puzzleElement = document.getElementById("puzzle");
let editColorElement = document.getElementById("editColor");

document.getElementById("mute").addEventListener("change", e => {isMuted = e.target.checked;});

for (let color in COLORS) {
    let opt = document.createElement("option");
    opt.appendChild(document.createTextNode(color[0].toUpperCase() + color.slice(1)));
    opt.value = color;
    editColorElement.appendChild(opt);
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function setLink(code) {
    history.replaceState({}, "", "?" + code);
}

function updateURL() {
    setLink(
        puzzleData.corners.map(x => ANTICODE[x.color]).join("") +
        puzzleData.tiles.map(x => x.map(y => ANTICODE[y])).flat().join("")
    );
}

function toggleEdit() {
    isEditMode = !isEditMode;
    document.getElementById("editToggle").innerText = `Switch to ${isEditMode ? "play" : "edit"} mode`;
    document.getElementById("editColor").disabled = !isEditMode;
    document.getElementById("resetButton").disabled = isEditMode;
    if (isEditMode) {
        puzzleData.corners.forEach(x => {x.lit = false;});
        displayPuzzle();
    } else {
        updateURL();
    }
}

function playSound(sound) {
    if (!isMuted) new Audio(sound).play();
}

function loadPuzzle(code) {
    code = code.toLowerCase();
    if (!/^[-wyovrgkpb]{13}$/.test(code)) return;
    let tiles1d = [...code.slice(4)].map(x => CODE[x]);
    puzzleData = {
        corners: [...code.slice(0, 4)].map(x => ({color: CODE[x], lit: false})),
        tiles: [0, 1, 2].map(x => tiles1d.slice(3 * x, 3 * x + 3))
    }
    initialState = copy(puzzleData);
    randomSolution = null;
    displayPuzzle();
    updateURL();
}

function resetPuzzle() {
    puzzleData = copy(initialState);
    displayPuzzle();
}

function generateRandomPuzzle() {
    let possibleColors = Object.values(CODE);
    let flatTiles = Array.from({length: 9}).fill(0).map(() => possibleColors[Math.floor(Math.random() * possibleColors.length)]);
    let tiles = [0, 1, 2].map(x => flatTiles.slice(3 * x, 3 * x + 3));
    puzzleData = {tiles, corners: Array.from({length: 4}).fill(0).map(() => ({color: "gray", lit: false}))};
    let initialTiles = copy(tiles);
    randomSolution = [];
    for (let i = 0; i < Math.floor(Math.random() * 20) + 10; i++) {
        for (let attempt = 0; attempt < 10; attempt++) {
            let r = Math.floor(Math.random() * 3);
            let c = Math.floor(Math.random() * 3);
            let didSomething = clickTile(r, c, false);
            if (didSomething) {
                randomSolution.push({r, c});
                break;
            }
        }
    }
    let corners = [puzzleData.tiles[0][0], puzzleData.tiles[0][2], puzzleData.tiles[2][0], puzzleData.tiles[2][2]];
    puzzleData = {tiles: initialTiles, corners: corners.map(x => ({color: x, lit: false}))};
    initialState = copy(puzzleData);
    updateURL();
    displayPuzzle();
}

function clickCorner(cornerIndex) {
    if (isEditMode) {
        puzzleData.corners[cornerIndex].color = editColorElement.value;
        displayPuzzle();
        updateURL();
        return;
    }
    playSound("click.ogg");
    let row = cornerIndex > 1 ? 2 : 0;
    let col = cornerIndex % 2 ? 2 : 0;
    let thisCorner = puzzleData.corners[cornerIndex];
    let thisTileColor = puzzleData.tiles[row][col];
    if (thisCorner.color === thisTileColor) thisCorner.lit = true;
    else resetPuzzle();
    displayPuzzle();
}

function clickTile(row, col, shouldPlaySound) {
    if (isEditMode) {
        puzzleData.tiles[row][col] = editColorElement.value;
        displayPuzzle();
        updateURL();
        return;
    }
    if (shouldPlaySound) playSound("click.ogg");
    let thisTileColor = puzzleData.tiles[row][col];
    let didSomething = performTileAction(row, col, thisTileColor);
    displayPuzzle();
    return didSomething;
}

function isInBounds(row, col) {
    return 0 <= row && row <= 2 && 0 <= col && col <= 2;
}

function adjacents(row, col) {
    return [[-1, 0], [1, 0], [0, -1], [0, 1]]
        .map(([roff, coff]) => [row + roff, col + coff])
        .filter(([r, c]) => isInBounds(r, c));
}

function surrounding(row, col) {
    return [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]]
        .map(([roff, coff]) => [row + roff, col + coff])
        .filter(([r, c]) => isInBounds(r, c));
}

function doCornerCheck(row, col) {
    if (row === 1 || col === 1) return;
    let tileColor = puzzleData.tiles[row][col];
    let cornerIndex = row + col / 2;
    if (puzzleData.corners[cornerIndex].color !== tileColor)
        puzzleData.corners[cornerIndex].lit = false;
}

function setTileColor(row, col, color) {
    if (!isInBounds(row, col)) return;
    puzzleData.tiles[row][col] = color;
    doCornerCheck(row, col);
}

function swapTiles(r1, c1, r2, c2) {
    if (!isInBounds(r1, c1) || !isInBounds(r2, c2)) return;
    let tileColor1 = puzzleData.tiles[r1][c1];
    let tileColor2 = puzzleData.tiles[r2][c2];
    setTileColor(r1, c1, tileColor2);
    setTileColor(r2, c2, tileColor1);
}

function performTileAction(row, col, color) {
    let thisTileColor = puzzleData.tiles[row][col];
    switch (color) {
        case "gray":
            return false;
        case "white":
            for (let [toggleRow, toggleCol] of adjacents(row, col).concat([[row, col]])) {
                let currentColor = puzzleData.tiles[toggleRow][toggleCol];
                let newColor = currentColor;
                if (currentColor === "gray") newColor = thisTileColor;
                if (currentColor === thisTileColor) newColor = "gray";
                setTileColor(toggleRow, toggleCol, newColor);
            }
            return true;
        case "yellow":
            swapTiles(row, col, row - 1, col);
            return row > 0 && puzzleData.tiles[row][col] !== "yellow";
        case "orange":
            let adjacentColors = adjacents(row, col).map(([r, c]) => puzzleData.tiles[r][c]);
            let counts = {};
            for (let adj of adjacentColors) {
                if (counts[adj] === undefined) counts[adj] = 0;
                counts[adj]++;
            }
            let maxCount = Math.max(...Object.values(counts));
            let maxColors = Object.keys(counts).filter(x => counts[x] === maxCount);
            if (maxColors.length === 1) setTileColor(row, col, maxColors[0]);
            return maxColors.length === 1 && maxColors[0] !== "orange";
        case "violet":
            swapTiles(row, col, row + 1, col);
            return row < 2 && puzzleData.tiles[row][col] !== "violet";
        case "red":
            let anyChanged = false;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let tileColor = puzzleData.tiles[r][c];
                    if (tileColor === "white") setTileColor(r, c, "black");
                    else if (tileColor === "black") setTileColor(r, c, "red");
                    else continue;
                    anyChanged = true;
                }
            }
            return anyChanged;
        case "green":
            swapTiles(row, col, 2 - row, 2 - col);
            return puzzleData.tiles[row][col] !== "green";
        case "black":
            let rowColors = puzzleData.tiles[row].slice();
            for (let c = 0; c < 3; c++) {
                let newColor = rowColors[(c + 2) % 3];
                setTileColor(row, c, newColor);
            }
            return !rowColors.every(x => x === "black");
        case "pink":
            let surroundingPositions = surrounding(row, col);
            let surroundingColors = surroundingPositions.map(([r, c]) => puzzleData.tiles[r][c]);
            surroundingColors.unshift(surroundingColors.pop());
            for (let i = 0; i < surroundingPositions.length; i++)
                setTileColor(...surroundingPositions[i], surroundingColors[i]);
            return !surroundingColors.every(x => x === surroundingColors[0]);
        case "blue":
            let centerTile = puzzleData.tiles[1][1];
            if (centerTile !== "blue") return performTileAction(row, col, centerTile);
            else return false;
    }
}

function displayPuzzle() {
    while (puzzleElement.firstChild) puzzleElement.removeChild(puzzleElement.firstChild);
    let isComplete = puzzleData && puzzleData.corners.every(x => x.lit);
    let eventListener = "ontouchend" in window ? "touchend" : "click";
    for (let i = 0; i < 3; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 3; j++) {
            let cell = document.createElement("td");
            if (i !== 1 && j !== 1) {
                if (puzzleData) {
                    let cornerIndex = i + j / 2;
                    let div = document.createElement("div");
                    div.setAttribute("data-symbol", puzzleData.corners[cornerIndex].color);
                    if (puzzleData.corners[cornerIndex].lit) div.setAttribute("data-symfill", "true");
                    cell.appendChild(div);
                    if (!isComplete) cell.addEventListener(eventListener, () => clickCorner(cornerIndex));
                }
                cell.classList.add("corner-" + (i ? "d" : "u") + (j ? "r" : "l"), "corner");
            }
            row.appendChild(cell);
        }
        puzzleElement.appendChild(row);
    }
    let puzzleGrid = document.createElement("table");
    puzzleGrid.id = "grid";
    for (let i = 0; i < 3; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 3; j++) {
            let cell = document.createElement("td");
            cell.classList.add("tile");
            if (i !== 1 && j !== 1) {
                cell.classList.add("corner-tile-" + (i ? "d" : "u") + (j ? "r" : "l"), "corner-tile");
            }
            if (puzzleData) {
                cell.setAttribute("data-color", puzzleData.tiles[i][j]);
                if (!isComplete) cell.addEventListener(eventListener, () => clickTile(i, j, true));
            }
            row.appendChild(cell);
        }
        puzzleGrid.appendChild(row);
    }
    puzzleElement.children[1].children[1].appendChild(puzzleGrid);
    if (isComplete) {
        setTimeout(() => puzzleElement.classList.add("complete"), 0);
        document.getElementById("puzzle-border").classList.add("complete");
        playSound("win.ogg");
    } else {
        setTimeout(() => puzzleElement.classList.remove("complete"), 0);
        document.getElementById("puzzle-border").classList.remove("complete");
    }
    document.getElementById("randomSolution").innerText =
        randomSolution ? randomSolution.map(x => "⌜⌃⌝<⌾>⌞⌄⌟"[x.r * 3 + x.c]).join("") : "N/a";
    if (randomSolution) document.getElementById("randomSolution").classList.add("spoiler");
    reformat();
}

loadPuzzle(location.search.replace(/^\?/, ""));
if (!puzzleData) loadPuzzle("-------------");
displayPuzzle();