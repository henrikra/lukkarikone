// Rendataan kellonajat
//renderTimes();
// Rendataan viikonpäivät
var monday = moment().isoWeekday(1).format(dateFormat);
var tuesday = moment().isoWeekday(2).format(dateFormat);
var wednesday = moment().isoWeekday(3).format(dateFormat);
var thursday = moment().isoWeekday(4).format(dateFormat);
var friday = moment().isoWeekday(5).format(dateFormat);
renderWeekdays(monday, tuesday, wednesday, thursday, friday);
// Korostetaan nykyinen päivämäärä kalenterissa 
setCurrentDay(moment().format("D.M.YYYY"));
// Asetetaan nykyinen viikkonumero
setWeekCounter(moment().isoWeek());
// Asetetaan punainen aikajana
showCurrentTimeLine();
setInterval(showCurrentTimeLine, 60000);
// Asetetaan näytettävä päivä mobiililaitteille
mobSetDisplayDate();
// navigoidaan sivulle #:n mukaan ja kuunnellaan muutoksia
navigate();
window.addEventListener("hashchange", navigate);
// Tehdään päivämääristä ja menuista ikkunan mukana rullautuva
$('#menu').hcSticky();
$('#dates').hcSticky({top: 63});