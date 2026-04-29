const questionBox = document.getElementById("question-box");
const inputBox = document.getElementById("input-box");
const scoreBox = document.getElementById("score-box");
const nextBtn = document.getElementById("next-btn");


let buffer = "";
let currentQuestion = null;
let numOfCorrect = 0;
let numOfMissed = 0;
let streak = 0;

const vimQuestions = [
  // ===== MOVEMENT =====
  { prompt: "Move cursor left", answers: ["h"], type: "exact", category: "movement" },
  { prompt: "Move cursor down", answers: ["j"], type: "exact", category: "movement" },
  { prompt: "Move cursor up", answers: ["k"], type: "exact", category: "movement" },
  { prompt: "Move cursor right", answers: ["l"], type: "exact", category: "movement" },
  { prompt: "Move multiple times in a direction", answers: ["#h", "#j", "#k", "#l"], type: "count", category: "movement", 
    correctRegex = /^\d[hjkl]$/, pendingRegex: /^(\d*|\d+[hjkl]?)$/ },
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
  { prompt: "Cut specified number of lines", answers: ["#dd", "d#d"], type: "count", category: "delete", correctRegex = /^\d+dd$/ },
  { prompt: "Cut everything right of cursor", answers: ["d$"], type: "exact", category: "delete" },
  { prompt: "Delete a single word", answers: ["dw"], type: "exact", category: "delete" },
  { prompt: "Delete all lines", answers: [":%d"], type: "exact", category: "delete" },

  // ===== YANK (COPY) =====
  { prompt: "Copy entire line", answers: ["yy"], type: "exact", category: "yank" },
  { prompt: "Copy specified number of lines", answers: ["#yy"], type: "count", category: "yank" },
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
  { prompt: "Search forward for pattern", answers: ["/pattern"], type: "search", category: "search" },
  { prompt: "Search backward for pattern", answers: ["?pattern"], type: "search", category: "search" },
  { prompt: "Repeat search same direction", answers: ["n"], type: "exact", category: "search" },
  { prompt: "Repeat search opposite direction", answers: ["N"], type: "exact", category: "search" },
  { prompt: "Jump to next instance of word", answers: ["*"], type: "exact", category: "search" },
  { prompt: "Jump to previous instance of word", answers: ["#"], type: "exact", category: "search" },

  // ===== MARKS =====
  { prompt: "Mark line", answers: ["m[a-z]"], type: "mark", category: "marks" },
  { prompt: "Jump to mark", answers: ["'a"], type: "mark", category: "marks" },
  { prompt: "Yank to mark", answers: ["y'a"], type: "mark", category: "marks" },
  { prompt: "Mark line in another file", answers: ["M[A-Z]"], type: "mark", category: "marks" },
  { prompt: "List all marks", answers: [":marks"], type: "exact", category: "marks" },

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
  { prompt: "Move to specified line number", answers: [":#"], type: "count", category: "misc" }
];

function getRandomNumber(min, max) {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomQuestion() {
    const index = Math.floor(Math.random() * vimQuestions.length);
    const questionObj = vimQuestions[index];
    return questionObj;
}

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
    scoreBox.innerHTML = `
        <p class="score">Score: ${numOfCorrect}</p>
        <p class="streak">Streak: ${streak}<p>
        <p class="missed">Missed: ${numOfMissed}</p>
    `;
}

function updateInputBox(buffer) {
    inputBox.innerHTML = `<p class="answer">${buffer}</p>`;
}

function checkAnswerState(question, buffer) {

    const answers = question.answers;
    const isTemplate = question.type !== "exact" ? true : false;

    if (!isTemplate) {
        if (answers.includes(buffer)) {
            return "correct";
        }
        else if (answers.some(answer => answer.startsWith(buffer))) {
            return "pending";
        }
        else {
            return "incorrect";
        }
    }
    else {
        if (question.type === "count") {
            return getCountState(question);
        }
    }

}

function getCountState(question) {
    const number = getRandomNumber(1, 10);
}

function startGame() {
    nextQuestion();
}

function nextQuestion() {
    currentQuestion = getRandomQuestion();
    displayQuestion(currentQuestion);
}

document.addEventListener("keydown", (e) => {
    e.preventDefault();

    if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

    if (e.key === "Backspace") {
        buffer = buffer.slice(0, -1);
        updateInputBox(buffer);
        return;
    }

    if (e.key.length > 1 && !e.ctrlKey) return;

    buffer += e.ctrlKey ? `Ctrl+${e.key}` : e.key;
    console.log(buffer);
    updateInputBox(buffer);

    const state = checkAnswerState(currentQuestion, buffer);

    if (state === "pending") return;
    
    updateScore(state === "correct");
    buffer = "";
    updateInputBox(buffer);
    nextQuestion();
})

window.addEventListener("DOMContentLoaded", startGame);

nextBtn.addEventListener("click", nextQuestion);



