var DS = {
	Reviser:function(cfg) {
		/* initialization */
		this.cfg 								= cfg;
		
		// Assign CallBacks
		this.beforeSaveCallBack = cfg.beforeSave || function(html){return html;};
		this.afterSaveCallBack  = cfg.afterSave  || function(){return false;};
		
		// the elem we are editing
		this.editorElement = $(cfg.elm);
		this.actualElement = this.editorElement;
		
		// editorType, inline || modal
		this.editorType    = cfg.editorType || ((this.editorElement.width() < 600) ? 'modal':'inline');		

		
		/*-------- Editor Core ---------------*/
		this.drawModalEditor = function(){
			var frame = $('<div id="modal_reviser"></div>');
			var editorContent = $('<div id="editorContent" contenteditable="true"></div>');
			editorContent.html(this.editorElement.html());
			frame.append(this.menu);
			frame.append(editorContent);
			$.facebox(frame,'reviser');
			this.editorElement = editorContent;
		};
		this.setupEditor = function() {
			// create a new Menu and pass it an editor instance
			this.menu = new DS.Menu(this);
			if (this.editorType == 'inline') {
				this.appendMenuToElement();
				this.setElementToEditable();
			}else{
				this.drawModalEditor();
			}
			// save the content for revert
			this.contentBackup = this.editorElement.html();
		};
		this.appendMenuToElement = function() {
			var coords = this.editorElement.offset();
			this.menu.attr("id",this.editorElement[0].id + '_reviser');
			$('body').append(this.menu);
			// postioning the menu
			this.menu.css({
				'position':'absolute',
				'display':'none',
				'top':coords.top-24,
				'left':coords.left
			});
			//this.menu.slideToggle('medium');
			this.menu.show();
		};
		
		// get rid of the click and start editing
		this.setElementToEditable = function(){
			this.editorElement.unbind('click');
			this.editorElement.attr('contenteditable',true);
			return true;
		};
		// kill the menu and re-bind
		this.setElementToNonEditable = function(){
			/*menu.slideToggle('medium',function(){
				menu.remove();
			});*/
			this.menu.remove();
			this.editorElement.attr('contenteditable',false);
			$(this.editorElement).click(function(){
				this.editor = new DS.Reviser(this.editor.cfg);
			});
			return false;
		};
		/*------------------------------------*/
		
		// starting up
		this.setupEditor();
		
		
	},
	Menu:function(editor){
		// Loading the Commands
		$.extend(this,DS.Commands);
		
		// This should be passed in through a cfg at soem point
		var menu = $('<div class="reviser_menu" style="z-index:200">\
			<a href="#" class="reviser_btn" id="boldSelection" alt="Text Bold">bold</a>\
			<a href="#" class="reviser_btn" id="italicSelection" alt="Text Italic">italic</a>\
			<a href="#" class="reviser_btn" id="strikethroughSelection" alt="Text Strike">strike</a>\
			<a href="#" class="reviser_btn" id="underlineSelection" alt="Text Under">underline</a>\
			<a href="#" class="reviser_btn" id="insertImage" alt="Insert Image">image</a>\
			<a href="#" class="reviser_btn" id="blockquoteSelection" alt="Insert Block Quote">block quote</a>\
			<a href="#" class="reviser_btn" id="insertOrderedList" alt="Insert Ordered List">ordered list</a>\
			<a href="#" class="reviser_btn" id="insertUnorderedList" alt="Insert Ordered List">unordered list</a>\
			<a href="#" class="reviser_btn" id="createLink" alt="Insert Link">link</a>\
			<a href="#" class="reviser_btn" id="save" alt="Save">save</a>\
			<a href="#" class="reviser_btn" id="revert" alt="Save">cancel</a>\
		</div>');
		// Bind that trick
		this.bindMenu = function(){
			// Assign scope to Menu
			var scope 	= this;
			$('.reviser_btn',menu).each(function(){
				$(this).click(function(){
					// Methods bound to dom elems but scoped to Menu
					scope[this.id].call(scope);
				});
			});
		};
		// Kill editing and send callbacks with elems innerHtml
		this.save = function(){
			// pre-process through beforeSave
			if (this.editorType=='inline') {
				editor.editorElement.html(editor.beforeSaveCallBack(editor.editorElement.html()));
				editor.setElementToNonEditable();
			}else{
				$.facebox.close();
				editor.actualElement.html(editor.editorElement.html());
			}
			
			// send afterSave with elems innerHtml
			editor.afterSaveCallBack(editor.editorElement.html());
		};
		// Don't like it, revert it.
		this.revert = function(){
			editor.editorElement.html(editor.contentBackup);
			editor.setElementToNonEditable();
			$.facebox.close();
			return false;
		};
		// bind that trick
		this.bindMenu();
		return menu;
	},
	// Base commands for an editable area.
	// "Borrowed" from wysihat.
	Commands:{
		createLink:function() {
			url = this.needInput("What url? (Use http://)");
			return this.exec('createLink',url);
		},
		boldSelection: function() {
			this.exec('bold', null);
		},
		underlineSelection: function() {
			return this.exec('underline', null);
		},
		italicSelection: function() {
			return this.exec('italic', null);
		},
		strikethroughSelection: function() {
			return this.exec('strikethrough', null);
		},
		blockquoteSelection: function() {
			return this.exec('blockquote', null);
		},
		colorSelection: function(color) {
			return this.exec('forecolor', color);
		},
		insertOrderedList: function() {
			return this.exec('insertorderedlist', null);
		},
		insertUnorderedList: function() {
			return this.exec('insertunorderedlist', null);
		},
		insertImage: function() {
			url = this.needInput("What url? (Use http://)");
			return this.exec('insertImage', url);
		},
		insertHTML: function(html) {
	 		if ($.browser.msie) {
		     var range = this.editingElement._selection.getRange();
		     range.pasteHTML(html);
		     range.collapse(false);
		     range.select();
		   } else {
		     return this.exec('insertHTML', html);
		   }
		},
		needInput:function(msg) {
			var resp = prompt(msg);
			if (resp == "") {
				this.getInput(msg);
			}else{
				return resp;
			}
		},
		exec:function(fn,val){
			document.execCommand(fn,false,val);
			return false;
		}
	}
};






