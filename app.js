// Estado de la aplicación
let board = null;
let game = null;
let currentPuzzle = null;
let solutionMoves = [];
let currentMoveIndex = 0;

// Datos curiosos sobre ajedrez
const chessTrivia = [
    "🏆 El match más largo de la historia fue entre Nikolic y Arsovic en 1989, con 269 movimientos y duró más de 20 horas.",
    "🎯 El número de posibles posiciones únicas de ajedrez se estima en 10^120, más que el número de átomos en el universo observable.",
    "👑 La palabra 'jaque mate' proviene del persa 'Shah Mat', que significa 'el rey está muerto'.",
    "⚡ El movimiento más rápido registrado en una partida oficial fue de 0.15 segundos por el GM Hikaru Nakamura.",
    "🌍 Bobby Fischer exigió que su match del Campeonato Mundial de 1972 tuviera cámaras especiales porque creía que los soviéticos lo estaban 'atacando' con rayos.",
    "🎨 Marcel Duchamp, el famoso artista del dadaísmo, abandonó el arte durante años para dedicarse al ajedrez profesional.",
    "📚 El segundo libro impreso en inglés fue sobre ajedrez: 'Game and Playe of the Chesse' de William Caxton en 1474.",
    "🤖 Deep Blue de IBM derrotó al campeón mundial Garry Kasparov en 1997, marcando un hito en la inteligencia artificial.",
    "👁️ Los grandes maestros pueden recordar las posiciones de miles de partidas, pero no mejor que una persona promedio para posiciones aleatorias.",
    "⏱️ El récord mundial de partidas simultáneas es de Ehsan Ghaem Maghami con 604 tableros a la vez en 2011.",
    "🎭 Durante la Guerra Fría, las partidas de ajedrez entre estadounidenses y soviéticos eran consideradas batallas ideológicas.",
    "🌟 Judit Polgár es considerada la mejor jugadora de ajedrez de todos los tiempos, alcanzando el puesto #8 del mundo.",
    "🔢 Hay 400 posiciones diferentes posibles después de un movimiento por cada bando, y 72,084 posiciones después de dos movimientos.",
    "👶 El gran maestro más joven de la historia es Abhimanyu Mishra, quien logró el título a los 12 años, 4 meses y 25 días.",
    "🏅 Emanuel Lasker mantuvo el título de Campeón Mundial por 27 años (1894-1921), el reinado más largo en la historia.",
    "🎪 El término 'Zugzwang' describe una situación donde cualquier movimiento empeora tu posición - proviene del alemán.",
    "💎 El ajedrez se jugaba sin el movimiento de enroque hasta el siglo XV, cuando se introdujeron las reglas modernas.",
    "🚀 El astronauta Greg Chamitoff llevó un tablero de ajedrez a la Estación Espacial Internacional y jugó contra el control terrestre.",
    "📱 Magnus Carlsen, actual campeón mundial, empezó a interesarse en el ajedrez memorizando países y capitales a los 5 años.",
    "🎬 La película 'Searching for Bobby Fischer' está basada en la vida real del prodigio Josh Waitzkin.",
    "🌙 El ajedrez se menciona en las '1001 Noches Árabes', mostrando su popularidad en el mundo islámico medieval.",
    "🎨 La pieza del 'alfil' se llamaba 'elefante' en el ajedrez persa original.",
    "⚔️ Durante el sitio de Leningrado en WWII, los grandes maestros continuaron jugando torneos a pesar de la hambruna.",
    "🧠 Estudios muestran que jugar ajedrez regularmente puede ayudar a prevenir el Alzheimer y mejorar la memoria.",
    "🏰 El movimiento del enroque es el único movimiento que permite mover dos piezas en un solo turno.",
    "🎯 La 'Inmortal de Anderssen' (1851) es considerada una de las partidas más brillantes jamás jugadas, con un sacrificio de dama espectacular.",
    "🌐 Lichess.org es completamente gratuito y de código abierto, sin anuncios, mantenido por donaciones de la comunidad.",
    "👑 Garry Kasparov fue el jugador más joven en convertirse en campeón mundial indiscutido a los 22 años en 1985.",
    "🎲 La 'Defensa Siciliana' es la apertura más popular a nivel de gran maestro contra 1.e4.",
    "🔮 Paul Morphy, un prodigio del siglo XIX, se retiró del ajedrez a los 21 años y se consideró a sí mismo solo un aficionado."
];

// Inicializar la aplicación cuando el DOM esté listo
$(document).ready(function() {
    initializeBoard();
    loadNewPuzzle();
    showRandomTrivia();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    $('#new-puzzle-btn').on('click', loadNewPuzzle);
    $('#show-solution-btn').on('click', showSolution);
    $('#new-trivia-btn').on('click', showRandomTrivia);
}

// Inicializar el tablero de ajedrez
function initializeBoard() {
    const config = {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    board = Chessboard('board', config);
    game = new Chess();
}

// Evento: antes de arrastrar una pieza
function onDragStart(source, piece, position, orientation) {
    // No permitir mover si el juego terminó
    if (game.game_over()) return false;

    // Solo permitir mover piezas del color correcto
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

// Evento: al soltar una pieza
function onDrop(source, target) {
    // Intentar hacer el movimiento
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Siempre promocionar a dama por simplicidad
    });

    // Si el movimiento es ilegal, revertir
    if (move === null) return 'snapback';

    // Verificar si es el movimiento correcto de la solución
    checkMove(move);
}

// Evento: después de que la pieza se ha colocado
function onSnapEnd() {
    board.position(game.fen());
}

// Verificar si el movimiento es correcto
function checkMove(move) {
    const moveNotation = move.from + move.to;

    if (currentMoveIndex < solutionMoves.length) {
        const expectedMove = solutionMoves[currentMoveIndex];

        if (moveNotation === expectedMove.substring(0, 4)) {
            currentMoveIndex++;

            // Si aún hay más movimientos en la solución, hacer el movimiento de respuesta
            if (currentMoveIndex < solutionMoves.length) {
                setTimeout(() => {
                    makeComputerMove();
                }, 300);
            } else {
                // Puzzle resuelto
                showMessage('¡Excelente! Has resuelto el puzzle correctamente. 🎉', 'success');
                $('#show-solution-btn').prop('disabled', true);
            }
        } else {
            // Movimiento incorrecto
            showMessage('No es el mejor movimiento. Intenta de nuevo.', 'error');
            game.undo();
            board.position(game.fen());
        }
    }
}

// Hacer movimiento del "oponente"
function makeComputerMove() {
    if (currentMoveIndex < solutionMoves.length) {
        const move = solutionMoves[currentMoveIndex];
        const from = move.substring(0, 2);
        const to = move.substring(2, 4);

        game.move({
            from: from,
            to: to,
            promotion: 'q'
        });

        board.position(game.fen());
        currentMoveIndex++;
    }
}

// Cargar un nuevo puzzle
async function loadNewPuzzle() {
    try {
        showMessage('Cargando nuevo puzzle...', 'success');
        $('#new-puzzle-btn').prop('disabled', true);
        $('#show-solution-btn').prop('disabled', true);

        // Usar el endpoint de puzzle diario de Lichess
        const response = await fetch('https://lichess.org/api/puzzle/daily');

        if (!response.ok) {
            throw new Error('No se pudo cargar el puzzle');
        }

        const data = await response.json();
        currentPuzzle = data.puzzle;

        // Configurar el juego
        game = new Chess(currentPuzzle.fen);
        board.position(currentPuzzle.fen);

        // Obtener los movimientos de la solución
        solutionMoves = currentPuzzle.solution;
        currentMoveIndex = 0;

        // Hacer el primer movimiento (el movimiento que lleva a la posición del puzzle)
        if (solutionMoves.length > 0) {
            const initialMove = solutionMoves[0];
            const from = initialMove.substring(0, 2);
            const to = initialMove.substring(2, 4);

            game.move({
                from: from,
                to: to,
                promotion: 'q'
            });

            board.position(game.fen());
            currentMoveIndex = 1;
        }

        // Determinar qué lado juega
        const orientation = game.turn() === 'w' ? 'white' : 'black';
        board.orientation(orientation);

        // Actualizar la información del puzzle
        $('#puzzle-rating').text(currentPuzzle.rating || 'N/A');
        $('#side-to-move').text(game.turn() === 'w' ? 'Blancas' : 'Negras');

        // Determinar el objetivo (jaque mate, ventaja material, etc.)
        const themes = currentPuzzle.themes || [];
        let objective = 'Encuentra el mejor movimiento';

        if (themes.includes('mate') || themes.includes('mateIn1') || themes.includes('mateIn2')) {
            objective = '¡Hay un jaque mate! Encuéntralo.';
        } else if (themes.includes('advantage')) {
            objective = 'Encuentra el movimiento que da ventaja decisiva.';
        } else if (themes.includes('fork')) {
            objective = 'Busca un tenedor (ataque doble).';
        } else if (themes.includes('pin')) {
            objective = 'Aprovecha una clavada.';
        }

        $('#objective').text(objective);

        showMessage('', '');
        $('#new-puzzle-btn').prop('disabled', false);
        $('#show-solution-btn').prop('disabled', false);

    } catch (error) {
        console.error('Error cargando puzzle:', error);
        showMessage('Error al cargar el puzzle. Intenta de nuevo.', 'error');
        $('#new-puzzle-btn').prop('disabled', false);
    }
}

// Mostrar la solución
function showSolution() {
    if (!currentPuzzle || !solutionMoves) return;

    // Reiniciar el juego a la posición inicial del puzzle
    game = new Chess(currentPuzzle.fen);

    // Hacer el primer movimiento (setup)
    if (solutionMoves.length > 0) {
        const initialMove = solutionMoves[0];
        game.move({
            from: initialMove.substring(0, 2),
            to: initialMove.substring(2, 4),
            promotion: 'q'
        });
    }

    board.position(game.fen());

    // Reproducir la solución automáticamente
    let moveIndex = 1;
    const interval = setInterval(() => {
        if (moveIndex < solutionMoves.length) {
            const move = solutionMoves[moveIndex];
            game.move({
                from: move.substring(0, 2),
                to: move.substring(2, 4),
                promotion: 'q'
            });
            board.position(game.fen());
            moveIndex++;
        } else {
            clearInterval(interval);
            showMessage('Solución completa mostrada.', 'success');
        }
    }, 1000);

    $('#show-solution-btn').prop('disabled', true);
}

// Mostrar un dato curioso aleatorio
function showRandomTrivia() {
    const randomIndex = Math.floor(Math.random() * chessTrivia.length);
    const trivia = chessTrivia[randomIndex];

    $('#trivia-content').fadeOut(300, function() {
        $(this).html(`<p>${trivia}</p>`).fadeIn(300);
    });
}

// Mostrar mensaje al usuario
function showMessage(text, type) {
    const messageElement = $('#message');

    if (text === '') {
        messageElement.removeClass('show success error');
        return;
    }

    messageElement
        .text(text)
        .removeClass('success error')
        .addClass(type)
        .addClass('show');
}
