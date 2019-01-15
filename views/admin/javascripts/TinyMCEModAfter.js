jQuery(window).load(function() {
    // This block adds custom styles to the text edit form on exhibit pages.
    // Add classes to this menu and put the style declarations in style.css
    // -AM 2/10/17
    params = {
      toolbar: "bold italic underline | alignleft aligncenter alignright | bullist numlist | link formatselect | styleselect | code",
      style_formats: [{
          title: 'Highlight1 - gray w/bar',
          inline: 'span',
          classes: 'medium-block-1'
        }, {
          title: 'Highlight2 - white w/bar',
          inline: 'span',
          classes: 'medium-block-3'
        }, {
          title: 'Quote1 - double gray',
          inline: 'span',
          classes: 'medium-block-2'
        }, {
          title: 'Quote2 - single green',
          inline: 'span',
          classes: 'medium-block-4'
        }, {
          title: 'Pull quote',
          inline: 'span',
          classes: 'pull-quote'
        }, {
          title: 'Transcription',
          block: 'div',
          classes: 'transcription'
        }, {
          title: 'Transcription link',
          selector: 'a',
          classes: 'show-transcription'
        }],
    }
    Omeka.wysiwyg(params);
});
