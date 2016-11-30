angular.module('mean.tarento_directives', [])

.directive('nestedList', function () {
	return {
		restrict: "E",   // tells Angular to apply this to only html tag that is <nested-list>
		replace: true,   // tells Angular to replace <nested-list> by the whole template
		scope: {
			collection: '='   // create an isolated scope variable 'collection'
		},
		template: "<ul><member ng-repeat='member in collection' member='member'></member></ul>"
	}
    
})

.directive('member', function ($compile) {
    
    var type = $('#view').attr('type');
    var check = $('#view').attr('checkbox');
    var checkboxAdd = "";
    if(check=='true'){
       checkboxAdd = "<input type ='checkbox' value='{{member.name}}'>"
    }
	 return {
		restrict: "E",  // tells Angular to apply this to only html tag that is <member>
		replace: true,   // tells Angular to replace <member> by the whole template
		scope: {
			member: '='
		},
        template: function() {
          switch(type) {
                  
             case 'plus':
               return "<li class='collapsed list-ul'><a><span class='glyphicon glyphicon-plus-sign listnameRight'></span></a>"+checkboxAdd+"<span class='listname'>{{member.name}}</span></li>";
                  
             case 'folder':
               return "<li class='collapsed list-ul'><a><span class='glyphicon glyphicon-folder-close foldercolor listnameRight'></span></a>" +checkboxAdd+ "<span class='listname'>{{member.name}}</span></li>";  
                  
             case 'checkbox':
               return "<li class='collapsed'><input type ='checkbox' value='{{member.name}}'><span class='listname'>{{member.name}}</span><a><span class='glyphicon glyphicon-chevron-down listname'></span></a></li>";
                  
            }
               return "<li class='collapsed list'>{{member.name}}<a><span class='glyphicon glyphicon-chevron-down listname'></span></a></li>";
      },
        
		link: function (scope, element, attrs) {
             var has_children = angular.isArray(scope.member.children);  // Check if there are any children, otherwise we'll have                                                                          infinite execution
			 if (has_children) {
                 element.append("<div><nested-list collection='member.children'></nested-list></div>"); // Manipulate HTML in DOM
                 $compile(element.contents())(scope);  // recompile Angular because of manual appending
			    }
            
            // Bind events
                element.on('click','a', function(event) { 
                  event.stopPropagation();
                    if(has_children){
                     element.toggleClass('collapsed'); 
                     }
                    if(type=='folder'){
                        $(this).find('span').toggleClass('glyphicon glyphicon-folder-open')
                            .toggleClass('glyphicon glyphicon-folder-close')
                    }
                    else if(type=='plus'){
                     $(this).find('span').toggleClass('glyphicon glyphicon-minus-sign')
                         .toggleClass('glyphicon glyphicon-plus-sign');
                    }
                    else {
                      $(this).find('span').toggleClass('glyphicon glyphicon-chevron-right')
                      .toggleClass('glyphicon glyphicon-chevron-down');
                    }
                 });
            
             //checked child if parent checked 
                $("input[type='checkbox']").change(function (){
                  $(this).siblings('div').find("input[type='checkbox']")
                     .prop('checked', this.checked);
                }); 
            }
		}
    
})
 
.controller('NestlistCtrl', function ($scope) {
    
    //selected item from checkbox function for controller
     $("#getvalue").click(function(){
       var selectedItem = [];
        $("input[type='checkbox']:checked").each(function(){            
          selectedItem.push($(this).val());
        });
        alert("Selected items are: \n" + selectedItem.join("\n"));
      });
    
	$scope.tasks = [
		{
			name: 'Europe',
			children: [
				{
					name: 'Italy',
					children: [
						{
							name: 'Rome',
                            children:[
                                {
                                    name:'street 23B',
                                    
                                }
                            ]
						},
						{
							name: 'Milan',
						}
					]
				}, 
				{
					name: 'Spain',
				}
			]
		}, 
		{
			name: 'India',
			children: [
				{
					name: 'Delhi',
                    children: [
                        {
                            name: 'New delhi',
                        },
                        {
                            name: 'Gurgaon',
                            children: [
                                {
                                    name: 'Shivpuri',
                                }
                            ]
                        }
                    ]
				},
				{
					name: 'Ranchi',
				}
			]
		},
        {
            name:'USA',
        }
	];
});        