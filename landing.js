var VISITED_KEY = "has_visited";

function initLanding() {
  var visited = false;
  try { visited = localStorage.getItem(VISITED_KEY) === "true"; } catch (e) {}

  var landing = document.getElementById("landing");
  var appContent = document.getElementById("app-content");

  if (visited) {
    landing.className = "landing-compact";
    landing.querySelector(".landing-body").style.display = "none";
    appContent.style.display = "";
  } else {
    landing.className = "landing-hero";
    appContent.style.display = "none";
  }
}

function startTraining() {
  try { localStorage.setItem(VISITED_KEY, "true"); } catch (e) {}

  var landing = document.getElementById("landing");
  var appContent = document.getElementById("app-content");

  landing.className = "landing-compact";
  landing.querySelector(".landing-body").style.display = "none";
  appContent.style.display = "";
}

function expandLanding() {
  var landing = document.getElementById("landing");
  var body = landing.querySelector(".landing-body");
  if (landing.className === "landing-compact") {
    landing.className = "landing-hero";
    body.style.display = "";
  } else {
    landing.className = "landing-compact";
    body.style.display = "none";
  }
}
