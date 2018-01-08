/* globals window, $ */
'use strict';
window.addEventListener('Agave::ready', function() {
  
	var appContext = $('[data-app-name="mapman-orthlog-finder"]');

	var form = $('form[name=orthlog_finder_form]', appContext);

	form.on('submit', function(e) {
		e.preventDefault();

		var Agave = window.Agave;

		var locus = ($.trim(this.geneLocus.value).split(/\n/));
		var hasError = false;
		console.log(locus);
		if (locus.length > 1){
			$(this.geneLocus).parent().addClass('has-error');
			$('#mapman_orthlog_finder-messages', this).append('<div class="alert alert-danger">Only one gene can be entered</div>');
			hasError = true; // more than one gene
		}
		
		var queryParams ={
			'aragene':locus[0]
		}; 
		console.log (queryParams);
		if (!hasError){
		
			Agave.api.adama.getStatus({}, function(resp) {
				if (resp.obj.status === 'success') {
					$.ajax({   
						url: 'https://api.araport.org/community/v0.3/mercator/orthologfinder_v0.1/access',
						headers: {'Authorization': 'Bearer ' + Agave.token.accessToken},
						data: queryParams,
						error: function(err) {
							// handle errors
							console.log(err);
						},
						success: function(data) {
							console.log(data);
							showResults(data);
							// operate on successful data return
						}
					});
	          
				}else {
					// ADAMA is not available, show a message
					$('#mapman_enrichment-table', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
				}
			});
		}
		
		function showResults(data){
			
			if (data.status === 'success'){
		        var mangleData=mangleJson(data);
		        tabulate(mangleData);
			}else{
			      $('#mapman_orthlog_finder-messages', this).append('<div class="alert alert-danger">Genes of Interest cannot be found</div>');

			}
			
		}
		
		 function mangleJson(data) {

			    var result=data.result;

			    console.log(result);

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
              var table = d3.select('#mapman_orthlog_finder-table').append('table');
              var tbody = table.append('tbody');


              var rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

              rows.selectAll('td')
                .data(function (d) { return d; })
                .enter()
                .append('td')
                  .text(function (d) { return d; });

      }



	});

});
