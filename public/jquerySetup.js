(function($) {
  $.fn.inputFilter = function(callback, errMsg) {
    return this.on("focusout", function(e) {
      if (callback(this.value)) {
        // Accepted value
        if (["focusout"].indexOf(e.type) >= 0){
          this.setCustomValidity("");
        }
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        // Rejected value - restore the previous one
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value - nothing to restore
        this.value = "";
      }
    });
  };
}(jQuery));
