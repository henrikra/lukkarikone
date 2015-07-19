// #-symbolin käsittely urlissa
// Etsitään lukujärjestystä #:n jälkeisen olevan osan perusteella
function navigate(){
	if(location.hash) {
		fragmentId = location.hash.substr(1).toUpperCase();
		$('#search-box').val(fragmentId);
		searchCalendar();
	}
}