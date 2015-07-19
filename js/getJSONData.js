var studentGroupTxtInput,
	weekOffSet = 0,
	dataFetched = false,
	pageTitle = document.title,
	resultJSON;
	
function emptySubjectDivs() {
	$('.cal-data').remove();
}

$('#search-personal-btn').click(function() {
	var codes = $('#personal-search-box').val();
	$('#personal-search-box').addClass('loadinggifbox');
	$.post('getCourseData.php', {codes:codes}, function(results) {
		resultJSON = JSON.parse(results);
		console.log(resultJSON);
		
		if (resultJSON.message == 'No results') {
			$('#personal-results tbody').empty();
			$('#personal-search-error').show();
		} else {
			$('#personal-search-error').hide();
			var course = resultJSON.realizations[0];
			var startDate = moment(course.startDate).format("D.M.YYYY");
			var endDate = moment(course.endDate).format("D.M.YYYY");
			$('#personal-results tbody').empty();
			$('#personal-results tbody').append("<tr><td>"
			+ course.name
			+ "</td><td>" + course.code
			+ "</td><td>" + course.studentGroups[0].code 
			+ "</td><td>" + startDate
			+ "</td><td>" + endDate
			+ '</td><td class="add-btn-cell"><button id="' + course.code 
			+ '" class="btn btn-success personal-add-btn" type="button" onclick="addToPersonalCalendar(this)">Lisää</button>' + "</td></tr>");
		}
		$('#personal-search-box').removeClass('loadinggifbox');
	});
});

function addToPersonalCalendar(button) {
	if (localStorage.getItem("courses") == null) {
		var courses = [];
		courses.push({"courseCode": button.id});
		localStorage.setItem("courses", JSON.stringify(courses));
	} else {
		var courses = JSON.parse(localStorage.getItem("courses"));
		courses.push({"courseCode": button.id});
		localStorage.setItem("courses", JSON.stringify(courses));
		
	}
	console.log(JSON.parse(localStorage.getItem("courses")));
}

$('#delete-all-personal-courses').on('click', function() {
	localStorage.removeItem("courses");
});

var searchOpen = false;
$('#search-btn').click(function() {
	// Muuttaa vain hashia, mikä aiheuttaa searchCalendar kutsun
	location.hash = $('#search-box').val().toUpperCase();
	if (location.hash.substr(1) == $('#search-box').val().toUpperCase()) {
		navigate();
	}
	if (window.innerWidth <= 767) {
		var navMain = $("#bs-example-navbar-collapse-1");
		navMain.collapse('hide');
	}
});


function searchCalendar() {
	$('#search-box').blur();
	mobSetDisplayDate();
	weekOffSet = 0;
	emptySubjectDivs();
	studentGroupTxtInput = $('#search-box').val().toUpperCase();
	getDataPOST();
	renderNextWeekPage(weekOffSet, moment().isoWeek());
	document.title = pageTitle + " - " +$('#search-box').val().toUpperCase();
}

	
function getDataPOST() {
	$('.weekdaySubjects').addClass('loadinggif');
	$.post('getData.php', {studentGroup:studentGroupTxtInput, weekOffSet: weekOffSet}, function(results) {
		resultJSON = JSON.parse(results);
		if (resultJSON.message == 'No results') {
			/*
			var errorBox = document.getElementById('errorBox');
			$("#errorBox").show().delay(5000).fadeOut();
			errorBox.innerHTML = 'Ei tuloksia viikolle <b>' + (weekOffSet + moment().isoWeek())
			+ '</b> hakusanalla <b>' + $('#search-box').val().toUpperCase() + '</b>';
			location.hash = '';*/
			dataFetched = true;
		} else {
			renderWeekdaySubjects(JSON.parse(results), "Monday");
			renderWeekdaySubjects(JSON.parse(results), "Tuesday");
			renderWeekdaySubjects(JSON.parse(results), "Wednesday");
			renderWeekdaySubjects(JSON.parse(results), "Thursday");
			renderWeekdaySubjects(JSON.parse(results), "Friday");
			dataFetched = true;
		}
		$('.weekdaySubjects').removeClass('loadinggif');
	});
}

var currentDayAsText = moment().format("dddd");
var mobDayCounter = 0;
$('#navigateForward').click(function() {
	if (window.innerWidth <= 767) {
		mobSwitchDay('forward');
	} else {
		emptySubjectDivs();
		weekOffSet += 1;
		if (dataFetched) {
			getDataPOST();
		}
		renderNextWeekPage(weekOffSet, moment().isoWeek());
	}
});

$('#navigateBack').click(function() {
	if (window.innerWidth <= 767) {
		mobSwitchDay('back');
	} else {
		emptySubjectDivs();
		weekOffSet -= 1;
		if (dataFetched) {
			getDataPOST();
		}
		renderNextWeekPage(weekOffSet, moment().isoWeek());
	}
});

function mobSwitchDay(direction) {
	var elements = document.getElementsByClassName('current-weekday');
	var currentDayId = (elements[0].id);
	if (direction == 'forward') {
		switch(currentDayId) {
			case "monday":
			setNewDay(currentDayId, 'tuesday');
				break;
			case "tuesday":
			setNewDay(currentDayId, 'wednesday');
				break;
			case "wednesday":
			setNewDay(currentDayId, 'thursday');
				break;
			case "thursday":
			setNewDay(currentDayId, 'friday');
				break;
			case "friday":
			emptySubjectDivs();
			weekOffSet += 1;
			getDataPOST();
			renderNextWeekPage(weekOffSet, moment().isoWeek());
			setNewDay(currentDayId, 'monday');
				break;
		}
	} else {
		switch(currentDayId) {
			case "monday":
			emptySubjectDivs();
			weekOffSet -= 1;
			getDataPOST();
			renderNextWeekPage(weekOffSet, moment().isoWeek());
			setNewDay(currentDayId, 'friday');
				break;
			case "tuesday":
			setNewDay(currentDayId, 'monday');
				break;
			case "wednesday":
			setNewDay(currentDayId, 'tuesday');
				break;
			case "thursday":
			setNewDay(currentDayId, 'wednesday');
				break;
			case "friday":
			setNewDay(currentDayId, 'thursday');
				break;
		}
	}
	function setNewDay(oldDay, newDay) {
		// Asetetaan nykyinen päivä normaaliksi...
		$('#'+oldDay).removeClass('current-weekday');
		$('#subjects'+firstToUpperCase(oldDay)).removeClass('current-weekday');
		// ...ja uusi päivä nykyiseksi
		$('#'+newDay).addClass('current-weekday');
		$('#subjects'+firstToUpperCase(newDay)).addClass('current-weekday');
	}
}

function renderNextWeekPage(weekOffSet, currentWeek) {
	setWeekCounter(weekOffSet + currentWeek);
	var monday = moment().week(weekOffSet + currentWeek).weekday(1).format(dateFormat);
	var tuesday = moment().week(weekOffSet + currentWeek).weekday(2).format(dateFormat);
	var wednesday = moment().week(weekOffSet + currentWeek).weekday(3).format(dateFormat);
	var thursday = moment().week(weekOffSet + currentWeek).weekday(4).format(dateFormat);
	var friday = moment().week(weekOffSet + currentWeek).weekday(5).format(dateFormat);
	renderWeekdays(monday, tuesday, wednesday, thursday, friday);
	setCurrentDay(moment().format("D.M.YYYY"));
	showCurrentTimeLine();
}

function firstToUpperCase( str ) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}