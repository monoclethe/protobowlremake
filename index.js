const rnbw = document.getElementsByClassName("rainbow");

const plpa = document.getElementById("plpa");
const plpaImg = document.getElementById("plpaImg");
const skip = document.getElementById("skip");
const skipImg = document.getElementById("skipImg");
const buzz = document.getElementById("buzz");
const buzzImg = document.getElementById("buzzImg");
const timerDisp = document.getElementById("timerBlock");
const timerText = document.getElementById("timerText");
const difficultySet = document.getElementById("difficulty");
const historyDisp = document.getElementById("historyDisp");
const helpButton = document.getElementById("helpButton");
const quitHelpButton = document.getElementById("quitHelp");
const pointTotal = document.getElementById("pointTotal");
const rSpeed = document.getElementById("rSpeed");
const showPause = document.getElementById("showPause");

const litWeight = document.getElementById("litWeight");
const hisWeight = document.getElementById("hisWeight");
const sciWeight = document.getElementById("sciWeight");
const artWeight = document.getElementById("artWeight");
const relWeight = document.getElementById("relWeight");
const mytWeight = document.getElementById("mytWeight");
const phiWeight = document.getElementById("phiWeight");
const socWeight = document.getElementById("socWeight");
const curWeight = document.getElementById("curWeight");
const geoWeight = document.getElementById("geoWeight");
const othWeight = document.getElementById("othWeight");
const traWeight = document.getElementById("traWeight");
const weights = [litWeight, hisWeight, sciWeight, artWeight, relWeight, mytWeight, phiWeight, socWeight, curWeight, geoWeight, othWeight, traWeight];
const categories = ["Literature", "History", "Science", "Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Current Events", "Geography", "Other Academic", "Trash"];

const qInfo = document.getElementById("qInfo");
const qTextOut = document.getElementById("qText");

const buzzAns = document.getElementById("buzzAns");

var qActive = false;
var plpaEnable = true;
var plpaState = false;
var skipEnable = false;
var buzzEnable = false;
var buzzState = false;
var timeManagers = [];

var qHistory = [];

var activeQ;
var activeCat;
var activeYear;
var activeName;
var qText;
var qDisp;
var qTextPos;
var qFin;
var powerActive;

var result;

var endCountDown;
var buzzCountDown;

var scores = {
    "all": [0, 0, 0],
    "lit": [0, 0, 0],
    "his": [0, 0, 0],
    "sci": [0, 0, 0],
    "art": [0, 0, 0],
    "rel": [0, 0, 0],
    "myt": [0, 0, 0],
    "phi": [0, 0, 0],
    "soc": [0, 0, 0],
    "cur": [0, 0, 0],
    "geo": [0, 0, 0],
    "oth": [0, 0, 0],
    "tra": [0, 0, 0],
}
const catMap = {
    "All": "all",
    "Literature": "lit",
    "History": "his",
    "Science": "sci",
    "Fine Arts": "art",
    "Religion": "rel",
    "Mythology": "myt",
    "Philosophy": "phi",
    "Social Science": "soc",
    "Current Events": "cur",
    "Geography": "geo",
    "Other Academic": "oth",
    "Trash": "tra"
}

var rainbow_Manager = setInterval(function () {
    for (let elem of rnbw) {
        elem.style.color = "hsl(" + (new Date().getTime())/25 + ", 100%, 50%)";
    }
}, 50)

//I love stack overflow
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
  

function getQuestion (difficulty, category) {
    fetch("https://www.qbreader.org/api/random-tossup?difficulties=" + difficulty + "&categories=" + category).then(function(response) {
        return response.json();
    }).then(function(qData) {
        console.log(qData);
        qActive = true;
        activeQ = qData["tossups"][0];
        activeYear = activeQ["set"]["year"];
        activeName = activeQ["set"]["name"]
        qInfo.innerHTML = activeYear + "/" + activeName + "/" + activeCat;
        readQuestion(activeQ);
    })
}

function countDownEnd () {
    qFin = true;
    timeManagers[1] = setInterval(function () {
        if (plpaState && !buzzState) {
            if (endCountDown > 0) {
                timerDisp.classList = ["bluestripe"];
                endCountDown -= 0.1;
                timerText.innerHTML = Math.abs((endCountDown/10).toFixed(1)) + "s";
                timerDisp.style.width = endCountDown + "%";
            } else {
                clearInterval(timeManagers[1]);
            }
        }
    }, 10)
}

const punctuation = ["(", ")", "[", "]", ".", "?", "!", "-", ","];

function readTick () {
    //avg of 12.5 letters per second reading speed
    //or, a delay of .08s (80ms)
    //round down to 50ms becaues these people talk fast
    if (qActive) {
        if (plpaState && !buzzState) {
            if (qTextPos < qText.length) {
                qDisp += qText[qTextPos];
                let timeoutLength = 110 - rSpeed.value;
                qTextOut.innerHTML = qDisp;
                if (punctuation.includes(qText[qTextPos])) {
                    timeoutLength *= 5;
                }
                if (qText.substring(qTextPos, qTextPos + 3) == "(*)") {
                    timeoutLength = 0;
                    powerActive = false;
                }
                qTextPos++;
                setTimeout(readTick, timeoutLength);
            } else {
                endCountDown = 100;
                countDownEnd();
                clearInterval(timeManagers[0]);
            }
        } else {
            if (showPause.checked && !buzzState) {
                qTextOut.innerHTML = "[Question Paused]";
            } else {
                qTextOut.innerHTML = qDisp;
            }
            setTimeout(readTick, 0);
        }
    }
}

function readQuestion (data) {
    powerActive = true;
    qText = data["question_sanitized"];
    if (!qText.includes("(*)")) {
        powerActive = false;
    }
    qDisp = "";
    qTextPos = 0;
    setTimeout(readTick, 0)
}

function initQuestion () {
    qFin = false;
    //compute weights for difficulties
    qDiff = difficultySet.value;
    let wTotal = 0;
    let wBar = [];
    let id = 0;
    for (let weight of weights) {
        wTotal += weight.value * 1;
        for (let i = 0; i < weight.value * 1; i++) {
            wBar.push(id);
        }
        id++;
    }
    //make sure there is a possible category
    if (wTotal > 0) {
        //cancel all timer events
        for (let timer of timeManagers) {
            clearInterval(timer);
        }
        //reset timer
        timerDisp.style.width = "100%";
        timerText.innerHTML = "10.0s";
        timerDisp.classList = ["bluebg"];
        
        //enable and reset all buttons
        enableVis(skip);
        enableVis(buzz);
        skipEnable = true;
        buzzEnable = true;
        buzzState = false;
        buzzImg.src = "images/buzz.png"

        //select question type
        let selection = Math.round(Math.random()*(wTotal-1));
        
        activeCat = (categories[wBar[selection]]);
        getQuestion(qDiff, activeCat);
    } else {
        alert("Please set at least one category above zero.")
    }
}
helpButton.onclick = function () {
    document.getElementById("help").style.display = "block";
}
quitHelpButton.onclick = function () {
    document.getElementById("help").style.display = "none";
}

function disableVis (elem) {
    elem.style.backgroundColor = "gray";
}
function enableVis(elem) {
    elem.style.backgroundColor = "";
}

disableVis(skip);
disableVis(buzz);

document.addEventListener("keypress", function onEvent(event) {
    if (event.key === "p") {
        plpaClick();
    }
    else if (event.key === "s") {
        skipClick();
    } else if ((event.key === " "  && !buzzState)|| event.key === "Enter") {
        event.preventDefault();
        buzzClick();
    }
});
function plpaClick () {
    if (plpaEnable) {
        if (!plpaState) {
            plpaState = true;
            plpa.classList = ["pause"];
            plpaImg.src = "images/pause.png";

            enableVis(skip);
            skipEnable = true;
            enableVis(buzz);
            buzzEnable = true;

            if (!qActive) {
                initQuestion();
            }

        } else if (plpaState) {
            plpaState = false;
            plpa.classList = ["play"];
            plpaImg.src = "images/play.png";

            disableVis(buzz);
            buzzEnable = false;
        }
    }
}
plpa.onclick = function () {
    plpaClick();
}
function skipClick () {
    if (skipEnable) {
        plpaState = false;
        finishBuzz();
    }
}
skip.onclick = function () {
    skipClick();
}
function buzzClick () {
    if (buzzEnable) {
        if (!buzzState) {
            buzzState = true;
            buzzImg.src = "images/submit.png";
            
            disableVis(plpa);
            plpaEnable = false;
            disableVis(skip);
            skipEnable = false;

            buzzAns.removeAttribute("readonly");
            buzzAns.value = "";

            countDownBuzz();
            buzzAns.focus();
        } else if (buzzState) {
            buzzAns.blur();
            buzzState = false;
            buzzImg.src = "images/buzz.png";
            finishBuzz();
        }
    }
}
buzz.onclick = function () {
    buzzClick();
}
function finishBuzz () {
    
    buzzState = false;
    buzzImg.src = "images/buzz.png";
    enableVis(plpa);
    plpaEnable = true;
    enableVis(skip);
    skipEnable = true;

    buzzAns.readOnly = true;
    timerDisp.classList = ["greenbg"];
    timerText.innerHTML = "10.0s";
    timerDisp.style.width = "100%";
    result = processAns(buzzAns.value, activeQ["answer"]);
    buzzAns.value = "";
    finishQuestion(result);
}

function finishQuestion (result) {
    //cancel all timer events
    for (let timer of timeManagers) {
        clearInterval(timer);
    }
    //reset buttons
    plpaEnable = true;
    plpa.classList = ["play"];
    plpaImg.src = "images/play.png";
    enableVis(plpa);
    skipEnable = false;
    disableVis(skip);
    buzzEnable = false;
    buzzState = false;
    buzzImg.src = "images/buzz.png";
    disableVis(buzz);
    qTextOut.innerHTML = activeQ["question_sanitized"] + "<div class=\"dottedLine\"></div>" + activeQ["answer"];
    qActive = false;
    if (!result && !qFin) {
        scores["all"][0] += 1;
        scores[catMap[activeCat]][0] += 1;
    } else if (result && !powerActive) {
        scores["all"][1] += 1;
        scores[catMap[activeCat]][1] += 1;
    } else if (result && powerActive) {
        scores["all"][2] += 1;
        scores[catMap[activeCat]][2] += 1;
    }
    updScores();
    qHistory.unshift([qText, activeQ["answer"]]);
    updHistory();
    if (!result) {
        qTextOut.innerHTML += "<br><input type=\"button\" value=\"I was right\" id=\"wasRight\" onclick=\"iWasRight()\">";
    } else {
        qTextOut.innerHTML += "<br><input type=\"button\" value=\"I was wrong\" id=\"wasWrong\" onclick=\"iWasWrong()\">";
    }
}

function iWasRight () {
    document.getElementById("wasRight").remove();
    scores["all"][0] -= 1;
    scores[catMap[activeCat]][0] -= 1;
    if (!powerActive) {
        scores["all"][1] += 1;
        scores[catMap[activeCat]][1] += 1;
    } else {
        scores["all"][2] += 1;
        scores[catMap[activeCat]][2] += 1;
    }
    updScores();
    qTextOut.innerHTML += "<input type=\"button\" value=\"I was wrong\" id=\"wasWrong\" onclick=\"iWasWrong()\">";
}
function iWasWrong () {
    document.getElementById("wasWrong").remove();
    scores["all"][0] += 1;
    scores[catMap[activeCat]][0] += 1;
    if (!powerActive) {
        scores["all"][1] -= 1;
        scores[catMap[activeCat]][1] -= 1;
    } else {
        scores["all"][2] -= 1;
        scores[catMap[activeCat]][2] -= 1;
    }
    updScores();
    qTextOut.innerHTML += "<input type=\"button\" value=\"I was right\" id=\"wasRight\" onclick=\"iWasRight()\">";
}

function updHistory () {
    let hisBuffer = "";
    let lim = qHistory.length;
    if (qHistory.length > 5) {
        lim = 5;
    }
    for (let i = 0; i < lim; i++) {
        hisBuffer += "<div class=\"textBox\">" + qHistory[i][0] + "</div>" + "<div class=\"textBox\">" + qHistory[i][1] + "</div><div class=\"dottedLine\"></div>";
    }
    historyDisp.innerHTML = hisBuffer;
}

function updScores () {
    for (let cat in catMap) {
        document.getElementById(catMap[cat]+"StatNeg").innerHTML = scores[catMap[cat]][0];
        document.getElementById(catMap[cat]+"StatCorrect").innerHTML = scores[catMap[cat]][1];
        document.getElementById(catMap[cat]+"StatPower").innerHTML = scores[catMap[cat]][2];
    }
    pointTotal.innerHTML = (scores["all"][0] * -5) + (scores["all"][1] * 10) + (scores["all"][2] * 15)
}

function countDownBuzz () {
    buzzCountDown = 100;
    timeManagers[2] = setInterval(function () {
        if (buzzCountDown > 0 && buzzState) {
            timerDisp.classList = ["redstripe"];
            buzzCountDown -= 0.1;
            timerText.innerHTML = Math.abs((buzzCountDown/10).toFixed(1)) + "s";
            timerDisp.style.width = buzzCountDown + "%";
        } else {
            if (buzzState) {
                finishBuzz();
            }
            clearInterval(timeManagers[2]);
        }
    }, 10)
}

function processAns(ansIn, ans) {
    //process possible correct answers
    //correct answers are surrounded by <b><u>ans</u></b>
    let startIndices = [];
    let endIndices = [];
    for (let i = 0; i < ans.length - 8; i++) {
        if (ans.substring(i, i+6) == "<b><u>") {
            startIndices.push(i+6);
        } else if (ans.substring(i, i+8) == "</u></b>") {
            endIndices.push(i);
        }
    }
    let answers = [];
    let correct = false;
    for (let i = 0; i < startIndices.length; i++) {
        answers.push(ans.substring(startIndices[i],endIndices[i]))
    }
    //sanitize answers (I LOVE REGEXES 😁😁😁😁😁)
    for (let i = 0; i < answers.length; i++) {
        answers[i] = answers[i].replace(/<.*?>/g, '');
    }
    for (let i = 0; i < answers.length; i++) {
        if (similarity(ansIn, answers[i]) >= 0.8 || similarity(ansIn, ans.replace(/<.*?>/g, '')) >= 0.8) {
            correct = true;
        }
    }
    return correct;
}