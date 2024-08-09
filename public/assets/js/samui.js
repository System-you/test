"use strict";

var logoHeaderContent = $('.sidebar .logo-header').html();
$('.main-header .logo-header').html(logoHeaderContent);

$(".nav-search .input-group > input").focus(function (e) {
	$(this).parents().eq(2).addClass("focus");
}).blur(function (e) {
	$(this).parents().eq(2).removeClass("focus");
});

$(function () {
	// Show Tooltip
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
	// Show Popover
	const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
	const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
	layoutsColors();
	customBackgroundColor();
});

function layoutsColors() {
	if ($('.sidebar').is('[data-background-color]')) {
		$('html').addClass('sidebar-color');
	} else {
		$('html').removeClass('sidebar-color');
	}
}

function customBackgroundColor() {
	$('*[data-background-color="custom"]').each(function () {
		if ($(this).is('[custom-color]')) {
			$(this).css('background', $(this).attr('custom-color'));
		} else if ($(this).is('[custom-background]')) {
			$(this).css('background-image', 'url(' + $(this).attr('custom-background') + ')');
		}
	});
}

function legendClickCallback(event) {
	event = event || window.event;

	var target = event.target || event.srcElement;
	while (target.nodeName !== 'LI') {
		target = target.parentElement;
	}
	var parent = target.parentElement;
	var chartId = parseInt(parent.classList[0].split("-")[0], 10);
	var chart = Chart.instances[chartId];
	var index = Array.prototype.slice.call(parent.children).indexOf(target);

	chart.legend.options.onClick.call(chart, event, chart.legend.legendItems[index]);
	if (chart.isDatasetVisible(index)) {
		target.classList.remove('hidden');
	} else {
		target.classList.add('hidden');
	}
}

$(document).ready(function () {

	$('.btn-refresh-card').on('click', function () { var e = $(this).parents(".card"); e.length && (e.addClass("is-loading"), setTimeout(function () { e.removeClass("is-loading") }, 3e3)) })

	var scrollbarDashboard = $('.sidebar .scrollbar');
	if (scrollbarDashboard.length > 0) {
		scrollbarDashboard.scrollbar();
	}

	var contentScrollbar = $('.main-panel .content-scroll');
	if (contentScrollbar.length > 0) {
		contentScrollbar.scrollbar();
	}

	var messagesScrollbar = $('.messages-scroll');
	if (messagesScrollbar.length > 0) {
		messagesScrollbar.scrollbar();
	}

	var tasksScrollbar = $('.tasks-scroll');
	if (tasksScrollbar.length > 0) {
		tasksScrollbar.scrollbar();
	}

	var quickScrollbar = $('.quick-scroll');
	if (quickScrollbar.length > 0) {
		quickScrollbar.scrollbar();
	}

	var messageNotifScrollbar = $('.message-notif-scroll');
	if (messageNotifScrollbar.length > 0) {
		messageNotifScrollbar.scrollbar();
	}

	var notifScrollbar = $('.notif-scroll');
	if (notifScrollbar.length > 0) {
		notifScrollbar.scrollbar();
	}

	var quickActionsScrollbar = $('.quick-actions-scroll');
	if (quickActionsScrollbar.length > 0) {
		quickActionsScrollbar.scrollbar();
	}

	var userScrollbar = $('.dropdown-user-scroll');
	if (userScrollbar.length > 0) {
		userScrollbar.scrollbar();
	}

	$('#search-nav').on('shown.bs.collapse', function () {
		$('.nav-search .form-control').focus();
	});

	//Chat Open
	$('.messages-contact .user a').on('click', function () {
		$('.tab-chat').addClass('show-chat')
	});

	$('.messages-wrapper .return').on('click', function () {
		$('.tab-chat').removeClass('show-chat')
	});

	//select all
	$('[data-select="checkbox"]').change(function () {
		var target = $(this).attr('data-target');
		$(target).prop('checked', $(this).prop("checked"));
	})

	//form-group-default active if input focus
	$(".form-group-default .form-control").focus(function () {
		$(this).parent().addClass("active");
	}).blur(function () {
		$(this).parent().removeClass("active");
	})

});

// Input File Image

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			$(input).parent('.input-file-image').find('.img-upload-preview').attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
	}
}

$('.input-file-image input[type="file"').change(function () {
	readURL(this);
});

// Show Password

function showPassword(button) {
	var inputPassword = $(button).parent().find('input');
	if (inputPassword.attr('type') === "password") {
		inputPassword.attr('type', 'text');
	} else {
		inputPassword.attr('type', 'password');
	}
}

$('.show-password').on('click', function () {
	showPassword(this);
})

// Sign In & Sign Up
var containerSignIn = $('.container-login'),
	containerSignUp = $('.container-signup'),
	showSignIn = true,
	showSignUp = false;

function changeContainer() {
	if (showSignIn == true) {
		containerSignIn.css('display', 'block')
	} else {
		containerSignIn.css('display', 'none')
	}

	if (showSignUp == true) {
		containerSignUp.css('display', 'block')
	} else {
		containerSignUp.css('display', 'none')
	}
}

$('#show-signup').on('click', function () {
	showSignUp = true;
	showSignIn = false;
	changeContainer();
})

$('#show-signin').on('click', function () {
	showSignUp = false;
	showSignIn = true;
	changeContainer();
})

changeContainer();

//Input with Floating Label
$('.form-floating-label .form-control').keyup(function () {
	if ($(this).val() !== '') {
		$(this).addClass('filled');
	} else {
		$(this).removeClass('filled');
	}
})