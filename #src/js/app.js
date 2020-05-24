(function () {
	const API = {
		RANDOM_JOKE: 'https://api.chucknorris.io/jokes/random',
		ALL_CATEGORIES: 'https://api.chucknorris.io/jokes/categories'
	};
	let favoriteJokes = getFromLocalStorage();
	let serverData = [];

	/**
	 * Get data from LocalStorage.
	 * @return {Array} Array of Saved favorite jokes data
	 */
	function getFromLocalStorage() {
		const newJokesData = localStorage.getItem('jokes');
		if (newJokesData) {
			return JSON.parse(newJokesData);
		}
		return [];
	}

	function get(url) {
		return fetch(url).then(res => res.json());
	}
	
	get(API.ALL_CATEGORIES).then((data) => {
	}).catch(err => {
		return [];
	});

		/** Count the numbers of hours
	 * @param {Date} dt2 Current date
	 * @param {Date} dt1 Update date
	 * @return {number} Hours since update date
	 */
	function diffHours(dt2, dt1) {
		let diff =(dt2.getTime() - dt1.getTime()) / 1000;
		diff /= (60 * 60);
		return Math.abs(Math.round(diff));
	}

	/**
	 * Create HTML element with className, attribute, content, events
	 * @param {String} name HTML tag
	 * @param {([String] | String)} className class for HTML tag
	 * @param {([String] | String)} content content in this element
	 * @param {Object} attrs attribute for this element
	 * @param {Object} events events for this element
	 * @return {HTMLElement} HTML element with properties
	 */
	function createEl(name, className=null, content=null, attrs=null, events=null) {
		const element = document.createElement(name);
		if (Array.isArray(className)) {
			for (let item of className) {
				element.classList.add(item);
			}
		} else if(className){
			element.classList.add(className);
			}
		if (Array.isArray(content)) {
			for (let item of content) {
				if (typeof item === 'string') {
					const text = document.createTextNode(item);
					element.appendChild(text);
				} else if (item) {
					element.appendChild(item);
				}
			}
		} else if (content) {
			if (typeof content === 'string') {
				if (name === 'input') {
					element.value = content;
				} else {
					const text = document.createTextNode(content);
					element.appendChild(text);
				}
			} else {
				element.appendChild(content);
			}
		}
		if (attrs) {
			for (let key in attrs) {
				if (!attrs.hasOwnProperty(key)) {
					continue;
				}
				element.setAttribute(key, attrs[key]);
			}
		}
		if (events) {
			for (let key in events) {
				if (!events.hasOwnProperty(key)) {
					continue;
				}
				element.addEventListener(key, events[key]);
			}
		}
		return element;
	}

	/**
	 * Create HTML block with joke
	 * @param {Object} joke Object of date about joke
	 * @return {HTMLElements}
	 */
	function createJoke(joke) {
		return createEl('div', 'joke', [
			createEl('span', 'joke__icon'),
			createEl('div', 'joke__content', [
				createEl('p', 'joke__id', [
					createEl('span', 'joke__id-text', 'ID: '),
					createEl('a', 'joke__link', [joke.id], { href: joke.url })
				]),
				createEl('p', 'joke__description', joke.value),

				createEl('span', 'joke__data-update', `Last updated: ${diffHours(new Date(), new Date(joke.updated_at))} hours ago`),
				joke.categories.length !== 0 ? createEl('span', 'joke__category', joke.categories) : null
			]),
			createEl('button', isAFavorite(joke) ? ['joke__save', 'active'] : 'joke__save', null, null, {
				click: function (event) {
					updateFavoriteJokes(joke);
				}
			})
		])
	}

	/**
	 * Add new favorite joke to array with favorite jokes and set new data to Local Storage
	 * @param {Object} joke Object by favorite joke
	 */
	function updateFavoriteJokes(joke) {
		if (!isAFavorite(joke)) {
			favoriteJokes.push(joke);
		} else {
			for (let i = 0; i < favoriteJokes.length; i++) {
				if (favoriteJokes[i].id !== joke.id) {
					continue;
				}
				favoriteJokes.splice(i, 1);
				break;
			}
		}
		localStorage.removeItem('jokes');
		localStorage.setItem('jokes', JSON.stringify(favoriteJokes));
		renderFavoriteJokes();
		renderResult();
	}

/**
 * Create some HTML blokes with jokes
 * @param {Array} data Array with all available categories
 * @return {[HTMLElement]} Array with HTML elements
 */
	function createJokesList(data) {
			return data.map(element => {
				return createJoke(element)
		})
	}

	/**
	 * Create list with all available categories
	 * @param {Array} array Array with favorite jokes
	 * @return {Array} Array with HTML elements
	 */
	function createListOfCategories(array) {
		return array.map(element => {
		 return createEl('label', 'form__category', [
			 createEl('input', 'form__field-category', null, {
				 type: 'radio',
				 name: 'category',
				 value: element,
			 }, {
					 change: (event) => {
					 const labels = document.querySelectorAll('.form__category');
					 labels.forEach(element => {
						element.classList.remove('active');
					 });
					 event.target.parentElement.classList.add('active');
					 }
				}),
				element
			]);
		});
	}

	/**
	 * Draw container for available categories
	 * @return {HTMLElement} HTML block
	 */
	function drawListOfCategories() {
		const categoryItem = document.querySelector('.form__item--category');
		return categoryItem.appendChild(createEl('div', 'form__categories-list'));
	}

	/**
	 * Create and Draw search field
	 * @return {HTMLElement} HTML elements
	 */
	function drawSearchInput() {
		const searchItem = document.querySelector('.form__item--search');
		return searchItem.append(
			createEl('input', 'form__search-field', null, {
			placeholder: 'Free text search...',
			type: 'search',
			name: 'search',
			required: ''
		}),
			createEl('span', 'form__search-error', null, {
				id: 'search_error'
			})
		);
	}

/**
 * Render favorite jokes
 */
	function renderFavoriteJokes() {
		const favoriteContainer = document.querySelector('#favorite');
		favoriteContainer.innerHTML = '';
		favoriteContainer.append(...createJokesList(favoriteJokes));
	}

	/**
	 * Render search result
	 */
	function renderResult() {
		const container = document.querySelector('#root');
		container.innerHTML = '';
		if (serverData.length === 0) {
			container.appendChild(createEl('div', null, `Sorry, we don't have any jokes by your request`));
		}
		container.append(...createJokesList(serverData));
	}

	/**
	 * Check joke - it is favorite or not.
	 * @param {Object} joke Object with data about favorite joke
	 * @return {Boolean}
	 */
	function isAFavorite(joke) {
		return !!favoriteJokes.find(favoriteJoke => favoriteJoke.id === joke.id);
	}

	/**
	 * Get random joke by API request
	 * @return {Promise[Object]}
	 */
	function getRandomJoke() {
		return get(API.RANDOM_JOKE);
	}

			/**
	 * Get joke by selected category by API request
	 * @return {Promise[Object]}
	 */
	function getCategoryJoke(formData) {
		return get(`https://api.chucknorris.io/jokes/random?category=${formData.category}`);
	}

		/**
	 * Get jokes by search request
	 * @param {Object} formData Object with data by form
	 * @return {Promise[Object]}
	 */
	function getSearchJokes(formData) {
		const searchInput = document.querySelector('.form__search-field');
		const searchError = document.querySelector('#search_error');
		if (formData.search.length >= 3) {
			searchError.innerHTML = '';
			searchInput.value = '';
			return get(`https://api.chucknorris.io/jokes/search?query=${formData.search.toLowerCase()}`);
		}
		searchInput.value = '';
		searchError.innerText = 'Your request should contain at least 3 letters';
		return null;
	}

	window.addEventListener('DOMContentLoaded', function () {
		renderFavoriteJokes();
		const categoriesInput = document.getElementsByName('choice');
		categoriesInput.forEach(element => {
			element.addEventListener('change', function () {
				const categoryList = document.querySelector('.categories-list');
				const formSearchInput = document.querySelector('.form__search-field');
				if (categoryList) {
					categoryList.remove();
				}
				if (formSearchInput) {
					formSearchInput.remove();
				}
				if (this.value === 'categories') {
					formSendStrategy = getCategoryJoke;
					get(API.ALL_CATEGORIES).then((data) => {
						drawListOfCategories().append(...createListOfCategories(data));
					});
				}
				if (this.value === 'random') {
					formSendStrategy = getRandomJoke;
				}
				if (this.value === 'search') {
					formSendStrategy = getSearchJokes;
					drawSearchInput();
				}
			});
		});

		let formSendStrategy = getRandomJoke;

		const submitBtn = document.querySelector('#submit');
		submitBtn.addEventListener('click', function (event) {
			event.preventDefault();
			const form = document.querySelector('#form')
			const formData = Object.fromEntries(Array.from(new FormData(form)));
			const apiRequest = formSendStrategy(formData);
			if (apiRequest !== null) {
				apiRequest.then((data) => {
					serverData = data.result ? data.result : [data];
					renderResult();
				})
			}
		});

		const favorite = document.querySelector('.favorite-block');
		const btnOpenFavoriteJokes = document.querySelector('#btn_open');
		const btnCloseFavoriteJokes = document.querySelector('#btn_close');
		btnOpenFavoriteJokes.addEventListener('click', function () {
			favorite.classList.add('active');
		});

		btnCloseFavoriteJokes.addEventListener('click', function () {
			favorite.classList.remove('active');
		});
	});
})();