var rhit = rhit || {};

rhit.DISPLAYNAME = "Placeholder DISPLAYNAME";
rhit.UID = "Placeholder UID";
rhit.constFirebaseActivityLogs = null;
rhit.singleConstFirebaseActivityLog = null;


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.baseAuthController = class {
	constructor() {
		this.inputEmail = document.querySelector("#inputEmail");
		this.inputPassword = document.querySelector("#inputPassword");
	}

	signOut() {
		console.log("Signout");
		firebase.auth().signOut().then(function () {
			console.log("You are now signed out");
			window.location.href = "/";
		}).catch(function (error) {
			console.log("Sign out error");
		});
	}
};

rhit.indexPageController = class extends rhit.baseAuthController {
	constructor() {
		super();

		document.querySelector("#signUpForAccountButton").onclick = (event) => {
			window.location.href = "/sign-up-page.html";
		};

		document.querySelector("#logIntoAccountButton").onclick = (event) => {
			window.location.href = "/login-page.html";
		};
	}
};

rhit.loginPageController = class extends rhit.baseAuthController {
	constructor() {
		super();

		document.querySelector("#logInButton").onclick = (event) => {
			this.loginUser(this.inputEmail, this.inputPassword);
		};

		document.querySelector("#loginGoBack").onclick = (event) => {
			window.location.href = `/`;
		};
	}

	loginUser(inputEmail, inputPassword) {
		console.log(`Log in for email ${inputEmail.value} and password ${inputPassword.value}`);
		firebase.auth().signInWithEmailAndPassword(inputEmail.value, inputPassword.value)
			.then((result) => {
				rhit.DISPLAYNAME = result.user.displayName;
				rhit.UID = result.user.uid;
				console.log('LOGIN PAGE rhit.UID :>> ', rhit.UID);
				rhit.pfpCheckForRedirects(result.user.uid);
			})
			.catch(function (error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log("Exisiting account error", errorCode, errorMessage);
			});
	}
};

rhit.signUpController = class extends rhit.baseAuthController {
	constructor() {
		super();

		this.inputName = document.querySelector("#inputName");

		document.querySelector("#createAccountButton").onclick = (event) => {
			this.createAccount(this.inputEmail, this.inputPassword, this.inputName);
		};

		document.querySelector("#signupGoBack").onclick = (event) => {
			window.location.href = `/`;
		};
	}

	createAccount(inputEmail, inputPassword, inputName) {
		console.log(`Create account for email ${inputEmail.value} and password ${inputPassword.value} with username ${inputName.value}`);
		firebase.auth().createUserWithEmailAndPassword(inputEmail.value, inputPassword.value)
			.then((result) => {
				var user = result.user;
				rhit.DISPLAYNAME = inputName.value;
				rhit.UID = user.uid;
				console.log('SIGN UP PAGE rhit.UID :>> ', rhit.UID);
				user.updateProfile({
					displayName: inputName.value
				})
					.then(() => {
						rhit.pfpCheckForRedirects(user.uid);
					}
					)
			})
			.catch(function (error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log("Create account error", errorCode, errorMessage);
			});
	}
};

rhit.petHomepageController = class extends rhit.baseAuthController {
	constructor(check) {
		super();

		if (rhit.UID === "Placeholder UID") {
			window.location.href = `/`;
		}
		const changeName = document.getElementById("barName");
		changeName.innerHTML = `<a class="navbar-brand">Hello ${rhit.DISPLAYNAME}!</a>`;

		//pet-homepage
		if (check === document.querySelector("#petHomepage")) {
			document.querySelector("#viewActivityButton").onclick = (event) => {
				window.location.href = `/activity-homepage.html?uid=${rhit.UID}`;
			};

			this.buildFriend(rhit.DISPLAYNAME);

			document.querySelector("#signOutButtonPet").onclick = (event) => {
				this.signOut();
			};
		}

		//activity-homepage
		else {
			const changeName = document.getElementById("barName");
			changeName.innerHTML = `<a class="navbar-brand">Hello ${rhit.DISPLAYNAME}!</a>`;

			document.querySelector("#submitAddActivity").onclick = (event) => {
				const activity = document.querySelector("#inputActivity").value;
				rhit.constFirebaseActivityLogs.add(activity);

				$("#addActivityDialog").on("show.bs.modal", (event) => {
					document.querySelector("#inputActivity").value = "";
				});

				$("#addActivityDialog").on("show.bs.modal", (event) => {
					document.querySelector("#inputActivity").focus();
				});
			};

			document.querySelector("#signOutButtonActivity").onclick = (event) => {
				this.signOut();
			};

			document.querySelector("#activityGoBack").onclick = (event) => {
				window.location.href = `/pet-homepage.html?uid=${rhit.UID}`;
			};

			document.querySelector("#activityHomeButton").onclick = (event) => {
				window.location.href = `/pet-homepage.html?uid=${rhit.UID}`;
			};

		}
		rhit.constFirebaseActivityLogs.beginListening(this.updateList.bind(this));
	}

	buildFriend(displayName) {
		const friendContainer = htmlToElement('<div id="friendContainer" class="d-flex justify-content-center"></div>');
		const bestFriend = htmlToElement(` <iframe id="bestFriend" width="314" height="321" scrolling="no"
        src="https://gifypet.neocities.org/pet/pet.html?name=${displayName}&dob=1723687939&element=Air&pet=https%3A%2F%2Fbettysgraphics.neocities.org%2Fimages%2Fanimals%2Fdog%2520103.gif&map=hills.jpg&background=gify.jpg&tablecolor=black&textcolor=black"
        frameborder="0"></iframe>`);
		friendContainer.appendChild(bestFriend);

		const oldList = document.querySelector("#friendContainer");
		oldList.hidden = true;
		oldList.parentElement.appendChild(friendContainer);
	}

	_createCard(singleActivity) {
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center card-text">
            <div class="left-center">${singleActivity.activity}</div>
            <div class="right-center">${singleActivity.lastTouched}</div>
          </div>
        </div>
      </div>`);
	}

	updateList() {
		const newList = htmlToElement('<div id="activityListContainer"></div>');

		for (let i = 0; i < rhit.constFirebaseActivityLogs.length; i++) {
			const singleActivity = rhit.constFirebaseActivityLogs.getActivitAtIndex(i);
			const newCard = this._createCard(singleActivity);

			newCard.onclick = (event) => {
				console.log(`You clicked on ${singleActivity.id}`);
				window.location.href = `/detail-homepage.html?id=${singleActivity.id}`;
			}
			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#activityListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}
};

rhit.FirebaseActivityLogs = class {
	constructor(uid, limit) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("ActivityLogs");
		this._unsubscribe = null;
		this._limit = limit;
	}

	add(activity) {
		this._ref.add({
			["activity"]: activity,
			["lastTouched"]: firebase.firestore.Timestamp.now(),
			["author"]: this._uid
		})
			.then(function (docRef) {
				console.log('docRef.id :>> ', docRef.id);
			})
			.catch(function (error) {
				console.log('error :>> ', error);
			});
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy("lastTouched", "desc").limit(this._limit);
		query = query.where("author", "==", this._uid);

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getActivitAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const lastTouched = docSnapshot.get("lastTouched");
		const newLastTouched = this.convertLastTouched(lastTouched);

		const singleActivity = new rhit.Activity(
			docSnapshot.id,
			docSnapshot.get("activity"),
			newLastTouched
		)
		return singleActivity;
	}

	convertLastTouched(timestamp) {
		const date = timestamp.toDate();
		return date.toLocaleDateString("en-US", {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
};

rhit.Activity = class {
	constructor(id, activity, lastTouched) {
		this.id = id;
		this.activity = activity;
		this.lastTouched = lastTouched;
	}
};

rhit.detailHomepageModel = class extends rhit.baseAuthController {
	constructor(activityId) {
		super();

		const changeName = document.getElementById("barName");
		changeName.innerHTML = `<a class="navbar-brand" href = "/pet-homepage.html?uid=${rhit.UID}"> Hello ${rhit.DISPLAYNAME}!</a>`;
		const homeButton = document.getElementById("detailHomeButton");

		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection("ActivityLogs").doc(activityId);

		document.querySelector("#signOutButtonDetail").onclick = (event) => {
			this.signOut();
		};
	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				this._documentSnapshot = doc;
				changeListener();
			}
			else {
				console.log("No such document!");
			}
		});
	}
	stopListening() {
		this._unsubscribe();
	}

	update(activity) {
		this._ref.update({
			["activity"]: activity,
			["lastTouched"]: firebase.firestore.Timestamp.now(),
		})
			.catch(function (error) {
				console.log('error :>> ', error);
			});

	}

	delete() {
		return this._ref.delete();
	}

	get activity() {
		return this._documentSnapshot.get("activity");
	}

	get lastTouched() {
		const timestamp = this._documentSnapshot.get("lastTouched");
		const date = timestamp.toDate();
		return date.toLocaleDateString("en-US", {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
};

rhit.detailHomepageController = class {
	constructor() {

		if (rhit.UID === "Placeholder UID") {
			window.location.href = `/`;
		};

		document.querySelector("#submitEditActivity").onclick = (event) => {
			const activity = document.querySelector("#inputActivity").value;
			rhit.singleConstFirebaseActivityLog.update(activity);
		};

		$("#editActivityDialog").on("show.bs.modal", (event) => {
			document.querySelector("#inputActivity").value = rhit.singleConstFirebaseActivityLog.activity;
		});

		$("#editActivityDialog").on("shown.bs.modal", (event) => {
			document.querySelector("#inputActivity").focus();
		});

		document.querySelector("#submitDeleteActivity").onclick = (event) => {
			rhit.singleConstFirebaseActivityLog.delete().then(() => {
				console.log("Doc successfully deleted");
				window.location.href = `/activity-homepage.html?uid=${rhit.UID}`;
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		};

		document.querySelector("#detailGoBack").onclick = (event) => {
			window.location.href = `/activity-homepage.html?uid=${rhit.UID}`;
		};

		document.querySelector("#detailHomeButton").onclick = (event) => {
			window.location.href = `/pet-homepage.html?uid=${rhit.UID}`;
		};

		rhit.singleConstFirebaseActivityLog.beginListening(this.updateView.bind(this));
	}

	updateView() {
		document.querySelector("#activityText").innerHTML =
			`<div class="d-flex justify-content-center">
            <div id="activityText">
                <h3 class="decorative-line">${rhit.singleConstFirebaseActivityLog.activity}</h3>
            </div>
       		</div>`;

		document.querySelector("#lastTouchedText").innerHTML =
			`<div id="lastTouchedText" class="d-flex justify-content-center">
            <div>
                <h3 class="">Activity Performed on ${rhit.singleConstFirebaseActivityLog.lastTouched}</h3>
            </div>
        	</div>`;
	}
};

rhit.pfpCheckForRedirects = function (uid) {
	if (document.querySelector("#loginPage") && uid || document.querySelector("#signUpPage") && uid) {
		window.location.href = `/pet-homepage.html?uid=${uid}`;
	}
};

rhit.setControllers = function () {
	if (document.querySelector("#loginPage")) {
		console.log("You are on the loginPage");
		new rhit.loginPageController();
	}
	else if (document.querySelector("#signUpPage")) {
		console.log("You are on the signUpPage");
		new rhit.signUpController();
	}
	else if (document.querySelector("#petHomepage")) {
		const check = document.querySelector("#petHomepage");
		console.log("You are on the petHomepage");
		rhit.constFirebaseActivityLogs = new rhit.FirebaseActivityLogs(rhit.UID, 3);
		new rhit.petHomepageController(check);
	}
	else if (document.querySelector("#indexPage")) {
		console.log("You are on the indexPage");
		new rhit.indexPageController();
	}
	else if (document.querySelector("#activityHomepage")) {
		const check = document.querySelector("#activityHomepage");
		console.log("You are on the activityHomepage");
		rhit.constFirebaseActivityLogs = new rhit.FirebaseActivityLogs(rhit.UID, 10);
		new rhit.petHomepageController(check);
	}
	else if (document.querySelector("#detailHomepage")) {
		console.log("You are on the detailHomepage");

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const activityId = urlParams.get("id");

		rhit.singleConstFirebaseActivityLog = new rhit.detailHomepageModel(activityId);
		new rhit.detailHomepageController();
	}
};

rhit.main = function () {
	console.log("Ready");

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			rhit.DISPLAYNAME = user.displayName;
			rhit.UID = user.uid;
			console.log('Signed in, rhit.UID :>> ', rhit.UID);

			rhit.setControllers();
		}
		else {
			console.log("No user signed in");
			rhit.setControllers();
		}
	});
};

rhit.main();