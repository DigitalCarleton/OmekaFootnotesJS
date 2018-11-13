<?php

class TinyMCEModPlugin extends Omeka_Plugin_AbstractPlugin
{
    protected $_hooks = array('admin_head');

    /**
     * Queue javascript files when admin section loads
     *
     *@return void
     */
    public function hookAdminHead()
    {
      $Record = "";
      $view = get_view();
      // Zend_Debug::dump($view);

      // if(isset($view->simple_pages_page)) {
      //     $Record = 'Y';
      // }

      if(isset($view->exhibit_page)) {
          $Record = 'Y';
      }

      if($Record == 'Y') {
        queue_js_file('TinyMCEMod');
      }
    }

}
