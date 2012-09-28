/*!
 * Scripts
 *
 */
head.ready(function() {
 "use strict";

	var Engine = {
		utils : {
			links : function(){
				$('a[rel*="external"]').click(function(e){
					e.preventDefault();
					window.open($(this).attr('href'));
				});
			},
			mails : function(){
				$('a[href^="mailto:"]').each(function(){
					var 
						mail = $(this).attr('href').replace('mailto:',''),
						replaced = mail.replace('/at/','@');
					$(this).attr('href','mailto:' + replaced);
					if($(this).text() === mail) {
						$(this).text(replaced);
					}
				});
			},
			labels : function(){
				try { $('.form-t label, .form-a label').compactize(); } catch(err) {}
			},
 			customSel: function(){
 				try { $('.form-a select.custom').customSelect(); } catch(err) {}
 			}
		},
		fixes : {
			enhancements : function() {
				if($.browser.msie && parseInt($.browser.version,10) < 9){
					$('hr').wrap('<div class="hr"></div>');
					$(':last-child:not(cufon)').addClass('last-child');
				}
			},
			pie : function() {
				$('body').bind('refresh.pie',function() {
					if($.browser.msie && parseInt($.browser.version,10) < 9){
						if(window.PIE !== undefined){							
							$('.INSERT_PIE_ELEMENTS_HERE').each(function() {
								window.PIE.detach(this);
								window.PIE.attach(this);
							});
						}
					}
				});
			}
		}
	};

	Engine.utils.links();
	Engine.utils.mails();
	Engine.utils.labels();
	Engine.utils.customSel();
	Engine.fixes.enhancements();
	
});
