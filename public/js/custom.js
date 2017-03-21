$(document).ready(function(){
	windowSize = $(window).width();
	
	$('#fullpage').fullpage({
		scrollOverflow: true
	});
	
	$('#nav-icon').click(function(){
		$(this).toggleClass('open');
		$('#main-nav').fadeToggle();

	});
	
	$('#goToReg').click(function(e){
		e.preventDefault();
		$.fn.fullpage.moveTo(3);
	});
	
	if($('#home1111').length){
		$.scrollify({
			section : ".section-scroll",
		});
		
		$('.scroll1, .scroll2').click(function(e){
			$.scrollify.next();
		});
	}		

    $( ".datepicker" ).datepicker({
		dateFormat: "dd.mm.yy",
		minDate: 0,
		maxDate: new Date(2018, 31, 12)
	});
});