// Suomalainen formaatti
var dateFormat = "D.M.YYYY";


function renderTimes() {
	var STARTTIME = 8,
			ENDTIME = 21,
			h;
  // add the times to the first table cell.  the height of the span is set in the css
	// to 60 which is the same as the var above
  var timeColumn = $('#schedule-time');
  for (h=STARTTIME; h<=ENDTIME; h++) {
		$("<div class='time'><span>" + h + ":00</span></div>").appendTo(timeColumn);
	}
}

function renderWeekdaySubjects(searchResults, weekdayNumber) {
	var STARTTIME = 8,
			ENDTIME = 21,
			HEIGHTOFHOUR = 60,
			h, m, e,
			ts, event, leftindex;
	var events = searchResults.reservations;
	// set up timeslots
	// it is 1 for each minute of the day
	var MINUTESINDAY = (ENDTIME - STARTTIME) * 60;

	var timeslots = [];
	for (m=0; m<MINUTESINDAY; m++) {
		timeslots.push([]);
	}
	// the eventids will probably come from a database and cannot be numeric so we
	// use the EventsById object as a kind of lookup - well use the ids as properties of this
	// object and then get them using array notation.
	var EventsById = {};
	setUpEvents(events);
	
	// load events into timeslots - events must be sorted by starttime already
	var numEvents = events.length;
	for (e=0; e<numEvents; e++) {
		event = events[e];
		for (m=event.start; m<event.stop; m++) {
			timeslots[m].push(event.id);
		}
	}
	
	// take the timeslots one at a time
	// for each event in the timeslot make sure that it has the right numcolumns (max amount for that event)
	// then check if its leftindex has been set
	// if not then set it.  find the first free space in that timeslot
	for (m=0; m<MINUTESINDAY; m++) {
		ts = timeslots[m];
		for (e=0; e<ts.length; e++) {
			event = EventsById[ ts[e] ];
			var max = ts.length;
			ts.forEach(function(id){
				var evt = EventsById[id];
				max=(evt.numcolumns>max)?evt.numcolumns:max;
			});
		
			if (event.numcolumns <= max) {    
				event.numcolumns = max;
			}
		 
			if (event.leftindex == -1) {
				leftindex = 0;
				while (! isFreeSpace(ts, leftindex, event.id)) {
						leftindex++;
				}
				event.leftindex = leftindex;
			}
		}
	}
	// UPDATE CODE AFTER COMMENT
	// fix numcolumns
	for (m=0; m<MINUTESINDAY; m++) {
		ts = timeslots[m];
		for (e=0; e<ts.length; e++) {
			event = EventsById[ ts[e] ];
			var max = ts.length;
			ts.forEach(function(id){
				var evt = EventsById[id];
				max=(evt.numcolumns>max)?evt.numcolumns:max;
			});
		
			if (event.numcolumns <= max) {    
				event.numcolumns = max;
			}
		}
	}
	
	
	layoutEvents();
	
	function isFreeSpace(ts, leftindex, eventid) {
		var tslength = ts.length;
		var event;
		for (var i=0; i<tslength; ++i) {
			// get the event in this timeslot location
			event = EventsById[ts[i]];
			if (event.leftindex == leftindex) {
				if (event.id != eventid) {
					return false; // left index taken
				} else {
					return true; // this event is in this place
				}
			}
		}
		return true;
	}
	
	function setUpEvents(events) {
		var numEvents = events.length;
		var event, e, pos, stH, stM, etH, etM, height;
	
		for (e=0; e<numEvents; e++) {
			if (moment(events[e].startDate).format("dddd") == weekdayNumber) {
				event = events[e];
				event.leftindex = -1;
				event.numcolumns = 0;
				var formatedH = moment(event.startDate).format("HH:mm");
				pos = formatedH.indexOf(':');
				stH = parseInt( formatedH.substr(0, pos), 10);
				stM = parseInt( formatedH.substr(pos+1), 10) / 60;
				// need its positions top and bottom in minutes
				event.start = ((stH - STARTTIME) * 60) + (stM * 60);
				event.topPos = ((stH - STARTTIME) * HEIGHTOFHOUR) + (stM * HEIGHTOFHOUR);
				var formatedM = moment(event.endDate).format("HH:mm");
				pos = formatedM.indexOf(':');
				etH = parseInt( formatedM.substr(0, pos), 10);
				etM = parseInt( formatedM.substr(pos+1), 10) / 60;
				// need its positions top and bottom in minutes
				event.stop = ((etH - STARTTIME) * 60) + (etM * 60);
				
				height = (etH - stH) * HEIGHTOFHOUR;
				height -= stM * HEIGHTOFHOUR;
				height += etM * HEIGHTOFHOUR;
				event.height = height;
				EventsById[event.id] = event;
			}  
		}
	}
	
	function layoutEvents() {
		var numEvents = events.length;
		var event, e, numx, xfactor, left;
		
		for (e=0; e<numEvents; e++) {
			if (moment(events[e].startDate).format("dddd") == weekdayNumber) {
				event = events[e];
				
				numx = event.numcolumns;
				xfactor = 1 / numx;
				left = (event.leftindex * xfactor * 100);
				
				// Kurssin nimestä otetaan tunnus pois
				var subject = event.subject;
				var subjectWOCode;
				// Kurssitunnuksen osuma esim. TT00AA44-3005
				var courseCodematch = subject.match(/ [A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{2}-[0-9]{4}/);	
				if (courseCodematch === null) {
					subjectWOCode = event.subject;
				} else {
					var matchPos = event.subject.indexOf(courseCodematch[0]);
					subjectWOCode = event.subject.substr(0, matchPos);
				}
				// Otetaan huonenumero muuttujaan room
				var room = '';
				for (var j = 0; j < event.resources.length; j++) {
					var resource = event.resources[j];
					if (resource.type == "room") {
						room = resource.code;
					}
				}
				// Kurssin alku ja loppumisajat tekstiä varten
				var startingTime = moment(event.startDate).format("H:mm");
				var endingTime = moment(event.endDate).format("H:mm");
				var padding, fontSize;
				if (Math.floor(100 * xfactor) <= 33) {
					padding = "3";
					fontSize = "12";
				} else if (Math.floor(100 * xfactor) <= 50) {
					padding = "5";
					fontSize = "12";
				} else {
					padding = "8";
				}
				$("<div class='cal-data' onclick='showCourseInfo(this)'></div>")
				.attr( "id", "cal-data-" + event.id)
				.html( "<h4>" + subjectWOCode + "<br/><strong>"
				+ room + "</strong> " + startingTime + " - " + endingTime + "</h4>")
				.css("top", Math.round(event.topPos) + "px")
				.css("height", Math.round(event.height) + "px")
				.css("width", Math.floor(100 * xfactor) + '%')
				.css("left", (left) + '%')
				.css("padding", padding + "px")
				.appendTo( $('#subjects' + weekdayNumber) );
				var width = $('#'+"cal-data-" + event.id).width();
				var parentWidth = $('#'+"cal-data-" + event.id).offsetParent().width();
				var percent = 100*width/parentWidth;
				if (fontSize && percent <= 50) {
					$('#'+"cal-data-" + event.id + " h4").addClass('small-cal-event');
				}
			}
		}
	}
}

// Asettaa koko viikon päivämäärät
function renderWeekdays(monday, tuesday, wednesday, thursday, friday) {
	document.getElementById('monday').childNodes[1].childNodes[1].childNodes[1].innerHTML =	"Ma " + monday;
	document.getElementById('tuesday').childNodes[1].childNodes[1].childNodes[1].innerHTML =	"Ti " + tuesday;
	document.getElementById('wednesday').childNodes[1].childNodes[1].childNodes[1].innerHTML =	"Ke " + wednesday;
	document.getElementById('thursday').childNodes[1].childNodes[1].childNodes[1].innerHTML =	"To " + thursday;
	document.getElementById('friday').childNodes[1].childNodes[1].childNodes[1].innerHTML =	"Pe " + friday;
}

// Asettaa näytettävän viikonpäivän mobiililaitteille
function mobSetDisplayDate() {
	$('.current-weekday').removeClass('current-weekday');
	var currentDayAsText = moment().format("dddd");
	if (currentDayAsText == 'Saturday' || currentDayAsText == 'Sunday') {
		currentDayAsText = 'Friday';
	}
	var currentDayDate = document.getElementById(currentDayAsText.toLowerCase());
	var currentDaySubjects = document.getElementById('subjects' + currentDayAsText);
	currentDayDate.className += ' current-weekday';
	currentDaySubjects.className += ' current-weekday';
}

// Asettaa nykyisen päivän kalenterissa eri värillä
function setCurrentDay(currentDay){
	var weekdays = document.getElementById("dates").children,
			weekday;
	for (var i = 1; i < weekdays.length; i++) {
		weekday = weekdays[i];
		// Pe 30.1.2015 -> 30.1.2015
		weekdayText = weekday.childNodes[1].childNodes[1].childNodes[1].innerHTML.substr(3);
		if (weekdayText === currentDay) {
			$(weekday).addClass('active');
			$('#subjects' + firstToUpperCase(weekday.id)).addClass('active');
		} else {
			$('#' + weekday.id).removeClass('active');
			$('#subjects' + firstToUpperCase(weekday.id)).removeClass('active');
		}
	}
}

// Näyttää nykyisen ajan viivana kalenterin päällä
function showCurrentTimeLine() {
	var timeLineDiv = document.getElementById('timeLine');
	var currentHour = moment().format("H");
	var hourDifference = currentHour - 8;
	if (hourDifference >= 0 && hourDifference <= 13) {
		document.getElementById('timeLine').style.display = 'block';
		var currentMinute = parseInt(moment().format("m"));
		var topValue = (hourDifference * 60) + currentMinute;
		timeLineDiv.style.top = topValue + "px";
		currentMinute = moment().format("mm");
		timeLineDiv.childNodes[1].innerHTML = currentHour + ":" + currentMinute;
		
		var weekdaySubjects = document.getElementsByClassName('weekdaySubjects');
		for (var i = 0; i < weekdaySubjects.length; i++) {
			if ($("#" + weekdaySubjects[i].id).hasClass("active")) {
				document.getElementById('timeLine').style.display = 'block';
				weekdaySubjects[i].appendChild(timeLineDiv);
				i = weekdaySubjects.length;
				break;
			} else {
				document.getElementById('timeLine').style.display = 'none';
			}
		}
	} else {
		document.getElementById('timeLine').style.display = 'none';
	}
}

// Enterin painaminen laukaisee haun
$("#search-box").keyup(function(event){
    if(event.keyCode == 13){
        $("#search-btn").click();
    }
});

// Asettaa viikkolaskurin
function setWeekCounter(weekNumber) {
	document.getElementById('week-counter').childNodes[1].innerHTML = '<strong>Vko ' + weekNumber + "</strong>";
}

function showCourseInfo(course) {
	// Estetään kännykän takia scrollaus kun modaali auki
	if (window.innerWidth <= 767) {
		$( document ).bind( 'touchmove', touchScroll );
	}
	for (var i = 0; i < resultJSON.reservations.length; i++) {
		var reservation = resultJSON.reservations[i];
		if (reservation.id == course.id.substr(9)) {
			// Kurssin nimestä otetaan tunnus pois
			var subject = reservation.subject;
			var subjectWOCode;
			// Kurssitunnuksen osuma esim. TT00AA44-3005
			var courseCodematch = subject.match(/ [A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{2}-[0-9]{4}/);	
			if (courseCodematch === null) {
				subjectWOCode = reservation.subject;
			} else {
				var matchPos = reservation.subject.indexOf(courseCodematch[0]);
				subjectWOCode = reservation.subject.substr(0, matchPos);
			}
			// Otetaan huonenumero ja osoite ylös
			var room = '';
			var address = '';
			var lonnrotWing = ["P419", "P421", "P423", "P429", "P509", "P511", "P513"];
			var bulevardWing = ["P401", "P405", "P411", "P412", "P503", "P504", "P506"];
			var wingInfo = '';
			for (var j = 0; j < reservation.resources.length; j++) {
				var resource = reservation.resources[j];
				if (resource.type == "room") { 
					if(jQuery.inArray(resource.code,lonnrotWing) != -1){
						wingInfo = " (Lönnrotin siipi)";
					};
					if(jQuery.inArray(resource.code,bulevardWing) != -1){
						wingInfo = " (Bulevardin siipi)";
					};
					room = resource.code + wingInfo + " - " + resource.name;
					address = resource.parent.name;
				}
			}
			// Otetaan ryhmä muuttujaan studentGroup
			var studentGroup = '';
			var studentGroupCount = 0;
			for (var j = 0; j < reservation.resources.length; j++) {
				var resource = reservation.resources[j];
				if (resource.type == "student_group" && studentGroupCount > 0) {
					studentGroupCount++;
					studentGroup += ", " + resource.code;
				} else if (resource.type == "student_group") {
					studentGroupCount++;
					studentGroup = resource.code;
				} 
			}
			// Otetaan kurssintunnus muuttujaan courseId
			var courseId = '';
			for (var j = 0; j < reservation.resources.length; j++) {
				var resource = reservation.resources[j];
				if (resource.type == "realization") {
					courseId = "<strong>Kurssitunnus: </strong>" + resource.code + "<br/>" ;
				}
			}
			
			var courseDescription = '';
			if (reservation.description != '') {
				courseDescription = "<strong>Kuvaus: </strong>" + reservation.description + "<br/>";
			}
			$('#courseInfoLabel').html(subjectWOCode);
			$('.modal-body').html("<h4>Perustiedot</h4>" +
				//"<strong>Nimi: </strong>" + subjectWOCode + "<br/>" +
				"<strong>Päivämäärä: </strong>" + moment(reservation.startDate).format("D.M.YYYY") + "<br/>" +
				"<strong>Aika: </strong>" + reservation.startDate.substr(11) + " - " + reservation.endDate.substr(11) + "<br/>" +
				"<strong>Luokka: </strong>" + room + "<br/>" +
				courseDescription + "<br/>" +
				"<h4>Lisätiedot</h4>" +
				courseId +
				"<strong>Ryhmä(t): </strong>" + studentGroup + "<br/>" +
				"<strong>Osoite: </strong>" + address + "<br/>");
		}
	}
	$('#courseInfo').modal('show');
}

// Sallitaan kännykällä scrollaus kun modaali suljetaan
$('#courseInfo').on('hidden.bs.modal', function () {
	if (window.innerWidth <= 767) {
		$( document ).unbind( 'touchmove', touchScroll );
	}
});
var touchScroll = function( event ) {
    event.preventDefault();
};

// Lisätään näppäimistön nuolinäppäimiin navigointi ominaisuudet
top.document.documentElement.onkeydown = function(event) {
  if (!event)
    event = window.event;
  var code = event.keyCode;
  if (event.charCode && code == 0)
    code = event.charCode;
    switch(code) {
      case 37:
				if (!$('#search-box').is(':focus')) {
					$('#navigateBack').click();
				}
        break;
      case 39:
				if (!$('#search-box').is(':focus')) {
					$('#navigateForward').click();
				}
        break;
    }
};


// $('#personal-calendar').on('click', function(event) {
// 	event.preventDefault();
// 	$('#calendar-content').hide();
// 	$('#personal-calendar-search').show();
// });