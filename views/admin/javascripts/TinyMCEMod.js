jQuery(document).ready(function() {
    // This block adds custom styles to the text edit form on exhibit pages.
    // Add classes to this menu and put the style declarations in style.css
    // -AM 2/10/17
    Omeka.wysiwyg(params);
});

jQuery(window).load(function() {
    Omeka.wysiwyg(params);
});

params = {
  toolbar: [
    "bold italic underline | alignleft aligncenter alignright | bullist numlist | link formatselect | styleselect | code ",
    "addFootnoteButton | deleteFootnotesButton | updateFootnotesButton | addTranscriptionLinkButton"
],
  style_formats: [{
      title: 'Highlight1 - gray w/bar',
      block: 'p',
      classes: 'medium-block-1'
    }, {
      title: 'Highlight2 - white w/bar',
      block: 'p',
      classes: 'medium-block-3'
    }, {
      title: 'Quote1 - double gray',
      block: 'p',
      classes: 'medium-block-2'
    }, {
      title: 'Quote2 - single green',
      block: 'p',
      classes: 'medium-block-4'
    }, {
      title: 'Pull quote',
      block: 'p',
      classes: 'pull-quote'
    }, {
      title: 'Transcription',
      block: 'div',
      classes: 'transcription'
    // }, {
    //   title: 'Transcription link',
    //   selector: 'a',
    //   classes: 'show-transcription'
    }],
  setup: function (editor) {
  editor.addButton('addFootnoteButton', {
      text: 'Add Footnote',
      onclick: function () {
        // Add the new footnote link
        var tinymceBody = getTinyMCEDOMObject();
        addFootnoteLinkClassToFootnoteLinks(tinymceBody);
        updateFootnotes();
        var fnNextNum = getNumberOfExistingFootnotes(tinymceBody) + 1;
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
            var idsFootnotesToDelete = getListOfFootnotesToDelete(selectedHTML);
            var fnLinks = tinymceBody.getElementsByClassName("footnote link");
            var fnCitations = getExistingFootnoteDiv(tinymceBody).getElementsByClassName('footnote');
            var listShift = 0; //need this since we're deleting from a list and thus indices will shift
            for(j = 0; j < idsFootnotesToDelete.length; j++){
              var indexDel = idsFootnotesToDelete[j] - 1;
              fnLinkToDelete = fnLinks.item(indexDel - listShift);
              fnLinkParent = fnLinkToDelete.parentNode;
              fnLinkParent.removeChild(fnLinkToDelete);
              if(fnCitations.length == 1){
                tinymceBody.removeChild(getExistingFootnoteDiv(tinymceBody));
              } else {
                fnCitToDelete = fnCitations.item(indexDel - listShift);
                fnCitParent = fnCitToDelete.parentNode;
                fnCitParent.removeChild(fnCitToDelete);
              }
              listShift = listShift + 1;
            }
            updateFootnotes();
      }
    });
  editor.addButton('addTranscriptionLinkButton', {
        text: 'Add Transcription Link',
        onclick: function () {
            var tinymceBody = getTinyMCEDOMObject();
            editor.insertContent("<p><a class='show-transcription' href='#'>Show Transcription</a></p>");
      }
    });
  },
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
  var tinymceBody = getTinyMCEDOMObject();
  if(!(tinymceBody.getAttribute("data-id").toString().includes("block"))){
    alert("Click inside the box you are editing before using buttons.");
  }
  addFootnoteLinkClassToFootnoteLinks(tinymceBody);
  var numOfFns = getNumberOfExistingFootnotes(tinymceBody);
  if(numOfFns > 0){
      // Check formatting of footnote links to make sure they're OK
      if(getNumberOfFootnoteDivs(tinymceBody) == 0){
        addFootnoteDiv(tinymceBody);
      } else if (getNumberOfFootnoteDivs(tinymceBody) > 1){
        mergeFootnoteDivs(tinymceBody);
      }
      var currentLinkIDs = getCurrentLinkIDs(tinymceBody);
      correctFootnoteLinkFormatting(tinymceBody);
      var numOfFns = getNumberOfExistingFootnotes(tinymceBody);
      correctFootnoteCitationFormatting(tinymceBody, numOfFns)
      numOfFns = getNumberOfExistingFootnotes(tinymceBody);
      correctFootnoteCitationsOrder(tinymceBody, currentLinkIDs);
      correctFootnoteLinksOrder(tinymceBody);
      alertUserOfExtraFootnotes(tinymceBody, numOfFns);
  }
}

function getTinyMCEDOMObject(){
  var currentNode = tinymce.activeEditor.selection.getNode();
  while(!(currentNode.className.trim() === "mce-content-body")){
    currentNode = currentNode.parentNode;
  }
  return currentNode;
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

function getNumberOfExistingFootnotes(tinymceBody){
  return tinymceBody.getElementsByClassName("footnote link").length;
}

function getNumberOfExistingCitations(tinymceBody){
  return tinymceBody.getElementsByClassName("footnote").length;
}

function getLinkHTML(fnNextNum){
  var str1 = '<sup class="footnote link" id="fnref:';
  var str2 = fnNextNum.toString();
  var str3 = '"> <a href="#fn:';
  var str4 = fnNextNum.toString();
  var str5 = '">';
  var str6 = fnNextNum.toString();
  var str7 = '</a>  </sup>.';
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
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  var orderedList = footnoteDiv.getElementsByTagName('ol').item(0);
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
        id = parseInt(citBelowNewCit.id.substring(3, ));
        if (id >= fnNextNum){
          updateFootnoteCitationID(citBelowNewCit, id+1)
        }
    }
  }
}

function updateFootnoteCitationID(fnCitation, newID){
  newID = newID.toString();
  fnCitation.id = "fn:".concat(newID);
  var hrefLink = fnCitation.getElementsByTagName("a").item(0);
  hrefLink.setAttribute("href", "#fnref:".concat(newID));
  hrefLink.setAttribute("data-mce-href", "#fnref:".concat(newID));
}


function addFootnoteDiv(tinymceBody){
  var footnoteDiv = getNewFootnoteDivElement();
  tinymceBody.appendChild(footnoteDiv);
}

function getCurrentLinkIDs(tinymceBody){
  var fnLinks = tinymceBody.getElementsByClassName("footnote link");
  var assignedNums = [];
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    assignedNums.push(fnLink.id.substring(6, ));
  }
  return assignedNums;
}

function correctFootnoteLinksOrder(tinymceBody){
  var fnLinks = tinymceBody.getElementsByClassName("footnote link");
  var i = 1;
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    var correctNum = i.toString();
    fnLink.id = fnLink.id.substring(0, 6).concat(correctNum);
    var hrefLink = fnLink.getElementsByTagName("a").item(0);
    hrefLink.setAttribute("href", hrefLink.getAttribute("href").substring(0, 4).concat(correctNum));
    hrefLink.textContent = correctNum;
  }
}

function correctFootnoteCitationsOrder(tinymceBody, currentLinkIDs){
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  var i = 1;
  var fnCitations = footnoteDiv.getElementsByTagName("li");
  var citationIDs = getFnCitationIDs(fnCitations);
  newSortFootnoteCitationsBasedOnIDs(footnoteDiv, fnCitations, currentLinkIDs, citationIDs);
  assignLinkIDsInIncreasingOrder(tinymceBody);
  assignFootnoteIDsInIncreasingOrder(fnCitations);
}

function newSortFootnoteCitationsBasedOnIDs(footnoteDiv, fnCitations, linkIDs, citationIDs){
  var fnCitationIDMap = getCitationIDMap(fnCitations, citationIDs);
  var originalOL = footnoteDiv.getElementsByTagName('ol').item(0);
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

function assignLinkIDsInIncreasingOrder(tinymceBody){
  fnLinks = tinymceBody.getElementsByClassName("footnote link");
  var i;
  for (i = 1; i <= fnLinks.length; i++) {
      var fnLink = fnLinks.item(i-1);
      fnLink.id = "fnref:".concat(i);
      var hrefLink = fnLink.getElementsByTagName("a").item(0);
      hrefLink.setAttribute("href", "#fn:".concat(i));
      hrefLink.setAttribute("data-mce-href", "#fn:".concat(i));
  }
}

function assignFootnoteIDsInIncreasingOrder(fnCitations){
  for (i = 1; i <= fnCitations.length; i++) {
      var fnCitation = fnCitations.item(i-1);
      updateFootnoteCitationID(fnCitation, i);
  }
}

function correctFootnoteLinkFormatting(tinymceBody){
  var fnLinks = tinymceBody.getElementsByClassName("footnote link");
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    // If the fnLink is just superscript text
    if(isNoLongerALink(fnLink)){
      removeBadLink(fnLink);
      var fnLinks = tinymceBody.getElementsByClassName("footnote link");
      i = 1;
    }
  }
  for (i = 1; i < fnLinks.length + 1; i++) {
    var fnLink = fnLinks.item(i - 1);
    if(hasChildFootnoteLink(fnLink)){
      moveChildLinksOutOfParents(tinymceBody, fnLink, fnLinks, i);
      var fnLinks = tinymceBody.getElementsByClassName("footnote link");
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
  var fnCitations = footnoteDiv.getElementsByTagName("li");
  var i;
  for (i = 0; i < fnCitations.length; i++) {
    var fnCitation = fnCitations.item(i);
    var linkNodes = fnCitation.getElementsByTagName("a");
    ensureParagraphElementInCitation(fnCitation);
    // If multiple links are on the same line, we eliminate the extras
    if(linkNodes.length > 1){
      var k;
      var paragraphChild = fnCitation.childNodes.item(0);
      var highestIndexLim = linkNodes.length;
      for(k = 1; k < highestIndexLim; k++){
        var extraChild = linkNodes.item(k);
        if(!(extraChild.getAttribute("href").includes("#fn:"))){
          paragraphChild.removeChild(extraChild);
        }
      }
    // If there are no links, we create a new one
    } else if(linkNodes.length == 0) {
      var newLinkNode = getNewLinkElement(i + 1);
      var fnCitationParagraph = fnCitation.getElementsByTagName("p").item(0);
      fnCitationParagraph.appendChild(newLinkNode);
    // If there is a link, check its text content
    } else {
      var linkNode = linkNodes.item(0);
      linkNode.textContent = "↩";
    }
  }
  createCitationsToMatchNumOfLinks(fnCitations, footnoteDiv, numOfFns)
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
  var footnoteDiv = getExistingFootnoteDiv(tinymceBody);
  var fnCitations = footnoteDiv.getElementsByTagName("li");
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
