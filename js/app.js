// ====================== Event Listeners ======================= \\

// When you click on a character display it's information on the page.
// When you click on a tag populate the searchbar with it's text and search.
document.addEventListener(
	"click",
	function(event) {
		if (event.target.matches("img")) {
			getInfo(event.target.id);
		} else if (event.target.matches(".tag")) {
			document.getElementById("search").value = event.target.innerText;
			search();
		}
	},
	false
);

// Perform the drag function if element is an image.
document.addEventListener(
	"dragstart",
	function(event) {
		if (event.target.matches("img")) {
			drag(event);
		}
	},
	false
);

// Perform the drag end function if the element is an image.
document.addEventListener(
	"dragend",
	function(event) {
		if (event.target.matches("img")) {
			dragEnd(event.target);
		}
	},
	false
);

// ====================== Functions ======================= \\

// Convert JSON database to a javascript object asyncronously.
async function fetchData() {
	const response = await fetch("../assets/database/db.json");
	const data = await response.json();
	return data;
}

// Create an ajax request to retrieve the local assets and populate the character lists.
function getImages() {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "../assets/portraits/", true);
	xhr.responseType = "document";
	xhr.onload = () => {
		// Check to see if the response is a success.
		if (xhr.status === 200) {
			console.log(xhr.response);
			const elements = xhr.response.getElementsByTagName("a");
			for (x of elements) {
				if (x.href.match(/\.(jpe?g|png|gif)$/)) {
					const imgtitle = x.innerText; // WAMP
					// const imgtitle = x.title; // Live Server
					const img = document.createElement("img");
					img.src = x.href;
					img.draggable = true;
					img.id = imgtitle.slice(0, -4);
					img.classList = "hvr-grow pointer";
					document.getElementById("characterList").appendChild(img);
				}
			}
		} else {
			alert("Request failed. Returned status of " + xhr.status);
		}
	};
	xhr.send();
}

// Grab character info from the js object database.
async function getInfo(id) {
	const md = window.markdownit();
	const db = await fetchData();

	const characters = db.Characters;
	const name = document.getElementById("name");
	const health = document.getElementById("health");
	const damage = document.getElementById("damage");
	const armour = document.getElementById("armour");
	const focus = document.getElementById("focus");
	const resistance = document.getElementById("resistance");
	const critdamage = document.getElementById("critdamage");
	const critchance = document.getElementById("critchance");
	const speed = document.getElementById("speed");
	const basic = document.getElementById("basic");
	const basicdesc = document.getElementById("basicdesc");
	const special = document.getElementById("special");
	const specialdesc = document.getElementById("specialdesc");
	const ultimate = document.getElementById("ultimate");
	const ultimatedesc = document.getElementById("ultimatedesc");
	const passive = document.getElementById("passive");
	const passivedesc = document.getElementById("passivedesc");
	const colors = ["btn-primary", "btn-success", "btn-danger", "btn-warning", "btn-info"];
	const tagbuttons = document.getElementById("tags");

	// Find the character in the database that matches the id clicked.
	const char = characters.filter(function(el) {
		return el.Id === id;
	});

	// Save the tags in an array for future use.
	const tags = char[0].Tags;

	// Populate the page with character information.
	name.innerHTML = char[0].Name;
	health.innerHTML = char[0].Health;
	damage.innerHTML = char[0].Damage;
	armour.innerHTML = char[0].Armor;
	focus.innerHTML = char[0].Focus;
	resistance.innerHTML = char[0].Resistance;
	critdamage.innerHTML = char[0]["Crit Damage"];
	critchance.innerHTML = char[0]["Crit Chance"];
	speed.innerHTML = char[0].Speed;

	// Reset the tags.
	tagbuttons.innerHTML = "";

	// For however many tags the character has create a button with a random color that
	// allows you to search for characters that match the tag.
	for (let i = 0; i < tags.length; i++) {
		const color = colors[Math.floor(Math.random() * colors.length)];
		const button = document.createElement("button");
		button.classList = `btn btn-sm ${color} mr-1 mb-1 tag`;
		button.innerText = tags[i];
		tagbuttons.appendChild(button);
	}

	// Due to minions having a different move set check to see if the selected character
	// is a minion and alter the page appropriately.
	if (char[0].Tags.includes("Minion")) {
		basic.innerHTML = char[0].Abilities.Basic.Name;
		basicdesc.innerHTML = md.render(char[0].Abilities.Basic.Description);
		special.innerHTML = char[0].Abilities.Special.Name;
		specialdesc.innerHTML = md.render(char[0].Abilities.Special.Description);
		ultimate.innerHTML = char[0].Abilities.Passive.Name;
		ultimatedesc.innerHTML = md.render(char[0].Abilities.Passive.Description);
		passive.innerHTML = "";
		passivedesc.innerHTML = "";
	} else {
		basic.innerHTML = char[0].Abilities.Basic.Name;
		basicdesc.innerHTML = md.render(char[0].Abilities.Basic.Description);
		special.innerHTML = char[0].Abilities.Special.Name;
		specialdesc.innerHTML = md.render(char[0].Abilities.Special.Description);
		ultimate.innerHTML = char[0].Abilities.Ultimate.Name;
		ultimatedesc.innerHTML = md.render(char[0].Abilities.Ultimate.Description);
		passive.innerHTML = char[0].Abilities.Passive.Name;
		passivedesc.innerHTML = md.render(char[0].Abilities.Passive.Description);
	}
}

// Get the character database and the input, then cross reference the images with
// the filter and hide any images that don't match.
async function search() {
	// Retrieve the database.
	const db = await fetchData();
	const characters = db.Characters;
	let input, filter;
	input = document.getElementById("search");
	filter = input.value.toUpperCase();

	// Get all of the characters in the list.
	images = document.getElementById("characterList").getElementsByTagName("img");

	// For each character in the list check if
	for (img of images) {
		let id = img.id;
		for (let i = 0; i < characters.length; i++) {
			if (characters[i].Id === id) {
				let tags = characters[i].Tags.map(function(x) {
					return x.toUpperCase();
				});
				if (tags.some(v => filter.includes(v)) || id.toUpperCase().indexOf(filter) > -1) {
					img.style.display = "";
				} else {
					img.style.display = "none";
				}
			}
		}
	}
}

// Sort the images inside an element by alphabetical order.
function sortImages(container) {
	let images = container.getElementsByTagName("img"),
		imageSources = [],
		imageIds = [];
	for (let i = images.length; i-- > 0; ) {
		imageSources.push(images[i].src);
		imageIds.push(images[i].id);
	}
	imageSources = imageSources.sort();
	imageIds = imageIds.sort();
	for (let i = imageSources.length; i-- > 0; ) {
		images[i].src = imageSources[i];
		images[i].id = imageIds[i];
	}
}

// When an item is dragged make apply the invisible class to it and set the data to be
// transfered as it's id.
function drag(e) {
	setTimeout(() => (e.target.className = "invisible"), 0);
	e.dataTransfer.setData("text", e.target.id);
}

function allowDrop(e) {
	e.preventDefault();
}

// If the item is dropped onto an element with an appropriate dropzone transfer the
// element there.
function drop(e, element) {
	e.preventDefault();
	if (element.classList.contains("drag-slot-dark") || element.classList.contains("drag-slot-light")) {
		if (element.childNodes.length < 1) {
			const data = e.dataTransfer.getData("text");
			image = document.getElementById(data);
			element.appendChild(image);
			sortImages(element);
		} else {
			console.log("Slot filled.");
		}
	} else {
		const data = e.dataTransfer.getData("text");
		image = document.getElementById(data);
		element.appendChild(image);
		sortImages(element);
		console.log(element.childNodes.length);
	}
}

// When finished dragging add the appropriate styles back to the item.
function dragEnd(e) {
	e.className = "hvr-grow pointer";
}

// Create new elements to hold the saved teams, collect the appropriate data and perform
// some calculations before appending to the bottom of the container in a new row.
function saveTeam() {
	// Elements
	const form = document.getElementById("saveTeam");
	const characterList = document.getElementById("characterList");
	const teamname = document.getElementById("teamname").value;
	const savedteams = document.getElementById("savedteams");

	if (teamname == "") {
		alert("Your team name cannot be empty.");
		return false;
	}

	// Character 1 Data
	const character1 = document.getElementById("character1");
	const power1 = parseInt(document.getElementById("power1").value);
	const stars1 = parseInt(document.getElementById("stars1").value);
	const redstars1 = parseInt(document.getElementById("redstars1").value);

	console.log(power1);
	if (isNaN(power1)) {
		alert("Please enter a power level for Character 1");
		return false;
	}

	// Character 2 Data
	const character2 = document.getElementById("character2");
	const power2 = parseInt(document.getElementById("power2").value);
	const stars2 = parseInt(document.getElementById("stars2").value);
	const redstars2 = parseInt(document.getElementById("redstars2").value);

	if (isNaN(power2)) {
		alert("Please enter a power level for Character 2");
		return false;
	}

	// Character 3 Data
	const character3 = document.getElementById("character3");
	const power3 = parseInt(document.getElementById("power3").value);
	const stars3 = parseInt(document.getElementById("stars3").value);
	const redstars3 = parseInt(document.getElementById("redstars3").value);

	if (isNaN(power3)) {
		alert("Please enter a power level for Character 3");
		return false;
	}

	// Character 4 Data
	const character4 = document.getElementById("character4");
	const power4 = parseInt(document.getElementById("power4").value);
	const stars4 = parseInt(document.getElementById("stars4").value);
	const redstars4 = parseInt(document.getElementById("redstars4").value);

	if (isNaN(power4)) {
		alert("Please enter a power level for Character 4");
		return false;
	}

	// Character 5 Data
	const character5 = document.getElementById("character5");
	const power5 = parseInt(document.getElementById("power5").value);
	const stars5 = parseInt(document.getElementById("stars5").value);
	const redstars5 = parseInt(document.getElementById("redstars5").value);

	if (isNaN(power5)) {
		alert("Please enter a power level for Character 5");
		return false;
	}

	let team = [character1, character2, character3, character4, character5];
	if (!character1.hasChildNodes() || !character2.hasChildNodes() || !character3.hasChildNodes() || !character4.hasChildNodes() || !character5.hasChildNodes()) {
		alert("Make sure you've selected 5 characters!");
	} else {
		// Set up the elements.
		let row = document.createElement("div");
		row.classList = "row mb-2 align-items-center";
		let teamColumn = document.createElement("div");
		teamColumn.classList = "col-sm-2 text-center";
		let imageColumn = document.createElement("div");
		imageColumn.classList = "col-sm-5 text-center";
		let powerColumn = document.createElement("div");
		powerColumn.classList = "col-sm-1 text-center";
		let starColumn = document.createElement("div");
		starColumn.classList = "col-sm-2 text-center";
		let redstarColumn = document.createElement("div");
		redstarColumn.classList = "col-sm-2 text-center";

		// Add team name to team column
		let teamData = document.createElement("h5");
		teamData.innerText = teamname;
		teamColumn.appendChild(teamData);
		row.appendChild(teamColumn);

		// Add character images to image column.
		team.forEach(character => {
			let img = document.createElement("img");
			img.src = character.childNodes[0].src;
			img.id = character.childNodes[0].id;
			img.draggable = false;
			imageColumn.appendChild(img);
		});
		row.appendChild(imageColumn);

		// Add combined power level to power column.
		let powerLevel = document.createElement("h5");
		powerLevel.innerText = (power1 + power2 + power3 + power4 + power5).toString();
		powerColumn.appendChild(powerLevel);
		row.appendChild(powerColumn);

		// Add average star count to star column
		let averageStar = document.createElement("h5");
		averageStar.innerText = Math.floor((stars1 + stars2 + stars3 + stars4 + stars5) / 5).toString();
		starColumn.appendChild(averageStar);
		row.appendChild(starColumn);

		// Add average red star count to red star column
		let averageRedStar = document.createElement("h5");
		averageRedStar.innerText = Math.floor((redstars1 + redstars2 + redstars3 + redstars4 + redstars5) / 5).toString();
		redstarColumn.appendChild(averageRedStar);
		row.appendChild(redstarColumn);

		// Add the saved team to the row.
		savedteams.appendChild(row);

		// Reset from and return characters to the list.
		characterList.appendChild(character1.childNodes[0]);
		characterList.appendChild(character2.childNodes[0]);
		characterList.appendChild(character3.childNodes[0]);
		characterList.appendChild(character4.childNodes[0]);
		characterList.appendChild(character5.childNodes[0]);
		sortImages(characterList);
		form.reset();
	}

	return false;
}

// When the page loads populate the character list elements with characters.
window.onload = function() {
	if (document.getElementById("characterList")) {
		getImages();
	}
};

// When the page scrolls to a certain distance make the navbar opaque so you can
// still read the nav.
const nav = document.getElementById("nav");
window.onscroll = function() {
	"use strict";
	if (document.documentElement.scrollTop >= 5) {
		nav.classList.add("nav-colored");
		nav.classList.remove("nav-transparent");
	} else {
		nav.classList.add("nav-transparent");
		nav.classList.remove("nav-colored");
	}
};
