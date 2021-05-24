import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  
  const [stateObjects, setStateObjects] = useState([]);
  const [numMonths, setNumMonths] = useState('4')
  const [startMonth, setStartMonth] = useState('01')
  const [startYear, setStartYear] = useState('2019')
  const [exchangeCurrency, setExchangeCurrency] = useState('GBP')
    // Dropdown values 
  const dropdownYears = [2020, 2019, 2018, 2017, 2016]
  const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'HKD',]
  const dropdownStartMonths = [
      {value: '00', text: 'Jan',},
      {value: '01', text: 'Feb',}, 
      {value: '02', text: 'Mar',}, 
      {value: '03', text: 'Apr',}, 
      {value: '04', text: 'May',}, 
      {value: '05', text: 'Jun',}, 
      {value: '06', text: 'Jul',}, 
      {value: '07', text: 'Aug',}, 
      {value: '08', text: 'Sep',}, 
      {value: '09', text: 'Oct',}, 
      {value: '10', text: 'Nov',}, 
      {value: '11', text: 'Dec',}, 
  ]
   useEffect(doFetch, [startMonth, startYear, numMonths, exchangeCurrency]);

   function calculateDateArray() {
      const startDate = new Date(startYear, startMonth, 1);
      let dateArray = [];
      for (let i = 0; i < numMonths; i++) {
          dateArray.push(new Date (startDate));
          startDate.setMonth(startDate.getMonth() + 1);
        }
      let dateArrayFormatted = [];
      for (let date of dateArray) {
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          if (month < 10) {
              month = '0' + month.toString();
          }
          if (day < 10) {
              day = '0' + day.toString();
          }
          dateArrayFormatted.push(year + '-' + month + '-' + day);
      };
      return dateArrayFormatted; 
  };  
  function getFetches() {
    let fetchRequests = [];
    let dates = calculateDateArray();
    for (let date of dates) {
        let url = 'https://api.exchangerate.host/' + date + '?symbols=' + exchangeCurrency;
        let fetchRequest = fetch(url)
        fetchRequests.push(fetchRequest)
    };
    return Promise.all(fetchRequests)
  };

  function dataToStateObjects(responses) {
    for (let response of responses) {
        response.then(data => {
            let barData = {
                'date': data.date,
                'currency': exchangeCurrency,
                'rate': data.rates.[exchangeCurrency]
            };
        setStateObjects(stateObjects => [...stateObjects, barData])
        })
    }
  };

  function doFetch() {
      setStateObjects([]);
      getFetches()
      .then(responses => responses.map(response => response.json()))
      .then(responses => {
        dataToStateObjects(responses);
    })
  };

    function calcBarWidth(currentRate) {
        let rateArray = []
        for (let item of stateObjects) {
            rateArray.push(item.rate)
        };
        const maxRate = Math.max(...rateArray);
        const minrate = Math.min(...rateArray);
        const minPercent = 20;
        return (((100-minPercent)/(maxRate - minrate))*(currentRate - maxRate))+100
    };
  
  return (
    <div className="ExchangeRate">
        <div className="ExchangeRateChart">
            <div className="ExchangeRateChart-margin-top">
            </div>
            <div className="ExchangeRateChart-title">
                <h3>Currency Exchange Rates</h3>
            </div>
            <div className="ExchangeRateChart-margin">
            </div>
            <div className="ExchangeRateChart-legend">
                <div>
                    <label for="start_month">Start Month:</label>
                    <select id="start_month"
                        value={startMonth}
                        onChange={ev => setStartMonth(ev.target.value)}>
                        {dropdownStartMonths.map(month => (
                            <option key={month.value} value={month.value}>{month.text}</option>
                        ))}
                    </select>
                    <select id="start_year"
                    value={startYear}
                    onChange={ev => setStartYear(ev.target.value)}>
                        {dropdownYears.map(year => (
                            <option key={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label for="numOfMonths">Number of months (up to 12):</label>
                        <input type="number" id="numOfMonths" min="1" max="12"
                            value={numMonths} 
                            onChange={ev => setNumMonths(ev.target.value)}/>
                </div>
                <div>
                    <select id="currency_select"
                        value={exchangeCurrency} 
                        onChange={ev => setExchangeCurrency(ev.target.value)}>
                        {currencies.map(currency =>(
                            <option key={currency}>{currency}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="ExchangeRateChart-display">
                {stateObjects
                .map (bar => (
                    <div className="ExchangeRateChart-bar" key={bar.rate}  style={{width: calcBarWidth(bar.rate) + '%', height: 95/stateObjects.length + '%' }}>
                        <div className="ExchangeRateChart-bar-text" >
                            <p>{bar.date}: <strong>{bar.rate}</strong> {bar.currency}</p>
                        </div>
                    </div>
                ))
                }
            </div>
            <div className="ExchangeRateChart-margin"></div>
        </div>
    </div>
  );
}
export default App;