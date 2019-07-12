let td = document.querySelectorAll('td');
let tr = document.querySelectorAll('tr');
let color = td[0].style.backgroundColor;
let targetColor = 'lightblue';
let sum = 0;
let selection = document.getElementById('selection'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
let selecting = false;
let data = [];

let ctx = document.getElementById('myChart');
let chartContainer = document.getElementById('chart-container');

function initSelectionModule() {
    enumerateCells();
    onmousedown = function(e) {
        e.preventDefault();
        selecting = true;
        selection.hidden = 0;
        x1 = e.clientX; 
        y1 = e.clientY;
        reCalc();
    };
    onmousemove = function(e) {
        e.preventDefault();
        x2 = e.clientX; 
        y2 = e.clientY;
        if (selecting) reCalc();
        else {
            let point = getCellFromScreen(x2, y2);
            if (point.style.backgroundColor == targetColor 
                && chartContainer.style.opacity == 0) drawChart();
            else if (point.style.backgroundColor == color) hideChart();
        }
    };
    onmouseup = function(e) {
        e.preventDefault();
        selection.hidden = 1;
        selecting = false;
    };

}

function enumerateCells() {
    let i = 0;
    for (let row of tr) {
        for (let cell of row.cells) {
            cell.customIndex = i;
            i++;
        }
    }
}

function getCellFromScreen(x, y) {
    let arr = document.elementsFromPoint(x, y);
    for (let el of arr) if (el.nodeName == 'TD') {
        return el;
    } 
    return document.getElementById('magic'); // 'magic' is a hidden block with value 0
}

function deselectAll() {
    td.forEach(x => x.style.backgroundColor = color);
    data = [];
    sum = 0;
    document.getElementById('sum').innerHTML = sum;
}

function selectCell(el) {
    if (el.tagName == 'TD' && el.style.backgroundColor == color) {
        let cellValue = parseFloat(el.innerHTML);
        el.style.backgroundColor = targetColor;
        sum += cellValue;
        document.getElementById('sum').innerHTML = sum;
        data.push({
            customIndex: el.customIndex,
            customValue: cellValue
        });
    } 
}

function reCalc() {
    deselectAll();
    let x3 = Math.min(x1,x2); 
    let x4 = Math.max(x1,x2);
    let y3 = Math.min(y1,y2); 
    let y4 = Math.max(y1,y2); 
    drawRectangle(x3, y3, x4-x3, y4-y3);
    findInnings(x3, y3, x4, y4);
}

function drawRectangle(left, top, right, bottom) {
    selection.style.left = left + 'px';
    selection.style.top = top + 'px';
    selection.style.width = right + 'px';
    selection.style.height = bottom + 'px';
}

function findInnings(left, top, right, bottom) {
    for (let x = left; x <= right; x += 5) {
        for (let y = top; y <= bottom; y += 5) {
            let cell = getCellFromScreen(x, y);
            selectCell(cell);
        }
    }
}

function drawChart() {
    if (data.length == 0) return;
    chartContainer.style.opacity = 1;
    let chartableData = formatData(data);
    let XAxis = generateXAxis(chartableData);
    let YStart = Math.min(...chartableData);

    let lineData = {
        labels: XAxis,
        datasets: [{
            data: chartableData,
        }]
    };
    let lineOptions = {
        animation: {
            duration: 0
        },
        events: [],
        plugins: {
            datalabels: {
                backgroundColor: targetColor,
                borderRadius: 50
            }
        },
        elements: {
            line: {
                tension: 0
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: YStart
                }
            }],
            xAxes: [{
                offset: false
            }]
        },
        legend: {
            display: false,
        }
    }

    let myLineChart = new Chart(ctx, {
        type: 'line',
        data: lineData,
        options: lineOptions
    });
}

function hideChart() {
    chartContainer.style.opacity = 0;
}

function formatData(dataset) {
    let datasetCopy = [...dataset];
    let result = [];
    let latestIndex = 0;
    while (datasetCopy.length > 0) {
        for (let obj of datasetCopy) {
            if (obj.customIndex == latestIndex) {
                result.push(obj.customValue);
                for (let i = 0; i < datasetCopy.length; i++){ // removing element from initial array
                    if (datasetCopy[i] === obj) {
                        datasetCopy.splice(i, 1); 
                        i--;
                    }
                }
            }
        }
        latestIndex++;
    }
    return result;    
}

function generateXAxis(dataset) {
    return Array.from(Array(dataset.length), (x,i) => i+1) 
}

initSelectionModule();