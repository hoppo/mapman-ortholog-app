/*global _*/
/*jshint camelcase: false*/
(function(window, $, _, undefined) {
	'use strict';

	var appContext = $('[data-app-name="mapman-ortholog-finder"]');
	
	
	window.addEventListener('Agave::ready', function() {

		var Agave = window.Agave;
	
		var form = $('form[name=ortholog_finder_form]', appContext);

		form.on('submit', function(e) {
			e.preventDefault();

		
			$('#mapman_ortholog_finder-table', appContext).empty();
			$('#mapman_ortholog_finder-messages', appContext).empty();
			$('.has-error', appContext).removeClass('has-error');

			var hasError = false;

		
			var locusString = $.trim(this.geneLocus.value);
				
			if (!locusString){
				hasError = true;
				$(this.geneLocus).parent().addClass('has-error');
				$('#mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-danger">Please enter a AGI code</div>');
			}else if (locusString.split(/\s+/) > 1){
				$(this.geneLocus).parent().addClass('has-error');
				$('#mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-danger">Only one gene can be entered</div>');
				hasError = true; 
			}
	
			
			if (!hasError){
				
				var queryParams ={'aragene':locusString};
			
				Agave.api.adama.getStatus({}, function(resp) {
					if (resp.obj.status === 'success') {
						$.ajax({   
							url: 'https://api.araport.org/community/v0.3/mercator/orthologfinder_v0.1/access',
							headers: {'Authorization': 'Bearer ' + Agave.token.accessToken},
							data: queryParams,
							error: function(err) {
								console.log(err);
								$('#mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-danger">Unexpected Error occured</div>');
							},
							success: function(data) {
								console.log(data);
								showResults(data);
							}
						});
		
					}else {
						$('mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
					}
				});
			}
			
			function showResults(data){
				
				if(data.status === 'success'){
					
					if(data.result.hasOwnProperty('35.2')){
						$('#mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-info">Genes of Interest is assigned to the Unknown bin</div>');
					}else{
						var mangleData=mangleJson(data);
						tabulate(mangleData);
					}
				}else{
					$('#mapman_ortholog_finder-messages', appContext).append('<div class="alert alert-danger">Genes of Interest could not be found</div>');
				}
			}
			
			function mangleJson(data) {
	
				var result=data.result;
				var out=[];
	
				for (var i in result){
	
					if (i !== 'query'){
						var binArray=[];
						binArray.push(i);
						out.push(binArray);
	
						var binResult=result[i];
						
						for(var species in binResult){
							var genes = binResult[species];
							genes.splice(0, 0, species);
							out.push(genes);
						}
					}
				}
				return out;
			}
			 
			function tabulate(data) {
				var table = d3.select('#mapman_ortholog_finder-table').append('table').attr('class', 'table');
				table.append('thead');
				var tbody = table.append('tbody');
	
	
				var rows = tbody.selectAll('tr')
								.data(data)
								.enter()
								.append('tr');
	
				rows.selectAll('td').data( function(d) { return d; })
									.enter().append('td')
									.text(function(d) { return d; });
			}
		});
	});
})(window, jQuery, _);
