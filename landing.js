var VISITED_KEY = "has_visited";

function initLanding() {
  var visited = false;
  try { visited = localStorage.getItem(VISITED_KEY) === "true"; } catch (e) {}

  var landing = document.getElementById("landing");
  var appWrapper = document.getElementById("app-wrapper");

  if (visited) {
    landing.className = "landing-compact";
    landing.querySelector(".landing-body").style.display = "none";
    appWrapper.style.display = "flex";
  } else {
    landing.className = "landing-hero";
    appWrapper.style.display = "none";
  }
}

function startTraining() {
  try { localStorage.setItem(VISITED_KEY, "true"); } catch (e) {}

  var landing = document.getElementById("landing");
  var appWrapper = document.getElementById("app-wrapper");

  landing.className = "landing-compact";
  landing.querySelector(".landing-body").style.display = "none";
  appWrapper.style.display = "flex";
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
