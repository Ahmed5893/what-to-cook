"use strict";

//Selecting Dom Elements
const container = document.querySelector(".container");
const search = document.getElementById("search");
const random = document.getElementById("random");
const input = document.getElementById("input");
const heading = document.querySelector(".search-result");
const load = document.querySelector(".loader");

//Call init function to display previous search result
init();

//All App Functions

//1-Init Function
function init() {
  try {
    const meals = JSON.parse(sessionStorage.getItem("meal"));
    if (meals !== null && meals.length > 0) {
      container.innerHTML = meals
        .map(
          (item) => ` 
    
    <div class="meal"  >
<img src="${item.strMealThumb}" alt="${item.strMeal}" class="meal-image" />
<div class="meal-name" id="${item.idMeal}">${item.strMeal}</div>
</div>

`
        )
        .join("");
    }
  } catch (err) {
    console.error(err);
    renderError(`Something Went Wrong:Try Again`);
  }
}

//2-Error Handle Function
function renderError(msg) {
  container.innerHTML = `<div class="error">
  <div class="error-msg">${msg}</div>
  </div>

`;
}

//3-Fetch the data from the API function to get a  meal
async function getMeal() {
  const meal = input.value;
  try {
    if (meal.trim() === "") {
      heading.textContent = `Enter the meal name`;
      load.style.display = "none";
      return;
    }

    heading.textContent = `Result for:${meal}`;

    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${meal}`
    );
    const data = await res.json();
    if (!data.meals) {
      heading.textContent = `There is no Result for:${meal}`;
      container.innerHTML = `<div class="error"><img src="/try-again.png" alt="Try Again"/></div>`;
    } else {
      sessionStorage.setItem("meal", JSON.stringify(data.meals));

      container.innerHTML = data.meals
        .map(
          (item) => ` 
              
              <div class="meal"  >
          <img src="${item.strMealThumb}" alt="${item.strMeal}" class="meal-image" />
          <div class="meal-name" id="${item.idMeal}">${item.strMeal}</div>
          </div>
          
          `
        )
        .join("");
    }

    input.value = "";
    load.style.display = "none";
  } catch (err) {
    console.error(err);
    load.style.display = "none";

    renderError(`Something Went Wrong:Try Again`);
  }
}

//4-Fetch the data from the API function to get a single meal

async function getSingleMeal(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const meals = await data.meals[0];
    console.log(meals);
    container.innerHTML = ` 
    <div class="meal-instruction">
    <h1 class="title">${meals.strMeal}</h1>
    <button id='btn-back'>Back</button>
    <h2>INGREDIENTS:</h2>
      <div class="meal-container">
    <ul class="ingredients-list"></ul> 
    <div class="meal-category-area">
    <div class=area>
    <div class=first>
    <h2>Category:</h2>
    <span >${meals.strCategory} </span>
    </div>
    <div class=second>
    <h2>Area:</h2>
    <span >${meals.strArea}</span>
    </div>
    </div>

   </div>
     
    </div>
    <h2>DIRECTIONS:</h2>
   <p class="directions">${meals.strInstructions}</p>
   <h2>VIDEO:</h2>
   <div class="video"> <iframe src='${meals.strYoutube.replace(
     /watch[?]v=/g,
     "embed/"
   )}' allow="fullscreen">
  </iframe>
   </div>
   </div>
   
   `;

    //Back Button Handle
    const btn = document.getElementById("btn-back");
    btn.addEventListener("click", () => {
      location.reload();
    });
    //Meal Ingredient List Handle
    const ul = document.querySelector(".ingredients-list");
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      if (meals[`strIngredient${i}`]) {
        ingredients.push(
          `${meals[`strIngredient${i}`]} - ${meals[`strMeasure${i}`]}`
        );
      } else break;
    }
    ul.innerHTML = ingredients.map((item) => `<li>${item}</li>`).join("");
    load.style.display = "none";
  } catch (err) {
    console.error(err);
    load.style.display = "none";

    renderError(`Something Went Wrong:${err.message}`);
  }
}

//5-Select a meal Function
async function selectedMeal(e) {
  if (e.target.classList.contains("meal-name")) {
    const idMeal = e.target.id;
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;
    try {
      await getSingleMeal(url);
      load.style.display = "none";
    } catch (err) {
      console.error(err);
      load.style.display = "none";

      renderError(`Something Went Wrong:Try Again`);
    }
  }
}

//Event Listener Handle

//Search for a meal event
search.addEventListener("click", () => {
  load.style.display = "block";
  getMeal();
});

//Select a meal event
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("meal-name")) {
    load.style.display = "block";
    selectedMeal(event);
  }
});

//Get a random meal event
random.addEventListener("click", () => {
  load.style.display = "block";
  const url = `https://www.themealdb.com/api/json/v1/1/random.php`;
  getSingleMeal(url);
});
