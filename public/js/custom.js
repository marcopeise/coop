$(document).ready(function () {
    $('#nav-icon').click(function () {
        $(this).toggleClass('open');
        $('#main-nav').fadeToggle();

    });

    $('#fullpage').fullpage({
        scrollOverflow: true
    });

    var formData = JSON.stringify($("#regform").serializeArray());
});