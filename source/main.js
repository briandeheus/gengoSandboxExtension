/**
 * Setting some global variables to be used throughout the script.
**/

var modal   = null;
var jobs	= [];
var URL		= "http://sandbox.gengo.com";
var ACTIONS	= {
	
	"setReviewable" : "s_set_reviewable",
	"setPending"	: "s_set_pending",
	"sendJob"		: "s_cb_send_job",
};

var TEXT	= {
	
	"checkedText" 	: "selected for bulk action",
	"uncheckedText"	: "select for bulk action"

};

/**
 * 
 * Draws and appends a modal window to the document body, 
 * that is used to display the progress when a job is being executed.
 *
**/

function drawModalWindow() {
	
	var modal 		= document.createElement("div");
	modal.className = "powerModal";
	
	var wrapper			= document.createElement("loader");
	wrapper.className 	= "loader";
	
	var loadingAnim			= document.createElement("div");
	loadingAnim.className	= "loadingAnimation";
	
	var loadingText			= document.createElement("div");
	loadingText.className	= "loadingText";
	loadingText.appendChild(document.createTextNode("Executing Bulk Action"));
	
	wrapper.appendChild(loadingAnim);
	wrapper.appendChild(loadingText);
	
	modal.appendChild(wrapper);
	document.body.appendChild(modal);
	
	return {
	
		modal	: modal,
		text	: loadingText
		
	};

}

/**
 *
 * Draws an additional menu and append it to the right column of the sandbox where other
 * menu items are located as well.
 *
**/

function drawBulkActions() {

	var actionCol 		= document.getElementById("right-col");
	var wrapper			= document.createElement("div");
	wrapper.className	= "blue-box black-box bulkActionOptions";
	
	var title     		= document.createElement("H2");
	title.appendChild(document.createTextNode("Bulk Actions:"));
	
	var setReviewable			= document.createElement("a");
	setReviewable.className 	= "button_medium orange";
	setReviewable.appendChild(document.createTextNode("Set As Reviewed"));
	
	var setPending		    = document.createElement("a");
	setPending.className 	= "button_medium orange";
	setPending.appendChild(document.createTextNode("Set As Pending"));
	
	var sendJobs		= document.createElement("a");
	sendJobs.className 	= "button_medium orange";
	sendJobs.appendChild(document.createTextNode("Send Jobs"));
	
	setReviewable.onclick = function() {
		
		executeAction("setReviewable");
	
	}
	
	setPending.onclick = function () {
	
		executeAction("setPending");
	
	}
	
	sendJobs.onclick = function () {
	
		executeAction("sendJob");
		
	}
	
	wrapper.appendChild(title);
	wrapper.appendChild(setReviewable);
	wrapper.appendChild(setPending);
	wrapper.appendChild(sendJobs);
	
	actionCol.appendChild(wrapper);
	
}

/**
 *
 * Draws checkboxes and appends these to job items.
 * These checkboxes are used to select, and deselect jobs.
 *
**/

function drawCheckboxes() {

	//First get all the children of the job list.
	var jobElements = $(".job_list").children()

	for(var i = 0, l = jobElements.length; i < l; i++) {
		
		var wrapper			= document.createDocumentFragment();
		var jobElm			= jobElements[i];
		
		//Get the ID of the job.
		var id				= ($(jobElm).find(".meta-info a")[0].href).split("/");
		//And now actually get the ID of the job.
		var id				= id[id.length - 1];
		var checkboxId		= "checkbox_" + id;
		
		var label			= document.createElement("label");
		label.className 	= "powerCheckbox";
		label.appendChild(document.createTextNode(TEXT.uncheckedText));
		label.setAttribute("for", checkboxId);

		
		var checkbox 		= document.createElement("input");
		checkbox.type		= "checkbox";
		checkbox.id			= checkboxId;
		
		//Since creating functions in a loop is a bad habbit, pass it on to function instead.
		setCheckboxAction(checkbox, label, id);
		
		wrapper.appendChild(checkbox);
		wrapper.appendChild(label);
		
		jobElm.appendChild(wrapper);

	}
	
}

/**
 *
 * Function that determines the action when a checkbox is checked or unchecked
 *
**/

function setCheckboxAction(checkbox, label, id) {
	
	checkbox.onclick 	= function() {
		
		if(checkbox.checked) {
			
			label.textContent = "";
			label.appendChild(document.createTextNode(TEXT.checkedText));
			
			//Casting integer to string because of the way JS handles (handled?) integers in an array.
			jobs.push(id.toString());
			
		} else {
		
			label.textContent = "";
			label.appendChild(document.createTextNode(TEXT.uncheckedText));
			var index = jobs.indexOf(id.toString);
			jobs.pop(index);
			
		}
		
	}
		

}

/**
 *
 * Executes actions based on the current amount of jobs in the jobs array.
 *
**/

function executeAction(action) {
	

	var currentJob				= 1;
	modal.modal.style.display 	= "block";
	
	//Perform each action synchronous to prevent the sandbox from freaking out about too many jobs.
	async.eachSeries(jobs, function(jobId, callback) {
		
		//Create a pretty url.
		var url 				= URL + "/" + ACTIONS[action] + "/" + jobId + "/";
		modal.text.textContent 	= "";
		modal.text.appendChild(document.createTextNode("Executing job " + currentJob + " out of " + jobs.length));
		
		$.post(url, function() {
			
			currentJob++;
			//Timeout of 500ms to offload any pressure on the Sandbox environment.
			setTimeout(callback, 500);
			
		});
		
	}, function () {
	
		//Now that we're done, reload the window to update all the jobs.
		window.location.reload();
		
	});

}

/**
 *
 * Take a guess what this does
 *
**/
$(document).ready(function(){

	drawCheckboxes();
	drawBulkActions();
	
	//Store modal in a variable outside of the scope of the function.
	//Modal is being shown/hidden by a different function/
	modal = drawModalWindow();
	
});