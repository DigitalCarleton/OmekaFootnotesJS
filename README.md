# OmekaFootnotesJS
An Omeka plugin to extend the TinyMCE on exhibit pages and simple pages to include interactive JavaScript footnotes.

This plugin uses Bigfoot.js version 2.1.4

## Installation

1. Make sure you have ExhibitBuilder and SimplePages installed in your Omeka site

2. Install the OmekaFootnotesJS plugin

3. Add '*.id' to Allowed HTML Attributes in Omeka security settings and save changes.


## Instructions

### Adding and editing footnotes

1. If you want to add/edit a footnote:

    a. Position your cursor in the place you'd like to add a footnote, then press the "Add Footnote" button on the toolbar. A footnote link will be inserted at that point, and a footnote text snippet will appear at the end of the text block.
   
    b. To change the content of the footnote, edit the associated text snippet. If citing a source, remember to do so in a standard format (see the "Citing and managing your sources" tab), and apply a link if it can be accessed online.
   
    c. Refer to (3) to update the order of your footnotes if necessary (in most cases, this should be handled automatically).

![Add Footnote Image](images/TinyMCEMod_AddFootnote-Edit.png)


2. If you want to remove a footnote:
   
    a. Highlight the footnote link in the text. You may highlight multiple footnotes at the same time, but note that all footnotes you highlight will be deleted.
   
    b. Press the "Delete Selected Footnotes" button on the toolbar. The footnotes you selected, along with their descriptive text snippets, will be removed.
   
    c. Refer to (3) to update the order of your footnotes if necessary (in most cases, this should be handled automatically).

![Delete Footnote Image](images/TinyMCEMod_DeleteFootnotes-Edit.png)


3. If your footnotes are out of order:
  
    a. Press the "Update Footnotes" button on the toolbar. This will reorder your footnotes in order of appearance.

![Update Footnote Image](images/TinyMCEMod_UpdateFootnotes-Edit.png)
