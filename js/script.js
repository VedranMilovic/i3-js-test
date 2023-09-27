"use strict";

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
      //ili let i=0; i < numButton; i++
      const button = document.createElement("button");
      button.setAttribute("name", "button");
      button.setAttribute("type", "button");
      button.setAttribute("id", `question-${i + 1}`);
      button.classList.add("button_slide");
      button.textContent = `${i + 1}`;
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
    const slideElement = e.target.closest(".slide"); // daje broj slide-a (1,2,3,4) u kojem se kliknuo gumb
    const slideIndex = Array.from(slides).indexOf(slideElement); // This allows the code to determine which slide/container the clicked button belongs to
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

    if (clickSlides[index].length > correctAnswersPerSlide[index]) {
      displayErrorMessage(
        "Too many answers to a single question! Please restart quiz 🔁",
        slide
      );
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
    // stavi slide, index
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

nextButton.addEventListener("click", showNextSlide);
prevButton.addEventListener("click", showPreviousSlide);

goToSlide(curSlide);
updateButtonVisibility();

function disableBtn() {
  document.getElementById("submit").disabled = true;
}

// checks if there has been at least one click on each slide represented by the clickSlides array.
// If there has been at least one click on each slide, it enables a button with the id "submit." If any slide has no clicks, it disables the button,
function enableBtn() {
  // It then sets the disabled property of the button element to the opposite of the value stored in the enableBtn variable.
  //If enableBtn is true (meaning that every slide has at least one click recorded), the button is enabled (disabled is false).
  //If enableBtn is false (at least one slide has no clicks), the button is disabled (disabled is true).
  const enableBtn = clickSlides.every((slideClicks) => slideClicks.length > 0);
  document.getElementById("submit").disabled = !enableBtn;
}

submitButton.addEventListener("click", function () {
  console.log(clickSlides);

  let allSlidesAnswered = true;
  let exceededAnswers = false;

  let answerString = "";

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
      answerString += `Odgovor ${slideIndex + 1}: ${slideClicks.join(", ")};\n`;
    }
  });

  if (!allSlidesAnswered) {
    disableBtn();
  } else if (exceededAnswers) {
    submitButton.style.color = "red";
  } else {
    enableBtn();

    answers.textContent = answerString;
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
