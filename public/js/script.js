const dropdownButton = document.getElementById('dropdownButton');
            const dropdownMenu = document.getElementById('dropdownMenu');
            dropdownButton.addEventListener('click', function(event) {
                event.stopPropagation();
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
            document.addEventListener('click', function() {
                dropdownMenu.style.display = 'none';
            });


// animejs below

const { animate, utils, createDraggable, createSpring, stagger } = anime;


const GRID_SELECTOR = '.grid';
const ROW_CLASS = 'row';
const SQUARE_CLASS = 'square';
const SQUARE_MAIN_CLASS = 'squaremain';
const MIN_SQUARE_SIZE = 30; // px, matches max-width in CSS

// This variable will always contain the current grid dimensions: [columns, rows]
let gridDimensions = [0, 0];

function calculateColumns() {
    const viewportWidth = window.innerWidth;
    return Math.max(1, Math.floor(viewportWidth / MIN_SQUARE_SIZE));
}

function createGridElements() {
    const gridElement = document.querySelector(GRID_SELECTOR);
    if (!gridElement) return;

    // Remove existing rows
    while (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
    }

    const columns = calculateColumns();
    const rows = columns; // To keep grid square

    // Update gridDimensions variable
    gridDimensions = [columns, rows];

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const rowElement = document.createElement('div');
        rowElement.className = ROW_CLASS;
        rowElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        for (let colIndex = 0; colIndex < columns; colIndex++) {
            const square = document.createElement('div');
            square.className = SQUARE_CLASS;

            const squareMain = document.createElement('div');
            squareMain.className = SQUARE_MAIN_CLASS;

            square.appendChild(squareMain);
            rowElement.appendChild(square);
        }
        gridElement.appendChild(rowElement);
    }
}

// Initial grid creation
createGridElements();

// Recreate grid on resize
window.addEventListener('resize', () => {
    createGridElements();
});



const $squares = utils.$('.squaremain');

function animateSquares() {
    animate(
        $squares,
        {
            scale: [
                { to: [0, 1]},
                { to: 0}
            ],
            boxShadow: [
                { to: '0 0 10px 0 #E54B4B'},
                { to: '0 0 0 0 #E54B4B'}
            ],
            delay: stagger(100,
                {
                    grid: gridDimensions,
                    from : utils.random(0, gridDimensions[0] * gridDimensions[1] - 1),
                }
            ),
            onComplete: animateSquares,
        }
    )
}

animateSquares();
