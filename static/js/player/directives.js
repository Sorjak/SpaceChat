app.directive('expandInput', function () {
    return {
        link: function (scope, element, attrs) {
            attrs.$observe('ngModel', function (item) {
                if (scope[item] == "") {
                    attrs.$addClass("col-xs-12");
                    attrs.$removeClass("col-xs-9");
                } else {
                    attrs.$addClass('class', "col-xs-9");
                    attrs.$removeClass("col-xs-12");
                }
            });
        }
    }
})

.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
})