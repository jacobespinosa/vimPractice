// HTML ELEMENTS
const questionBox = document.getElementById("question-box");
const inputBox = document.getElementById("input-box");
const score = document.getElementById("score");
const nextBtn = document.getElementById("next-btn");

// REGEX
const commandRegex = /^[/?:].*$/;

// VARIABLES
let buffer = "";
let currentQuestion = null;
let numOfCorrect = 0;
let numOfMissed = 0;
let streak = 0;
let showCommandBox = false;

const vimQuestions = [
  // ===== MOVEMENT =====
  { prompt: "Move cursor left", answers: ["h"], type: "exact", category: "movement" },
  { prompt: "Move cursor down", answers: ["j"], type: "exact", category: "movement" },
  { prompt: "Move cursor up", answers: ["k"], type: "exact", category: "movement" },
  { prompt: "Move cursor right", answers: ["l"], type: "exact", category: "movement" },
  { prompt: "Move multiple times in a direction", answers: ["#h", "#j", "#k", "#l"], type: "count", category: "movement", 
    pendingRegex: /^(\d*|\d+[hjkl]?)$/ },
  { prompt: "Move to the start of a word", answers: ["b", "B"], type: "exact", category: "movement" },
  { prompt: "Move to the start of the next word", answers: ["w", "W"], type: "exact", category: "movement" },
  { prompt: "Move to the end of a word", answers: ["e", "E"], type: "exact", category: "movement" },
  { prompt: "Jump to beginning of line", answers: ["0"], type: "exact", category: "movement" },
  { prompt: "Jump to end of line", answers: ["$"], type: "exact", category: "movement" },
  { prompt: "Jump to first non-blank character", answers: ["^"], type: "exact", category: "movement" },
  { prompt: "Move to top of screen", answers: ["H"], type: "exact", category: "movement" },
  { prompt: "Move to middle of screen", answers: ["M"], type: "exact", category: "movement" },
  { prompt: "Move to bottom of screen", answers: ["L"], type: "exact", category: "movement" },

  // ===== INSERT =====
  { prompt: "Insert before cursor", answers: ["i"], type: "exact", category: "insert" },
  { prompt: "Insert at beginning of line", answers: ["I"], type: "exact", category: "insert" },
  { prompt: "Insert after cursor", answers: ["a"], type: "exact", category: "insert" },
  { prompt: "Insert at end of line", answers: ["A"], type: "exact", category: "insert" },
  { prompt: "Open new line below", answers: ["o"], type: "exact", category: "insert" },
  { prompt: "Open new line above", answers: ["O"], type: "exact", category: "insert" },
  { prompt: "Insert at end of word", answers: ["ea"], type: "exact", category: "insert" },

  // ===== DELETE =====
  { prompt: "Cut entire line", answers: ["dd", "D"], type: "exact", category: "delete" },
  { prompt: "Cut specified number of lines", answers: ["#dd", "d#d"], type: "count", category: "delete",
    pendingRegex: /^(\d*$|\d+d?$|d$|d\d+)$/ },
  { prompt: "Cut everything right of cursor", answers: ["d$"], type: "exact", category: "delete" },
  { prompt: "Delete a single word", answers: ["dw"], type: "exact", category: "delete" },
  { prompt: "Delete all lines", answers: [":%d"], type: "exact", category: "delete" },

  // ===== YANK (COPY) =====
  { prompt: "Copy entire line", answers: ["yy"], type: "exact", category: "yank" },
  { prompt: "Copy specified number of lines", answers: ["#yy"], type: "count", category: "yank",
    pendingRegex: /^(\d*|\d+y?)$/ },
  { prompt: "Copy word without trailing whitespace", answers: ["yiw"], type: "exact", category: "yank" },
  { prompt: "Copy everything right of cursor", answers: ["y$"], type: "exact", category: "yank" },
  { prompt: "Copy everything left of cursor", answers: ["y^"], type: "exact", category: "yank" },

  // ===== PASTE / UNDO =====
  { prompt: "Paste after cursor", answers: ["p"], type: "exact", category: "edit" },
  { prompt: "Paste before cursor", answers: ["P"], type: "exact", category: "edit" },
  { prompt: "Undo last change", answers: ["u"], type: "exact", category: "edit" },
  { prompt: "Redo last undone change", answers: ["Ctrl+r"], type: "exact", category: "edit" },

  // ===== VISUAL =====
  { prompt: "Enter visual mode (character)", answers: ["v"], type: "exact", category: "visual" },
  { prompt: "Enter visual mode (line)", answers: ["V"], type: "exact", category: "visual" },
  { prompt: "Mark a word", answers: ["aw"], type: "exact", category: "visual" },
  { prompt: "Mark block ()", answers: ["ab"], type: "exact", category: "visual" },
  { prompt: "Mark inner block ()", answers: ["ib"], type: "exact", category: "visual" },
  { prompt: "Mark inner block {}", answers: ["iB"], type: "exact", category: "visual" },
  { prompt: "Switch selection ends", answers: ["o"], type: "exact", category: "visual" },

  // ===== SEARCH =====
  { prompt: "Search forward for pattern", answers: ["/pattern"], type: "search", category: "search",
    pendingRegex: /^\/.*$/ },
  { prompt: "Search backward for pattern", answers: ["?pattern"], type: "search", category: "search",
    pendingRegex: /^\?.*$/ },
  { prompt: "Repeat search same direction", answers: ["n"], type: "exact", category: "search" },
  { prompt: "Repeat search opposite direction", answers: ["N"], type: "exact", category: "search" },
  { prompt: "Jump to next instance of word", answers: ["*"], type: "exact", category: "search" },
  { prompt: "Jump to previous instance of word", answers: ["#"], type: "exact", category: "search" },

  // ===== MARKS =====
  { prompt: "Mark line", answers: ["m[a-z]"], type: "mark", category: "marks",
    pendingRegex: /^m[a-z]?$/ },
  { prompt: "Jump to mark", answers: ["'a"], type: "mark", category: "marks",
    pendingRegex: /^'[a-z]?$/ },
  { prompt: "Yank to mark", answers: ["y'a"], type: "mark", category: "marks",
    pendingRegex: /^y'?([a-z])?$/ },
  { prompt: "Mark line in another file", answers: ["M[A-Z]"], type: "mark", category: "marks",
    pendingRegex: /^M[A-Z]?$/ },
  { prompt: "List all marks", answers: [":marks"], type: "exact", category: "marks"},

  // ===== SCROLL / NAV =====
  { prompt: "Move back one full screen", answers: ["Ctrl+b"], type: "exact", category: "scroll" },
  { prompt: "Move forward one full screen", answers: ["Ctrl+f"], type: "exact", category: "scroll" },
  { prompt: "Move forward half screen", answers: ["Ctrl+d"], type: "exact", category: "scroll" },
  { prompt: "Move back half screen", answers: ["Ctrl+u"], type: "exact", category: "scroll" },
  { prompt: "Jump backward in history", answers: ["Ctrl+o"], type: "exact", category: "scroll" },
  { prompt: "Jump forward in history", answers: ["Ctrl+i"], type: "exact", category: "scroll" },

  // ===== MISC =====
  { prompt: "Replace a single character", answers: ["r"], type: "exact", category: "misc" },
  { prompt: "Delete a character", answers: ["s"], type: "exact", category: "misc" },
  { prompt: "Repeat last command", answers: ["."], type: "exact", category: "misc" },
  { prompt: "Move to specified line number", answers: [":#"], type: "count", category: "misc",
    pendingRegex: /^:\d*$/ }
];


const patterns = ["function", "variable", "array", "pointer", "buffer", 
                  "stack", "queue", "index", "loop", "recursion"];

// FUNCTIONS: Get Randoms
function getRandomNumber(min, max) {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomQuestion() {
    const index = Math.floor(Math.random() * vimQuestions.length);
    const questionObj = vimQuestions[index];
    return questionObj;
}

// FUNCTIONS: Displays
function displayQuestion(questionObj) {
    questionBox.innerHTML = `<p class="question">${questionObj.prompt}</p>`;
}

function updateScore(isCorrect) {
    if (isCorrect) {
        numOfCorrect++;
        streak++;
    } else {
        numOfMissed++;
        streak = 0;
    }
    score.innerHTML = `
        <p class="score">Score: ${numOfCorrect}</p>
        <p class="streak">Streak: ${streak}<p>
        <p class="missed">Missed: ${numOfMissed}</p>
    `;
}

function updateInputBox(buffer) {
    inputBox.innerHTML = `<p class="answer">${buffer}</p>`;
}

// FUNCTIONS: handle template questions
function handleTemplateQuestion(question) {
    // Copy question and answer array
    const activeQuestion = { ...question, answers: [...question.answers] };

    if (activeQuestion.type === "count") {
        return handleCount(activeQuestion);
    }
    else if (activeQuestion.type === "search") {
        return handleSearch(activeQuestion);
    }
    else if (activeQuestion.type === "mark") {
        return handleMark(activeQuestion);
    }
    return activeQuestion;
}

function handleCount(question) {
    const randomNumber = getRandomNumber(1, 10);
    const hasDirection = question.prompt.includes("direction");
    let direction = "";

    // Handling h,j,k,l with counts
    if (hasDirection) {
        const index = getRandomNumber(0, 4);
        const navKey = question.answers[index].slice(-1);
        switch (navKey) {
            case 'h': direction = "left"; break;
            case 'j': direction = "down"; break;
            case 'k': direction = "up"; break;
            case 'l': direction = "right"; break;
        }
        question.answers = [question.answers[index]];
    }

    question.prompt = `${question.prompt} (${randomNumber} ${direction})`;
    question.answers = question.answers.map((answer) => answer.replace("#", randomNumber));

    return question;
}

function handleSearch(question) {
    const patternIndex = getRandomNumber(0, patterns.length);
    const pattern = patterns[patternIndex];

    question.prompt = `${question.prompt} (${pattern})`;
    question.answers = question.answers.map((answer) => answer.replace("pattern", pattern));

    return question;
}

function handleMark(question) {
    // ASCII:
    // lowercase starts 97
    // uppercase starts 65

    const index = getRandomNumber(0, 26);

    const needsUppercase = question.answers.some(answer =>
        answer.includes("[A-Z]")
    );

    const offset = needsUppercase ? 65 : 97;
    const letter = String.fromCharCode(index + offset);

    question.prompt = `${question.prompt} (${letter})`;

    question.answers = question.answers.map(answer =>
        answer
            .replace("[a-z]", letter)
            .replace("[A-Z]", letter)
    );

    return question;
}

// FUNCTIONS: Check answers
function checkAnswerState(question, buffer) {
    if (question.answers.includes(buffer)) return "correct";

    if (question.pendingRegex?.test(buffer)) return "pending";

    if (question.answers.some(a => a.startsWith(buffer))) return "pending";

    return "incorrect";
}

// FUNCITONS: Flow control
function startGame() {
    nextQuestion();
}

function nextQuestion() {
    currentQuestion = getRandomQuestion();
    if (currentQuestion.type !== "exact") {
        currentQuestion = handleTemplateQuestion(currentQuestion);
    }
    displayQuestion(currentQuestion);
}

function toggleCommandBox(isCommand) {
    if (isCommand) {
        inputBox.classList.remove("hidden");
    }
    else {
        inputBox.classList.add("hidden");
    }
}

function handleBackspace(event) {
    if (event.key === "Backspace") {
        buffer = buffer.slice(0, -1);
        updateInputBox(buffer);
        return true;
    }
}

function handleEnter(event) {
    if (event.key !== "Enter") return;

    const isCommandMode = commandRegex.test(buffer);

    if (isCommandMode) {
        const state = checkAnswerState(currentQuestion, buffer);
        updateScore(state === "correct");
        buffer = "";
        updateInputBox(buffer);
        inputBox.classList.add("hidden");
        nextQuestion();
    }
    return true;
}

// EVENT LISTENERS
document.addEventListener("keydown", (e) => {
    e.preventDefault();

    const isCommandMode = commandRegex.test(buffer);

    if (handleBackspace(e)) return;
    if (handleEnter(e)) return;
    if (e.key.length > 1 && !e.ctrlKey) return;

    buffer += e.ctrlKey ? `Ctrl+${e.key}` : e.key;

    updateInputBox(buffer);
    toggleCommandBox(isCommandMode);

    const state = checkAnswerState(currentQuestion, buffer);
    if (state === "pending") return;
    if (isCommandMode) return; // only submit input on enter

    updateScore(state === "correct");

    buffer = "";
    updateInputBox(buffer);
    nextQuestion();
})

window.addEventListener("DOMContentLoaded", startGame);

nextBtn.addEventListener("click", nextQuestion);



