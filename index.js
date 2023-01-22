const util = require('util');
const readline = require('readline');
const scraper = require('./scraper.js');
const {parseSearchResults, parseSummary, parseSales, parseAssessments} = require('./parser.js');

const getInput = function(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { resolve(answer); rl.close(); });
  });
}

const init = async () => {
  try {
    let input_street_number = null;
    while(/^\d+$/.test(input_street_number) === false){
      input_street_number = await getInput('Street Number: ');
    }
    let input_street_name = await getInput('Street Name: ');
    const search_raw = await scraper.request({
      url: 'https://assessments.milwaukee.gov/SearchResults.asp',
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      postData: `SearchStreetNumber=${input_street_number}&SearchStreetName=${input_street_name}&SearchSubmitted=yes&cmdGo=Go`
    });
    const search_parsed = await parseSearchResults(search_raw);
    if(search_parsed.length){
      const summary_raw = await scraper.request({ url: 'https://assessments.milwaukee.gov/summary-bottom.asp' });
      const sales_raw = await scraper.request({ url: 'https://assessments.milwaukee.gov/g_sales.asp' });
      const assessments_raw = await scraper.request({ url: 'https://assessments.milwaukee.gov/g_previous.asp' });
      const search_result_parsed = search_parsed[0];
      const summary_parsed = await parseSummary(summary_raw);
      const sales_parsed = await parseSales(sales_raw);
      const assessments_parsed = await parseAssessments(assessments_raw);
      const data = {
        search_result: search_result_parsed,
        summary: summary_parsed,
        sales: sales_parsed,
        assessments: assessments_parsed
      }
      const condensed = {
        street_address: search_result_parsed.street_address,
        last_sold: `${sales_parsed[0].sale_date.split('/')[2]} / $${Math.floor(sales_parsed[0].sale_price).toLocaleString('en-US')}`,
        last_assessed: `${assessments_parsed[0].year} / $${assessments_parsed[0].total_value}`,
      }
      console.log('\n',util.inspect(condensed, { colors: true, showHidden: false, depth: null }) );
      let input_show_more = null;
      while(input_show_more !== 'y' && input_show_more !== 'n'){
        input_show_more = await getInput('Show expanded data (y/n): ');
      }
      if(input_show_more === 'y'){
        console.log('\n',util.inspect(data, { colors: true, showHidden: false, depth: null }) );
      } else {
        throw 'Done.'
      }
    } else {
      throw 'No matching results.'
    }
  } catch (e) {
    console.log(e);
    let input_again = null;
    while(input_again !== 'y' && input_again !== 'n'){
      input_again = await getInput('Search again (y/n): ');
    }
    return input_again === 'y';
  }
}


(async () => {
  await scraper.launch();
  let run = true;
  while(run){
    run = await init();
  }
  await scraper.close();
})();
