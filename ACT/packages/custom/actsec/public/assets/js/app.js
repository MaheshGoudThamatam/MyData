/**
Core script to handle the entire theme and core functions
**/
var App = function() {

	// IE mode
	var isRTL = false;
	var isIE8 = false;
	var isIE9 = false;
	var isIE10 = false;

	var resizeHandlers = [];

	var assetsPath = '/actsec/assets/';

	var globalImgPath = 'img/';

	var globalPluginsPath = 'global/plugins/';

	var globalCssPath = 'global/css/';

	// theme layout color set

	var brandColors = {
		'blue': '#89C4F4',
		'red': '#F3565D',
		'green': '#1bbc9b',
		'purple': '#9b59b6',
		'grey': '#95a5a6',
		'yellow': '#F8CB00'
	};

	// initializes main settings
	var handleInit = function() {

		if ($('body').css('direction') === 'rtl') {
			isRTL = true;
		}

		isIE8 = !!navigator.userAgent.match(/MSIE 8.0/);
		isIE9 = !!navigator.userAgent.match(/MSIE 9.0/);
		isIE10 = !!navigator.userAgent.match(/MSIE 10.0/);

		if (isIE10) {
			$('html').addClass('ie10'); // detect IE10 version
		}

		if (isIE10 || isIE9 || isIE8) {
			$('html').addClass('ie'); // detect IE10 version
		}
	};

	// runs callback functions set by App.addResponsiveHandler().
	var _runResizeHandlers = function() {
		// reinitialize other subscribed elements
		for (var i = 0; i < resizeHandlers.length; i++) {
			var each = resizeHandlers[i];
			each.call();
		}
	};

	// handle the layout reinitialization on window resize
	var handleOnResize = function() {
		var resize;
		if (isIE8) {
			var currheight;
			$(window).resize(function() {
				if (currheight == document.documentElement.clientHeight) {
					return; //quite event since only body resized not window.
				}
				if (resize) {
					clearTimeout(resize);
				}
				resize = setTimeout(function() {
					_runResizeHandlers();
				}, 50); // wait 50ms until window resize finishes.                
				currheight = document.documentElement.clientHeight; // store last body client height
			});
		} else {
			$(window).resize(function() {
				if (resize) {
					clearTimeout(resize);
				}
				resize = setTimeout(function() {
					_runResizeHandlers();
				}, 50); // wait 50ms until window resize finishes.
			});
		}
	};

	// Handles portlet tools & actions
	var handlePortletTools = function() {
		// handle portlet remove
		$('body').on('click', '.portlet > .portlet-title > .tools > a.remove', function(e) {
			e.preventDefault();
			var portlet = $(this).closest(".portlet");

			if ($('body').hasClass('page-portlet-fullscreen')) {
				$('body').removeClass('page-portlet-fullscreen');
			}

			portlet.find('.portlet-title .fullscreen').tooltip('destroy');
			portlet.find('.portlet-title > .tools > .reload').tooltip('destroy');
			portlet.find('.portlet-title > .tools > .remove').tooltip('destroy');
			portlet.find('.portlet-title > .tools > .config').tooltip('destroy');
			portlet.find('.portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip('destroy');

			portlet.remove();
		});

		// handle portlet fullscreen
		$('body').on('click', '.portlet > .portlet-title .fullscreen', function(e) {
			e.preventDefault();
			var portlet = $(this).closest(".portlet");
			if (portlet.hasClass('portlet-fullscreen')) {
				$(this).removeClass('on');
				portlet.removeClass('portlet-fullscreen');
				$('body').removeClass('page-portlet-fullscreen');
				portlet.children('.portlet-body').css('height', 'auto');
			} else {
				var height = App.getViewPort().height -
					portlet.children('.portlet-title').outerHeight() -
					parseInt(portlet.children('.portlet-body').css('padding-top')) -
					parseInt(portlet.children('.portlet-body').css('padding-bottom'));

				$(this).addClass('on');
				portlet.addClass('portlet-fullscreen');
				$('body').addClass('page-portlet-fullscreen');
				portlet.children('.portlet-body').css('height', height);
			}
		});

		$('body').on('click', '.portlet > .portlet-title > .tools > a.reload', function(e) {
			e.preventDefault();
			var el = $(this).closest(".portlet").children(".portlet-body");
			var url = $(this).attr("data-url");
			var error = $(this).attr("data-error-display");
			if (url) {
				App.blockUI({
					target: el,
					animate: true,
					overlayColor: 'none'
				});
				$.ajax({
					type: "GET",
					cache: false,
					url: url,
					dataType: "html",
					success: function(res) {
						App.unblockUI(el);
						el.html(res);
						App.initAjax() // reinitialize elements & plugins for newly loaded content
					},
					error: function(xhr, ajaxOptions, thrownError) {
						App.unblockUI(el);
						var msg = 'Error on reloading the content. Please check your connection and try again.';
						if (error == "toastr" && toastr) {
							toastr.error(msg);
						} else if (error == "notific8" && $.notific8) {
							$.notific8('zindex', 11500);
							$.notific8(msg, {
								theme: 'ruby',
								life: 3000
							});
						} else {
							alert(msg);
						}
					}
				});
			} else {
				// for demo purpose
				App.blockUI({
					target: el,
					animate: true,
					overlayColor: 'none'
				});
				window.setTimeout(function() {
					App.unblockUI(el);
				}, 1000);
			}
		});

		// load ajax data on page init
		$('.portlet .portlet-title a.reload[data-load="true"]').click();

		$('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function(e) {
			e.preventDefault();
			var el = $(this).closest(".portlet").children(".portlet-body");
			if ($(this).hasClass("collapse")) {
				$(this).removeClass("collapse").addClass("expand");
				el.slideUp(200);
			} else {
				$(this).removeClass("expand").addClass("collapse");
				el.slideDown(200);
			}
		});
	};

	// Handlesmaterial design checkboxes
	var handleMaterialDesign = function() {

		// Material design ckeckbox and radio effects
		$('body').on('click', '.md-checkbox > label, .md-radio > label', function() {
			var the = $(this);
			// find the first span which is our circle/bubble
			var el = $(this).children('span:first-child');

			// add the bubble class (we do this so it doesnt show on page load)
			el.addClass('inc');

			// clone it
			var newone = el.clone(true);

			// add the cloned version before our original
			el.before(newone);

			// remove the original so that it is ready to run on next click
			$("." + el.attr("class") + ":last", the).remove();
		});

		if ($('body').hasClass('page-md')) {
			// Material design click effect
			// credit where credit's due; http://thecodeplayer.com/walkthrough/ripple-click-effect-google-material-design       
			var element, circle, d, x, y;
			$('body').on('click', 'a.btn, button.btn, input.btn, label.btn', function(e) {
				element = $(this);

				if (element.find(".md-click-circle").length == 0) {
					element.prepend("<span class='md-click-circle'></span>");
				}

				circle = element.find(".md-click-circle");
				circle.removeClass("md-click-animate");

				if (!circle.height() && !circle.width()) {
					d = Math.max(element.outerWidth(), element.outerHeight());
					circle.css({
						height: d,
						width: d
					});
				}

				x = e.pageX - element.offset().left - circle.width() / 2;
				y = e.pageY - element.offset().top - circle.height() / 2;

				circle.css({
					top: y + 'px',
					left: x + 'px'
				}).addClass("md-click-animate");

				setTimeout(function() {
					circle.remove();
				}, 1000);
			});
		}

		// Floating labels
		var handleInput = function(el) {
			if (el.val() != "") {
				el.addClass('edited');
			} else {
				el.removeClass('edited');
			}
		}

		$('body').on('keydown', '.form-md-floating-label .form-control', function(e) {
			handleInput($(this));
		});
		$('body').on('blur', '.form-md-floating-label .form-control', function(e) {
			handleInput($(this));
		});

		$('.form-md-floating-label .form-control').each(function() {
			if ($(this).val().length > 0) {
				$(this).addClass('edited');
			}
		});
	}

	// Handles custom checkboxes & radios using jQuery iCheck plugin
	var handleiCheck = function() {
		if (!$().iCheck) {
			return;
		}

		$('.icheck').each(function() {
			var checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
			var radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';

			if (checkboxClass.indexOf('_line') > -1 || radioClass.indexOf('_line') > -1) {
				$(this).iCheck({
					checkboxClass: checkboxClass,
					radioClass: radioClass,
					insert: '<div class="icheck_line-icon"></div>' + $(this).attr("data-label")
				});
			} else {
				$(this).iCheck({
					checkboxClass: checkboxClass,
					radioClass: radioClass
				});
			}
		});
	};

	// Handles Bootstrap switches
	var handleBootstrapSwitch = function() {
		if (!$().bootstrapSwitch) {
			return;
		}
		$('.make-switch').bootstrapSwitch();
	};

	// Handles Bootstrap confirmations
	var handleBootstrapConfirmation = function() {
		if (!$().confirmation) {
			return;
		}
		$('[data-toggle=confirmation]').confirmation({
			btnOkClass: 'btn btn-sm btn-success',
			btnCancelClass: 'btn btn-sm btn-danger'
		});
	}

	// Handles Bootstrap Accordions.
	var handleAccordions = function() {
		$('body').on('shown.bs.collapse', '.accordion.scrollable', function(e) {
			App.scrollTo($(e.target));
		});
	};

	// Handles Bootstrap Tabs.
	var handleTabs = function() {
		//activate tab if tab id provided in the URL
		if (location.hash) {
			var tabid = encodeURI(location.hash.substr(1));
			$('a[href="#' + tabid + '"]').parents('.tab-pane:hidden').each(function() {
				var tabid = $(this).attr("id");
				$('a[href="#' + tabid + '"]').click();
			});
			$('a[href="#' + tabid + '"]').click();
		}

		if ($().tabdrop) {
			$('.tabbable-tabdrop .nav-pills, .tabbable-tabdrop .nav-tabs').tabdrop({
				text: '<i class="fa fa-ellipsis-v"></i>&nbsp;<i class="fa fa-angle-down"></i>'
			});
		}
	};

	// Handles Bootstrap Modals.
	var handleModals = function() {
		// fix stackable modal issue: when 2 or more modals opened, closing one of modal will remove .modal-open class. 
		$('body').on('hide.bs.modal', function() {
			if ($('.modal:visible').size() > 1 && $('html').hasClass('modal-open') === false) {
				$('html').addClass('modal-open');
			} else if ($('.modal:visible').size() <= 1) {
				$('html').removeClass('modal-open');
			}
		});

		// fix page scrollbars issue
		$('body').on('show.bs.modal', '.modal', function() {
			if ($(this).hasClass("modal-scroll")) {
				$('body').addClass("modal-open-noscroll");
			}
		});

		// fix page scrollbars issue
		$('body').on('hidden.bs.modal', '.modal', function() {
			$('body').removeClass("modal-open-noscroll");
		});

		// remove ajax content and remove cache on modal closed 
		$('body').on('hidden.bs.modal', '.modal:not(.modal-cached)', function() {
			$(this).removeData('bs.modal');
		});
	};

	// Handles Bootstrap Tooltips.
	var handleTooltips = function() {
		// global tooltips
		// $('.tooltips').tooltip();

		// portlet tooltips
		$('.portlet > .portlet-title .fullscreen').tooltip({
			trigger: 'hover',
			container: 'body',
			title: 'Fullscreen'
		});
		$('.portlet > .portlet-title > .tools > .reload').tooltip({
			trigger: 'hover',
			container: 'body',
			title: 'Reload'
		});
		$('.portlet > .portlet-title > .tools > .remove').tooltip({
			trigger: 'hover',
			container: 'body',
			title: 'Remove'
		});
		$('.portlet > .portlet-title > .tools > .config').tooltip({
			trigger: 'hover',
			container: 'body',
			title: 'Settings'
		});
		$('.portlet > .portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip({
			trigger: 'hover',
			container: 'body',
			title: 'Collapse/Expand'
		});
	};

	// Handles Bootstrap Dropdowns
	var handleDropdowns = function() {
		/*
		  Hold dropdown on click  
		*/
		$('body').on('click', '.dropdown-menu.hold-on-click', function(e) {
			e.stopPropagation();
		});
	};

	var handleAlerts = function() {
		$('body').on('click', '[data-close="alert"]', function(e) {
			$(this).parent('.alert').hide();
			$(this).closest('.note').hide();
			e.preventDefault();
		});

		$('body').on('click', '[data-close="note"]', function(e) {
			$(this).closest('.note').hide();
			e.preventDefault();
		});

		$('body').on('click', '[data-remove="note"]', function(e) {
			$(this).closest('.note').remove();
			e.preventDefault();
		});
	};

	// Handle Hower Dropdowns
	var handleDropdownHover = function() {
		$('[data-hover="dropdown"]').not('.hover-initialized').each(function() {
			$(this).dropdownHover();
			$(this).addClass('hover-initialized');
		});
	};

	// Handle textarea autosize 
	var handleTextareaAutosize = function() {
		if (typeof(autosize) == "function") {
			autosize(document.querySelector('textarea.autosizeme'));
		}
	}

	// Handles Bootstrap Popovers

	// last popep popover
	var lastPopedPopover;

	var handlePopovers = function() {
		$('.popovers').popover();

		// close last displayed popover

		$(document).on('click.bs.popover.data-api', function(e) {
			if (lastPopedPopover) {
				lastPopedPopover.popover('hide');
			}
		});
	};

	// Handles scrollable contents using jQuery SlimScroll plugin.
	var handleScrollers = function() {
		App.initSlimScroll('.scroller');
		App.initSidebarSlimScroll('.sidebar-scroller');
	};

	// Handles Image Preview using jQuery Fancybox plugin
	var handleFancybox = function() {
		if (!jQuery.fancybox) {
			return;
		}

		if ($(".fancybox-button").size() > 0) {
			$(".fancybox-button").fancybox({
				groupAttr: 'data-rel',
				prevEffect: 'none',
				nextEffect: 'none',
				closeBtn: true,
				helpers: {
					title: {
						type: 'inside'
					}
				}
			});
		}
	};

	// Handles counterup plugin wrapper
	var handleCounterup = function() {
		if (!$().counterUp) {
			return;
		}

		$("[data-counter='counterup']").counterUp({
			delay: 10,
			time: 1000
		});
	};

	// Fix input placeholder issue for IE8 and IE9
	var handleFixInputPlaceholderForIE = function() {
		//fix html5 placeholder attribute for ie7 & ie8
		if (isIE8 || isIE9) { // ie8 & ie9
			// this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
			$('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function() {
				var input = $(this);

				if (input.val() === '' && input.attr("placeholder") !== '') {
					input.addClass("placeholder").val(input.attr('placeholder'));
				}

				input.focus(function() {
					if (input.val() == input.attr('placeholder')) {
						input.val('');
					}
				});

				input.blur(function() {
					if (input.val() === '' || input.val() == input.attr('placeholder')) {
						input.val(input.attr('placeholder'));
					}
				});
			});
		}
	};

	// Handle Select2 Dropdowns
	var handleSelect2 = function() {
		if ($().select2) {
			$.fn.select2.defaults.set("theme", "bootstrap");
			$('.select2me').select2({
				placeholder: "Select",
				width: 'auto',
				allowClear: true
			});
		}
	};

	// handle group element heights
	var handleHeight = function() {
		$('[data-auto-height]').each(function() {
			var parent = $(this);
			var items = $('[data-height]', parent);
			var height = 0;
			var mode = parent.attr('data-mode');
			var offset = parseInt(parent.attr('data-offset') ? parent.attr('data-offset') : 0);

			items.each(function() {
				if ($(this).attr('data-height') == "height") {
					$(this).css('height', '');
				} else {
					$(this).css('min-height', '');
				}

				var height_ = (mode == 'base-height' ? $(this).outerHeight() : $(this).outerHeight(true));
				if (height_ > height) {
					height = height_;
				}
			});

			height = height + offset;

			items.each(function() {
				if ($(this).attr('data-height') == "height") {
					$(this).css('height', height);
				} else {
					$(this).css('min-height', height);
				}
			});

			if (parent.attr('data-related')) {
				$(parent.attr('data-related')).css('height', parent.height());
			}
		});
	}

	//* END:CORE HANDLERS *//

	return {

		//main function to initiate the theme
		init: function() {
			//IMPORTANT!!!: Do not modify the core handlers call order.

			//Core handlers
			handleInit(); // initialize core variables
			handleOnResize(); // set and handle responsive    

			//UI Component handlers     
			handleMaterialDesign(); // handle material design       
			handleiCheck(); // handles custom icheck radio and checkboxes
			handleBootstrapSwitch(); // handle bootstrap switch plugin
			handleScrollers(); // handles slim scrolling contents 
			handleFancybox(); // handle fancy box
			handleSelect2(); // handle custom Select2 dropdowns
			handlePortletTools(); // handles portlet action bar functionality(refresh, configure, toggle, remove)
			handleAlerts(); //handle closabled alerts
			handleDropdowns(); // handle dropdowns
			handleTabs(); // handle tabs
			handleTooltips(); // handle bootstrap tooltips
			handlePopovers(); // handles bootstrap popovers
			handleAccordions(); //handles accordions 
			handleModals(); // handle modals
			handleBootstrapConfirmation(); // handle bootstrap confirmations
			handleTextareaAutosize(); // handle autosize textareas
			handleCounterup(); // handle counterup instances

			//Handle group element heights
			this.addResizeHandler(handleHeight); // handle auto calculating height on window resize

			// Hacks
			handleFixInputPlaceholderForIE(); //IE8 & IE9 input placeholder issue fix
		},

		//main function to initiate core javascript after ajax complete
		initAjax: function() {
			//handleUniform(); // handles custom radio & checkboxes     
			handleiCheck(); // handles custom icheck radio and checkboxes
			handleBootstrapSwitch(); // handle bootstrap switch plugin
			handleDropdownHover(); // handles dropdown hover       
			handleScrollers(); // handles slim scrolling contents 
			handleSelect2(); // handle custom Select2 dropdowns
			handleFancybox(); // handle fancy box
			handleDropdowns(); // handle dropdowns
			handleTooltips(); // handle bootstrap tooltips
			handlePopovers(); // handles bootstrap popovers
			handleAccordions(); //handles accordions 
			handleBootstrapConfirmation(); // handle bootstrap confirmations
		},

		//init main components 
		initComponents: function() {
			this.initAjax();
		},

		//public function to remember last opened popover that needs to be closed on click
		setLastPopedPopover: function(el) {
			lastPopedPopover = el;
		},

		//public function to add callback a function which will be called on window resize
		addResizeHandler: function(func) {
			resizeHandlers.push(func);
		},

		//public functon to call _runresizeHandlers
		runResizeHandlers: function() {
			_runResizeHandlers();
		},

		// wrApper function to scroll(focus) to an element
		scrollTo: function(el, offeset) {
			var pos = (el && el.size() > 0) ? el.offset().top : 0;

			if (el) {
				if ($('body').hasClass('page-header-fixed')) {
					pos = pos - $('.page-header').height();
				} else if ($('body').hasClass('page-header-top-fixed')) {
					pos = pos - $('.page-header-top').height();
				} else if ($('body').hasClass('page-header-menu-fixed')) {
					pos = pos - $('.page-header-menu').height();
				}
				pos = pos + (offeset ? offeset : -1 * el.height());
			}

			$('html,body').animate({
				scrollTop: pos
			}, 'slow');
		},

		initSlimScroll: function(el) {
			if (!$().slimScroll) {
				return;
			}

			$(el).each(function() {
				if ($(this).attr("data-initialized") || $(this).hasClass('sidebar-scroller')) {
					return; // exit
				}

				var height;

				if ($(this).attr("data-height")) {
					height = $(this).attr("data-height");
				} else {
					height = $(this).css('height');
				}

				$(this).slimScroll({
					allowPageScroll: true, // allow page scroll when the element scroll is ended
					size: '7px',
					color: ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
					wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
					railColor: ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#eaeaea'),
					position: isRTL ? 'left' : 'right',
					height: height,
					alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
					railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
					disableFadeOut: true,
				});

				$(this).attr("data-initialized", "1");

			});
		},

		initSidebarSlimScroll: function(el) {
			if (!$().slimScroll) {
				return;
			}

			if ($(el).attr("data-initialized")) {
				return; // exit
			}

			var height;

			if ($(el).attr("data-height")) {
				height = $(el).attr("data-height");
			} else {
				height = $(el).css('height');
			}

			$(el).slimScroll({
				allowPageScroll: true, // allow page scroll when the element scroll is ended
				size: '7px',
				color: ($(el).attr("data-handle-color") ? $(el).attr("data-handle-color") : '#bbb'),
				wrapperClass: ($(el).attr("data-wrapper-class") ? $(el).attr("data-wrapper-class") : 'sidebar-slimScrollDiv'),
				railColor: ($(el).attr("data-rail-color") ? $(el).attr("data-rail-color") : '#eaeaea'),
				position: isRTL ? 'left' : 'right',
				height: height,
				alwaysVisible: ($(el).attr("data-always-visible") == "1" ? true : false),
				railVisible: ($(el).attr("data-rail-visible") == "1" ? true : false),
				disableFadeOut: true,
				width: '235px'
			});

			$(el).attr("data-initialized", "1");
		},

		destroySlimScroll: function(el) {
			if (!$().slimScroll) {
				return;
			}

			$(el).each(function() {
				if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
					$(this).removeAttr("data-initialized");
					$(this).removeAttr("style");

					var attrList = {};

					// store the custom attribures so later we will reassign.
					if ($(this).attr("data-handle-color")) {
						attrList["data-handle-color"] = $(this).attr("data-handle-color");
					}
					if ($(this).attr("data-wrapper-class")) {
						attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
					}
					if ($(this).attr("data-rail-color")) {
						attrList["data-rail-color"] = $(this).attr("data-rail-color");
					}
					if ($(this).attr("data-always-visible")) {
						attrList["data-always-visible"] = $(this).attr("data-always-visible");
					}
					if ($(this).attr("data-rail-visible")) {
						attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
					}

					$(this).slimScroll({
						wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
						destroy: true
					});

					var the = $(this);

					// reassign custom attributes
					$.each(attrList, function(key, value) {
						the.attr(key, value);
					});

				}
			});
		},

		destroySidebarSlimScroll: function(el) {
			if (!$().slimScroll) {
				return;
			}

			if ($(el).attr("data-initialized") === "1") { // destroy existing instance before updating the height
				$(el).removeAttr("data-initialized");
				$(el).removeAttr("style");

				var attrList = {};

				// store the custom attribures so later we will reassign.
				if ($(el).attr("data-handle-color")) {
					attrList["data-handle-color"] = $(el).attr("data-handle-color");
				}
				if ($(el).attr("data-wrapper-class")) {
					attrList["data-wrapper-class"] = $(el).attr("data-wrapper-class");
				}
				if ($(el).attr("data-rail-color")) {
					attrList["data-rail-color"] = $(el).attr("data-rail-color");
				}
				if ($(el).attr("data-always-visible")) {
					attrList["data-always-visible"] = $(el).attr("data-always-visible");
				}
				if ($(el).attr("data-rail-visible")) {
					attrList["data-rail-visible"] = $(el).attr("data-rail-visible");
				}

				$(el).slimScroll({
					wrapperClass: ($(el).attr("data-wrapper-class") ? $(el).attr("data-wrapper-class") : 'sidebar-slimScrollDiv'),
					destroy: true
				});

				var the = $(el);

				// reassign custom attributes
				$.each(attrList, function(key, value) {
					the.attr(key, value);
				});

			}
		},

		// function to scroll to the top
		scrollTop: function() {
			App.scrollTo();
		},

		// wrApper function to  block element(indicate loading)
		blockUI: function(options) {
			options = $.extend(true, {}, options);
			var html = '';
			if (options.animate) {
				html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '">' + '<div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>' + '</div>';
			} else if (options.iconOnly) {
				html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""></div>';
			} else if (options.textOnly) {
				html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
			} else {
				html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
			}

			if (options.target) { // element blocking
				var el = $(options.target);
				if (el.height() <= ($(window).height())) {
					options.cenrerY = true;
				}
				el.block({
					message: html,
					baseZ: options.zIndex ? options.zIndex : 1000,
					centerY: options.cenrerY !== undefined ? options.cenrerY : false,
					css: {
						top: '10%',
						border: '0',
						padding: '0',
						backgroundColor: 'none'
					},
					overlayCSS: {
						backgroundColor: options.overlayColor ? options.overlayColor : '#555',
						opacity: options.boxed ? 0.05 : 0.1,
						cursor: 'wait'
					}
				});
			} else { // page blocking
				$.blockUI({
					message: html,
					baseZ: options.zIndex ? options.zIndex : 1000,
					css: {
						border: '0',
						padding: '0',
						backgroundColor: 'none'
					},
					overlayCSS: {
						backgroundColor: options.overlayColor ? options.overlayColor : '#555',
						opacity: options.boxed ? 0.05 : 0.1,
						cursor: 'wait'
					}
				});
			}
		},

		// wrApper function to  un-block element(finish loading)
		unblockUI: function(target) {
			if (target) {
				$(target).unblock({
					onUnblock: function() {
						$(target).css('position', '');
						$(target).css('zoom', '');
					}
				});
			} else {
				$.unblockUI();
			}
		},

		startPageLoading: function(options) {
			if (options && options.animate) {
				$('.page-spinner-bar').remove();
				$('body').append('<div class="page-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
			} else {
				$('.page-loading').remove();
				$('body').append('<div class="page-loading"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif"/>&nbsp;&nbsp;<span>' + (options && options.message ? options.message : 'Loading...') + '</span></div>');
			}
		},

		stopPageLoading: function() {
			$('.page-loading, .page-spinner-bar').remove();
		},

		alert: function(options) {

			options = $.extend(true, {
				container: "", // alerts parent container(by default placed after the page breadcrumbs)
				place: "append", // "append" or "prepend" in container 
				type: 'success', // alert's type
				message: "", // alert's message
				close: true, // make alert closable
				reset: true, // close all previouse alerts first
				focus: true, // auto scroll to the alert after shown
				closeInSeconds: 0, // auto close after defined seconds
				icon: "" // put icon before the message
			}, options);

			var id = App.getUniqueID("App_alert");

			var html = '<div id="' + id + '" class="custom-alerts alert alert-' + options.type + ' fade in">' + (options.close ? '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>' : '') + (options.icon !== "" ? '<i class="fa-lg fa fa-' + options.icon + '"></i>  ' : '') + options.message + '</div>';

			if (options.reset) {
				$('.custom-alerts').remove();
			}

			if (!options.container) {
				if ($('.page-fixed-main-content').size() === 1) {
					$('.page-fixed-main-content').prepend(html);
				} else if (($('body').hasClass("page-container-bg-solid") || $('body').hasClass("page-content-white")) && $('.page-head').size() === 0) {
					$('.page-title').after(html);
				} else {
					if ($('.page-bar').size() > 0) {
						$('.page-bar').after(html);
					} else {
						$('.page-breadcrumb, .breadcrumbs').after(html);
					}
				}
			} else {
				if (options.place == "append") {
					$(options.container).append(html);
				} else {
					$(options.container).prepend(html);
				}
			}

			if (options.focus) {
				App.scrollTo($('#' + id));
			}

			if (options.closeInSeconds > 0) {
				setTimeout(function() {
					$('#' + id).remove();
				}, options.closeInSeconds * 1000);
			}

			return id;
		},

		//public function to initialize the fancybox plugin
		initFancybox: function() {
			handleFancybox();
		},

		//public helper function to get actual input value(used in IE9 and IE8 due to placeholder attribute not supported)
		getActualVal: function(el) {
			el = $(el);
			if (el.val() === el.attr("placeholder")) {
				return "";
			}
			return el.val();
		},

		//public function to get a paremeter by name from URL
		getURLParameter: function(paramName) {
			var searchString = window.location.search.substring(1),
				i, val, params = searchString.split("&");

			for (i = 0; i < params.length; i++) {
				val = params[i].split("=");
				if (val[0] == paramName) {
					return unescape(val[1]);
				}
			}
			return null;
		},

		// check for device touch support
		isTouchDevice: function() {
			try {
				document.createEvent("TouchEvent");
				return true;
			} catch (e) {
				return false;
			}
		},

		// To get the correct viewport width based on  http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
		getViewPort: function() {
			var e = window,
				a = 'inner';
			if (!('innerWidth' in window)) {
				a = 'client';
				e = document.documentElement || document.body;
			}

			return {
				width: e[a + 'Width'],
				height: e[a + 'Height']
			};
		},

		getUniqueID: function(prefix) {
			return 'prefix_' + Math.floor(Math.random() * (new Date()).getTime());
		},

		// check IE8 mode
		isIE8: function() {
			return isIE8;
		},

		// check IE9 mode
		isIE9: function() {
			return isIE9;
		},

		//check RTL mode
		isRTL: function() {
			return isRTL;
		},

		// check IE8 mode
		isAngularJsApp: function() {
			return (typeof angular == 'undefined') ? false : true;
		},

		getAssetsPath: function() {
			return assetsPath;
		},

		setAssetsPath: function(path) {
			assetsPath = path;
		},

		setGlobalImgPath: function(path) {
			globalImgPath = path;
		},

		getGlobalImgPath: function() {
			return assetsPath + globalImgPath;
		},

		setGlobalPluginsPath: function(path) {
			globalPluginsPath = path;
		},

		getGlobalPluginsPath: function() {
			return assetsPath + globalPluginsPath;
		},

		getGlobalCssPath: function() {
			return assetsPath + globalCssPath;
		},

		// get layout color code by color name
		getBrandColor: function(name) {
			if (brandColors[name]) {
				return brandColors[name];
			} else {
				return '';
			}
		},

		getResponsiveBreakpoint: function(size) {
			// bootstrap responsive breakpoints
			var sizes = {
				'xs': 480, // extra small
				'sm': 768, // small
				'md': 992, // medium
				'lg': 1200 // large
			};

			return sizes[size] ? sizes[size] : 0;
		}
	};

}();

$(document).ready(function() {
	App.init(); // init metronic core componets
    // TODO: Can be removed. Using angular directive to achieve this.
	// $(window).load(function() {
	// 	$('#preloader').fadeOut('slow', function() {
	// 		$(window).trigger('resize');
	// 		$(this).hide();
	// 	});
	// });
});

var Dashboard = function() {

    return {

        initJQVMAP: function() {
            if (!jQuery().vectorMap) {
                return;
            }

            var showMap = function(name) {
                jQuery('.vmaps').hide();
                jQuery('#vmap_' + name).show();
            }

            var setMap = function(name) {
                var map = jQuery('#vmap_' + name);
                
                if (map.size() !== 1) {
                    return;
                }

                var data = {
                    map: 'world_en',
                    backgroundColor: null,
                    borderColor: '#333333',
                    borderOpacity: 0.5,
                    borderWidth: 1,
                    color: '#c6c6c6',
                    enableZoom: true,
                    hoverColor: '#c9dfaf',
                    hoverOpacity: null,
                    values: sample_data,
                    normalizeFunction: 'linear',
                    scaleColors: ['#b6da93', '#909cae'],
                    selectedColor: '#c9dfaf',
                    selectedRegion: null,
                    showTooltip: true,
                    onLabelShow: function(event, label, code) {

                    },
                    onRegionOver: function(event, code) {
                        if (code == 'ca') {
                            event.preventDefault();
                        }
                    },
                    onRegionClick: function(element, code, region) {
                        var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
                        alert(message);
                    }
                };

                data.map = name + '_en';
              
                map.width(map.parent().parent().width());
                map.show();
                map.vectorMap(data);
                map.hide();
            }

            setMap("world");
            setMap("usa");
            setMap("europe");
            setMap("russia");
            setMap("germany");
            showMap("world");

            jQuery('#regional_stat_world').click(function() {
                showMap("world");
            });

            jQuery('#regional_stat_usa').click(function() {
                showMap("usa");
            });

            jQuery('#regional_stat_europe').click(function() {
                showMap("europe");
            });
            jQuery('#regional_stat_russia').click(function() {
                showMap("russia");
            });
            jQuery('#regional_stat_germany').click(function() {
                showMap("germany");
            });

            $('#region_statistics_loading').hide();
            $('#region_statistics_content').show();

            App.addResizeHandler(function() {
                jQuery('.vmaps').each(function() {
                    var map = jQuery(this);
                    map.width(map.parent().width());
                });
            });
        },

        initCalendar: function() {
            if (!jQuery().fullCalendar) {
                return;
            }

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            var h = {};

            if ($('#calendar').width() <= 400) {
                $('#calendar').addClass("mobile");
                h = {
                    left: 'title, prev, next',
                    center: '',
                    right: 'today,month,agendaWeek,agendaDay'
                };
            } else {
                $('#calendar').removeClass("mobile");
                if (App.isRTL()) {
                    h = {
                        right: 'title',
                        center: '',
                        left: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
                } else {
                    h = {
                        left: 'title',
                        center: '',
                        right: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
                }
            }



            $('#calendar').fullCalendar('destroy'); // destroy the calendar
            $('#calendar').fullCalendar({ //re-initialize the calendar
                disableDragging: false,
                header: h,
                editable: true,
                events: [{
                    title: 'All Day',
                    start: new Date(y, m, 1),
                    backgroundColor: App.getBrandColor('yellow')
                }, {
                    title: 'Long Event',
                    start: new Date(y, m, d - 5),
                    end: new Date(y, m, d - 2),
                    backgroundColor: App.getBrandColor('blue')
                }, {
                    title: 'Repeating Event',
                    start: new Date(y, m, d - 3, 16, 0),
                    allDay: false,
                    backgroundColor: App.getBrandColor('red')
                }, {
                    title: 'Repeating Event',
                    start: new Date(y, m, d + 6, 16, 0),
                    allDay: false,
                    backgroundColor: App.getBrandColor('green')
                }, {
                    title: 'Meeting',
                    start: new Date(y, m, d + 9, 10, 30),
                    allDay: false
                }, {
                    title: 'Lunch',
                    start: new Date(y, m, d, 14, 0),
                    end: new Date(y, m, d, 14, 0),
                    backgroundColor: App.getBrandColor('grey'),
                    allDay: false
                }, {
                    title: 'Birthday',
                    start: new Date(y, m, d + 1, 19, 0),
                    end: new Date(y, m, d + 1, 22, 30),
                    backgroundColor: App.getBrandColor('purple'),
                    allDay: false
                }, {
                    title: 'Click for Google',
                    start: new Date(y, m, 28),
                    end: new Date(y, m, 29),
                    backgroundColor: App.getBrandColor('yellow'),
                    url: 'http://google.com/'
                }]
            });
        },

        initCharts: function() {
            if (!jQuery.plot) {
                return;
            }

            function showChartTooltip(x, y, xValue, yValue) {
                $('<div id="tooltip" class="chart-tooltip">' + yValue + '<\/div>').css({
                    position: 'absolute',
                    display: 'none',
                    top: y - 40,
                    left: x - 40,
                    border: '0px solid #ccc',
                    padding: '2px 6px',
                    'background-color': '#fff'
                }).appendTo("body").fadeIn(200);
            }

            var data = [];
            var totalPoints = 250;

            // random data generator for plot charts

            function getRandomData() {
                if (data.length > 0) data = data.slice(1);
                // do a random walk
                while (data.length < totalPoints) {
                    var prev = data.length > 0 ? data[data.length - 1] : 50;
                    var y = prev + Math.random() * 10 - 5;
                    if (y < 0) y = 0;
                    if (y > 100) y = 100;
                    data.push(y);
                }
                // zip the generated y values with the x values
                var res = [];
                for (var i = 0; i < data.length; ++i) res.push([i, data[i]])
                return res;
            }

            function randValue() {
                return (Math.floor(Math.random() * (1 + 50 - 20))) + 10;
            }

            var visitors = [
                ['02/2013', 1500],
                ['03/2013', 2500],
                ['04/2013', 1700],
                ['05/2013', 800],
                ['06/2013', 1500],
                ['07/2013', 2350],
                ['08/2013', 1500],
                ['09/2013', 1300],
                ['10/2013', 4600]
            ];


            if ($('#site_statistics').size() != 0) {

                $('#site_statistics_loading').hide();
                $('#site_statistics_content').show();

                var plot_statistics = $.plot($("#site_statistics"), [{
                        data: visitors,
                        lines: {
                            fill: 0.6,
                            lineWidth: 0
                        },
                        color: ['#f89f9f']
                    }, {
                        data: visitors,
                        points: {
                            show: true,
                            fill: true,
                            radius: 5,
                            fillColor: "#f89f9f",
                            lineWidth: 3
                        },
                        color: '#fff',
                        shadowSize: 0
                    }],

                    {
                        xaxis: {
                            tickLength: 0,
                            tickDecimals: 0,
                            mode: "categories",
                            min: 0,
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        yaxis: {
                            ticks: 5,
                            tickDecimals: 0,
                            tickColor: "#eee",
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        grid: {
                            hoverable: true,
                            clickable: true,
                            tickColor: "#eee",
                            borderColor: "#eee",
                            borderWidth: 1
                        }
                    });

                var previousPoint = null;
                $("#site_statistics").bind("plothover", function(event, pos, item) {
                    $("#x").text(pos.x.toFixed(2));
                    $("#y").text(pos.y.toFixed(2));
                    if (item) {
                        if (previousPoint != item.dataIndex) {
                            previousPoint = item.dataIndex;

                            $("#tooltip").remove();
                            var x = item.datapoint[0].toFixed(2),
                                y = item.datapoint[1].toFixed(2);

                            showChartTooltip(item.pageX, item.pageY, item.datapoint[0], item.datapoint[1] + ' visits');
                        }
                    } else {
                        $("#tooltip").remove();
                        previousPoint = null;
                    }
                });
            }


            if ($('#site_activities').size() != 0) {
                //site activities
                var previousPoint2 = null;
                $('#site_activities_loading').hide();
                $('#site_activities_content').show();

                var data1 = [
                    ['DEC', 300],
                    ['JAN', 600],
                    ['FEB', 1100],
                    ['MAR', 1200],
                    ['APR', 860],
                    ['MAY', 1200],
                    ['JUN', 1450],
                    ['JUL', 1800],
                    ['AUG', 1200],
                    ['SEP', 600]
                ];


                var plot_statistics = $.plot($("#site_activities"),

                    [{
                        data: data1,
                        lines: {
                            fill: 0.2,
                            lineWidth: 0,
                        },
                        color: ['#BAD9F5']
                    }, {
                        data: data1,
                        points: {
                            show: true,
                            fill: true,
                            radius: 4,
                            fillColor: "#9ACAE6",
                            lineWidth: 2
                        },
                        color: '#9ACAE6',
                        shadowSize: 1
                    }, {
                        data: data1,
                        lines: {
                            show: true,
                            fill: false,
                            lineWidth: 3
                        },
                        color: '#9ACAE6',
                        shadowSize: 0
                    }],

                    {

                        xaxis: {
                            tickLength: 0,
                            tickDecimals: 0,
                            mode: "categories",
                            min: 0,
                            font: {
                                lineHeight: 18,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        yaxis: {
                            ticks: 5,
                            tickDecimals: 0,
                            tickColor: "#eee",
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        grid: {
                            hoverable: true,
                            clickable: true,
                            tickColor: "#eee",
                            borderColor: "#eee",
                            borderWidth: 1
                        }
                    });

                $("#site_activities").bind("plothover", function(event, pos, item) {
                    $("#x").text(pos.x.toFixed(2));
                    $("#y").text(pos.y.toFixed(2));
                    if (item) {
                        if (previousPoint2 != item.dataIndex) {
                            previousPoint2 = item.dataIndex;
                            $("#tooltip").remove();
                            var x = item.datapoint[0].toFixed(2),
                                y = item.datapoint[1].toFixed(2);
                            showChartTooltip(item.pageX, item.pageY, item.datapoint[0], item.datapoint[1] + 'M$');
                        }
                    }
                });

                $('#site_activities').bind("mouseleave", function() {
                    $("#tooltip").remove();
                });
            }
        },

        initEasyPieCharts: function() {
            if (!jQuery().easyPieChart) {
                return;
            }

            $('.easy-pie-chart .number.transactions').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: App.getBrandColor('yellow')
            });

            $('.easy-pie-chart .number.visits').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: App.getBrandColor('green')
            });

            $('.easy-pie-chart .number.bounce').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: App.getBrandColor('red')
            });

            $('.easy-pie-chart-reload').click(function() {
                $('.easy-pie-chart .number').each(function() {
                    var newValue = Math.floor(100 * Math.random());
                    $(this).data('easyPieChart').update(newValue);
                    $('span', this).text(newValue);
                });
            });
        },

        initSparklineCharts: function() {
            if (!jQuery().sparkline) {
                return;
            }
            $("#sparkline_bar").sparkline([8, 9, 10, 11, 10, 10, 12, 10, 10, 11, 9, 12, 11, 10, 9, 11, 13, 13, 12], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#35aa47',
                negBarColor: '#e02222'
            });

            $("#sparkline_bar2").sparkline([9, 11, 12, 13, 12, 13, 10, 14, 13, 11, 11, 12, 11, 11, 10, 12, 11, 10], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#ffb848',
                negBarColor: '#e02222'
            });

            $("#sparkline_bar5").sparkline([8, 9, 10, 11, 10, 10, 12, 10, 10, 11, 9, 12, 11, 10, 9, 11, 13, 13, 12], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#35aa47',
                negBarColor: '#e02222'
            });

            $("#sparkline_bar6").sparkline([9, 11, 12, 13, 12, 13, 10, 14, 13, 11, 11, 12, 11, 11, 10, 12, 11, 10], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#ffb848',
                negBarColor: '#e02222'
            });

            $("#sparkline_line").sparkline([9, 10, 9, 10, 10, 11, 12, 10, 10, 11, 11, 12, 11, 10, 12, 11, 10, 12], {
                type: 'line',
                width: '100',
                height: '55',
                lineColor: '#ffb848'
            });
        },

        initMorisCharts: function() {
            if (Morris.EventEmitter && $('#sales_statistics').size() > 0) {
                // Use Morris.Area instead of Morris.Line
                dashboardMainChart = Morris.Area({
                    element: 'sales_statistics',
                    padding: 0,
                    behaveLikeLine: false,
                    gridEnabled: false,
                    gridLineColor: false,
                    axes: false,
                    fillOpacity: 1,
                    data: [{
                        period: '2011 Q1',
                        sales: 1400,
                        profit: 400
                    }, {
                        period: '2011 Q2',
                        sales: 1100,
                        profit: 600
                    }, {
                        period: '2011 Q3',
                        sales: 1600,
                        profit: 500
                    }, {
                        period: '2011 Q4',
                        sales: 1200,
                        profit: 400
                    }, {
                        period: '2012 Q1',
                        sales: 1550,
                        profit: 800
                    }],
                    lineColors: ['#399a8c', '#92e9dc'],
                    xkey: 'period',
                    ykeys: ['sales', 'profit'],
                    labels: ['Sales', 'Profit'],
                    pointSize: 0,
                    lineWidth: 0,
                    hideHover: 'auto',
                    resize: true
                });

            }
        },

        initChat: function() {
            var cont = $('#chats');
            var list = $('.chats', cont);
            var form = $('.chat-form', cont);
            var input = $('input', form);
            var btn = $('.btn', form);

            var handleClick = function(e) {
                e.preventDefault();

                var text = input.val();
                if (text.length == 0) {
                    return;
                }

                var time = new Date();
                var time_str = (time.getHours() + ':' + time.getMinutes());
                var tpl = '';
                tpl += '<li class="out">';
                tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + 'avatar1.jpg"/>';
                tpl += '<div class="message">';
                tpl += '<span class="arrow"></span>';
                tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                tpl += '<span class="datetime">at ' + time_str + '</span>';
                tpl += '<span class="body">';
                tpl += text;
                tpl += '</span>';
                tpl += '</div>';
                tpl += '</li>';

                var msg = list.append(tpl);
                input.val("");

                var getLastPostPos = function() {
                    var height = 0;
                    cont.find("li.out, li.in").each(function() {
                        height = height + $(this).outerHeight();
                    });

                    return height;
                }

                cont.find('.scroller').slimScroll({
                    scrollTo: getLastPostPos()
                });
            }

            $('body').on('click', '.message .name', function(e) {
                e.preventDefault(); // prevent click event

                var name = $(this).text(); // get clicked user's full name
                input.val('@' + name + ':'); // set it into the input field
                App.scrollTo(input); // scroll to input if needed
            });

            btn.click(handleClick);

            input.keypress(function(e) {
                if (e.which == 13) {
                    handleClick(e);
                    return false; //<---- Add this line
                }
            });
        },

        initDashboardDaterange: function() {
            if (!jQuery().daterangepicker) {
                return;
            }

            $('#dashboard-report-range').daterangepicker({
                "ranges": {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                    'Last 7 Days': [moment().subtract('days', 6), moment()],
                    'Last 30 Days': [moment().subtract('days', 29), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                },
                "locale": {
                    "format": "MM/DD/YYYY",
                    "separator": " - ",
                    "applyLabel": "Apply",
                    "cancelLabel": "Cancel",
                    "fromLabel": "From",
                    "toLabel": "To",
                    "customRangeLabel": "Custom",
                    "daysOfWeek": [
                        "Su",
                        "Mo",
                        "Tu",
                        "We",
                        "Th",
                        "Fr",
                        "Sa"
                    ],
                    "monthNames": [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December"
                    ],
                    "firstDay": 1
                },
                //"startDate": "11/08/2015",
                //"endDate": "11/14/2015",
                opens: (App.isRTL() ? 'right' : 'left'),
            }, function(start, end, label) {
                $('#dashboard-report-range span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            });

            $('#dashboard-report-range span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
            $('#dashboard-report-range').show();
        },

        initAmChart1: function() {
            if (typeof(AmCharts) === 'undefined' || $('#dashboard_amchart_1').size() === 0) {
                return;
            }

            var chartData = [{
                "date": "2012-01-05",
                "distance": 480,
                "townName": "Miami",
                "townName2": "Miami",
                "townSize": 10,
                "latitude": 25.83,
                "duration": 501
            }, {
                "date": "2012-01-06",
                "distance": 386,
                "townName": "Tallahassee",
                "townSize": 7,
                "latitude": 30.46,
                "duration": 443
            }, {
                "date": "2012-01-07",
                "distance": 348,
                "townName": "New Orleans",
                "townSize": 10,
                "latitude": 29.94,
                "duration": 405
            }, {
                "date": "2012-01-08",
                "distance": 238,
                "townName": "Houston",
                "townName2": "Houston",
                "townSize": 16,
                "latitude": 29.76,
                "duration": 309
            }, {
                "date": "2012-01-09",
                "distance": 218,
                "townName": "Dalas",
                "townSize": 17,
                "latitude": 32.8,
                "duration": 287
            }, {
                "date": "2012-01-10",
                "distance": 349,
                "townName": "Oklahoma City",
                "townSize": 11,
                "latitude": 35.49,
                "duration": 485
            }, {
                "date": "2012-01-11",
                "distance": 603,
                "townName": "Kansas City",
                "townSize": 10,
                "latitude": 39.1,
                "duration": 890
            }, {
                "date": "2012-01-12",
                "distance": 534,
                "townName": "Denver",
                "townName2": "Denver",
                "townSize": 18,
                "latitude": 39.74,
                "duration": 810
            }, {
                "date": "2012-01-13",
                "townName": "Salt Lake City",
                "townSize": 12,
                "distance": 425,
                "duration": 670,
                "latitude": 40.75,
                "alpha": 0.4
            }, {
                "date": "2012-01-14",
                "latitude": 36.1,
                "duration": 470,
                "townName": "Las Vegas",
                "townName2": "Las Vegas",
                "bulletClass": "lastBullet"
            }, {
                "date": "2012-01-15"
            }];
            var chart = AmCharts.makeChart("dashboard_amchart_1", {
                type: "serial",
                fontSize: 12,
                fontFamily: "Open Sans",
                dataDateFormat: "YYYY-MM-DD",
                dataProvider: chartData,

                addClassNames: true,
                startDuration: 1,
                color: "#6c7b88",
                marginLeft: 0,

                categoryField: "date",
                categoryAxis: {
                    parseDates: true,
                    minPeriod: "DD",
                    autoGridCount: false,
                    gridCount: 50,
                    gridAlpha: 0.1,
                    gridColor: "#FFFFFF",
                    axisColor: "#555555",
                    dateFormats: [{
                        period: 'DD',
                        format: 'DD'
                    }, {
                        period: 'WW',
                        format: 'MMM DD'
                    }, {
                        period: 'MM',
                        format: 'MMM'
                    }, {
                        period: 'YYYY',
                        format: 'YYYY'
                    }]
                },

                valueAxes: [{
                    id: "a1",
                    title: "distance",
                    gridAlpha: 0,
                    axisAlpha: 0
                }, {
                    id: "a2",
                    position: "right",
                    gridAlpha: 0,
                    axisAlpha: 0,
                    labelsEnabled: false
                }, {
                    id: "a3",
                    title: "duration",
                    position: "right",
                    gridAlpha: 0,
                    axisAlpha: 0,
                    inside: true,
                    duration: "mm",
                    durationUnits: {
                        DD: "d. ",
                        hh: "h ",
                        mm: "min",
                        ss: ""
                    }
                }],
                graphs: [{
                    id: "g1",
                    valueField: "distance",
                    title: "distance",
                    type: "column",
                    fillAlphas: 0.7,
                    valueAxis: "a1",
                    balloonText: "[[value]] miles",
                    legendValueText: "[[value]] mi",
                    legendPeriodValueText: "total: [[value.sum]] mi",
                    lineColor: "#08a3cc",
                    alphaField: "alpha",
                }, {
                    id: "g2",
                    valueField: "latitude",
                    classNameField: "bulletClass",
                    title: "latitude/city",
                    type: "line",
                    valueAxis: "a2",
                    lineColor: "#786c56",
                    lineThickness: 1,
                    legendValueText: "[[description]]/[[value]]",
                    descriptionField: "townName",
                    bullet: "round",
                    bulletSizeField: "townSize",
                    bulletBorderColor: "#02617a",
                    bulletBorderAlpha: 1,
                    bulletBorderThickness: 2,
                    bulletColor: "#89c4f4",
                    labelText: "[[townName2]]",
                    labelPosition: "right",
                    balloonText: "latitude:[[value]]",
                    showBalloon: true,
                    animationPlayed: true,
                }, {
                    id: "g3",
                    title: "duration",
                    valueField: "duration",
                    type: "line",
                    valueAxis: "a3",
                    lineAlpha: 0.8,
                    lineColor: "#e26a6a",
                    balloonText: "[[value]]",
                    lineThickness: 1,
                    legendValueText: "[[value]]",
                    bullet: "square",
                    bulletBorderColor: "#e26a6a",
                    bulletBorderThickness: 1,
                    bulletBorderAlpha: 0.8,
                    dashLengthField: "dashLength",
                    animationPlayed: true
                }],

                chartCursor: {
                    zoomable: false,
                    categoryBalloonDateFormat: "DD",
                    cursorAlpha: 0,
                    categoryBalloonColor: "#e26a6a",
                    categoryBalloonAlpha: 0.8,
                    valueBalloonsEnabled: false
                },
                legend: {
                    bulletType: "round",
                    equalWidths: false,
                    valueWidth: 120,
                    useGraphSettings: true,
                    color: "#6c7b88"
                }
            });
        },

        initAmChart2: function() {
            if (typeof(AmCharts) === 'undefined' || $('#dashboard_amchart_2').size() === 0) {
                return;
            }

            // svg path for target icon
            var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
            // svg path for plane icon
            var planeSVG = "M19.671,8.11l-2.777,2.777l-3.837-0.861c0.362-0.505,0.916-1.683,0.464-2.135c-0.518-0.517-1.979,0.278-2.305,0.604l-0.913,0.913L7.614,8.804l-2.021,2.021l2.232,1.061l-0.082,0.082l1.701,1.701l0.688-0.687l3.164,1.504L9.571,18.21H6.413l-1.137,1.138l3.6,0.948l1.83,1.83l0.947,3.598l1.137-1.137V21.43l3.725-3.725l1.504,3.164l-0.687,0.687l1.702,1.701l0.081-0.081l1.062,2.231l2.02-2.02l-0.604-2.689l0.912-0.912c0.326-0.326,1.121-1.789,0.604-2.306c-0.452-0.452-1.63,0.101-2.135,0.464l-0.861-3.838l2.777-2.777c0.947-0.947,3.599-4.862,2.62-5.839C24.533,4.512,20.618,7.163,19.671,8.11z";

            var map = AmCharts.makeChart("dashboard_amchart_2", {
                type: "map",
                "theme": "light",
                pathToImages: "../assets/global/plugins/amcharts/ammap/images/",

                dataProvider: {
                    map: "worldLow",
                    linkToObject: "london",
                    images: [{
                            id: "london",
                            color: "#009dc7",
                            svgPath: targetSVG,
                            title: "London",
                            latitude: 51.5002,
                            longitude: -0.1262,
                            scale: 1.5,
                            zoomLevel: 2.74,
                            zoomLongitude: -20.1341,
                            zoomLatitude: 49.1712,

                            lines: [{
                                latitudes: [51.5002, 50.4422],
                                longitudes: [-0.1262, 30.5367]
                            }, {
                                latitudes: [51.5002, 46.9480],
                                longitudes: [-0.1262, 7.4481]
                            }, {
                                latitudes: [51.5002, 59.3328],
                                longitudes: [-0.1262, 18.0645]
                            }, {
                                latitudes: [51.5002, 40.4167],
                                longitudes: [-0.1262, -3.7033]
                            }, {
                                latitudes: [51.5002, 46.0514],
                                longitudes: [-0.1262, 14.5060]
                            }, {
                                latitudes: [51.5002, 48.2116],
                                longitudes: [-0.1262, 17.1547]
                            }, {
                                latitudes: [51.5002, 44.8048],
                                longitudes: [-0.1262, 20.4781]
                            }, {
                                latitudes: [51.5002, 55.7558],
                                longitudes: [-0.1262, 37.6176]
                            }, {
                                latitudes: [51.5002, 38.7072],
                                longitudes: [-0.1262, -9.1355]
                            }, {
                                latitudes: [51.5002, 54.6896],
                                longitudes: [-0.1262, 25.2799]
                            }, {
                                latitudes: [51.5002, 64.1353],
                                longitudes: [-0.1262, -21.8952]
                            }, {
                                latitudes: [51.5002, 40.4300],
                                longitudes: [-0.1262, -74.0000]
                            }],

                            images: [{
                                label: "Flights from London",
                                svgPath: planeSVG,
                                left: 100,
                                top: 45,
                                labelShiftY: 5,
                                color: "#d93d5e",
                                labelColor: "#d93d5e",
                                labelRollOverColor: "#d93d5e",
                                labelFontSize: 20
                            }, {
                                label: "show flights from Vilnius",
                                left: 106,
                                top: 70,
                                labelColor: "#6c7b88",
                                labelRollOverColor: "#d93d5e",
                                labelFontSize: 11,
                                linkToObject: "vilnius"
                            }]
                        },

                        {
                            id: "vilnius",
                            color: "#009dc7",
                            svgPath: targetSVG,
                            title: "Vilnius",
                            latitude: 54.6896,
                            longitude: 25.2799,
                            scale: 1.5,
                            zoomLevel: 4.92,
                            zoomLongitude: 15.4492,
                            zoomLatitude: 50.2631,

                            lines: [{
                                latitudes: [54.6896, 50.8371],
                                longitudes: [25.2799, 4.3676]
                            }, {
                                latitudes: [54.6896, 59.9138],
                                longitudes: [25.2799, 10.7387]
                            }, {
                                latitudes: [54.6896, 40.4167],
                                longitudes: [25.2799, -3.7033]
                            }, {
                                latitudes: [54.6896, 50.0878],
                                longitudes: [25.2799, 14.4205]
                            }, {
                                latitudes: [54.6896, 48.2116],
                                longitudes: [25.2799, 17.1547]
                            }, {
                                latitudes: [54.6896, 44.8048],
                                longitudes: [25.2799, 20.4781]
                            }, {
                                latitudes: [54.6896, 55.7558],
                                longitudes: [25.2799, 37.6176]
                            }, {
                                latitudes: [54.6896, 37.9792],
                                longitudes: [25.2799, 23.7166]
                            }, {
                                latitudes: [54.6896, 54.6896],
                                longitudes: [25.2799, 25.2799]
                            }, {
                                latitudes: [54.6896, 51.5002],
                                longitudes: [25.2799, -0.1262]
                            }, {
                                latitudes: [54.6896, 53.3441],
                                longitudes: [25.2799, -6.2675]
                            }],

                            images: [{
                                label: "Flights from Vilnius",
                                svgPath: planeSVG,
                                left: 100,
                                top: 45,
                                labelShiftY: 5,
                                color: "#d93d5e",
                                labelColor: "#d93d5e",
                                labelRollOverColor: "#d93d5e",
                                labelFontSize: 20
                            }, {
                                label: "show flights from London",
                                left: 106,
                                top: 70,
                                labelColor: "#009dc7",
                                labelRollOverColor: "#d93d5e",
                                labelFontSize: 11,
                                linkToObject: "london"
                            }]
                        }, {
                            svgPath: targetSVG,
                            title: "Brussels",
                            latitude: 50.8371,
                            longitude: 4.3676
                        }, {
                            svgPath: targetSVG,
                            title: "Prague",
                            latitude: 50.0878,
                            longitude: 14.4205
                        }, {
                            svgPath: targetSVG,
                            title: "Athens",
                            latitude: 37.9792,
                            longitude: 23.7166
                        }, {
                            svgPath: targetSVG,
                            title: "Reykjavik",
                            latitude: 64.1353,
                            longitude: -21.8952
                        }, {
                            svgPath: targetSVG,
                            title: "Dublin",
                            latitude: 53.3441,
                            longitude: -6.2675
                        }, {
                            svgPath: targetSVG,
                            title: "Oslo",
                            latitude: 59.9138,
                            longitude: 10.7387
                        }, {
                            svgPath: targetSVG,
                            title: "Lisbon",
                            latitude: 38.7072,
                            longitude: -9.1355
                        }, {
                            svgPath: targetSVG,
                            title: "Moscow",
                            latitude: 55.7558,
                            longitude: 37.6176
                        }, {
                            svgPath: targetSVG,
                            title: "Belgrade",
                            latitude: 44.8048,
                            longitude: 20.4781
                        }, {
                            svgPath: targetSVG,
                            title: "Bratislava",
                            latitude: 48.2116,
                            longitude: 17.1547
                        }, {
                            svgPath: targetSVG,
                            title: "Ljubljana",
                            latitude: 46.0514,
                            longitude: 14.5060
                        }, {
                            svgPath: targetSVG,
                            title: "Madrid",
                            latitude: 40.4167,
                            longitude: -3.7033
                        }, {
                            svgPath: targetSVG,
                            title: "Stockholm",
                            latitude: 59.3328,
                            longitude: 18.0645
                        }, {
                            svgPath: targetSVG,
                            title: "Bern",
                            latitude: 46.9480,
                            longitude: 7.4481
                        }, {
                            svgPath: targetSVG,
                            title: "Kiev",
                            latitude: 50.4422,
                            longitude: 30.5367
                        }, {
                            svgPath: targetSVG,
                            title: "Paris",
                            latitude: 48.8567,
                            longitude: 2.3510
                        }, {
                            svgPath: targetSVG,
                            title: "New York",
                            latitude: 40.43,
                            longitude: -74
                        }
                    ]
                },

                zoomControl: {
                    buttonFillColor: "#dddddd"
                },

                areasSettings: {
                    unlistedAreasColor: "#15A892"
                },

                imagesSettings: {
                    color: "#d93d5e",
                    rollOverColor: "#d93d5e",
                    selectedColor: "#009dc7"
                },

                linesSettings: {
                    color: "#d93d5e",
                    alpha: 0.4
                },


                backgroundZoomsToTop: true,
                linesAboveImages: true,

                "export": {
                    "enabled": true,
                    "libs": {
                        "path": "http://www.amcharts.com/lib/3/plugins/export/libs/"
                    }
                }
            });
        },

        initAmChart3: function() {
            if (typeof(AmCharts) === 'undefined' || $('#dashboard_amchart_3').size() === 0) {
                return;
            }

            var chart = AmCharts.makeChart("dashboard_amchart_3", {
                "type": "serial",
                "addClassNames": true,
                "theme": "light",
                "path": "../assets/global/plugins/amcharts/ammap/images/",
                "autoMargins": false,
                "marginLeft": 30,
                "marginRight": 8,
                "marginTop": 10,
                "marginBottom": 26,
                "balloon": {
                    "adjustBorderColor": false,
                    "horizontalPadding": 10,
                    "verticalPadding": 8,
                    "color": "#ffffff"
                },

                "dataProvider": [{
                    "year": 2009,
                    "income": 23.5,
                    "expenses": 21.1
                }, {
                    "year": 2010,
                    "income": 26.2,
                    "expenses": 30.5
                }, {
                    "year": 2011,
                    "income": 30.1,
                    "expenses": 34.9
                }, {
                    "year": 2012,
                    "income": 29.5,
                    "expenses": 31.1
                }, {
                    "year": 2013,
                    "income": 30.6,
                    "expenses": 28.2,
                }, {
                    "year": 2014,
                    "income": 34.1,
                    "expenses": 32.9,
                    "dashLengthColumn": 5,
                    "alpha": 0.2,
                    "additional": "(projection)"
                }],
                "valueAxes": [{
                    "axisAlpha": 0,
                    "position": "left"
                }],
                "startDuration": 1,
                "graphs": [{
                    "alphaField": "alpha",
                    "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                    "fillAlphas": 1,
                    "title": "Income",
                    "type": "column",
                    "valueField": "income",
                    "dashLengthField": "dashLengthColumn"
                }, {
                    "id": "graph2",
                    "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                    "bullet": "round",
                    "lineThickness": 3,
                    "bulletSize": 7,
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "useLineColorForBulletBorder": true,
                    "bulletBorderThickness": 3,
                    "fillAlphas": 0,
                    "lineAlpha": 1,
                    "title": "Expenses",
                    "valueField": "expenses"
                }],
                "categoryField": "year",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "tickLength": 0
                },
                "export": {
                    "enabled": true
                }
            });
        },

        initAmChart4: function() {
            if (typeof(AmCharts) === 'undefined' || $('#dashboard_amchart_4').size() === 0) {
                return;
            }

            var chart = AmCharts.makeChart("dashboard_amchart_4", {
                "type": "pie",
                "theme": "light",
                "path": "../assets/global/plugins/amcharts/ammap/images/",
                "dataProvider": [{
                    "country": "Lithuania",
                    "value": 260
                }, {
                    "country": "Ireland",
                    "value": 201
                }, {
                    "country": "Germany",
                    "value": 65
                }, {
                    "country": "Australia",
                    "value": 39
                }, {
                    "country": "UK",
                    "value": 19
                }, {
                    "country": "Latvia",
                    "value": 10
                }],
                "valueField": "value",
                "titleField": "country",
                "outlineAlpha": 0.4,
                "depth3D": 15,
                "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                "angle": 30,
                "export": {
                    "enabled": true
                }
            });
            jQuery('.chart-input').off().on('input change', function() {
                var property = jQuery(this).data('property');
                var target = chart;
                var value = Number(this.value);
                chart.startDuration = 0;

                if (property == 'innerRadius') {
                    value += "%";
                }

                target[property] = value;
                chart.validateNow();
            });
        },

        initWorldMapStats: function() {
            if ($('#mapplic').size() === 0) {
                return;
            }

            $('#mapplic').mapplic({
                source: '../assets/global/plugins/mapplic/world.json',
                height: 265,
                animate: false,
                sidebar: false,
                minimap: false,
                locations: true,
                deeplinking: true,
                fullscreen: false,
                hovertip: true,
                zoombuttons: false,
                clearbutton: false,
                developer: false,
                maxscale: 2,
                skin: 'mapplic-dark',
                zoom: true
            });

            $("#widget_sparkline_bar").sparkline([8, 7, 9, 8.5, 8, 8.2, 8, 8.5, 9, 8, 9], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '30',
                barColor: '#4db3a4',
                negBarColor: '#e02222'
            });

            $("#widget_sparkline_bar2").sparkline([8, 7, 9, 8.5, 8, 8.2, 8, 8.5, 9, 8, 9], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '30',
                barColor: '#f36a5a',
                negBarColor: '#e02222'
            });

            $("#widget_sparkline_bar3").sparkline([8, 7, 9, 8.5, 8, 8.2, 8, 8.5, 9, 8, 9], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '30',
                barColor: '#5b9bd1',
                negBarColor: '#e02222'
            });

            $("#widget_sparkline_bar4").sparkline([8, 7, 9, 8.5, 8, 8.2, 8, 8.5, 9, 8, 9], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '30',
                barColor: '#9a7caf',
                negBarColor: '#e02222'
            });
        },

        init: function() {

            // this.initJQVMAP();
            // this.initCalendar();
            // this.initCharts();
            // this.initEasyPieCharts();
            // this.initSparklineCharts();
            // this.initChat();
            // this.initDashboardDaterange();
            // this.initMorisCharts();

            // this.initAmChart1();
            // this.initAmChart2();
            // this.initAmChart3();
            // this.initAmChart4();

            // this.initWorldMapStats();
        }
    };

}();

// if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        Dashboard.init(); // init metronic core componets
    });
// }

/**
Core script to handle the entire theme and core functions
**/
var Layout = function () {

    var layoutImgPath = 'layouts/layout/img/';

    var layoutCssPath = 'layouts/layout/css/';

    var resBreakpointMd = App.getResponsiveBreakpoint('md');

    //* BEGIN:CORE HANDLERS *//
    // this function handles responsive layout on screen size resize or mobile device rotate.

    // Set proper height for sidebar and content. The content and sidebar height must be synced always.
    var handleSidebarAndContentHeight = function () {
        var content = $('.page-content');
        var sidebar = $('.page-sidebar');
        var body = $('body');
        var height;

        if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
            var available_height = App.getViewPort().height - $('.page-footer').outerHeight() - $('.page-header').outerHeight();
            if (content.height() < available_height) {
                content.attr('style', 'min-height:' + available_height + 'px');
            }
        } else {
            if (body.hasClass('page-sidebar-fixed')) {
                height = _calculateFixedSidebarViewportHeight();
                if (body.hasClass('page-footer-fixed') === false) {
                    height = height - $('.page-footer').outerHeight();
                }
            } else {
                var headerHeight = $('.page-header').outerHeight();
                var footerHeight = $('.page-footer').outerHeight();

                if (App.getViewPort().width < resBreakpointMd) {
                    height = App.getViewPort().height - headerHeight - footerHeight;
                } else {
                    height = sidebar.height() + 20;
                }

                if ((height + headerHeight + footerHeight) <= App.getViewPort().height) {
                    height = App.getViewPort().height - headerHeight - footerHeight;
                }
            }
            content.attr('style', 'min-height:' + height + 'px');
        }
    };

    // Handle sidebar menu links
    var handleSidebarMenuActiveLink = function(mode, el) {
        var url = location.hash.toLowerCase();    

        var menu = $('.page-sidebar-menu');

        if (mode === 'click' || mode === 'set') {
            el = $(el);
        } else if (mode === 'match') {
            menu.find("li > a").each(function() {
                var path = $(this).attr("href").toLowerCase();       
                // url match condition         
                if (path.length > 1 && url.substr(1, path.length - 1) == path.substr(1)) {
                    el = $(this);
                    return; 
                }
            });
        }

        if (!el || el.size() == 0) {
            return;
        }

        if (el.attr('href').toLowerCase() === 'javascript:;' || el.attr('href').toLowerCase() === '#') {
            return;
        }        

        var slideSpeed = parseInt(menu.data("slide-speed"));
        var keepExpand = menu.data("keep-expanded");

        // begin: handle active state
        if (menu.hasClass('page-sidebar-menu-hover-submenu') === false) {
            menu.find('li.nav-item.open').each(function() {
                var match = false;
                $(this).find('li').each(function(){
                    if ($(this).find(' > a').attr('href') === el.attr('href')) {
                        match = true;
                        return;
                    }
                });

                if (match === true) {
                    return;
                }

                $(this).removeClass('open');
                $(this).find('> a > .arrow.open').removeClass('open');
                $(this).find('> .sub-menu').slideUp();
            });  
        } else {
             menu.find('li.open').removeClass('open');
        }

        menu.find('li.active').removeClass('active');
        menu.find('li > a > .selected').remove();
        // end: handle active state

        el.parents('li').each(function () {
            $(this).addClass('active');
            $(this).find('> a > span.arrow').addClass('open');

            if ($(this).parent('ul.page-sidebar-menu').size() === 1) {
                $(this).find('> a').append('<span class="selected"></span>');
            }
            
            if ($(this).children('ul.sub-menu').size() === 1) {
                $(this).addClass('open');
            }
        });

        if (mode === 'click') {
            if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }
        }
    };

    // Handle sidebar menu
    var handleSidebarMenu = function () {
        // handle sidebar link click
        $('.page-sidebar-menu').on('click', 'li > a.nav-toggle, li > a > span.nav-toggle', function (e) {
            var that = $(this).closest('.nav-item').children('.nav-link');

            if (App.getViewPort().width >= resBreakpointMd && !$('.page-sidebar-menu').attr("data-initialized") && $('body').hasClass('page-sidebar-closed') &&  that.parent('li').parent('.page-sidebar-menu').size() === 1) {
                return;
            }

            var hasSubMenu = that.next().hasClass('sub-menu');

            if (App.getViewPort().width >= resBreakpointMd && that.parents('.page-sidebar-menu-hover-submenu').size() === 1) { // exit of hover sidebar menu
                return;
            }

            if (hasSubMenu === false) {
                if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                    $('.page-header .responsive-toggler').click();
                }
                return;
            }

            var parent =that.parent().parent();
            var the = that;
            var menu = $('.page-sidebar-menu');
            var sub = that.next();

            var autoScroll = menu.data("auto-scroll");
            var slideSpeed = parseInt(menu.data("slide-speed"));
            var keepExpand = menu.data("keep-expanded");
            
            if (!keepExpand) {
                parent.children('li.open').children('a').children('.arrow').removeClass('open');
                parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
                parent.children('li.open').removeClass('open');
            }

            var slideOffeset = -200;

            if (sub.is(":visible")) {
                $('.arrow', the).removeClass("open");
                the.parent().removeClass("open");
                sub.slideUp(slideSpeed, function () {
                    if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                        if ($('body').hasClass('page-sidebar-fixed')) {
                            menu.slimScroll({
                                'scrollTo': (the.position()).top
                            });
                        } else {
                            App.scrollTo(the, slideOffeset);
                        }
                    }
                    handleSidebarAndContentHeight();
                });
            } else if (hasSubMenu) {
                $('.arrow', the).addClass("open");
                the.parent().addClass("open");
                sub.slideDown(slideSpeed, function () {
                    if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                        if ($('body').hasClass('page-sidebar-fixed')) {
                            menu.slimScroll({
                                'scrollTo': (the.position()).top
                            });
                        } else {
                            App.scrollTo(the, slideOffeset);
                        }
                    }
                    handleSidebarAndContentHeight();
                });
            }

            e.preventDefault();
        });

        // handle menu close for angularjs version
        if (App.isAngularJsApp()) {
            $(".page-sidebar-menu li > a").on("click", function(e) {
                if (App.getViewPort().width < resBreakpointMd && $(this).next().hasClass('sub-menu') === false) {
                    $('.page-header .responsive-toggler').click();
                }
            });
        }

        // handle ajax links within sidebar menu
        $('.page-sidebar').on('click', ' li > a.ajaxify', function (e) {
            e.preventDefault();
            App.scrollTop();

            var url = $(this).attr("href");
            var menuContainer = $('.page-sidebar ul');
            var pageContent = $('.page-content');
            var pageContentBody = $('.page-content .page-content-body');

            menuContainer.children('li.active').removeClass('active');
            menuContainer.children('arrow.open').removeClass('open');

            $(this).parents('li').each(function () {
                $(this).addClass('active');
                $(this).children('a > span.arrow').addClass('open');
            });
            $(this).parents('li').addClass('active');

            if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }

            App.startPageLoading();

            var the = $(this);
            
            $.ajax({
                type: "GET",
                cache: false,
                url: url,
                dataType: "html",
                success: function (res) {
                    if (the.parents('li.open').size() === 0) {
                        $('.page-sidebar-menu > li.open > a').click();
                    }

                    App.stopPageLoading();
                    pageContentBody.html(res);
                    Layout.fixContentHeight(); // fix content height
                    App.initAjax(); // initialize core stuff
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    App.stopPageLoading();
                    pageContentBody.html('<h4>Could not load the requested content.</h4>');
                }
            });
        });

        // handle ajax link within main content
        $('.page-content').on('click', '.ajaxify', function (e) {
            e.preventDefault();
            App.scrollTop();

            var url = $(this).attr("href");
            var pageContent = $('.page-content');
            var pageContentBody = $('.page-content .page-content-body');

            App.startPageLoading();

            if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }

            $.ajax({
                type: "GET",
                cache: false,
                url: url,
                dataType: "html",
                success: function (res) {
                    App.stopPageLoading();
                    pageContentBody.html(res);
                    Layout.fixContentHeight(); // fix content height
                    App.initAjax(); // initialize core stuff
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    pageContentBody.html('<h4>Could not load the requested content.</h4>');
                    App.stopPageLoading();
                }
            });
        });

        // handle scrolling to top on responsive menu toggler click when header is fixed for mobile view
        $(document).on('click', '.page-header-fixed-mobile .page-header .responsive-toggler', function(){
            App.scrollTop(); 
        });      
     
        // handle sidebar hover effect        
        handleFixedSidebarHoverEffect();

        // handle the search bar close
        $('.page-sidebar').on('click', '.sidebar-search .remove', function (e) {
            e.preventDefault();
            $('.sidebar-search').removeClass("open");
        });

        // handle the search query submit on enter press
        $('.page-sidebar .sidebar-search').on('keypress', 'input.form-control', function (e) {
            if (e.which == 13) {
                $('.sidebar-search').submit();
                return false; //<---- Add this line
            }
        });

        // handle the search submit(for sidebar search and responsive mode of the header search)
        $('.sidebar-search .submit').on('click', function (e) {
            e.preventDefault();
            if ($('body').hasClass("page-sidebar-closed")) {
                if ($('.sidebar-search').hasClass('open') === false) {
                    if ($('.page-sidebar-fixed').size() === 1) {
                        $('.page-sidebar .sidebar-toggler').click(); //trigger sidebar toggle button
                    }
                    $('.sidebar-search').addClass("open");
                } else {
                    $('.sidebar-search').submit();
                }
            } else {
                $('.sidebar-search').submit();
            }
        });

        // handle close on body click
        if ($('.sidebar-search').size() !== 0) {
            $('.sidebar-search .input-group').on('click', function(e){
                e.stopPropagation();
            });

            $('body').on('click', function() {
                if ($('.sidebar-search').hasClass('open')) {
                    $('.sidebar-search').removeClass("open");
                }
            });
        }
    };

    // Helper function to calculate sidebar height for fixed sidebar layout.
    var _calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = App.getViewPort().height - $('.page-header').outerHeight(true);
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.page-footer').outerHeight();
        }

        return sidebarHeight;
    };

    // Handles fixed sidebar
    var handleFixedSidebar = function () {
        var menu = $('.page-sidebar-menu');

        App.destroySidebarSlimScroll(menu);

        if ($('.page-sidebar-fixed').size() === 0) {
            handleSidebarAndContentHeight();
            return;
        }

        if (App.getViewPort().width >= resBreakpointMd) {
            menu.attr("data-height", _calculateFixedSidebarViewportHeight());
            App.initSidebarSlimScroll(menu);
            handleSidebarAndContentHeight();
            if($('body').hasClass('page-sidebar-closed')) {
            	$('.sidebar-slimScrollDiv').css('width', '');
            }
        }
    };

    // Handles sidebar toggler to close/hide the sidebar.
    var handleFixedSidebarHoverEffect = function () {
        var body = $('body');
        if (body.hasClass('page-sidebar-fixed')) {
            $('.page-sidebar').on('mouseenter', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').removeClass('page-sidebar-menu-closed');
                }
            }).on('mouseleave', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
                }
            });
        }
    };

    // Hanles sidebar toggler
    var handleSidebarToggler = function () {
        var body = $('body');
        if ($.cookie && $.cookie('sidebar_closed') === '1' && App.getViewPort().width >= resBreakpointMd) {
            $('body').addClass('page-sidebar-closed');
            $('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
            $('.sidebar-slimScrollDiv').css('width', '');
        }

        // handle sidebar show/hide
        $('body').on('click', '.sidebar-toggler', function (e) {
            var sidebar = $('.page-sidebar');
            var sidebarMenu = $('.page-sidebar-menu');
            $(".sidebar-search", sidebar).removeClass("open");

            if (body.hasClass("page-sidebar-closed")) {
                body.removeClass("page-sidebar-closed");
                sidebarMenu.removeClass("page-sidebar-menu-closed");
                if ($.cookie) {
                    $.cookie('sidebar_closed', '0');
                }
            } else {
                body.addClass("page-sidebar-closed");
                sidebarMenu.addClass("page-sidebar-menu-closed");
                if (body.hasClass("page-sidebar-fixed")) {
                    sidebarMenu.trigger("mouseleave");
                }
                if ($.cookie) {
                    $.cookie('sidebar_closed', '1');
                }
                $('.sidebar-slimScrollDiv').css('width', '');
            }

            $(window).trigger('resize');
        });
    };

    // Handles the horizontal menu
    var handleHorizontalMenu = function () {
        //handle tab click
        $('.page-header').on('click', '.hor-menu a[data-toggle="tab"]', function (e) {
            e.preventDefault();
            var nav = $(".hor-menu .nav");
            var active_link = nav.find('li.current');
            $('li.active', active_link).removeClass("active");
            $('.selected', active_link).remove();
            var new_link = $(this).parents('li').last();
            new_link.addClass("current");
            new_link.find("a:first").append('<span class="selected"></span>');
        });

        // handle search box expand/collapse        
        $('.page-header').on('click', '.search-form', function (e) {
            $(this).addClass("open");
            $(this).find('.form-control').focus();

            $('.page-header .search-form .form-control').on('blur', function (e) {
                $(this).closest('.search-form').removeClass("open");
                $(this).unbind("blur");
            });
        });

        // handle hor menu search form on enter press
        $('.page-header').on('keypress', '.hor-menu .search-form .form-control', function (e) {
            if (e.which == 13) {
                $(this).closest('.search-form').submit();
                return false;
            }
        });

        // handle header search button click
        $('.page-header').on('mousedown', '.search-form.open .submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).closest('.search-form').submit();
        });

        // handle hover dropdown menu for desktop devices only
        $('[data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function() {   
            $(this).dropdownHover(); 
            $(this).addClass('hover-initialized'); 
        });
        
        $(document).on('click', '.mega-menu-dropdown .dropdown-menu', function (e) {
            e.stopPropagation();
        });
    };

    // Handles Bootstrap Tabs.
    var handleTabs = function () {
        // fix content height on tab click
        $('body').on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
            handleSidebarAndContentHeight();
        });
    };

    // Handles the go to top button at the footer
    var handleGoTop = function () {
        var offset = 300;
        var duration = 500;

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {  // ios supported
            $(window).bind("touchend touchcancel touchleave", function(e){
               if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        } else {  // general 
            $(window).scroll(function() {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        }
        
        $('.scroll-to-top').click(function(e) {
            e.preventDefault();
            $('html, body').animate({scrollTop: 0}, duration);
            return false;
        });
    };

    // Hanlde 100% height elements(block, portlet, etc)
    var handle100HeightContent = function () {

        $('.full-height-content').each(function(){
            var target = $(this);
            var height;

            height = App.getViewPort().height -
                $('.page-header').outerHeight(true) -
                $('.page-footer').outerHeight(true) -
                $('.page-title').outerHeight(true) -
                $('.page-bar').outerHeight(true);

            if (target.hasClass('portlet')) {
                var portletBody = target.find('.portlet-body');

                App.destroySlimScroll(portletBody.find('.full-height-content-body')); // destroy slimscroll 
                
                height = height -
                    target.find('.portlet-title').outerHeight(true) -
                    parseInt(target.find('.portlet-body').css('padding-top')) -
                    parseInt(target.find('.portlet-body').css('padding-bottom')) - 5;

                if (App.getViewPort().width >= resBreakpointMd && target.hasClass("full-height-content-scrollable")) {
                    height = height - 35;
                    portletBody.find('.full-height-content-body').css('height', height);
                    App.initSlimScroll(portletBody.find('.full-height-content-body'));
                } else {
                    portletBody.css('min-height', height);
                }
            } else {
               App.destroySlimScroll(target.find('.full-height-content-body')); // destroy slimscroll 

                if (App.getViewPort().width >= resBreakpointMd && target.hasClass("full-height-content-scrollable")) {
                    height = height - 35;
                    target.find('.full-height-content-body').css('height', height);
                    App.initSlimScroll(target.find('.full-height-content-body'));
                } else {
                    target.css('min-height', height);
                }
            }
        });        
    };
    //* END:CORE HANDLERS *//

    return {
        // Main init methods to initialize the layout
        //IMPORTANT!!!: Do not modify the core handlers call order.

        initHeader: function() {
            handleHorizontalMenu(); // handles horizontal menu 
        },

        setSidebarMenuActiveLink: function(mode, el) {
            handleSidebarMenuActiveLink(mode, el);
        },

        initSidebar: function() {
            //layout handlers
            handleFixedSidebar(); // handles fixed sidebar menu
            handleSidebarMenu(); // handles main menu
            handleSidebarToggler(); // handles sidebar hide/show

            if (App.isAngularJsApp()) {      
                handleSidebarMenuActiveLink('match'); // init sidebar active links 
            }

            App.addResizeHandler(handleFixedSidebar); // reinitialize fixed sidebar on window resize
        },

        initContent: function() {
            handle100HeightContent(); // handles 100% height elements(block, portlet, etc)
            handleTabs(); // handle bootstrah tabs

            App.addResizeHandler(handleSidebarAndContentHeight); // recalculate sidebar & content height on window resize
            App.addResizeHandler(handle100HeightContent); // reinitialize content height on window resize 
        },

        initFooter: function() {
            handleGoTop(); //handles scroll to top functionality in the footer
        },

        init: function () {            
            this.initHeader();
            this.initSidebar();
            this.initContent();
            this.initFooter();
        },

        //public function to fix the sidebar and content height accordingly
        fixContentHeight: function () {
            handleSidebarAndContentHeight();
        },

        initFixedSidebarHoverEffect: function() {
            handleFixedSidebarHoverEffect();
        },

        initFixedSidebar: function() {
            handleFixedSidebar();
        },

        getLayoutImgPath: function () {
            return App.getAssetsPath() + layoutImgPath;
        },

        getLayoutCssPath: function () {
            return App.getAssetsPath() + layoutCssPath;
        }
    };

}();

// if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {    
       Layout.init(); // init metronic core componets
       Layout.initFixedSidebarHoverEffect();
    });
// }