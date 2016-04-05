/*
Jquery extension for emulating PDF-like data flow in chosen element(s).
This plugin operates with the idea of the flow. The flow is a data stream that is distributed between static content(pages)
Function takes a collection of elements and makes their content usable for print media by splitting content to pages.
*/
(function ( $ ) {
	$.fn.flow = function( options ) {

		var settings = $.extend({
			// These are the defaults.
				page_width: 740,
				page_height: 1060,
				page_class_name: 'flow_page_class_name_default',
				page_header_class_name: 'page_header_class_name_default',
				page_content_class_name:'page_content_class_name_default',
				page_footer_class_name: 'page_footer_class_name_default',
				first_page_no: 1,
				pn_container_class_name: 'pn_container_class_name_default',
				total_pn_container_class_name:'total_pn_container_class_name_default',
				header_exclude: '',
				footer_exclude: '',
				no_page_break:'h1,h2,h3,h4,h5,h6',
				callback: null
			}, options );

		var page_header_exclude = settings.header_exclude.split(",");
		var page_footer_exclude = settings.footer_exclude.split(",");

		var no_page_break_list = settings.no_page_break.split(",");
		for (var i = 0; i < no_page_break_list.length; i++) {
			no_page_break_list[i] = no_page_break_list[i].toLowerCase();
		}

		function flow_page_create(page_num, given_template) {
			var page = given_template.page.clone(true, true);

			page.css('position', 'relative');
			page.attr('page_number', page_num);
			//We always add the clones of nodes, not the nodes themselves
			//Clone header template to page if needed.
			/*
			The tricky part is: when page should not contain header (it's number is in page_header_exclude list)
			we still have to return header object. This is done to avoid multiple page_header_exclude checks in main loop.
			So if page number is in page_header_exclude list we still create page header and even return it,
			but we don't append it to the currently created page. It just wanishes with the next call of
			current_page = flow_page_create(page_number, settings) in the main loop.
			*/
			var header = given_template.header.clone(true, true);
			if ($.inArray((page_num).toString(), page_header_exclude) == -1 && settings.page_header_class_name != null) { page.append(header) }
			//Clone content template to page
			//Now we select the content of the current page, not the template we created before
			var content = given_template.content.clone(true, true);
			page.append(content);

			//Clone footer template to page if needed
			var footer = given_template.footer.clone(true, true);
			if ($.inArray((page_num).toString(), page_footer_exclude) == -1 && settings.page_footer_class_name != null) { page.append(footer) }

			return {page: page, header: header, content: content , footer: footer};
		}

		this.each(function() {
			var template = {
				page: $('<div/>').css('page-break-after', 'always').addClass(settings.page_class_name),
				header: null,
				content: $('<div/>').addClass(settings.page_content_class_name),
				footer: null
			};
			$(template.page, template.header, template.content, template.footer).css('width','100%');

			var page_number = settings.first_page_no;
			var flow = $(this);
			// width is set for whole flow container, height- for each page
			flow.css('width',settings.page_width + 'px');
			var flow_source_copy = flow.clone(true, true);
			flow.empty();//clearing flow content

			//BEGIN first page setup
			var first_page_header = flow_source_copy.find('.' + settings.page_header_class_name).first();
			template.header = first_page_header.clone(true,true);
			first_page_header.remove();

			var first_page_footer = flow_source_copy.find('.' + settings.page_footer_class_name).first();
			template.footer = first_page_footer.clone(true,true);
			first_page_footer.remove();

			current_page = flow_page_create(settings.first_page_no, template);
			flow.append(current_page.page);//add first page to the flow
			//END first page setup

			var last_el;
			var no_page_break_element;
			//BEGIN iterate through elements of flow source copy
			flow_source_copy.contents().each(function() {
				//process current element
				current_element = $(this).clone(true, true);
				if ( current_element.hasClass(settings.page_header_class_name) ) {
					template.header = current_element;
				} else if ( current_element.hasClass(settings.page_footer_class_name) ) {
					template.footer = current_element;
				} else { current_page.content.append(current_element) }

				if (current_page.page.innerHeight() >= settings.page_height || $(this).attr("page_break_before") == 'yes') {
					current_page.content.contents().last().remove();//delete last child as it cannot fit in current page
					//now  if last element on page is in no_page_break_list then remove it and append to the beginning of the next page
					last_el = current_page.content.find(':last');
					if ( $.inArray(last_el[0].nodeName.toLowerCase(), no_page_break_list) != -1 ) {
						//last_el.remove();
						no_page_break_element = last_el;
					} else {
						no_page_break_element = $(null);
					}
					//for footer to be absolutely positioned at the bottom of the page
					current_page.page.css('height', settings.page_height + 'px');
					current_page.footer.css({
						position: 'absolute',
						bottom: '0px',
						left: '0px',
						width: settings.page_width + 'px'
					});
					page_number++;
					//Create next page
					current_page = flow_page_create(page_number, template);
					flow.append(current_page.page);//add current page to main content
					//add no_page_break_element to new page (it is null if not in no_page_break_list)
					//also, with this we automatically remove last_el from previous page because no_page_break_element points to last_el
					current_page.content.append(no_page_break_element);
					current_page.content.append(current_element);//add current element to new page
				}
			});
			//END iterate through elements of flow
			//Set the total number of printed pages (starting from first_page_no)
			var total_pages = page_number;

			//BEGIN last page processing
			current_page.page.css('height', settings.page_height + 'px');
			current_page.footer.css( {
				position: 'absolute',
				bottom: '0px',
				left: '0px',
				width: settings.page_width + 'px'
			} );
			//remove last page's header if needed
			if ($.inArray('last', page_header_exclude) != -1) { current_page.header.remove() }
			//remove last page's footer if needed
			if ($.inArray('last', page_footer_exclude) != -1) { current_page.footer.remove() }
			//apply last page to the flow
			current_page.page.css('page-break-after','avoid');//Don't need page break after the last page
			flow.append(current_page.page);
			// END last page processing

			// Only now we add page numbers
			flow.find('.' + settings.pn_container_class_name).each(function(index, element) {
				var current = $(this);
				current.text( current.closest('.' + settings.page_class_name).attr('page_number') );
			});
			// Add total number of printed pages to every element with class "total_pn_container_class_name"
			flow.find('.' + settings.total_pn_container_class_name).text(total_pages);
			// Load and save scroll position (useful for web dev as FF doesn't restore scroll position on page refresh)
			if ($.cookie) {
				window.scrollTo(0, $.cookie('flow_y_shift'));
				$( window ).on('beforeunload', function() {
					$.cookie('flow_y_shift', $(window).scrollTop()); //omit expire days as it should be a session cookie
				});
			} else {
				//console.log messing up IE8 in compatibility mode, commenting the call
				/*console.log('jquery.cookie.js is not loaded')*/
			}
		});// END each flow method
		if (settings.callback != null) { settings.callback() }
	};// END Jquery extension method
}( jQuery ));// END Immediately Invoked Function Expression