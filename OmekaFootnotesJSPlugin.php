<?php

class OmekaFootnotesJSPlugin extends Omeka_Plugin_AbstractPlugin
{
    protected $_hooks = array(
      'admin_head',
      'public_head'
    );

    /**
     * Queue javascript files when admin section loads
     *
     *@return void
     */
    public function hookAdminHead()
    {
      $Record = "";
      $view = get_view();

      if(isset($view->exhibit_page) || isset($view->simple_page)) {
          $Record = 'Y';
      }

      if($Record == 'Y') {
        // Update existing and newly created text boxes
        queue_js_file('OmekaFootnotes');
      }
    }

    
    public function hookPublicHead() {
      
      queue_css_file('bigfoot-default');
      queue_css_file('bigfoot-number');

      queue_js_file('bigfoot');
      queue_js_string('var bigfoot = jQuery.bigfoot({activateOnHover:true,deleteOnUnhover:true,});');

    }

}
