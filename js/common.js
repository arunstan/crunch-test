
var expensesTypeList = [
						{'type':'Telephone', 'value':'Standard'},
						{'type':'Public Transport & Taxis', 'value':'Zero'},
						{'type':'Computer Consumables', 'value':'Standard'},
						{'type':'Subsistence', 'value':'Standard'},
						{'type':'Overseas Travel', 'value':'Zero'}	
					   ]; 

var vatRates = {'Standard':20,'Zero':0}; 

$(document).ready(function() {
	console.log('here');
	if(!doesSupportDateInput())
		$('#exp-date').datepicker({'dateFormat':'dd/mm/yy'});

	var newLineItem = buildLineItemElements(true);
	$('ul#line-items').append(newLineItem);	
});

$('#line-items').on('click','button.dropdown-btn', function(e){
	var $thisDropdown = $(this);

	if($('.dropdown-picker:visible').length>0)
		$('.dropdown-picker:visible').fadeOut(300, function(){ showDropDownPicker($thisDropdown); });
	else showDropDownPicker($thisDropdown);
	
	return false;
});

$('.btn-add').on('click',function(e){
	var newLineItem = buildLineItemElements(false);
	$(newLineItem).appendTo($('ul#line-items')).slideDown('300');
	return false;
});

$('#line-items').on('click','.btn-del',function(e){
	$(this).parents('.line-item-box').parent('li').slideUp('300',function(){ $(this).remove(); updateTotals();});
	return false;
});

$(document).on("click", function (e) {
	$('.dropdown-picker').fadeOut(300);
	$('.dropdown-btn').removeClass('active');
});

$('#line-items').on('change','input[name="exp-type"]',function(){
	$(this).parents('li').first().siblings().find('input[name="exp-vat"]').val($(this).val());
	updateTotals();
});

$('#line-items').on('change','input[name="exp-gross"]',function(){
	updateTotals();
});

$('#line-items').on('click','.dropdown-picker ul li a',function(e){
	$(this).parent().parent().parent().fadeOut(300);
	$(this).parent().parent().parent().siblings('.dropdown-btn').children('.btn-text').text($(this).text());
	$(this).parent().parent().parent().siblings('.dropdown-btn').toggleClass('active');
	$(this).parent().parent().parent().siblings('input[name="exp-type"]').val($(this).data('value'));
	$(this).parent().parent().parent().siblings('input[name="exp-type"]').change();
	$(this).parent().parent().parent().siblings('.dropdown-btn').removeClass('error');
	hideErrorMessage(getErrorDiv($(this).parent().parent().parent().siblings('.dropdown-btn')));
	return false;
});

function updateTotals() {
	
	var totalGross=0;
	var totalVAT=0;
	var totalNet=0; 
	
	var invalidVATValue = false;
	var invalidGrossValue = false;

	$('input[name="exp-gross"]').each(function(index, el) {
		
		var thisGross = Number($(this).val());
		if(isNaN(thisGross) || (!isNaN(thisGross) && thisGross <=0)) { 
		 invalidGrossValue= true; 
		 return false; 
		}
		
		var thisVAT = $(this).parents('li').first().siblings().find('input[name="exp-vat"]').val();
		if(typeof vatRates[thisVAT] == 'undefined')  { 
			invalidVATValue= true; 
			return false; 
		};
		
		totalVAT += thisGross * (vatRates[thisVAT] / 100);
		totalGross += thisGross;
	});

	if(!invalidVATValue && !invalidGrossValue) {
		totalNet = totalGross-totalVAT;

		$('.totals-net').text('\u00A3'+totalNet.toFixed(2));
		$('.totals-vat').text('\u00A3'+totalVAT.toFixed(2));
		$('.totals-gross').text('\u00A3'+totalGross.toFixed(2));
	}
}

function showDropDownPicker($thisDropdown) {
	$thisDropdown.parent().children('.dropdown-picker').fadeToggle(300);
	$thisDropdown.toggleClass('active');
}

function _(element,attrs) { /* Shortcut for document.createElement */
	var ele = document.createElement(element);
	if(arguments.length==2) {
		for(attr in attrs) 
			ele.setAttribute(attr,attrs[attr]);
	}

	return ele;
}

function buildLineItemElements(isFirstItem) {
	var displyStyle = isFirstItem ? 'block':'none';

	var itemParent = _('li',{'style':'display:'+displyStyle});
	var itemContainer = _('div',{'class':'line-item-box'});
	var fieldList = _('ul',{'class':'plain-list inline-list'});

	var expTypeItemLabel = document.createTextNode('Expense Type');
	var expTypeItemInput = buildExpenseTypesDropdown();
	var expTypeItem = buildLineItemField(expTypeItemLabel,expTypeItemInput);
	fieldList.appendChild(expTypeItem);

	var expVATItemLabel = document.createTextNode('VAT');
	var expVATItemInput = _('input',{'type':'text','name':'exp-vat','disabled':'disabled'});
	var expVATItem = buildLineItemField(expVATItemLabel,expVATItemInput);
	fieldList.appendChild(expVATItem);

	var expDescrItemLabel = document.createTextNode('Description');
	var expDescrItemInput = _('input',{'type':'text','name':'exp-descr'});
	var expDescrItem = buildLineItemField(expDescrItemLabel,expDescrItemInput);
	fieldList.appendChild(expDescrItem);

	var expGrossItemLabel = document.createTextNode('Gross');
	var expGrossItemInput = _('input',{'type':'text','name':'exp-gross'});
	var expGrossItem = buildLineItemField(expGrossItemLabel,expGrossItemInput);
	fieldList.appendChild(expGrossItem);

	if(!isFirstItem) {
		var deleteBtnItem = _('li');
		var deleteBtn = _('button',{'class':'btn-del'});
		deleteBtn.appendChild(document.createTextNode('\u2A2F'));
		deleteBtnItem.appendChild(deleteBtn);
		fieldList.appendChild(deleteBtnItem);
	}

	itemContainer.appendChild(fieldList);
	itemParent.appendChild(itemContainer);

	return itemParent;
}

function buildLineItemField(fieldLabel,fieldInput) {
	
	var fieldLineItem = _('li');	
	var fieldLabelDiv = _('div',{'class':'field-label'});
	var fieldInputDiv = _('div',{'class':'field-input'});
	var fieldErrorDiv = _('div',{'class':'field-error'});
	
	fieldLabelDiv.appendChild(fieldLabel);
	fieldInputDiv.appendChild(fieldInput);
	fieldLineItem.appendChild(fieldLabelDiv);
	fieldLineItem.appendChild(fieldInputDiv);
	fieldLineItem.appendChild(fieldErrorDiv);

	return fieldLineItem; 
}

function buildExpenseTypesDropdown() {
	
	var hiddenInput = _('input',{'name':'exp-type','type':'hidden'});
	var dropDownWrapper = _('div',{'class':'dropdown-wrapper'});
	var dropDownBtn = _('button',{'class':'dropdown-btn'});
	var btnText = _('span',{'class':'btn-text'});
	var btnCaret = _('span',{'class':'btn-caret'});
	
	btnText.appendChild(document.createTextNode('Select expense type'));
	btnCaret.appendChild(document.createTextNode('\u25BE'));
	dropDownBtn.appendChild(btnText);
	dropDownBtn.appendChild(btnCaret);

	var dropDownPicker = _('div',{'class':'dropdown-picker'});
	var dropDownList = _('ul',{'class':'plain-list'});

	for(i=0;i<expensesTypeList.length;i++) {
		var expenseType = expensesTypeList[i];
		var listItem = _('li');
		var link = _('a',{'href':'#','data-value':expenseType.value});
		link.appendChild(document.createTextNode(expenseType.type));
		listItem.appendChild(link);
		dropDownList.appendChild(listItem);
	}

	dropDownPicker.appendChild(dropDownList);
	dropDownWrapper.appendChild(dropDownBtn);
	dropDownWrapper.appendChild(dropDownPicker);
	dropDownWrapper.appendChild(hiddenInput);

	return dropDownWrapper;
}


/* Validations */
$('section#main').on('mouseenter','.error', function(){
	if($(window).width()>1024)getErrorDiv($(this)).fadeIn(200);
});

$('section#main').on('mouseleave','.error', function(){
	if($(window).width()>1024)getErrorDiv($(this)).fadeOut(200);
});

function getErrorDiv($this) {
	if($this.hasClass('dropdown-btn')) {
	  return $this.parent().parent().parent().find('.field-error').first(); 
	}
	if($this.attr('id')=='exp-date') {
	 return $this.parent().children('.field-error');
	}
	else 
	  return $this.parent().parent().find('.field-error');
}

function validateDescription($this) {
	var $errorDiv = getErrorDiv($this);
	var w = $(window).width();
	if($this.val()=='') {
		$errorDiv.text('This field is required');
		$this.addClass('error');
		showErrorMessage($errorDiv);
	} 
	else {
		$this.removeClass('error');
		hideErrorMessage($errorDiv);
	}

}

function validateDate($this) {
	var $errorDiv = getErrorDiv($this);
	if($this.val()=='') {
		$errorDiv.text('This field is required');
		$this.addClass('error');
		showErrorMessage($errorDiv);

	} 
	else if(isNaN(Date.parse($this.val())) || Date.parse($this.val()) <= 0 ) {
		$errorDiv.text('Please enter a proper date value');
		$this.addClass('error');
		showErrorMessage($errorDiv);
	} 
	else {
		$this.removeClass('error');
		hideErrorMessage($errorDiv);
	}
}

function validateGross($this) {
	var $errorDiv = getErrorDiv($this);
	if($this.val()=='') {
		$errorDiv.text('This field is required');
		$this.addClass('error');
		showErrorMessage($errorDiv);
	} 
	else if(isNaN($this.val())) {
		$errorDiv.text('Please enter a numeric value');
		$this.addClass('error');
		showErrorMessage($errorDiv);
	} 
	else if(parseInt($this.val())<=0) {
		$errorDiv.text('Please enter a value > 0');
		$this.addClass('error');
		showErrorMessage($errorDiv);
		
	}
	 else {
		$this.removeClass('error');
		getErrorDiv($this).fadeOut(200);
		hideErrorMessage($errorDiv);
	}
}

function showErrorMessage($errorDiv) {
	var w = $(window).width();
	if(w<600)
			$errorDiv.slideDown(200);
	else
		$errorDiv.fadeIn(200); 
}

function hideErrorMessage($errorDiv) {
	var w = $(window).width();
	if(w<600)
			$errorDiv.slideUp(200);
	else 
		$errorDiv.fadeOut(200);
}


$('#line-items').on('blur','.dropdown-btn', function(){
	var $errorDiv = $(this).parent().parent().parent().find('.field-error');
	console.log($(this).parent().find('input[name="exp-type"]').val());
	if($(this).parent().find('input[name="exp-type"]').val()=='') {
		$errorDiv.text('This field is required');
		$(this).addClass('error');
		showErrorMessage($errorDiv);
	} else $(this).removeClass('error');

});

$('#line-items').on('blur','input[name="exp-descr"]', function(){
	validateDescription($(this));
});

$('#line-items').on('blur','input[name="exp-gross"]', function(){
	validateGross($(this));
});

$('input[name="exp-date"]').on('blur', function(){
	validateDate($(this));
});

$('input[name="exp-date"]').on('change', function(){
	validateDate($(this));
});

$('#line-items').on('focus','input[name="exp-descr"]', function(){
	hideErrorMessage(getErrorDiv($(this)));
});

$('#line-items').on('focus','input[name="exp-gross"]', function(){
	hideErrorMessage(getErrorDiv($(this)));
});

$('input[name="exp-date"]').on('focus', function(){
	hideErrorMessage(getErrorDiv($(this)));
});


function doesSupportDateInput() {
	  var inputField = _("input");
	  inputField.setAttribute("type", "date");
	  return inputField.type != 'text';
}