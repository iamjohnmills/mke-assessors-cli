const util = require('util');
const {JSDOM} = require('jsdom');

// ASSESSMENTS
const parseAssessments = (string) => {
  const cleaned = string.replace(/(<font.*\">|<\/font>|<\/?b>|<\/?center>)/igm,'');
  const nodes = new JSDOM(cleaned);
  const rows = Array.from(nodes.window.document.querySelectorAll('tbody tr'));
  return rows.filter(row => !!row.textContent.trim()).map(row => {
    const tds = Array.from(row.querySelectorAll('td'));
    const luc_code_description = tds[1].textContent.split('-');
    return {
      year: tds[0].textContent.trim(),
      luc: {
        code: luc_code_description[0].trim(),
        description: luc_code_description[1].trim(),
      },
      building_value: tds[2].textContent.trim(),
      yard_items_value: tds[3].textContent.trim(),
      land_value: tds[4].textContent.trim(),
      category: tds[5].textContent.trim(),
      total_value: tds[6].textContent.trim(),
    }
  })
}

// SALES
const parseSales = (string) => {
  const cleaned = string.replace(/(<font.*\">|<\/font>|<\/?b>|<\/?center>)/igm,'');
  const nodes = new JSDOM(cleaned);
  const rows = Array.from(nodes.window.document.querySelectorAll('tbody tr'));
  return rows.map(row => {
    const tds = Array.from(row.querySelectorAll('td'));
    return {
      sale_date: tds[0].textContent.trim(),
      sale_price: tds[1].textContent.trim(),
      document_number: tds[2].textContent.trim(),
      seller: tds[3].textContent.trim(),
      buyer: tds[4].textContent.trim(),
    }
  })
}

// SUMMARY
const parseSummary = async (string) => {
  const cleaned = string.replace(/(<font.*\">|<\/font>|<\/?b>|<\/?center>)/igm,'');
  const nodes = new JSDOM(cleaned);
  const tables = Array.from(nodes.window.document.querySelectorAll('tbody tbody tbody'));
  const tds = Array.from(tables[0].querySelectorAll('td'));
  return {
    mailing_address: {
      street: tds[9].textContent.trim(),
      city: tds[3].textContent.trim(),
      state: tds[7].textContent.trim(),
      zip: tds[11].textContent.trim(),
    },
    zoning_code: tds[15].textContent.trim(),
    narrative_description: ( () => {
      const lines = tables[5].querySelector('strong').textContent.trim().split('\n');
      const description = lines.map(line => line.trim() ).join(' ').trim();
      return {
        text: description,
        exterior: description.match(/having(.*)exterior/)[1].trim(),
        commercial_units: description.match(/roof cover, with (.*) commercial unit\(s\)/)[1].trim(),
        residential_units: description.match(/commercial unit\(s\) and (.*) residential unit/)[1].trim(),
        total_rooms: description.match(/residential unit\(s\), (.*) total room\(s\)/)[1].trim(),
        bedrooms: description.match(/total room\(s\), (.*) total bedroom\(s\)/)[1].trim(),
        bathrooms_full: description.match(/total bedroom\(s\), (.*) total bath\(s\)/)[1].trim(),
        bathrooms_half: description.match(/total bath\(s\), (.*) total half bath\(s\)/)[1].trim(),
        bathrooms_3_4: description.match(/total half bath\(s\), (.*) total 3\/4 bath\(s\)/)[1].trim(),
      }
    })(),
    legal_description: (() => {
      const lines = tables[6].querySelector('strong').innerHTML.replace(/\t/gi,'').split('\n');
      return lines.map(line => line.trim() ).join(' ').trim();
    })(),
  }
}

// SEARCH RESULTS
const parseSearchResults = async (string) => {
  const nodes = JSDOM.fragment(string);
  const rows = Array.from(nodes.querySelectorAll('table:nth-child(2) tbody tr'));
  return rows.map(row => {
    const columns = Array.from(row.querySelectorAll('td'));
    return {
      account_number: columns[0].innerHTML.match(/(?!.*AccountNumber=)([0-9])+/)[0],
      tax_key: columns[0].innerHTML.match(/(?!.*">)([0-9])+/)[0],
      street_address: columns[1].querySelector('a').innerHTML,
      owners: Array.from(columns[2].querySelectorAll('a')).map(node => node.innerHTML),
      year_built: (() => {
        const links = columns[3].querySelectorAll('a');
        if(links.length == 2){
          return links[0].innerHTML.trim();
        } else {
          const els = columns[3].innerHTML.split('<br>')
          return els[0].trim();
        }
      })(),
      property_type: (() => {
        const links = columns[3].querySelectorAll('a');
        if(links.length == 2){
          return links[1].innerHTML.trim();
        } else if(links.length == 1) {
          return links[0].innerHTML.trim();
        } else {
          const els = columns[3].innerHTML.split('<br>')
          return els[1].trim();
        }
      })(),
      property_value: columns[4].innerHTML.replace(/[^0-9.-]+/g,''),
      bedrooms_amount: columns[5].innerHTML.replace(/\r?\n|\r/g,'').split('<br>')[0].trim(),
      bathrooms_amount: columns[5].innerHTML.replace(/\r?\n|\r/g,'').split('<br>')[1].trim(),
      lot_size: columns[6].innerHTML.replace(/\r?\n|\r|,/g,'').split('<br>')[0].trim(),
      finished_size: columns[6].innerHTML.replace(/\r?\n|\r|,/g,'').split('<br>')[1].trim(),
      luc_code: columns[7].querySelectorAll('a')[0].innerHTML.trim(),
      luc_description: columns[7].querySelectorAll('a')[1].innerHTML.trim(),
    };
  });
}

module.exports = {
  parseSearchResults,
  parseSummary,
  parseSales,
  parseAssessments
}
