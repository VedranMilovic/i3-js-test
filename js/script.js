"use strict";

const buttonSubmit = document.getElementById("submit");
const answers = document.getElementById("answers");
const container = document.getElementById("slide-container");
const navigationBar = document.getElementById("navigation-bar");
const prevButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const submitButton = document.getElementById("submit");

let navigationLinks = [];
let correctAnswersPerSlide = [];
let clickSlides = [];
let curSlide = 0;

function createSlidesInContainer() {
  const container = document.getElementById("slide-container");

  for (let i of [1, 2, 3, 4]) {
    const slide = document.createElement("div");
    slide.classList.add("slide");
    slide.classList.add("show_slide");
    slide.setAttribute("id", `slide-${i}`);
    container.appendChild(slide);
  }
}

createSlidesInContainer();

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const slides = document.querySelectorAll(".slide");

function generateQuestionsSlide() {
  let questionsContainer = document.querySelectorAll(".slide");
  clickSlides = new Array(questionsContainer.length).fill().map(() => []);

  function generateNavigationBar() {
    navigationBar.innerHTML = "";
    navigationLinks = [];

    questionsContainer.forEach((slide, index) => {
      const navLink = document.createElement("a");
      navLink.textContent = `Question ${index + 1}`;
      navLink.setAttribute("href", `#slide-${index + 1}`);
      navLink.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(index);
      });

      if (index === curSlide) {
        navLink.classList.add("active");
      }
      navigationBar.appendChild(navLink);
      navigationLinks.push(navLink);
    });

    updateNavigationLinks();
  }

  correctAnswersPerSlide = new Array(questionsContainer.length).fill(0);

  questionsContainer.forEach((slide, index) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = `Question ${index + 1}:`;
    slide.appendChild(paragraph);

    const numButton = generateRandomNumber(2, 6);

    for (let i of Array(numButton).keys()) {
      const button = document.createElement("button");
      button.setAttribute("name", "button");
      button.setAttribute("type", "button");
      button.classList.add("button_slide");
      button.textContent = `${i + 1}`;
      button.setAttribute("id", `question-${i + 1}`);
      slide.append(button);
    }

    correctAnswersPerSlide[index] = numButton;

    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.style.display = "none";
    slide.appendChild(errorMessage);
  });

  generateNavigationBar();
}

generateQuestionsSlide();

const buttons = document.querySelectorAll("button[name='button']");
buttons.forEach((button) => {
  button.addEventListener("click", function (e) {
    const buttonText = e.target.textContent;
    const slideElement = e.target.closest(".slide");
    const slideIndex = Array.from(slides).indexOf(slideElement);
    clickSlides[slideIndex].push(buttonText);

    const correctAnswers = correctAnswersPerSlide[slideIndex];
    const numClicks = clickSlides[slideIndex].length;

    if (numClicks > correctAnswers) {
      displayErrorMessage("", slideElement);
    }

    updateNavigationLinks();
    enableBtn();
  });
});

function updateNavigationLinks() {
  navigationLinks.forEach((navLink, index) => {
    if (clickSlides[index].length >= 1) {
      navLink.classList.add("answered");
    } else {
      navLink.classList.remove("answered");
    }

    if (index === curSlide) {
      navLink.classList.add("active");
    } else {
      navLink.classList.remove("active");
    }

    const slide = slides[index];
    let errorMessage = slide.querySelector(".error-message");
    if (!errorMessage) {
      errorMessage = document.createElement("div");
      errorMessage.classList.add("error-message");
      slide.appendChild(errorMessage);
    }

    if (clickSlides[index].length > correctAnswersPerSlide[index]) {
      errorMessage.textContent =
        "Too many answers to a single question! Please restart quiz 🔁";
      errorMessage.style.display = "block";
    }
  });
}

function displayErrorMessage(message, slideElement) {
  let errorMessage = slideElement.querySelector(".error-message");

  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    slideElement.appendChild(errorMessage);
  }

  errorMessage.textContent = message;
  errorMessage.style.display = "inline-block";

  setTimeout(() => {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  }, 3000);
}

const maxSlides = slides.length;

const goToSlide = function (slideIndex) {
  slides.forEach((s, i) => {
    if (i === slideIndex) {
      s.classList.add("show_slide");
      navigationLinks[i].classList.add("active");
    } else {
      s.classList.remove("show_slide");
      navigationLinks[i].classList.remove("active");
    }
  });
};

function updateButtonVisibility() {
  prevButton.style.display = curSlide === 0 ? "none" : "inline";
  nextButton.style.display = curSlide === maxSlides - 1 ? "none" : "inline";
  submitButton.style.display = curSlide === maxSlides - 1 ? "inline" : "none";
}

function showNextSlide() {
  curSlide++;
  goToSlide(curSlide);
  updateButtonVisibility();
}

function showPreviousSlide() {
  curSlide--;
  goToSlide(curSlide);
  updateButtonVisibility();
}

prevButton.addEventListener("click", showPreviousSlide);
nextButton.addEventListener("click", showNextSlide);

goToSlide(curSlide);
updateButtonVisibility();

function disableBtn() {
  document.getElementById("submit").disabled = true;
}

function enableBtn() {
  const enableBtn = clickSlides.every((slideClicks) => slideClicks.length > 0);
  document.getElementById("submit").disabled = !enableBtn;
}

buttonSubmit.addEventListener("click", function () {
  console.log(clickSlides);

  let allSlidesAnswered = true;
  let exceededAnswers = false;

  clickSlides.forEach((slideClicks, slideIndex) => {
    const slide = slides[slideIndex];
    if (slideClicks.length === 0) {
      allSlidesAnswered = false;
    } else {
      const correctAnswers = correctAnswersPerSlide[slideIndex];
      const numClicks = slideClicks.length;

      if (numClicks > correctAnswers) {
        exceededAnswers = true;
      } else {
        slide.style.borderColor = "initial";
      }
    }
  });

  if (!allSlidesAnswered) {
    disableBtn();
  } else if (exceededAnswers) {
    buttonSubmit.style.color = "red";
  } else {
    enableBtn();

    answers.innerHTML = `
    Odgovor 1: ${clickSlides[0]},
    Odgovor 2: ${clickSlides[1]},
    Odgovor 3: ${clickSlides[2]},
    Odgovor 4: ${clickSlides[3]}
    `;
  }
});

const restartButton = document.getElementById("restart");
restartButton.addEventListener("click", function () {
  clickSlides = new Array(slides.length).fill().map(() => []);
  updateNavigationLinks();
  enableBtn();

  curSlide = 0;
  goToSlide(curSlide);
  updateButtonVisibility();

  answers.innerHTML = "";
});
