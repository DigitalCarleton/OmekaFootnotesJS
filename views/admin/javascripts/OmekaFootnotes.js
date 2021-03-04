jQuery(document).ready(function() {
  displayFootnotes();
});

jQuery(window).load(function() {
  displayFootnotes();
});

function displayFootnotes() {
  var selector;
  if (jQuery('#simple-pages-use-tiny-mce').is(':checked')) {
    selector = '#simple-pages-text';
  } else if (jQuery('#simple-pages-use-tiny-mce').is(":not(:checked)")) {
    selector = false;
  } else {
    selector = 'textarea';
  }
  params = {
    selector: selector,
    menubar: 'edit view insert format table',
    toolbar: [
      "bold italic underline | alignleft aligncenter alignright | bullist numlist | link formatselect  | code ",
      "addFootnoteButton | deleteFootnotesButton | updateFootnotesButton"
    ],
    setup: function (editor) {
    editor.addButton('addFootnoteButton', {
        text: 'Add Footnote',
        onclick: function () {
          // Add the new footnote link
          var tinymceBody = getTinyMCEDOMObject();
          addFootnoteLinkClassToFootnoteLinks(tinymceBody);
          updateFootnotes();
          var fnNextNum = getFnNextNum(tinymceBody);
          addNewFootnoteLink(editor, fnNextNum);
          var tinymceBody = getTinyMCEDOMObject();
          // Add the new footnote citation
          if(getNumberOfFootnoteDivs(tinymceBody) == 0){
            addFootnoteDiv(tinymceBody);
          }
          addFootnoteCitation(tinymceBody, fnNextNum);
          // Move cursor to bottom of the editor
          tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.getBody(), true);
          tinyMCE.activeEditor.selection.collapse(false);
          updateFootnotes();
        }
      });
    editor.addButton('updateFootnotesButton', {
        text: 'Update Footnotes',
        onclick: function () {
            updateFootnotes();
        }
      });
    editor.addButton('deleteFootnotesButton', {
          text: 'Delete Selected Footnotes',
          onclick: function () {
              updateFootnotes();
              var tinymceBody = getTinyMCEDOMObject();
              node = editor.selection.getNode();
              parent = node.parentNode;
              var selectedHTML = editor.selection.getContent({format : 'html'}).toString();
              if(selectedHTML.length <= 1){
                //if the highlighted text is the single number of the footnote, the outerHTML will let us access the whole node.
                //Note: we can't just use the single number of innerHTML because then any time someone highlights a regular text number,
                //  the footnote with that number will be deleted
                selectedHTML = editor.selection.getNode().outerHTML.toString();
              }
              var idsFootnotesToDelete = getListOfFootnotesToDelete(selectedHTML);
              var fnLinks = getFnLinks(tinymceBody);
              var fnCitations = getFnCitations(tinymceBody);
              for(j = 0; j < idsFootnotesToDelete.length; j++){
                var fnLinkIDs = getFnLinkIDs(fnLinks);
                var indexDel = fnLinkIDs.indexOf(idsFootnotesToDelete[j]);
                fnLinkToDelete = fnLinks.item(indexDel);
                fnLinkParent = fnLinkToDelete.parentNode;
                fnLinkParent.removeChild(fnLinkToDelete);
                if(fnCitations.length == 1){
                  tinymceBody.removeChild(getExistingFootnoteDiv(tinymceBody));
                } else {
                  fnCitToDelete = fnCitations.item(indexDel);
                  fnCitParent = fnCitToDelete.parentNode;
                  fnCitParent.removeChild(fnCitToDelete);
                }
              }
              updateFootnotes();
          }
      });
    },
  }
  if (typeof tinyMCE != "undefined") {
    tinyMCE.remove();
  }
  Omeka.wysiwyg(params);
  updateFootnotes();

  // adds footnote functionality to new exhibit builder text blocks
  jQuery(document).on('exhibit-builder-refresh-wysiwyg', function () {
    Omeka.wysiwyg(params);
    updateFootnotes();
  });
}

function getSelectorValue() {
  var selector;
  if (jQuery('#simple-pages-use-tiny-mce').is(':checked')) {
    selector = '#simple-pages-text';
  } else if (jQuery("body").hasClass("simple-pages") && !jQuery('#simple-pages-use-tiny-mce').is(':checked')) {
    selector = false;
  } else {
    selector = 'textarea';
  }
  return selector;
}

function setParams(selector) {
  // updates TinyMCE WYSIWIG editor to include footnote functionality
  params = {
    selector: selector,
    menubar: 'edit view insert format table',
    toolbar: [
      "bold italic underline | alignleft aligncenter alignright | bullist numlist | link formatselect  | code ",
      "addFootnoteButton | deleteFootnotesButton | updateFootnotesButton"
    ],
    setup: function (editor) {
    editor.addButton('addFootnoteButton', {
        text: 'Add Footnote',
        onclick: function () {
          // Add the new footnote link
          var tinymceBody = getTinyMCEDOMObject();
          addFootnoteLinkClassToFootnoteLinks(tinymceBody);
          updateFootnotes();
          var fnNextNum = getFnNextNum(tinymceBody);
          addNewFootnoteLink(editor, fnNextNum);
          var tinymceBody = getTinyMCEDOMObject();
          // Add the new footnote citation
          if(getNumberOfFootnoteDivs(tinymceBody) == 0){
            addFootnoteDiv(tinymceBody);
          }
          addFootnoteCitation(tinymceBody, fnNextNum);
          // Move cursor to bottom of the editor
          tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.getBody(), true);
          tinyMCE.activeEditor.selection.collapse(false);
          updateFootnotes();
        }
      });
    editor.addButton('updateFootnotesButton', {
        text: 'Update Footnotes',
        onclick: function () {
            updateFootnotes();
        }
      });
    editor.addButton('deleteFootnotesButton', {
          text: 'Delete Selected Footnotes',
          onclick: function () {
              updateFootnotes();
              var tinymceBody = getTinyMCEDOMObject();
              node = editor.selection.getNode();
              parent = node.parentNode;
              var selectedHTML = editor.selection.getContent({format : 'html'}).toString();
              if(selectedHTML.length <= 1){
                //if the highlighted text is the single number of the footnote, the outerHTML will let us access the whole node.
                //Note: we can't just use the single number of innerHTML because then any time someone highlights a regular text number,
                //  the footnote with that number will be deleted
                selectedHTML = editor.selection.getNode().outerHTML.toString();
              }
              var idsFootnotesToDelete = getListOfFootnotesToDelete(selectedHTML);
              var fnLinks = getFnLinks(tinymceBody);
              var fnCitations = getFnCitations(tinymceBody);
              for(j = 0; j < idsFootnotesToDelete.length; j++){
                var fnLinkIDs = getFnLinkIDs(fnLinks);
                var indexDel = fnLinkIDs.indexOf(idsFootnotesToDelete[j]);
                fnLinkToDelete = fnLinks.item(indexDel);
                fnLinkParent = fnLinkToDelete.parentNode;
                fnLinkParent.removeChild(fnLinkToDelete);
                if(fnCitations.length == 1){
                  tinymceBody.removeChild(getExistingFootnoteDiv(tinymceBody));
                } else {
                  fnCitToDelete = fnCitations.item(indexDel);
                  fnCitParent = fnCitToDelete.parentNode;
                  fnCitParent.removeChild(fnCitToDelete);
                }
              }
              updateFootnotes();
          }
      });
    },
  }
  return params;
}

function getListOfFootnotesToDelete(selectedHTML){
  var idsFootnotesToDelete = [];
  numFootnoteLinks = selectedHTML.split('<a href=\"#fn:').length-1;
  remainingHTML = selectedHTML;
  for(i = 0; i < numFootnoteLinks; i++){
    var idIndexStart = remainingHTML.indexOf("<a href=\"#fn:") + 13;
    var idIndexEnd = remainingHTML.substring(idIndexStart, ).indexOf("\">") + idIndexStart;
    var id = parseInt(remainingHTML.substring(idIndexStart, idIndexEnd));
    idsFootnotesToDelete.push(id);
    remainingHTML = remainingHTML.substring(idIndexEnd + 2, );
  }
  return idsFootnotesToDelete;
}

function updateFootnotes(){
  var bodies = getAllTinyMCETextBodies();
  for(var i = 0; i < bodies.length; i++){
    var currentBody = bodies[i];
    addFootnoteLinkClassToFootnoteLinks(currentBody);
    var numOfFns = getNumberOfExistingLinks(currentBody);
    if(numOfFns > 0){
        // Check formatting of footnote links to make sure they're OK
        if(getNumberOfFootnoteDivs(currentBody) == 0){
          addFootnoteDiv(currentBody);
        } else if (getNumberOfFootnoteDivs(currentBody) > 1){
          mergeFootnoteDivs(currentBody);
        }
        correctFootnoteLinkFormatting(currentBody);
        var numOfFns = getNumberOfExistingLinks(currentBody);
        correctFootnoteCitationFormatting(currentBody, numOfFns)
        numOfFns = getNumberOfExistingLinks(currentBody);
        correctFootnoteCitationsOrder(currentBody);
        // correctFootnoteLinksOrder(currentBody);
        alertUserOfExtraFootnotes(currentBody, numOfFns);
    }
  }
  updateOLsAcrossAllTextEditorBoxes();
}

function updateOLsAcrossAllTextEditorBoxes(){
  var bodies = getAllTinyMCETextBodies();
  var numPrevFns = 0;
  //For each tinymce-text-body:
  for(var i = 0; i < bodies.length; i++){
    var currentBody = bodies[i];
    // Let orderedList be the ordered list in the tinymce-body
    var orderedList = getOrderedList(currentBody);
    if(orderedList!=null){
      // Update orderedList.start to be (numPrevFns + 1).
      orderedList.start = numPrevFns + 1;
      // for each Links[i] of the body, assign it the ID: (i + numPrevFns)
      var links = getFnLinks(currentBody);
      for(var j = 0; j < links.length; j++){
          updateLinkID(links[j], j+numPrevFns+1);
      }
      // for each citation[i] of the body, assign it the ID: i + numPrevFns
      var citations = getFnCitations(currentBody);
      for(var k = 0; k < citations.length; k++){
          updateCitationID(citations[k], k+numPrevFns+1);
      }
      // Increment numPrevFns by the number of footnote citations in the tinymce-body
      numPrevFns = numPrevFns + getNumberOfExistingCitations(currentBody);
    }
  }
}

function getAllTinyMCETextBodies(){
  var iFrames = document.getElementsByTagName("iframe");
  var textBodies = [];
  var j = 0;
  for(var i = 0; i< iFrames.length; i++){
    if(iFrames[i].id.indexOf("text_ifr") != -1){
        var innerDoc = iFrames[i].contentDocument || iFrames[i].contentWindow.document;
        textBodies[j] = innerDoc.getElementsByClassName("mce-content-body").item(0);
        j++;
    }
  }
  return textBodies;
}

function getTinyMCEDOMObject(){
  var currentNode = tinymce.activeEditor.selection.getNode();
  while(!(currentNode.className.trim() === "mce-content-body")){
    currentNode = currentNode.parentNode;
  }
  return currentNode;
}

function getOrderedList(tinymceBody){
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  if(footnoteDiv==null){
    return null;
  }
  var orderedList = footnoteDiv.getElementsByTagName('ol').item(0);
  return orderedList;
}

function addFootnoteLinkClassToFootnoteLinks(tinymceBody){
    var i = 0;
    var supElements = tinymceBody.getElementsByTagName("sup");
    for(i = 0; i < supElements.length; i++){
      var sup = supElements[i];
      if(sup.id.includes('fnref')){
        sup.className = "footnote link";
      }
    }
}

function getNumberOfExistingLinks(tinymceBody){
  return tinymceBody.getElementsByClassName("footnote link").length;
}

function getNumberOfExistingCitations(tinymceBody){
  // return tinymceBody.getElementsByClassName("footnote").length;
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  if(footnoteDiv==null){
    return null;
  }
  var fnCitations = footnoteDiv.getElementsByTagName("li");
  return fnCitations.length;
}

function getFnNextNum(tinymceBody){
  var allTinymceBodies = getAllTinyMCETextBodies();
  tinymceBodyIndex = allTinymceBodies.indexOf(tinymceBody);
  var numOfPreviousCits = 0;
  for(var i = 0; i <= tinymceBodyIndex; i++){
    numOfPreviousCits = numOfPreviousCits + getNumberOfExistingCitations(allTinymceBodies[i]);
  }
  var fnNextNum = numOfPreviousCits + 1;
  return fnNextNum;
}

function getFnLinks(tinymceBody){
  return tinymceBody.getElementsByClassName("footnote link");
}

function getFnCitations(tinymceBody){
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  if(footnoteDiv==null){
    return null;
  }
  var fnCitations = footnoteDiv.getElementsByTagName("li");
  return fnCitations;
}

function getLinkHTML(fnNextNum){
  var str1 = '<sup class="footnote link" id="fnref:';
  var str2 = fnNextNum.toString();
  var str3 = '"><a href="#fn:';
  var str4 = fnNextNum.toString();
  var str5 = '">';
  var str6 = fnNextNum.toString();
  var str7 = '</a></sup> ';
  var linkHTML = str1.concat(str2).concat(str3).concat(str4).concat(str5).concat(str6).concat(str7);
  return linkHTML;
}

function getExistingFootnoteDiv(tinymceBody){
  return tinymceBody.getElementsByClassName('footnotes').item(0);
}

function getNewListElement(fnNextNum){
  var list = document.createElement("li");
  var id = 'fn:';
  id = id.concat(fnNextNum.toString());
  list.classList.add("footnote");
  list.setAttribute("id", id);
  return list;
}

function getNewLinkElement(fnNextNum){
  var link = document.createElement("a");
  var href = '#fnref:';
  href = href.concat(fnNextNum.toString())
  link.setAttribute("href", href);
  link.setAttribute("title", "return to article");
  var arrow_text = document.createTextNode("↩");
  link.appendChild(arrow_text);
  return link
}

function getNewParagraphElement(){
  var paragraph = document.createElement("p");
  var ptext = document.createTextNode("footnote citation here");
  paragraph.appendChild(ptext);
  return paragraph;
}

function getNewFootnoteListItem(fnNextNum){
  var list = getNewListElement(fnNextNum);
  var link = getNewLinkElement(fnNextNum);
  var paragraph = getNewParagraphElement();
  paragraph.appendChild(link);
  list.appendChild(paragraph);
  return list;
}

function getNewFootnoteDivElement(){
  var footnoteDiv = document.createElement("div");
  footnoteDiv.classList.add("footnotes");
  var orderedList = document.createElement("ol");
  footnoteDiv.appendChild(orderedList);
  return footnoteDiv;
}

function getNumberOfFootnoteDivs(tinymceBody){
  return tinymceBody.getElementsByClassName("footnotes").length;
}

// Merge all the footnote divs by the ordered list of each footnote into the last footnote.
// Then delete all but the last footnote div, which are now empty.
function mergeFootnoteDivs(tinymceBody){
  var foonoteDivs = tinymceBody.getElementsByClassName("footnotes");
  var i;
    var indexOfLastFnDiv = foonoteDivs.length - 1;
    for(i = 0; i < indexOfLastFnDiv; i++){
      moveOlsFromOneFnDivToAnotherStackingUpwards(foonoteDivs.item(indexOfLastFnDiv), foonoteDivs.item(i));
    }
    deleteAllButOneFootnoteDiv(tinymceBody, foonoteDivs);
}

function moveOlsFromOneFnDivToAnotherStackingUpwards(listReceiver, listGiver){
  var child = listGiver.lastChild;
  var nextChild;
  while (child) {
    nextChild = child.previousSibling;
    listReceiver.insertBefore(child, listReceiver.firstChild);
    child = nextChild;
  }
}

function deleteAllButOneFootnoteDiv(tinymceBody, foonoteDivs){
  var i;
  while(foonoteDivs.length > 1){
    var childFnDivToRemove = foonoteDivs.item(0);
    tinymceBody.removeChild(childFnDivToRemove);
  }
}

function addNewFootnoteLink(editor, fnNextNum){
  var linkHTML = getLinkHTML(fnNextNum);
  editor.insertContent(linkHTML);
}

function addFootnoteCitation(tinymceBody, fnNextNum){
  var newCitation = getNewFootnoteListItem(fnNextNum);
  var orderedList = getOrderedList(tinymceBody);
  if(fnNextNum == 1){
    orderedList.appendChild(newCitation);
  } else {
    //put the new footnote in the proper place
    var fnCitations = orderedList.childNodes;
    nextSibling = fnCitations.item(fnNextNum - 1);
    orderedList.insertBefore(newCitation, nextSibling)
    //update unlinked citations whose ID is larger than fnNextNum (the largest footnote link ID.
    //Since it is the largest there are no links connected to any of these citations).
    for(var i = fnNextNum; i < fnCitations.length; i++){
        var citBelowNewCit = fnCitations.item(i);
        id = getFnCitationID(citBelowNewCit);
        if (id >= fnNextNum){
          updateCitationID(citBelowNewCit, id+1)
        }
    }
  }
}

function addFootnoteDiv(tinymceBody){
  var footnoteDiv = getNewFootnoteDivElement();
  tinymceBody.appendChild(footnoteDiv);
}

function getCurrentLinkIDs(tinymceBody){
  var fnLinks = getFnLinks(tinymceBody);
  var assignedNums = [];
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    assignedNums.push(fnLink.id.substring(6, ));
  }
  return assignedNums;
}

// function correctFootnoteLinksOrder(tinymceBody){
//   var fnLinks = getFnLinks(tinymceBody);
//   var i = 1;
//   for (i = 1; i < fnLinks.length + 1; i++) {
//     var fnLink = fnLinks.item(i - 1);
//     var correctNum = i.toString();
//     fnLink.id = fnLink.id.substring(0, 6).concat(correctNum);
//     var hrefLink = fnLink.getElementsByTagName("a").item(0);
//     hrefLink.setAttribute("href", hrefLink.getAttribute("href").substring(0, 4).concat(correctNum));
//     hrefLink.textContent = correctNum;
//   }
// }

function correctFootnoteCitationsOrder(tinymceBody){
  var currentLinkIDs = getCurrentLinkIDs(tinymceBody);
  newSortFootnoteCitationsBasedOnLinkIDs(tinymceBody, currentLinkIDs);
  assignLinkIDsInIncreasingOrder(tinymceBody);
  assignFootnoteIDsInIncreasingOrder(tinymceBody);
}

function newSortFootnoteCitationsBasedOnLinkIDs(tinymceBody, linkIDs){
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  var fnCitations = getFnCitations(tinymceBody);
  var originalOL = getOrderedList(tinymceBody);
  var citationIDs = getFnCitationIDs(fnCitations);
  var fnCitationIDMap = getCitationIDMap(fnCitations, citationIDs);
  var newOL = originalOL.cloneNode(false); //an empty clone; has no children
  for(var i = 0; i < linkIDs.length; i++){
    linkID = linkIDs[i];
    //If (ID in CitationIDs), NewFootnoteList.append(CitationsByID[ID])
    if(linkIDInCitationIDs(citationIDs, linkID)){
      fnCitClone = cloneCitationByID(fnCitationIDMap, linkID);
      newOL.appendChild(fnCitClone);
    }
    //Else, NewFootnoteList.append(empty_citation)
    else {
      var newCitation = getNewFootnoteListItem(linkID);
      newOL.appendChild(newCitation);
    }
  }
  //For each citID in CitationIDs not in LinkIDs, NewFootnoteList.append(citations[citID])
  for(var i = 0; i < citationIDs.length; i++){
    citID = citationIDs[i];
    if(citIDinLinkIDs(linkIDs, citID) == false){
      fnCitClone = cloneCitationByID(fnCitationIDMap, citID);
      newOL.appendChild(fnCitClone);
    }
  }
  footnoteDiv.removeChild(originalOL);
  footnoteDiv.appendChild(newOL);
}

function linkIDInCitationIDs(citationIDs, linkID){
  if(citationIDs.indexOf(linkID) == -1){
    return false;
  } else {
    return true;
  }
}

function citIDinLinkIDs(linkIDs, citID){
  if(linkIDs.indexOf(citID) == -1){
    return false;
  } else {
    return true;
  }
}

function cloneCitationByID(fnCitationIDMap, id){
  var cloneCitation = fnCitationIDMap[id].cloneNode(true);
  return cloneCitation;
}

function getCitationIDMap(fnCitations){
  var citationIDMap = {};
  for(i = 0; i < fnCitations.length; i++){
    cit = fnCitations[i];
    id = cit.id.substring(3, );
    citationIDMap[id] = cit;
  }
  return citationIDMap;
}

function sortLinkIDS(currentLinkIDs){
  sortedLinkIDs = []
  for(x = 0; x < currentLinkIDs.length; x++){
    sortedLinkIDs.push(currentLinkIDs[x]);
  }
  sortedLinkIDs = sortedLinkIDs.sort();
  return sortedLinkIDs;
}

function getFnCitationIDs(fnCitations){
  var fnCitationsIDs = [];
  for (i = 0; i < fnCitations.length; i++) {
    var fnCitation = fnCitations.item(i);
    fnCitationsIDs.push(fnCitation.id.substring(3, ));
  }
  return fnCitationsIDs;
}

function updateLinkID(fnLink, newID){
  fnLink.id = "fnref:".concat(newID);
  var hrefLink = fnLink.getElementsByTagName("a").item(0);
  hrefLink.setAttribute("href", "#fn:".concat(newID));
  hrefLink.setAttribute("data-mce-href", "#fn:".concat(newID));
  hrefLink.textContent = newID.toString();
}

function updateCitationID(fnCitation, newID){
  newID = newID.toString();
  fnCitation.id = "fn:".concat(newID);
  var linkNodes = fnCitation.getElementsByTagName("a");
  for(var i = 0; i < linkNodes.length; i++){
    var linkChild = linkNodes[i];
    if(linkChild.getAttribute("href").includes("#fnref:")){
      linkChild.setAttribute("href", "#fnref:".concat(newID));
      linkChild.setAttribute("data-mce-href", "#fnref:".concat(newID));
    }
  }
}

function getFnCitationID(fnCitation){
  return parseInt(fnCitation.id.substring(3, ));
}

function getFnLinkID(fnLink){
  return parseInt(fnLink.id.substring(6, ));
}

function getFnLinkIDs(fnLinks){
  var linkIDs = [];
  for(var i = 0; i<fnLinks.length; i++){
    linkIDs[i] = getFnLinkID(fnLinks[i])
  }
  return linkIDs;
}

function assignLinkIDsInIncreasingOrder(tinymceBody){
  fnLinks = getFnLinks(tinymceBody);
  var i;
  for (i = 1; i <= fnLinks.length; i++) {
      var fnLink = fnLinks.item(i-1);
      updateLinkID(fnLink, i);
  }
}

function assignFootnoteIDsInIncreasingOrder(tinymceBody){
  var fnCitations = getFnCitations(tinymceBody);
  for (i = 1; i <= fnCitations.length; i++) {
      var fnCitation = fnCitations.item(i-1);
      updateCitationID(fnCitation, i);
  }
}

function correctFootnoteLinkFormatting(tinymceBody){
  var fnLinks = getFnLinks(tinymceBody);
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    // If the fnLink is just superscript text
    if(isNoLongerALink(fnLink)){
      removeBadLink(fnLink);
      var fnLinks = getFnLinks(tinymceBody);
      i = 1;
    }
  }
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    if(hasChildFootnoteLink(fnLink)){
      moveChildLinksOutOfParents(tinymceBody, fnLink, fnLinks, i);
      var fnLinks = getFnLinks(tinymceBody);
      i = 1;
    }
  }
}

function isNoLongerALink(fnLink){
  var hrefLinks = fnLink.getElementsByTagName("a");
  if(hrefLinks.length > 0){
    return false;
  }
  return true;
}

function removeBadLink(fnLink){
  fnLink.textContent = "";
  fnLink.parentNode.removeChild(fnLink);
}

function hasChildFootnoteLink(fnLink){
  var childFootnoteLinks = fnLink.getElementsByClassName("footnote link");
  if(childFootnoteLinks.length > 0){
    return true;
  }
  return false;
}

function getNextLink(fnLinks, i){
  if(i < fnLinks.length + 1){
    return fnLinks.item(i + 1);
  }
  return null;
}

function moveChildLinksOutOfParents(tinymceBody, fnLink, fnLinks, linkIndex){
  var childFootnoteLinks = fnLink.getElementsByClassName("footnote link");
  var nextLink = getNextLink(fnLinks, linkIndex);
  var parentNode = fnLink.parentNode;
  var textnode = document.createTextNode(childFootnoteLinks.length.toString());
  var k;
  for(k = 0; k < childFootnoteLinks.length + 1; k++){
    var childLink = childFootnoteLinks.item(k);
    var period = childLink.nextSibling;
    parentNode.insertBefore(childLink, fnLink);
    parentNode.insertBefore(period, fnLink);
  }
}

function correctFootnoteCitationFormatting(tinymceBody, numOfFns){
  replaceInnerFootnoteDivIfLost(tinymceBody);
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  fixMultipleOlIfNeeded(footnoteDiv);
  var fnCitations = getFnCitations(tinymceBody);
  var i;
  for (i = 0; i < fnCitations.length; i++) {
    var fnCitation = fnCitations.item(i);
    var linkNodes = fnCitation.getElementsByTagName("a");
    ensureParagraphElementInCitation(fnCitation);

    // If multiple links are on the same line, we eliminate the extras
    var k;
    var paragraphChild = fnCitation.childNodes.item(0);
    var citID = getFnCitationID(fnCitation);
    var citationLinkNodes = [];
    //for each citation look at the link nodes.
    // We make sure that there is exactly one #fnref link node by deleting all of them and readding them
    // This allows there to be other links that will not get deleted as we make these checks
    if(linkNodes.length > 0){
      for(k = linkNodes.length - 1; k >= 0; k = k - 1){
        var linkChild = linkNodes.item(k);
        if(linkChild.getAttribute("href").includes("#fnref:")){
          //take the non arrow textContent of the link and save it as a textnode
          var innerLinkText = linkChild.textContent;
          innerLinkText = innerLinkText.replace('↩','');
          var linkChildTextNode = document.createTextNode(innerLinkText);
          paragraphChild.insertBefore(linkChildTextNode, linkChild);
          paragraphChild.removeChild(linkChild);
        }
      }
    }
    // make sure that the footnote is not just ↩.
    // Otherwise, when typing, people will be writing within the link
    var citationText = paragraphChild.textContent;
    //remove invisible string
    citationText = citationText.replace(String.fromCharCode(65279), "");
    //&#65279 is the Unicode Character 'ZERO WIDTH NO-BREAK SPACE'
    if(citationText == "" || citationText.length == 0){
      paragraphChild.textContent = "footnote citation here";
    }
    var newLinkNode = getNewLinkElement(i + 1);
    var fnCitationParagraph = fnCitation.getElementsByTagName("p").item(0);
    fnCitationParagraph.appendChild(newLinkNode);
    // If there is a link, check its text content
  }
  createCitationsToMatchNumOfLinks(fnCitations, footnoteDiv, numOfFns);
}

function replaceInnerFootnoteDivIfLost(tinymceBody){
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  if(footnoteDiv.childElementCount == 0){
    tinymceBody.replaceChild(getNewFootnoteDivElement(), footnoteDiv);
  }
}

function fixMultipleOlIfNeeded(footnoteDiv){
  var orderedLists = footnoteDiv.getElementsByTagName("ol");
  if(orderedLists.length == 0){
    var orderedList = document.createElement("ol");
    footnoteDiv.appendChild(orderedList);
  } else if(orderedLists.length > 1){
    moveListItemsToTheLastOrderedList(orderedLists);
    deleteAllButOneOrderedList(footnoteDiv, orderedLists);
  }
}

function moveListItemsToTheLastOrderedList(orderedLists){
  var i;
  var indexOfLastOl = orderedLists.length - 1;
  for(i = 0; i < indexOfLastOl; i++){
    moveListItemsFromOneListToAnotherStackingUpwards(orderedLists.item(indexOfLastOl), orderedLists.item(i));
  }
}

function moveListItemsFromOneListToAnotherStackingUpwards(listReceiver, listGiver){
  var child = listGiver.lastChild;
  var nextChild;
  while (child) {
    nextChild = child.previousSibling;
    listReceiver.insertBefore(child, listReceiver.firstChild);
    child = nextChild;
  }
}

function deleteAllButOneOrderedList(footnoteDiv, orderedLists){
  var i;
  while(orderedLists.length > 1){
    var childOlToRemove = orderedLists.item(0);
    footnoteDiv.removeChild(childOlToRemove);
  }
}

function ensureParagraphElementInCitation(fnCitation){
  // If the paragraph element was deleted, we add a new one
  var paragraphElements = fnCitation.getElementsByTagName("p");
  if(paragraphElements.length > 1){
    var mergedText = "";
    for(p = 0; p < paragraphElements.length; p++){
      var currParagraph = paragraphElements.item(p);
      mergedText = mergedText.concat(currParagraph.textContent);
    }
    for(p = paragraphElements.length; p > 0; p--){
      var currParagraph = paragraphElements.item(p);
      fnCitation.removeChild(currParagraph);
    }
    paragraphElements.item(0).textContent = mergedText;
  }
  else {
    var paragraph = paragraphElements.item(0);
    if(paragraph == null){
      addNewParagraphElementToFootnoteCitation(fnCitation);
    }
    // If there is no text and no link, we add both
    else if (paragraph.textContent == ""){
      paragraph.textContent = "footnote citation here";
      removeBreaksWithinCitation(fnCitation);
    }
  }
}

function addNewParagraphElementToFootnoteCitation(fnCitation){
  var newParagraph = getNewParagraphElement();
  if(fnCitation.textContent != ""){
    moveTextContentToNewParagraph(fnCitation, newParagraph);
    moveLinkWithinParagraphIfExists(fnCitation, newParagraph);
  }
  fnCitation.appendChild(newParagraph);
  removeBreaksWithinCitation(fnCitation);
}

function moveTextContentToNewParagraph(fnCitation, newParagraph){
  var citationText = fnCitation.textContent.toString();
  citationText = citationText.replace("↩", "");
  newParagraph.textContent = citationText;
  deleteTextNodeContentOfCitation(fnCitation);
}

function deleteTextNodeContentOfCitation(fnCitation){
  var child = fnCitation.firstChild;
  var nextChild;
  while (child) {
    nextChild = child.nextSibling;
    if (child.nodeType == 3) {
      fnCitation.removeChild(child);
    }
    child = nextChild;
  }
}

function moveLinkWithinParagraphIfExists(fnCitation, newParagraph){
  var link = fnCitation.getElementsByTagName("a").item(0);
  if(link != null){
    newParagraph.appendChild(link);
  }
}

function removeBreaksWithinCitation(fnCitation){
  var breaks = fnCitation.getElementsByTagName("br");
  var i;
  for(i = breaks.length - 1; i >= 0; i--){
    fnCitation.removeChild(breaks.item(i));
  }
}

function createCitationsToMatchNumOfLinks(fnCitations, footnoteDiv, numOfFns){
  // if there more links than footnotes create new ones
  if (numOfFns > fnCitations.length){
    var n;
    for(n = fnCitations.length + 1; n <= numOfFns; n++){
      var newCitation = getNewFootnoteListItem(n);
      var fnNewCitationParagraph = newCitation.getElementsByTagName("p").item(0);
      var footnoteList = footnoteDiv.getElementsByTagName("ol").item(0);
      footnoteList.appendChild(newCitation);
    }
  }
}

function alertUserOfExtraFootnotes(tinymceBody, numOfFns){
  var fnCitations = getFnCitations(tinymceBody);
  var i;
  for (i = 0; i < fnCitations.length; i++) {
    var fnCitation = fnCitations.item(i);
    var n;
    for(n = 0; n < fnCitation.childNodes.length; n++){
      var fnCitationChild = fnCitation.childNodes[n];
      //If the node is an element node, the nodeType property will return 1.
      if(fnCitationChild.nodeType == 1){
        if(i + 1 > numOfFns){
          // change color to red
          fnCitationChild.style.color = "#ff0000";
        } else {
          // change color to black
          fnCitationChild.style.color = "#000000";
        }
      }
    }
  }
}
