const edamamAppId = 'b6a59d3a';
const edamamApiKey = '46f4a96bd135a8452e7d0b6973b0a859';

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Initialize favorites for the current user
let userFavoritesKey = `favorites_${currentUser.email}`;
let favorites = JSON.parse(localStorage.getItem(userFavoritesKey)) || [];

document.getElementById('recipeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const mainIngredient = document.getElementById('mainIngredient').value.trim().toLowerCase();
    fetchRecipes(mainIngredient);
});

document.getElementById('homeLink').addEventListener('click', function() {
    document.getElementById('recipeContainer').style.display = 'flex';
    document.getElementById('favoritesContainer').style.display = 'none';
});

document.getElementById('favoritesLink').addEventListener('click', function() {
    displayFavorites();
    document.getElementById('recipeContainer').style.display = 'none';
    document.getElementById('favoritesContainer').style.display = 'flex';
});

document.getElementById('logoutLink').addEventListener('click', function() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
});

async function fetchRecipes(mainIngredient) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(mainIngredient)}`);
        const data = await response.json();
        if (data.meals) {
            displayRecipes(data.meals);
        } else {
            document.getElementById('recipeContainer').innerHTML = '<p>No recipes found with the given ingredient.</p>';
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipeContainer').innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
    }
}

function displayRecipes(recipes) {
    const recipeContainer = document.getElementById('recipeContainer');
    recipeContainer.innerHTML = '';
    recipes.forEach((recipe, index) => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe';
        recipeElement.innerHTML = `
            <h3>${recipe.strMeal}</h3>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
            <div class="dots" onclick="toggleDropdown(${index})">...</div>
            <div class="dropdown" id="dropdown-${index}">
                <button onclick="addToFavorites(${index}, '${recipe.idMeal}', '${recipe.strMeal}', '${recipe.strMealThumb}')", style= "color:brown;">Add to Favorites</button>
            </div>
            <div class="buttons">
                <button class="option" onclick="viewRecipeAndIngredients('${recipe.idMeal}')">See Recipe and Ingredients</button>
                <button class="option" onclick="calculateCalories('${recipe.idMeal}')">Calculate Total Calories</button>
            </div>
        `;
        recipeContainer.appendChild(recipeElement);
    });
}

function toggleDropdown(index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function addToFavorites(index, id, name, image) {
    if (!favorites.some(recipe => recipe.id === id)) {
        const recipe = { id, name, image };
        favorites.push(recipe);
        localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
        alert(`${name} added to favorites`);
        const dropdownId = `dropdown-${index}`;
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.style.display = 'none'; // Set display to none to hide the dropdown
        }
    } else {
        alert(`${name} is already in favorites`);
        const dropdownId = `dropdown-${index}`;
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.style.display = 'none'; // Set display to none to hide the dropdown
        }
    }
}

function removeFromFavorites(id) {
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '';
    favorites.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe';
        recipeElement.innerHTML = `
            <h3>${recipe.name}</h3>
            <img src="${recipe.image}" alt="${recipe.name}" />
            <div class="buttons">
                <button class="option" onclick="viewRecipeAndIngredients('${recipe.id}')">See Recipe and Ingredients</button>
                <button class="option" onclick="removeFromFavorites('${recipe.id}')">Remove from Favorites</button>
            </div>
        `;
        favoritesContainer.appendChild(recipeElement);
    });
}

async function viewRecipeAndIngredients(idMeal) {
    const recipeDetails = await fetchRecipeDetails(idMeal);
    if (recipeDetails) {
        const ingredients = getIngredientsArray(recipeDetails).join(', ');
        alert(`Recipe for ${recipeDetails.strMeal}:\n\nIngredients: ${ingredients}\n\nInstructions: ${recipeDetails.strInstructions}`);
    }
}

async function calculateCalories(idMeal) {
    const recipeDetails = await fetchRecipeDetails(idMeal);
    if (recipeDetails) {
        const response = await fetch(`https://api.edamam.com/api/nutrition-details?app_id=${edamamAppId}&app_key=${edamamApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: recipeDetails.strMeal, ingr: getIngredientsArray(recipeDetails) }),
        });
        const data = await response.json();
        if (data.totalNutrients) {
            alert(`Total calories for ${recipeDetails.strMeal}: ${data.totalNutrients.ENERC_KCAL.quantity} kcal`);
        } else {
            alert(`Could not calculate calories for ${recipeDetails.strMeal}`);
        }
    }
}

async function fetchRecipeDetails(idMeal) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

function getIngredientsArray(recipeDetails) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipeDetails[`strIngredient${i}`];
        const measure = recipeDetails[`strMeasure${i}`];
        if (ingredient && measure) {
            ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
        }
    }
    return ingredients;
}
