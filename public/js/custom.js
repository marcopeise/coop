$(document).ready(function(){
	$('#nav-icon').click(function(){
		$(this).toggleClass('open');
		$('#main-nav').fadeToggle();

	});
	
	$('#fullpage').fullpage({
		scrollOverflow: true
	});
	
	
	$('#goToReg').click(function(e){
		e.preventDefault();
		$.fn.fullpage.moveTo(3);
	});
	
});