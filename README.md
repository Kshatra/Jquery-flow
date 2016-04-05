Jquery flow
===========

Jquery extension for emulating PDF-like data flow in chosen element(s).
This plugin operates with the idea of the flow - a data stream that is distributed between static content(pages).
Takes a collection of elements and makes their content usable for print media by splitting content to pages.

It's up to user to identify client browser and set corresponding page sizes. I recommend using WhichBrowser:
https://github.com/NielsLeenheer/WhichBrowser

Plugin automatically inserts page footers and headers. Their content is taken from elements with **page_header_class_name/page_footer_class_name** classes inside the flow
and can be changed dynamically by inserting inside the flow new elements with corresponding classes.
With **header_exclude** and **footer_exclude** settings you can omit inserting header/footer into specific pages.
Page numbers must be separated by comas(no spaces). For the last page you may use preserved word 'last'.
For example: header_exclude = '1,2,3,last'

Pages are counted from first_page_no setting, not from 0!

Notes:
- page header/footer content are taken from first occurance of element with **page_header_class_name/page_footer_class_name** in a document.
 So if page footer/header should not be present on starting flow pages you should specify elements with **page_header_class_name/page_footer_class_name** that has no children(empty) at the beginning of the flow or use **header_exclude/footer_exclude** setting strings in initialization.
- new page header/footer elements apply to new page. Another words: if plugin finds element with **page_header_class_name/page_footer_class_name**, it applies them only when the next page is created.

Initialization settings:
- **page_width**, **default:**740
- **page_height**, **default:**1060
- **page_class_name** - class name for each created page div
- **page_header_class_name**
- **page_content_class_name**
- **page_footer_class_name**
- **first_page_no** -number of the first page in each flow, **default:**1
- **pn_container_class_name** -  class of element where **current** page number should be inserted. It can be placed both inside header and footer
- **total_pn_container_class_name** -class of element where **total** page number should be inserted. It can be placed both inside header and footer, **default:**
- **header_exclude**
- **footer_exclude**
- **no_page_break** - string: coma-separated list of elements after which page break must not happen. This is useful for headers, etc., **default:**h1,h2,h3,h4,h5,h6. If any of listed elements happen to get at the bottom of the page then it is moved to the beginning of next page.
- **callback** -callback function after all flow operations are finished. Note that callback is called only once no matter how many Jquery objects are passed to the flow plugin. **default:**null

Plugin may use Jquery.cookie to retain vertical scroll positioning between page reloads.

Compatibility tested for: IE8, FF.

v0.6:
- added page_number attribute to each page. Page numbering in pn_container_class_name is based on this values. What it gives us? Well, now we can create or own elementas with pn_container_class_name in any place inside the flow and they will have current page number inside. For ex., this is useful for the lat page as it often has different footer(sign places) from all other pages. But it still should have page number. Shurely we can create new page footer at the beginning of this page. Or we can just create this sign places table where it should be(at the end of the flow) and give pn_container_class_name to some element inside it. This is much simplier way.
- added page class name. This is needed for (1) and when you want to apply custom css to the page. Though it's important not to apply CSS that may conflict with flow script, i.e. setting fixed page height, absolute postitioning, float etc. Mainly it's for setting background color, border.

v0.7
- added total page number container and processing

v0.8
- added callback function
- added proper css for last page footer

v0.9
- added no_page_break: coma-separated element list - next page cannot appear directly after element

