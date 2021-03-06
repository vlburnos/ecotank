var ModFormsForm = {
	init: [],
	selector: {
		form: '.modforms-form',
		modal: '.modforms-modal'
	},
	config: {
		validation: {
			rules: {

			},
			messages: {

			},
			error: {
				label: false,
			}
		},
		inputmask: {

		},
		modal: {

		}
	},

	validator: {
		addMethod: function() {

			jQuery.validator.addMethod("customphone", function(value, element) {
				return this.optional(element) || /^\+\d\([0-9]{3}\)[0-9]{3}-[0-9]{2}\-[0-9]{2}/i.test(value);
			});

			ModFormsForm.init['addMethod'] = true;
		}
	},

	initialize: function(opts) {
		var config = $.extend(true, {}, this.config, opts);

		if (!jQuery.Validation) {
			document.writeln('<script src="' + config.assetsUrl + 'vendor/validation/dist/jquery.validate.min.js"><\/script>');
		}

		if (!jQuery.inputmask) {
			document.writeln('<script src="' + config.assetsUrl + 'vendor/inputmask/dist/min/jquery.inputmask.bundle.min.js"><\/script>');
		}

		if (!jQuery.ajaxSubmit) {
			document.writeln('<script src="' + config.assetsUrl + 'vendor/form/jquery.form.js"><\/script>');
		}

		if (!jQuery().UIkit) {
			document.writeln('<style data-compiled-css>@import url(' + config.assetsUrl + 'vendor/uikit/src/css/components/modal.css); </style>');
			document.write('<script src="' + config.assetsUrl + 'vendor/uikit/src/js/core/core.js"><\/script>');
			document.write('<script src="' + config.assetsUrl + 'vendor/uikit/src/js/core/modal.js"><\/script>');
		}

		$(document).ready(function() {

			if (!ModFormsForm.init['addMethod']) {
				ModFormsForm.validator.addMethod();
			}

			$(ModFormsForm.selector.form + config.selector).each(function() {
				var $this = $(this);

				var inputmaskConfig = $.extend({}, config.inputmask, $this.data());
				$.each(inputmaskConfig, function(name, options) {
					var input = $this.find('input[name=' + name + ']');
					if (!!input) {
						input.inputmask($.extend({}, options, input.data()));
					}
				}, this);

				var validationConfig = $.extend({}, config.validation, $this.data());
				validationConfig.submitHandler = function() {
					/* hide modal, show thanks */

					var modal = UIkit.modal('#modal');
					if (modal.isActive() ) {
						modal.hide();
					}
					
				};

				if (!validationConfig.error.label) {
					/* disable error label */
					validationConfig.errorPlacement = function(error, element) {};
				}

				$this.validate(validationConfig);

				$this.submit(function(e) {
					e.preventDefault();

					var $form = $(this);
					if (!$form.valid()) {
						return false;
					}

					$form.ajaxSubmit({
						type: 'POST',
						dataType: 'json',
						url: config.actionUrl,
						data: {
							modforms: config.action,
							propkey: config.propkey,
							selector: config.selectors
						},

						beforeSerialize: function(form, options) {

						},
						beforeSubmit: function(fields, form) {
							form.find('.error').html('');
							form.find('.error').removeClass('error');
							form.find('input,textarea,select,button').attr('disabled', true);

							return true;
						},
						success: function(response, status, xhr, form) {
							form.find('input,textarea,select,button').attr('disabled', false);
							response.form = form;
							$(document).trigger('submit_complete', response);
							if (!response.success) {
								if (response.data) {
									var key, value;
									for (key in response.data) {
										if (response.data.hasOwnProperty(key)) {
											value = response.data[key];
											form.find('.error_' + key).html(value).addClass('error');
											form.find('[name="' + key + '"]').addClass('error');
										}
									}
								}
							} else {
								$form.find('.error').removeClass('error');
								$form[0].reset();
							}
						}
					});


					return false;

				});


			});


		});

	},

};